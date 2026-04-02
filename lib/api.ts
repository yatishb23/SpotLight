import axios, { AxiosRequestConfig } from "axios";

type RequestOptions = {
  cache?: boolean;
  ttlMs?: number;
  forceRefresh?: boolean;
  cacheKey?: string;
};

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 60_000;
const cacheStore = new Map<string, CacheEntry>();
const inFlightStore = new Map<string, Promise<unknown>>();
const EVENT_SNAPSHOT_STORAGE_KEY = "eventsById";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

const axiosClient = axios.create();

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const stableStringify = (input: unknown): string => {
  if (input === null || input === undefined) return "";
  if (typeof input !== "object") return String(input);
  if (Array.isArray(input)) {
    return `[${input.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(input as Record<string, unknown>)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return `{${entries
    .map(([key, value]) => `${key}:${stableStringify(value)}`)
    .join("|")}}`;
};

const createCacheKey = (config: AxiosRequestConfig, cacheKey?: string) => {
  if (cacheKey) return cacheKey;
  const method = (config.method || "GET").toUpperCase();
  const url = config.url || "";
  const paramsKey = stableStringify(config.params);
  const dataKey = stableStringify(config.data);
  return `${method}:${url}?params=${paramsKey}&data=${dataKey}`;
};

const shouldUseCache = (
  config: AxiosRequestConfig,
  options?: RequestOptions,
) => {
  const method = (config.method || "GET").toUpperCase();
  if (method !== "GET") return false;
  return options?.cache !== false;
};

const getCached = <T>(cacheKey: string): T | null => {
  const hit = cacheStore.get(cacheKey);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cacheStore.delete(cacheKey);
    return null;
  }
  return hit.data as T;
};

const setCached = (cacheKey: string, data: unknown, ttlMs: number) => {
  cacheStore.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
};

async function requestApi<T = unknown>(
  config: AxiosRequestConfig,
  options?: RequestOptions,
): Promise<T> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const useCache = shouldUseCache(config, options);
  const cacheKey = createCacheKey(config, options?.cacheKey);

  if (useCache && !options?.forceRefresh) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) return cached;

    const inFlight = inFlightStore.get(cacheKey);
    if (inFlight) return inFlight as Promise<T>;
  }

  const promise = axiosClient(config).then((response) => response.data as T);

  if (useCache) {
    inFlightStore.set(cacheKey, promise as Promise<unknown>);
  }

  try {
    const data = await promise;
    if (useCache) {
      setCached(cacheKey, data, ttlMs);
    }
    return data;
  } finally {
    if (useCache) {
      inFlightStore.delete(cacheKey);
    }
  }
}

export const clearApiCache = () => {
  cacheStore.clear();
  inFlightStore.clear();
};

export const invalidateApiCache = (matcher: RegExp | string) => {
  const matches = (key: string) =>
    matcher instanceof RegExp ? matcher.test(key) : key.includes(matcher);

  for (const key of cacheStore.keys()) {
    if (matches(key)) cacheStore.delete(key);
  }

  for (const key of inFlightStore.keys()) {
    if (matches(key)) inFlightStore.delete(key);
  }
};

export const primeEventSnapshots = (events: Array<Record<string, any>>) => {
  if (typeof window === "undefined") return;
  if (!Array.isArray(events) || events.length === 0) return;

  const eventMap = events.reduce(
    (acc, event) => {
      const id = event?.id;
      if (id !== undefined && id !== null) {
        acc[String(id)] = event;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  try {
    const raw = sessionStorage.getItem(EVENT_SNAPSHOT_STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    sessionStorage.setItem(
      EVENT_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ ...existing, ...eventMap }),
    );
  } catch {
    // Ignore sessionStorage errors and keep runtime resilient.
  }
};

export const getCachedEventSnapshot = <T = unknown>(
  eventId: string,
): T | null => {
  if (typeof window === "undefined" || !eventId) return null;

  try {
    const raw = sessionStorage.getItem(EVENT_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, unknown>;
    return (map[String(eventId)] as T) ?? null;
  } catch {
    return null;
  }
};

export const getEventsById = async (
  eventId: string,
  options?: RequestOptions,
) => {
  try {
    const response = await requestApi<any>(
      {
        method: "GET",
        url: "/api/events/getbyid",
        params: { id: eventId },
      },
      options,
    );
    return response?.data ?? response;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
};

export const getEventById = async (
  eventId: string,
  options?: RequestOptions,
) => {
  return getEventsById(eventId, options);
};

export const getEventsByOrganizerId = async (
  organizerId: string,
  options?: RequestOptions,
) => {
  try {
    return await requestApi(
      {
        method: "GET",
        url: "/api/events/getbyOrganizer",
        params: { organizerId },
      },
      options,
    );
  } catch (error) {
    console.error("Error fetching events by organizer ID:", error);
    throw error;
  }
};

export const getAdminStats = async (options?: RequestOptions) => {
  try {
    const response = await Promise.all([
      requestApi({ method: "GET", url: "/api/admin/events" }, options),
      requestApi({ method: "GET", url: "/api/admin/users/getall" }, options),
    ]);

    return {
      events: response[0],
      users: response[1],
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const response = await fetch("/api/events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};
export const getUserByUid = async (uid: string, options?: RequestOptions) => {
  return requestApi(
    {
      method: "GET",
      url: "/api/users/getbyuid",
      params: { id: uid },
    },
    options,
  );
};

export const getUserById = async (id: string, options?: RequestOptions) => {
  return requestApi(
    {
      method: "GET",
      url: "/api/users/getbyid",
      params: { id },
    },
    options,
  );
};

export const getUserBookings = async (userId: string) => {
  try {
    const response = await fetch(
      "/api/bookings/getbyuser?userId=" + encodeURIComponent(userId),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

export const getBookingsByEvent = async (eventId: string) => {
  try {
    const response = await fetch(
      "/api/bookings/getbyevent?eventId=" + encodeURIComponent(eventId),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching bookings by event:", error);
    throw error;
  }
};

export const getAdminUsers = async (options?: RequestOptions) => {
  return requestApi({ method: "GET", url: "/api/admin/users/getall" }, options);
};

export const createAdminUser = async (data: {
  name: string;
  email: string;
  role: string;
  password: string;
}) => {
  const response = await requestApi(
    {
      method: "POST",
      url: "/api/admin/users/create",
      data,
    },
    { cache: false },
  );

  invalidateApiCache(/\/api\/admin\/users\//);
  return response;
};

export const updateAdminUserStatus = async (
  userId: string,
  active: boolean,
) => {
  const response = await requestApi(
    {
      method: "PUT",
      url: `/api/admin/users/${userId}/status`,
      data: { active },
    },
    { cache: false },
  );

  invalidateApiCache(/\/api\/admin\/users\//);
  return response;
};

export const deleteAdminUser = async (userId: string) => {
  const response = await requestApi(
    {
      method: "DELETE",
      url: `/api/admin/users/${userId}`,
    },
    { cache: false },
  );

  invalidateApiCache(/\/api\/admin\/users\//);
  return response;
};

export const changeEventStatus = async (eventId: string, status: string) => {
  try {
    const response = await requestApi(
      {
        method: "POST",
        url: "/api/admin/events/changestatus",
        data: {
          eventId,
          status,
        },
      },
      { cache: false },
    );

    invalidateApiCache(/\/api\/(events|getbyid|getbyOrganizer|admin\/events)/);
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(EVENT_SNAPSHOT_STORAGE_KEY);
        if (raw) {
          const map = JSON.parse(raw) as Record<string, any>;
          const current = map[String(eventId)];
          if (current) {
            map[String(eventId)] = { ...current, status };
            sessionStorage.setItem(
              EVENT_SNAPSHOT_STORAGE_KEY,
              JSON.stringify(map),
            );
          }
        }
      } catch {
        // no-op
      }
    }
    return response;
  } catch (error) {
    console.error("Error changing event status:", error);
    throw error;
  }
};

export const apiClient = {
  async getEvents(page = 1, pageSize = 20, options?: RequestOptions) {
    const payload = await requestApi<any>(
      {
        method: "GET",
        url: "/api/events",
        params: { page, pageSize },
      },
      options,
    );

    if (Array.isArray(payload)) {
      return { events: payload, total: payload.length, page, pageSize };
    }

    return payload;
  },

  async getEventsByCity(city: string, options?: RequestOptions) {
    return requestApi(
      {
        method: "GET",
        url: "/api/events/getbycity",
        params: { city },
      },
      options,
    );
  },

  async getEventById(eventId: string, options?: RequestOptions) {
    return getEventById(eventId, options);
  },

  async getUserByUid(uid: string, options?: RequestOptions) {
    return getUserByUid(uid, options);
  },

  async getUserById(id: string, options?: RequestOptions) {
    return getUserById(id, options);
  },

  async getOrganizerEvents(organizerId: string, options?: RequestOptions) {
    return getEventsByOrganizerId(organizerId, options);
  },

  async getAdminStats(options?: RequestOptions) {
    return getAdminStats(options);
  },

  async getAdminUsers(options?: RequestOptions) {
    return getAdminUsers(options);
  },

  async createAdminUser(data: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) {
    return createAdminUser(data);
  },

  async updateAdminUserStatus(userId: string, active: boolean) {
    return updateAdminUserStatus(userId, active);
  },

  async deleteAdminUser(userId: string) {
    return deleteAdminUser(userId);
  },

  async getUserBookings(userId: string) {
    return getUserBookings(userId);
  },

  async bookTicket(data: Record<string, unknown>) {
    const response = await requestApi(
      {
        method: "POST",
        url: "/api/bookings",
        data,
      },
      { cache: false },
    );

    invalidateApiCache(/\/api\/(bookings|events)/);
    return response;
  },
};

type EventDraftPayload = {
  eventId?: string;
  title: string;
  description: string;
  category: string;
  startDatetime: string;
  endDatetime: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  totalCapacity: number;
  ticketType: "FREE" | "PAID";
  ticketPrice: number;
  currency: string;
  s3URLString?: string;
};

type EventMutationPayload = EventDraftPayload & {
  eventId: string;
  s3URLString: string;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

const parseEventFormData = (formData: FormData) => {
  if (!(formData instanceof FormData) || [...formData.keys()].length === 0) {
    throw new Error("Event form data is empty");
  }

  const imageFile = formData.get("file");
  if (!(imageFile instanceof File)) {
    throw new Error("Invalid file");
  }

  const dataField = formData.get("data");
  if (typeof dataField !== "string") {
    throw new Error("Invalid event payload");
  }

  const payload = JSON.parse(dataField) as EventDraftPayload;
  const normalizedTicketType: "FREE" | "PAID" =
    payload.ticketType === "PAID" ? "PAID" : "FREE";

  return {
    imageFile,
    payload: {
      ...payload,
      ticketType: normalizedTicketType,
    } as EventDraftPayload,
  };
};

const buildEventMutationPayload = async (
  imageFile: File,
  payload: EventDraftPayload,
  headers: HeadersInit,
  existingEventId?: string | null,
): Promise<EventMutationPayload> => {
  const uploadJson = await uploadEventImage(
    imageFile,
    headers,
    existingEventId,
  );
  const { uploadUrl, fileUrl, eventId } = uploadJson.data ?? {};

  if (!uploadUrl || !fileUrl) {
    throw new Error("Upload URL generation failed");
  }

  await uploadToS3(imageFile, uploadUrl);

  const resolvedEventId = String(eventId || payload.eventId || "").trim();
  if (!resolvedEventId) {
    throw new Error("Missing event ID");
  }

  return {
    ...payload,
    eventId: resolvedEventId,
    s3URLString: String(fileUrl),
  };
};

const handleEventMutationResponse = async (
  response: Response,
  action: string,
) => {
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      (result && typeof result === "object" && "error" in result
        ? String((result as { error?: unknown }).error)
        : null) || `Failed to ${action} event`,
    );
  }

  invalidateApiCache(/\/api\/events/);
  return result;
};

export const createEvent = async (formData: FormData) => {
  try {
    const headers = getAuthHeaders();
    const { imageFile, payload } = parseEventFormData(formData);
    const createPayload = await buildEventMutationPayload(
      imageFile,
      payload,
      headers,
      null,
    );

    const response = await updateEventDetails(createPayload);
    return handleEventMutationResponse(response, "create");
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

const uploadToS3 = async (file: File, uploadUrl: string) => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return true;
};

export const updateEventDetails = async (payload: {
  eventId: string;
  title: string;
  description: string;
  category: string;
  startDatetime: string;
  endDatetime: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  totalCapacity: number;
  ticketType: "FREE" | "PAID";
  ticketPrice: number;
  currency: string;
  s3URLString: string;
}) => {
  const token = getAccessToken();

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch("/api/events/create", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  invalidateApiCache(/\/api\/(events|getbyid|getbyOrganizer|admin\/events)/);
  return response;
};

export const uploadEventImage = async (
  file: File,
  headers: HeadersInit,
  eventId?: string | null,
) => {
  let baseUrl = "/api/events/upload";
  if (eventId) {
    baseUrl += `?id=${encodeURIComponent(eventId)}`;
  }

  const uploadResponse = await fetch(baseUrl, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      isBanner: true,
    }),
  });

  return uploadResponse.json();
};

export const updateEvent = async (formData: FormData) => {
  try {
    // ✅ Validate FormData
    if (!(formData instanceof FormData) || [...formData.keys()].length === 0) {
      throw new Error("Event form data is empty");
    }

    const headers = getAuthHeaders();

    // ✅ Extract and validate payload
    const dataField = formData.get("data");
    if (typeof dataField !== "string") {
      throw new Error("Invalid event payload");
    }

    const payload = JSON.parse(dataField) as EventDraftPayload;
    const eventId = String(payload.eventId || "").trim();

    if (!eventId) {
      throw new Error("Event ID is missing");
    }

    let bannerS3Url = payload.s3URLString;

    // ✅ Handle file upload
    const imageEntry = formData.get("file");

    if (formData.has("file") && imageEntry instanceof File) {
      const file = imageEntry;

      // Step 1: Get pre-signed URL
      const uploadResponse = await fetch(
        `/api/events/upload?eventId=${eventId}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isBanner: true,
          }),
        },
      );

      // ✅ Read response ONLY ONCE
      const uploadJson = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadJson.error || "Failed to get upload URL");
      }

      // Step 2: Upload to S3
      await uploadToS3(file, uploadJson.data.uploadUrl);

      // Step 3: Save file URL
      bannerS3Url = uploadJson.data.fileUrl;
    }

    // ✅ Prepare payload
    const newPayload = {
      description: payload.description,
      venueName: payload.venueName,
      address: payload.address,
      city: payload.city,
      bannerS3Url,
    };

    // ✅ Update event
    const response = await fetch(`/api/events/update?id=${eventId}`, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPayload),
    });

    // ✅ Read response ONLY ONCE
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update event");
    }

    return result;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const getEventReviews = async (eventId: string) => {
  try {
    const url = new URL("/api/events/reviews", window.location.origin);
    url.searchParams.append("eventId", eventId);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch event reviews");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching event reviews:", error);
    throw error;
  }
};

export const createReview = async (
  data: any
) => {
  try {
    const response = await fetch("/api/events/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: data.eventId,
        rating: data.rating,
        comment: data.comment,
        userName: data.userName,
        bookingId: data.bookingId,
        userId: data.userId,
      }),
    });

    invalidateApiCache(/\/api\/events\/reviews/);
    return response;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  const response = await fetch(`/api/events?id=${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.json();
};

export const deleteReview = async (eventId: string, reviewId: string) => {
  const response = await fetch(
    `/api/events/reviews?id=${reviewId}&eventId=${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
  return response.json();
};

export const createBooking = async (data: Record<string, unknown>) => {
  try {
    const accessToken = getAccessToken();

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    invalidateApiCache(/\/api\/(bookings|events)/);

    if (!response.ok) {
      throw new Error("Booking failed");
    }

    return response;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export async function createOrder(data: Record<string, unknown>) {
  try {
    const accessToken = getAccessToken();

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

export const verifyPayment = async (data: any) => {
  try {
    const response = await fetch(`/api/orders/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Verification failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Something went wrong");
  }
};

export const updateOrderStatus = async (bookingId: string) => {
  try {
    const response = await fetch("/api/orders/update-status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`, // Implement getAccessToken to retrieve the token from cookies/localStorage
      },
      body: JSON.stringify({ bookingId }),
    });
    if (!response.ok) {
      throw new Error("Failed to update order status");
    }
    const result = await response.json();
    console.log("Order status updated successfully:");
    return result?.data;
  } catch (error) {
    console.error("Error updating order status:", error);
  }
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const response = await fetch("/api/users/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    return response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

export const checkUserExistence = async (email: string, otp: string) => {
  try {
    const response = await fetch("/api/users/exist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });
    return response.json();
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
};

export const sendOTP = async (email: string) => {
  try {
    const response = await fetch("/api/mail/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const resetPassword = async (email: string, newPassword: string) => {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });
    return response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const getBookedSeats = async (eventId: string) => {
  try {
    const response = await fetch(
      `/api/bookings/getbookedseats?eventId=${encodeURIComponent(eventId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    throw error;
  }
};

createReview;

export const requestOrganizerAccess = async (userId:string) => {
  try {
    const response = await fetch("/api/users/request-organizer?id=" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    const data = await response.json();
    return { success: true, message: data?.message || "Request submitted successfully" };
  } catch (error) {
    console.error("Error requesting organizer access:", error);
    throw error;
  }
};

export const getRequestStatus = async () => {
  try {
    const response = await fetch("/api/users/request-organizer", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      }
    });
    return response.json();
  } catch (error) {
    console.error("Error requesting organizer access:", error);
    throw error;
  }
};


export const changeUserStatus = async (userId:string , isApproved:boolean) => {
  try {
    const response = await fetch("/api/users/request-organizer?id=" + userId, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ isApproved })
    });
    return response.json();
  } catch (error) {
    console.error("Error requesting organizer access:", error);
    throw error;
  }
};


export const provideVerifier = async (eventId:string) => {
  try {
    const response = await fetch("/api/users/provide-verifier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ eventId })
    });
    return response.json();
  } catch (error) {
    console.error("Error providing verifier:", error);
    throw error;
  }
};

export const createUser = (data:any) =>{
   try{
    const response = fetch("/api/admin/users/create", {
      method: "POST",
      headers: {  
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return response;
    }catch(error){
      console.error("Error creating user:", error);
      throw error;
    }
}

export const getSeats = async (eventId:string) => {
  try {
    const response = await fetch(`/api/seats?id=${encodeURIComponent(eventId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching seats:", error);
    throw error;
  }
};

export const deleteBooking = async (bookingId:string) => {
  try {
    const response = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}
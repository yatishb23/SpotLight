type UUID = string;

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;
type QueryParams = Record<string, QueryValue>;
type JsonBody = Record<string, unknown>;

type ResponseType = "json" | "text" | "arrayBuffer";

export interface ServiceClientConfig {
  baseUrl: string;
  accessToken?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  userId?: UUID;
  userRole?: string;
  responseType?: ResponseType;
}

export class ServiceApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ServiceApiError";
    this.status = status;
    this.body = body;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildQueryString(query?: QueryParams): string {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function resolveErrorMessage(parsedBody: unknown, status: number): string {
  if (parsedBody && typeof parsedBody === "object") {
    const bodyAsRecord = parsedBody as Record<string, unknown>;
    const msg = bodyAsRecord.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return `Request failed with status ${status}`;
}

abstract class BaseServiceClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  protected constructor(
    private readonly config: ServiceClientConfig,
    private readonly serviceBasePath: string,
  ) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.timeoutMs = config.timeoutMs ?? 15000;
  }

  protected async request<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const method = options.method ?? "GET";
    const responseType = options.responseType ?? "json";
    const query = buildQueryString(options.query);
    const url = `${this.baseUrl}${this.serviceBasePath}${path}${query}`;

    const headers: Record<string, string> = {
      ...(this.config.defaultHeaders ?? {}),
      ...(options.headers ?? {}),
    };

    if (this.config.accessToken && !headers.Authorization) {
      headers.Authorization = `Bearer ${this.config.accessToken}`;
    }
    if (options.userId) headers["X-User-Id"] = options.userId;
    if (options.userRole) headers["X-User-Role"] = options.userRole;

    const isJsonBody =
      options.body !== undefined &&
      options.body !== null &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof URLSearchParams);

    if (isJsonBody && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
      () => timeoutController.abort(),
      this.timeoutMs,
    );

    if (options.signal) {
      if (options.signal.aborted) timeoutController.abort();
      else {
        options.signal.addEventListener(
          "abort",
          () => timeoutController.abort(),
          { once: true },
        );
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body:
          options.body === undefined || options.body === null
            ? undefined
            : isJsonBody
              ? JSON.stringify(options.body)
              : (options.body as BodyInit),
        signal: timeoutController.signal,
        cache: "no-store",
      });

      let parsedBody: unknown;

      if (responseType === "text") {
        parsedBody = await response.text();
      } else if (responseType === "arrayBuffer") {
        parsedBody = await response.arrayBuffer();
      } else {
        const rawText = await response.text();
        parsedBody = rawText ? JSON.parse(rawText) : null;
      }

      if (!response.ok) {
        throw new ServiceApiError(
          resolveErrorMessage(parsedBody, response.status),
          response.status,
          parsedBody,
        );
      }

      return parsedBody as T;
    } catch (error) {
      if (error instanceof ServiceApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceApiError("Request timeout/aborted", 408, null);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class AuthServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/auth");
  }

  register<T = unknown>(payload: JsonBody, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/register", {
      method: "POST",
      body: payload,
      signal,
    });
  }

  login<T = unknown>(payload: JsonBody, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/login", { method: "POST", body: payload, signal });
  }

  refresh<T = unknown>(refreshToken: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/refresh", {
      method: "POST",
      body: { refreshToken },
      signal,
    });
  }

  logout<T = unknown>(refreshToken: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/logout", {
      method: "POST",
      body: { refreshToken },
      signal,
    });
  }

  logoutAll<T = unknown>(userId: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/logout-all", {
      method: "POST",
      userId,
      signal,
    });
  }
}

export class UserAuthServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/auth");
  }

  signup<T = unknown>(payload: JsonBody, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/signup", {
      method: "POST",
      body: payload,
      signal,
    });
  }

  login<T = unknown>(payload: JsonBody, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/login", { method: "POST", body: payload, signal });
  }

  googleLogin<T = unknown>(
    payload: JsonBody,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/google", {
      method: "POST",
      body: payload,
      signal,
    });
  }

  logout<T = unknown>(refreshToken: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/logout", {
      method: "POST",
      body: { refreshToken },
      signal,
    });
  }
}

export class UserServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/users");
  }

  getUserById<T = unknown>(id: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${id}`, { signal });
  }

  updateUser<T = unknown>(
    id: UUID,
    payload: JsonBody,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${id}`, { method: "PUT", body: payload, signal });
  }

  deleteUser<T = unknown>(id: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${id}`, {
      method: "DELETE",
      signal,
      responseType: "text",
    });
  }

  requestOrganizer<T = unknown>(signal?: AbortSignal): Promise<T> {
    return this.request<T>("/request-organizer", {
      method: "POST",
      signal,
      responseType: "text",
    });
  }

  getUserByTenantId<T = unknown>(
    tenantId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/tenant/${tenantId}`, { signal });
  }
}

export class AdminServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/admin/users");
  }

  getAllUsers<T = unknown>(signal?: AbortSignal): Promise<T> {
    return this.request<T>("/getAll", { signal });
  }

  getUserById<T = unknown>(id: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${id}`, { signal });
  }

  changeUserRole<T = unknown>(
    id: UUID,
    role: string,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${id}/role`, {
      method: "PUT",
      query: { role },
      signal,
    });
  }

  updateUserStatus<T = unknown>(
    id: UUID,
    active: boolean,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${id}/status`, {
      method: "PUT",
      query: { active },
      signal,
    });
  }

  approveOrganizer<T = unknown>(id: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${id}/approve-organizer`, {
      method: "PUT",
      signal,
    });
  }

  deleteUser<T = unknown>(id: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${id}`, {
      method: "DELETE",
      signal,
      responseType: "text",
    });
  }

  createUser<T = unknown>(payload: JsonBody, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/create", {
      method: "POST",
      body: payload,
      signal,
    });
  }
}

export class EventServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/events");
  }

  createEvent<T = unknown>(
    payload: JsonBody,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("", {
      method: "POST",
      body: payload,
      userId,
      signal,
    });
  }

  getReviews<T = unknown>(eventId: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${eventId}/reviews`, { signal });
  }

  deleteReview<T = unknown>(
    eventId: UUID,
    reviewId: UUID,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}/reviews/${reviewId}`, {
      method: "DELETE",
      userId,
      signal,
    });
  }

  getUploadUrl<T = unknown>(
    params: { fileName: string; contentType: string; isBanner?: boolean },
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/upload", {
      method: "POST",
      query: {
        fileName: params.fileName,
        contentType: params.contentType,
        isBanner: params.isBanner ?? false,
      },
      userId,
      signal,
    });
  }

  getEventById<T = unknown>(eventId: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>(`/${eventId}`, { signal });
  }

  getAllEvents<T = unknown>(
    filters?: {
      keyword?: string;
      category?: string;
      city?: string;
      fromDate?: string;
      toDate?: string;
    },
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("", { query: filters, signal });
  }

  getMyEvents<T = unknown>(
    organizerId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/my", { userId: organizerId, signal });
  }

  updateEvent<T = unknown>(
    eventId: UUID,
    payload: JsonBody,
    organizerId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}`, {
      method: "PUT",
      body: payload,
      userId: organizerId,
      signal,
    });
  }

  publishEvent<T = unknown>(
    eventId: UUID,
    organizerId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}/publish`, {
      method: "PATCH",
      userId: organizerId,
      signal,
    });
  }

  cancelEvent<T = unknown>(
    eventId: UUID,
    organizerId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}/cancel`, {
      method: "PATCH",
      userId: organizerId,
      signal,
    });
  }

  deleteEvent<T = unknown>(
    eventId: UUID,
    organizerId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}`, {
      method: "DELETE",
      userId: organizerId,
      signal,
    });
  }

  createReview<T = unknown>(
    eventId: UUID,
    payload: JsonBody,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${eventId}/reviews`, {
      method: "POST",
      body: payload,
      userId,
      signal,
    });
  }
}

export class BookingServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/bookings");
  }

  createBooking<T = unknown>(
    payload: JsonBody,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("", {
      method: "POST",
      body: payload,
      userId,
      signal,
    });
  }

  getBookingById<T = unknown>(
    bookingId: UUID,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${bookingId}`, { userId, signal });
  }

  getMyBookings<T = unknown>(userId: UUID, signal?: AbortSignal): Promise<T> {
    return this.request<T>("/my", { userId, signal });
  }

  getBookingsByEventId<T = unknown>(
    eventId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/event/${eventId}`, { signal });
  }

  cancelBooking<T = unknown>(
    bookingId: UUID,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/${bookingId}`, {
      method: "DELETE",
      userId,
      signal,
    });
  }

  verifyQr<T = unknown>(
    payload: JsonBody,
    verifierId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/verify/qr", {
      method: "POST",
      body: payload,
      userId: verifierId,
      signal,
    });
  }

  downloadQr(
    bookingId: UUID,
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<ArrayBuffer> {
    return this.request<ArrayBuffer>(`/${bookingId}/qr`, {
      userId,
      signal,
      responseType: "arrayBuffer",
    });
  }
}

export class NotificationServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/notifications");
  }

  sendNotification<T = unknown>(
    payload: JsonBody,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/send", { method: "POST", body: payload, signal });
  }

  getMyNotifications<T = unknown>(
    userId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/my", { userId, signal });
  }
}

export class PaymentServiceApi extends BaseServiceClient {
  constructor(config: ServiceClientConfig) {
    super(config, "/api/v1/payments");
  }

  createOrder<T = unknown>(
    payload: JsonBody,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>("/create-order", {
      method: "POST",
      body: payload,
      signal,
    });
  }

  getByBookingId<T = unknown>(
    bookingId: UUID,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>(`/booking/${bookingId}`, { signal });
  }
}

export interface ServiceClientRegistryConfig {
  authService: ServiceClientConfig;
  userAuthService: ServiceClientConfig;
  userService: ServiceClientConfig;
  adminService: ServiceClientConfig;
  eventService: ServiceClientConfig;
  bookingService: ServiceClientConfig;
  notificationService: ServiceClientConfig;
  paymentService: ServiceClientConfig;
}

export function createServiceClients(config: ServiceClientRegistryConfig) {
  return {
    authService: new AuthServiceApi(config.authService),
    userAuthService: new UserAuthServiceApi(config.userAuthService),
    userService: new UserServiceApi(config.userService),
    adminService: new AdminServiceApi(config.adminService),
    eventService: new EventServiceApi(config.eventService),
    bookingService: new BookingServiceApi(config.bookingService),
    notificationService: new NotificationServiceApi(config.notificationService),
    paymentService: new PaymentServiceApi(config.paymentService),
  };
}

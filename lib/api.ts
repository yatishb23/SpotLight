import axios from "axios";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

const getAuthConfig = () => {
  const token = getAccessToken();

  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getEventsById = async (eventId: string) => {
  try {
    const response = await axios.get(`/api/events/getbyid?id=${eventId}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
};

export const getEventById = async (eventId: string) => {
  return getEventsById(eventId);
};

export const getEventsByOrganizerId = async (organizerId: string) => {
  try {
    const response = await axios.get(
      `/api/events/getbyOrganizer?organizerId=${organizerId}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching events by organizer ID:", error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const authConfig = getAuthConfig();
    const response = await Promise.all([
      axios.get("/api/admin/events"),
      axios.get("/api/admin/users/getall"),
    ]);

    return {
      events: response[0].data,
      users: response[1].data,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const response = await axios.get(
      `/api/bookings/getbyuser?id=${userId}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

export const getBookingsByEvent = async (eventId: string) => {
  try {
    const response = await axios.get(
      `/api/bookings/getbyevent?id=${eventId}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

export const changeEventStatus = async (eventId: string, status: string) => {
  try {
    const response = await axios.post(
      `/api/admin/events/changestatus`,
      {
        eventId,
        status,
      },
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    console.error("Error changing event status:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await axios.delete(
      `/api/admin/events/delete?id=${eventId}`,
      getAuthConfig(),
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const apiClient = {
  async getEvents(page = 1, pageSize = 20) {
    const response = await axios.get("/api/events", {
      ...getAuthConfig(),
      params: { page, pageSize },
    });

    const payload = response.data;
    if (Array.isArray(payload)) {
      return { events: payload, total: payload.length, page, pageSize };
    }

    return payload;
  },

  async getEventById(eventId: string) {
    const response = await axios.get(
      `/api/events/getbyid?id=${eventId}`,
      getAuthConfig(),
    );
    return response.data?.data ?? response.data;
  },

  async getOrganizerEvents(organizerId: string) {
    return getEventsByOrganizerId(organizerId);
  },

  async getUserBookings(userId: string) {
    const response = await axios.get(
      `/api/bookings/getbyuser?id=${userId}`,
      getAuthConfig(),
    );
    return response.data;
  },

  async bookTicket(data: Record<string, unknown>) {
    const response = await axios.post("/api/bookings", data, getAuthConfig());
    return response.data;
  },
};

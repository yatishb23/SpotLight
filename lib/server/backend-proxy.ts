import { NextRequest, NextResponse } from "next/server";

type ProxyOptions = {
  backendPath?: string;
};

const gatewayUrl =
  process.env.BACKEND_URL ||
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:1111";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getServiceBaseUrl(pathname: string) {
  const authUrl = process.env.AUTH_SERVICE_URL || gatewayUrl;
  const eventUrl = process.env.EVENT_SERVICE_URL || gatewayUrl;
  const userUrl = process.env.USER_SERVICE_URL || gatewayUrl;
  const bookingUrl = process.env.BOOKING_SERVICE_URL || gatewayUrl;
  const paymentUrl = process.env.PAYMENT_SERVICE_URL || gatewayUrl;
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || gatewayUrl;

  if (pathname.startsWith("/api/auth")) return trimTrailingSlash(authUrl);
  if (pathname.startsWith("/api/events")) return trimTrailingSlash(eventUrl);
  if (pathname.startsWith("/api/users") || pathname.startsWith("/api/admin")) {
    return trimTrailingSlash(userUrl);
  }
  if (
    pathname.startsWith("/api/bookings") ||
    pathname.startsWith("/api/tickets")
  ) {
    return trimTrailingSlash(bookingUrl);
  }
  if (pathname.startsWith("/api/payments"))
    return trimTrailingSlash(paymentUrl);
  if (pathname.startsWith("/api/notifications")) {
    return trimTrailingSlash(notificationUrl);
  }

  return trimTrailingSlash(gatewayUrl);
}

function buildTargetUrl(request: NextRequest, backendPath?: string) {
  const url = new URL(request.url);
  const targetPath = backendPath || url.pathname;
  const baseUrl = getServiceBaseUrl(targetPath);
  return `${baseUrl}${targetPath}${url.search}`;
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");

  if (!headers.has("authorization")) {
    const authCookie = request.cookies.get("auth_token")?.value;
    if (authCookie) {
      headers.set("authorization", `Bearer ${authCookie}`);
    }
  }

  return headers;
}

async function getRequestBody(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  return await request.arrayBuffer();
}

export async function proxyToBackend(
  request: NextRequest,
  options?: ProxyOptions,
) {
  const requestUrl = new URL(request.url);
  const targetPath = options?.backendPath || requestUrl.pathname;
  const gatewayBaseUrl = trimTrailingSlash(gatewayUrl);
  const requestBody = await getRequestBody(request);
  const targetUrl = buildTargetUrl(request, options?.backendPath);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: copyRequestHeaders(request),
      body: requestBody,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const fallbackUrl = `${gatewayBaseUrl}${targetPath}${requestUrl.search}`;
    const isEventRoute = targetPath.startsWith("/api/events");

    // If dedicated event service is down, retry through API gateway.
    if (isEventRoute && targetUrl !== fallbackUrl) {
      try {
        const fallbackResponse = await fetch(fallbackUrl, {
          method: request.method,
          headers: copyRequestHeaders(request),
          body: requestBody,
          cache: "no-store",
          redirect: "manual",
        });

        const fallbackHeaders = new Headers(fallbackResponse.headers);
        fallbackHeaders.delete("content-encoding");
        fallbackHeaders.delete("transfer-encoding");

        return new NextResponse(fallbackResponse.body, {
          status: fallbackResponse.status,
          headers: fallbackHeaders,
        });
      } catch (fallbackError) {
        console.error("API proxy fallback failed:", fallbackError);
      }
    }

    console.error("API proxy failed:", error);
    return NextResponse.json(
      { message: "Failed to connect to backend service" },
      { status: 502 },
    );
  }
}

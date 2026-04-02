import { NextRequest, NextResponse } from "next/server";

const AUTH_REQUEST_TIMEOUT_MS = 10000;

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      AUTH_REQUEST_TIMEOUT_MS,
    );

    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!data?.success) {
      return NextResponse.json(
        { error: data?.message || "Invalid email or password" },
        { status: data?.code || response.status || 401 },
      );
    }
    // localStorage.setItem('userId', data.user.id);
    const res = NextResponse.json({
      success: true,
      user: data,
    });
    return res;
  } catch (error: any) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { error: "An error occurred during login. Backend may be offline." },
      { status: 503 },
    );
  }
}

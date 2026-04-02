import { NextRequest, NextResponse } from "next/server";

const AUTH_REQUEST_TIMEOUT_MS = 10000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      AUTH_REQUEST_TIMEOUT_MS,
    );

    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

    if (!response.ok || data?.success === false) {
      return NextResponse.json(
        { error: data?.message || "Signup failed" },
        { status: data?.code || response.status || 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error("[Signup Error]", error);
    return NextResponse.json(
      { error: "An error occurred during signup. Backend may be offline." },
      { status: 503 },
    );
  }
}

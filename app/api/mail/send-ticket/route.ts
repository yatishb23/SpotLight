import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, pdf } = body;

    if (!email || !pdf) {
      return NextResponse.json(
        { error: "Email and PDF data are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/mail/send-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pdf }),
      cache: "no-store",
    });

    let data: any = {};
    if (response.headers.get("content-type")?.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
        return NextResponse.json(
          { error: data?.message || "Failed to send ticket email" },
          { status: response.status }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Mail Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

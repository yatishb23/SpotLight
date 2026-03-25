import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/server/backend-proxy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

     const response =await fetch(`${process.env.BACKEND_URL}/api/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }); 
    if(response.ok){
      const eventData = await response.json();
      return NextResponse.json({ data: eventData?.data ?? eventData });
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData?.message || "Failed to create event" },
        { status: errorData?.code || response.status || 500 }
      );
    }
  } catch (error) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("id");
    console.log(eventId);
    
    if (!eventId) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${eventId}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch event details");
    }

    const eventData = await response.json();
    return NextResponse.json({ data: eventData?.data ?? eventData });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
   const organizerId =
      request.nextUrl.searchParams.get("organizerId") ||
      request.nextUrl.searchParams.get("id");

    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!organizerId) {
      return NextResponse.json(
        { error: "Organizer id is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/events/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-User-Id": organizerId,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch events by organizer");
    }

    const eventsData = await response.json();
    return NextResponse.json({ data: eventsData?.data ?? eventsData });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events by organizer" },
      { status: 500 },
    );
  }
}

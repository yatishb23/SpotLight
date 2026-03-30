import { NextRequest,NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  const accessToken = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 401 },
    );
  }
  try{
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/bookings/${eventId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bookings by event:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings by event" },
      { status: 500 },
    );
  }
}
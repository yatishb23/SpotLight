import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${eventId}/reviews`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch event reviews");
    }
    const reviewsData = await response.json();
    return NextResponse.json(reviewsData?.data ?? reviewsData);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch event reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const body = await request.json();
    if (!body.eventId) {
      return NextResponse.json(
        { error: "Event id is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${body.eventId}/reviews`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-User-Id": body.userId,
        },
        body: JSON.stringify({
          rating: body.rating,
          comment: body.comment,
          userName: body.userName,
          bookingId: body.bookingId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch event reviews");
    }
    const reviewsData = await response.json();
    return NextResponse.json(reviewsData?.data ?? reviewsData);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch event reviews" },
      { status: 500 },
    );
  }
}

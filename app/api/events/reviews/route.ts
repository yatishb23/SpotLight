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
      return NextResponse.json(
        { message: "You cannot submit a review for this event before it has occurred" },
        {status: 400}
      );
    }
    const reviewsData = await response.json();
    console.log(reviewsData);
    
    
    return NextResponse.json(reviewsData?.data ?? reviewsData);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch event reviews" },
      { status: 500 },
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const reviewId = request.nextUrl.searchParams.get("id");
    const eventId = request.nextUrl.searchParams.get("eventId");
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    if (!reviewId || !eventId) {
      return NextResponse.json(
        { error: "Review id and Event id are required" },
        { status: 400 },
      );
    }
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/events/${eventId}/reviews/${reviewId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log(response);
    
    if (!response.ok) {
      throw new Error("Failed to delete review");
    }
    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 },
    );
  }
}


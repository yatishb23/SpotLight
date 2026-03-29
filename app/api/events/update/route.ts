import { Search } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const eventId =
      request.nextUrl.searchParams.get("organizerId") ||
      request.nextUrl.searchParams.get("id")

     const response =await fetch(`${process.env.BACKEND_URL}/api/events/${eventId}`, {
      method: "PUT",
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
        { error: errorData?.message || "Failed to update event" },
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

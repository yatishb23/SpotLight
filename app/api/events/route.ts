import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(
      `${process.env.BACKEND_URL}/api/events`,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const existingEventId = request.nextUrl.searchParams.get("id");
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    const response = await axios.delete(
      `${process.env.BACKEND_URL}/api/events/${existingEventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}

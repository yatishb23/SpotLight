import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }
    
    const response = await axios.get(
      `${process.env.BACKEND_URL}/api/events?city=${city}`
    );
    
    return NextResponse.json(response.data);
  } catch (err) {
    console.error("Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
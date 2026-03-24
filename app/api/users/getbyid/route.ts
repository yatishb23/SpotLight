import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("id");

    const response =await axios.get(`${process.env.BACKEND_URL}/api/users/tenant/${userId}`)
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[v0] Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 },
    );
  }
}

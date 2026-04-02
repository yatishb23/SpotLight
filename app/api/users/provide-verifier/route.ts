import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    const accessToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId in request body" },
        { status: 400 },
      );
    }
    console.log(eventId);
    
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          eventId: eventId,
        }
      },
    );
    const result = await response.json();
    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error providing verifier:", error);
    return NextResponse.json(
      { error: "Failed to provide verifier" },
      { status: 500 },
    );
  }
}

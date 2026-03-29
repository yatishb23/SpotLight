import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 },
      );
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || "default_secret",
    );
    
    const userId = (decodedToken as any).userId;
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({
        userEmail: decodedToken.sub,
        eventId: body.eventId,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        currency: body.currency,
        eventName: body.eventName,
        seatNo: body.seatNo,
      }),
    });

    const parseJSON = async (res: Response) => {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    };

    if (response.ok) {
      const bookingsData = await parseJSON(response);

      return NextResponse.json({
        data: bookingsData?.data ?? bookingsData ?? [],
      });
    } else {
      const errorData = await parseJSON(response);

      return NextResponse.json(
        { error: errorData?.message || "Failed to fetch bookings" },
        { status: errorData?.code || response.status || 500 },
      );
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);

    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

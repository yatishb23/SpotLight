import { get } from "http";
import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    console.log(body);
    const decodedToken: any = jwt.decode(accessToken || "");
    const userId = decodedToken?.userId;
    console.log(userId);
    
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/bookings/${body.bookingId}/confirm-payment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(body),
      },
    );

    const backendData = await backendRes.json();
    console.log(backendData);
    
    if (!backendRes.ok) {
      return NextResponse.json(
        { message: backendData.message || "Booking failed" },
        { status: 500 },
      );
    }

    return NextResponse.json(backendData);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

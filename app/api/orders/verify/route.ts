import { get } from "http";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    console.log(body);
    
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/v1/payments/confirm`,
      {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), 
      }
    );

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: backendData.message || "Booking failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(backendData);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/payments/create-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const parseJSON = async (res: Response) => {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    };

    if (response.ok) {
      const eventData = await parseJSON(response);

      return NextResponse.json({
        data: eventData?.data ?? eventData,
      });
    } else {
      const errorData = await parseJSON(response);

      return NextResponse.json(
        { error: errorData?.message || "Failed to create order" },
        { status: errorData?.code || response.status || 500 }
      );
    }
  } catch (error) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const accessToken = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");
    console.log(body+" "+accessToken);
    
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
    const data= await response.json();
    if(response.ok){
      return NextResponse.json(data);
    }
      return NextResponse.json(
        { error: data.message || "Failed to create order" },
        { status: data.code || response.status || 500 }
      );
  } catch (error) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
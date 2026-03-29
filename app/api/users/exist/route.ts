import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    const checkRes = await fetch(
      `${process.env.BACKEND_URL}/api/users/exists?email=${email}`
    );

    const checkData = await checkRes.json();
    console.log(checkData);
    
    // 2. If exists → send OTP email
    if (checkData.exists) {
      const mailRes = await fetch(
        "http://localhost:3000/api/mail/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      if (!mailRes.ok) {
        return NextResponse.json(
          { error: "Failed to send OTP" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      });
    }

    // 3. If user not found
    return NextResponse.json(
      { error: "User does not exist" },
      { status: 404 }
    );

  } catch (err) {
    console.error("Error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
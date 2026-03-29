import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send Mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:40px 10px;">
          
          <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:20px;text-align:center;color:white;">
                <h2 style="margin:0;font-size:22px;">🔐 OTP Verification</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;text-align:center;color:#333;">
                <p style="font-size:16px;margin-bottom:10px;">
                  Hello 👋,
                </p>
                <p style="font-size:14px;color:#555;margin-bottom:25px;">
                  Use the OTP below to continue. This code is valid for 5 minutes.
                </p>

                <!-- OTP Box -->
                <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#4f46e5;background:#f1f5ff;padding:15px 25px;border-radius:8px;display:inline-block;margin-bottom:25px;">
                  ${otp}
                </div>

                <p style="font-size:13px;color:#777;margin-top:20px;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#888;">
                © ${new Date().getFullYear()} Your App. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
`,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Error sending OTP:", err);

    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

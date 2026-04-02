import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { to, loginId, password } = await req.json();
    console.log(to+" "+loginId+" "+password);
    if (!to || !loginId || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }
    
    
    // 🔥 Gmail SMTP Transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // 🔥 Email Content (HTML)
    const mailOptions = {
      from: `"Event Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🎟️ Verifier Credentials",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Verifier Credentials</h2>
          <p>Your verifier account has been created.</p>

          <div style="background:#f5f5f5; padding:15px; border-radius:8px;">
            <p><strong>Login ID:</strong> ${loginId}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>

          <p style="margin-top:15px;">
            Use these credentials to login and verify tickets.
          </p>

          <hr/>
          <small>This is an automated message.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("MAIL ERROR:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
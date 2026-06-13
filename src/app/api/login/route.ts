import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { dbSetOtp } from "@/lib/server/server.firestoreInterface";

export async function POST(req: Request) {
  
  const { email, password } = await req.json();
  // Only allow the configured admin email & password
  if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Generate OTP
  const { otp, challengeId } = await generateOtp(email);
  console.log("OTP:", otp);
  // Configure mailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Send OTP email
  await transporter.sendMail({
    from: `"Admin Login" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });

  return NextResponse.json(
    { message: "OTP sent", challengeId },
    { status: 200 }
  );
}

async function generateOtp(userId:string, digits = 6) {

  const bytes = crypto.randomBytes(4).readUInt32BE() % (10 ** digits);
  const otp = bytes.toString().padStart(digits, "0");
  const challengeId: string = crypto.randomUUID();
  await dbSetOtp(userId, challengeId, otp, Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
  return { otp, challengeId };

}
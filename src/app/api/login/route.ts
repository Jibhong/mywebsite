import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { dbGetString, dbRemoveString, dbSetString } from "@/app/lib/dbHandler";


export async function POST(req: Request) {
  const { email, password } = await req.json();
  // Only allow the configured admin email & password
  if (email !== process.env.EMAIL || password !== process.env.PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await dbRemoveString("TOKEN");

  // Generate OTP
  const currentOtp = await generateOtp();
  console.log(`OTP: ${currentOtp}`)

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
    text: `Your OTP is ${currentOtp}`,
  });
  return NextResponse.json({ message: "OTP sent" });
}

async function generateOtp(digits = 6) {
  
  const bytes = crypto.randomBytes(4).readUInt32BE() % (10 ** digits);
  const newOtp =  bytes.toString().padStart(digits, "0");
  await dbSetString("OTP", newOtp);
  return newOtp;

}

export async function getCurrentOtp() {
  try {
    return await dbGetString("OTP");
  } catch {
    return null;
  }
}
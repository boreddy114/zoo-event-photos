import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, photoUrl } = await request.json();

    if (!email || !photoUrl) {
      return NextResponse.json({ success: false, error: "Email and photo URL are required" }, { status: 400 });
    }

    let transporter;

    // Use environment variables if set (e.g. Gmail App Password, Resend, Sendgrid)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465", 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Test Ethereal Account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
      console.warn("Using Ethereal Email test account. Link will be printed in response.");
    }

    let attachments = [];
    let embeddedHtmlImage = '';

    if (photoUrl.startsWith('http')) {
      // It's a live Supabase URL! Attach it natively.
      attachments.push({ filename: 'zoo-event-photo.jpg', path: photoUrl });
      embeddedHtmlImage = `<div style="text-align: center; margin: 20px 0;"><img src="${photoUrl}" alt="Your Event Photo" style="max-width: 100%; border-radius: 12px;" /></div>`;
    } else if (photoUrl.startsWith('data:image')) {
       // Fallback for memory mode
       attachments.push({ path: photoUrl, cid: 'eventphoto' });
       embeddedHtmlImage = `<div style="text-align: center; margin: 20px 0;"><img src="cid:eventphoto" alt="Your Event Photo" style="max-width: 100%; border-radius: 12px;" /></div>`;
    }

    const info = await transporter.sendMail({
      from: `"CO4Kids Zoo Event" <${process.env.SMTP_USER || "hello@co4kids.org"}>`,
      to: email,
      subject: "Your wonderful memory from the Zoo Event! 🐘",
      text: "Attached is your photo from the event. We hope you had a great time!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F2046;">
          <div style="background-color: #0F2046; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">CO4Kids Zoo Event</h1>
          </div>
          <div style="padding: 20px; background-color: #f7f9fc; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <h2 style="color: #49c4b7;">Hello!</h2>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for attending our CO4Kids family event. Here is the special photo we captured for you today.</p>
            ${embeddedHtmlImage}
            <p style="font-size: 16px; line-height: 1.5; text-align: center;">We hope to see you at future events!</p>
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this photo, you can safely ignore this email.</p>
          </div>
        </div>
      `,
      attachments
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully (Test Mode)",
      previewUrl 
    });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}

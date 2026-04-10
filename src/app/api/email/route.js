import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, photoUrl } = await request.json();

    if (!email || !photoUrl) {
      return NextResponse.json({ success: false, error: "Email and photo URL are required" }, { status: 400 });
    }

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    let attachments = [];
    
    // Using nodemailer's native data URL support!
    if (photoUrl.startsWith('data:image')) {
       attachments.push({
          path: photoUrl,
          cid: 'eventphoto'
       });
    }

    const info = await transporter.sendMail({
      from: '"CO4Kids Zoo Event" <hello@co4kids.org>', // sender address
      to: email, // list of receivers
      subject: "Your wonderful memory from the Zoo Event! 🐘", // Subject line
      text: "Attached is your photo from the event. We hope you had a great time!", // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0F2046;">
          <div style="background-color: #0F2046; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">CO4Kids Zoo Event</h1>
          </div>
          <div style="padding: 20px; background-color: #f7f9fc; border: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <h2 style="color: #49c4b7;">Hello!</h2>
            <p style="font-size: 16px; line-height: 1.5;">Thank you for attending our family fun event. Here is the special photo we captured for you today.</p>
            <p style="font-size: 16px; line-height: 1.5;">We hope to see you at future events!</p>
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">If you did not request this photo, you can safely ignore this email.</p>
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

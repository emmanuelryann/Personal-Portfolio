import { Resend } from 'resend';

let resendClient = null;

const getResendClient = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

export const verifyTransporter = async () => {
  try {
    getResendClient();
    console.log('✅ Resend Email Service is configured');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error.message);
    return false;
  }
};

export const sendContactEmail = async ({ firstName, lastName, email, subject, message }) => {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL, 
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #96bb7c; border-bottom: 2px solid #96bb7c; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="padding: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="color: #666; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err;
  }
};
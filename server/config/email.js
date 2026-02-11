import { createTransport } from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS
      },
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }
  return transporter;
};

// Verify transporter configuration
export const verifyTransporter = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    return false;
  }
};

// Send contact form email
export const sendContactEmail = async ({ firstName, lastName, email, subject, message }) => {
  const mailOptions = {
    from: process.env.NODEMAILER_FROM,
    to: process.env.NODEMAILER_USER,
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
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This email was sent from your portfolio contact form.
        </p>
      </div>
    `
  };

  const result = await getTransporter().sendMail(mailOptions);
  return result;
};
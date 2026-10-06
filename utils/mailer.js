const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS via STARTTLS
      family: 4,     // Force IPv4 to prevent Render ENETUNREACH IPv6 routing errors
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // Strips accidental spaces
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10s connection timeout
    });
  }
  return null;
};

const sendOtpEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const transporter = createTransporter();

  // Bulletproof fallback: If SMTP credentials are not yet configured in .env,
  // log the code to console so local testing and defense demos never get stuck
  if (!transporter) {
    console.log(`\n==================================================`);
    console.log(`[FABH DEV MAILER FALLBACK]`);
    console.log(`To: ${toEmail}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`==================================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"FABH Accommodation Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your FABH Security Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">FABH Dagupan</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Student Boarding House & Housing Decision Platform</p>
        </div>
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="font-size: 13px; color: #475569; margin: 0 0 10px 0; font-weight: 600;">Your 6-Digit ${purpose} Code</p>
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otpCode}</span>
          <p style="font-size: 11px; color: #94a3b8; margin: 10px 0 0 0;">Valid for 10 minutes. Never share this code with anyone.</p>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">If you did not request this security verification code, please ignore this email or update your account password immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Nodemailer dispatch error:', error);
    console.log(`[FALLBACK CODE ON SMTP ERROR]: ${otpCode} for ${toEmail}`);
    return false;
  }
};

const sendAccountDeactivationEmail = async (toEmail, reason) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`\n==================================================`);
    console.log(`[FABH DEV DEACTIVATION NOTICE FALLBACK]`);
    console.log(`Target User: ${toEmail}`);
    console.log(`Reason: ${reason}`);
    console.log(`==================================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"FABH Administrative Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '[FABH Notice] Account Deactivation Notice',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #e11d48; margin: 0; font-size: 22px; font-weight: 800;">Notice of Account Deactivation</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">FABH Administrative Moderation</p>
        </div>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Your registered FABH account has been deactivated by administration. Access to your account features has been temporarily revoked.
        </p>
        <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; border-radius: 8px; padding: 14px; margin: 18px 0;">
          <p style="font-size: 12px; font-weight: 700; color: #9f1239; margin: 0 0 4px 0;">Administrative Reason:</p>
          <p style="font-size: 13px; color: #881337; margin: 0; font-style: italic;">"${reason}"</p>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
          If you believe this action was made in error or wish to appeal, please contact the platform administration.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Nodemailer deactivation dispatch error:', error);
    console.log(`[FALLBACK NOTICE ON SMTP ERROR]: User: ${toEmail} | Reason: ${reason}`);
    return false;
  }
};

module.exports = { 
  sendOtpEmail, 
  sendAccountDeactivationEmail 
};
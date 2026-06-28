import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      email, 
      subject, 
      message, 
      attachmentsList,
      resumeDetails,
      smtpHostOverride,
      smtpPortOverride,
      smtpUserOverride,
      smtpPassOverride
    } = body;

    // 1. Recipient Email Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Recipient email address is required.' });
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      return NextResponse.json({ success: false, error: 'Invalid recipient email format.' });
    }

    // 2. Load Local Env Files as fallback if not in process.env (users often edit .env.example directly)
    const localEnvVars: Record<string, string> = {};
    const envPaths = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.env.example'),
      '/.env.example',
      '/app/applet/.env.example'
    ];
    for (const envPath of envPaths) {
      try {
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf-8');
          const lines = content.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
              const key = match[1].trim();
              let value = match[2].trim();
              if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
              }
              if (value && value !== 'MY_GEMINI_API_KEY' && value !== 'MY_APP_URL') {
                localEnvVars[key] = value;
              }
            }
          }
        }
      } catch (e) {
        // Safe pass
      }
    }

    let smtpHost = smtpHostOverride || process.env.SMTP_HOST || localEnvVars['SMTP_HOST'];
    let smtpPort = smtpPortOverride || process.env.SMTP_PORT || localEnvVars['SMTP_PORT'] || '587';
    let smtpUser = smtpUserOverride || process.env.SMTP_USER || localEnvVars['SMTP_USER'];
    let smtpPass = smtpPassOverride || process.env.SMTP_PASS || localEnvVars['SMTP_PASS'];

    // Auto-sanitise spaces from Gmail 16-character App Passwords (e.g. "ugze rtar ljdx shpp" -> "ugzertarljdxshpp")
    let sanitizedPass = smtpPass || '';
    if (smtpUser && smtpUser.toLowerCase().endsWith('@gmail.com')) {
      const compacted = sanitizedPass.replace(/\s+/g, '');
      if (compacted.length === 16) {
        sanitizedPass = compacted;
      }
    }

    // Auto-completion helper: if host is empty and the user is a Gmail address, supply smtp.gmail.com
    if (smtpUser && smtpUser.toLowerCase().endsWith('@gmail.com') && (!smtpHost || smtpHost.trim() === '')) {
      smtpHost = 'smtp.gmail.com';
    }

    if (!smtpHost || !smtpUser || !sanitizedPass) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required SMTP configuration. Please define SMTP_HOST, SMTP_USER, and SMTP_PASS in Settings, .env.example, or directly in the SMTP Configuration panel below.' 
      });
    }

    let parsedPort = parseInt(smtpPort, 10);
    // Auto-correct common Gmail port typos such as 467 to standard 465 or default to 587
    if (smtpHost.toLowerCase().includes('gmail.com')) {
      if (parsedPort === 467 || parsedPort === 465) {
        parsedPort = 465;
      } else if (parsedPort !== 465 && parsedPort !== 587) {
        parsedPort = 587;
      }
    }

    // 3. Configure Transporter safely with dynamic port, SSL, and TLS options
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parsedPort,
      secure: parsedPort === 465, // True for 465 SSL, false for 587 TLS
      auth: {
        user: smtpUser,
        pass: sanitizedPass
      },
      tls: {
        rejectUnauthorized: false // Bypasses certificate verification issues in container environments
      }
    });

    // 4. Safely compile attachments list preventing blank, corrupt, or incomplete payloads
    const attachments: any[] = [];
    if (attachmentsList && Array.isArray(attachmentsList)) {
      for (const item of attachmentsList) {
        if (!item.content || typeof item.content !== 'string' || item.content.length < 50) {
          return NextResponse.json({ 
            success: false, 
            error: `Attachment ${item.filename || 'unknown'} has invalid or corrupt payload.` 
          });
        }
        attachments.push({
          filename: item.filename || 'document',
          content: Buffer.from(item.content, 'base64'),
          contentType: item.contentType || 'application/octet-stream'
        });
      }
    }

    if (attachments.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid attachments were compiled for dispatch.' });
    }

    // HTML Body
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Resume Builder</h2>
          <p style="color: #6366f1; margin: 4px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Application Materials</p>
        </div>
        
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-top: 0; white-space: pre-line;">${message || 'Dear User,\n\nPlease find attached your generated resume and cover letter files.\n\nThank you for using Resume Builder.'}</p>
        
        ${resumeDetails ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 24px; margin-bottom: 24px;">
          <h3 style="color: #0f172a; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Candidate Overview</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475569;">
            <tr>
              <td style="padding: 4px 0; font-weight: bold; width: 30%;">Full Name</td>
              <td style="padding: 4px 0; color: #0f172a;">${resumeDetails.fullName || 'Candidate'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Professional Title</td>
              <td style="padding: 4px 0; color: #0f172a;">${resumeDetails.professionalTitle || 'Unspecified'}</td>
            </tr>
            ${resumeDetails.email ? `
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Email Address</td>
              <td style="padding: 4px 0; color: #01579b;"><a href="mailto:${resumeDetails.email}" style="color: #2563eb; text-decoration: none;">${resumeDetails.email}</a></td>
            </tr>
            ` : ''}
            ${resumeDetails.phone ? `
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Contact Phone</td>
              <td style="padding: 4px 0; color: #0f172a;">${resumeDetails.phone}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        ` : ''}

        <div style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          This application has been successfully dispatched with high-fidelity attachments.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Resume Builder Dispatch" <${smtpUser}>`,
      to: email,
      subject: subject || "Your Resume Documents",
      text: message.replace(/<[^>]*>/g, '') || "Dear User,\n\nPlease find attached your generated resume and cover letter files.\n\nThank you for using Resume Builder.",
      html: htmlBody,
      attachments: attachments
    };

    // 5. Send Email
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMTP Mailer Success] Sent to ${email}. MessageID: ${info.messageId}`);
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.warn("[SMTP Server Warning] Failed dispatching mail via nodemailer:", error);
    let friendlyError = error.message || "An unexpected SMTP error occurred.";
    if (error.code === 'EAUTH' || friendlyError.includes('535') || friendlyError.includes('Username and Password not accepted') || friendlyError.includes('not accepted')) {
      friendlyError = `SMTP Authentication Failed (535). Incorrect login or restricted access.\n` +
        `• Option A: Double-check SMTP_USER & SMTP_PASS in Settings.\n` +
        `• Option B: Gmail/Google Accounts now require a Google "App Password" to proceed. Go to Google Account Settings -> Security -> App Passwords to generate one.`;
    } else if (friendlyError.includes('ENOTFOUND') || friendlyError.includes('EHOSTUNREACH')) {
      friendlyError = `Connection Failed: Unable to contact SMTP server at "${process.env.SMTP_HOST || 'host'}". Please check SMTP_HOST.`;
    } else {
      friendlyError = `SMTP Dispatch Failure: ${friendlyError}`;
    }
    return NextResponse.json({ 
      success: false, 
      error: friendlyError 
    });
  }
}

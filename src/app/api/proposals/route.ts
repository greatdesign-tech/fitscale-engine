import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, saveLead } from '@/lib/leadStore';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const TO_EMAIL = 'taiwo.adediji.apps@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, notes, gymName, attachedLeadId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const cleanNotes = notes && String(notes).trim() ? String(notes).trim() : 'None provided';
    const cleanGym = gymName || 'Gym Client';

    // 1. Update lead record in local store if attachedLeadId is present
    if (attachedLeadId) {
      const existingLead = getLeadById(attachedLeadId);
      if (existingLead) {
        saveLead({
          ...existingLead,
          contactName: name,
          contactEmail: email,
          notes: `[Proposal Request] Name: ${name} | Email: ${email} | Notes: ${cleanNotes}`,
          lastUpdated: new Date().toISOString().split('T')[0],
        });
      }
    }

    // 2. Format HTML email with strictly the requested fields
    const htmlEmail = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; border-radius: 16px; color: #f8fafc;">
        <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: #10b981; color: #022c22; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.05em;">New Proposal Inquiry</span>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0;">App Proposal Request: ${cleanGym}</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">A client has submitted the proposal inquiry form on the demo page.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; width: 170px; font-weight: 600;">Gym Name:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px; font-weight: 700;">${cleanGym}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Your Name & Role:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #ffffff; font-size: 15px; font-weight: 700;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px; font-weight: 600;">Work Email Address:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #1e293b; color: #34d399; font-size: 15px; font-weight: 700; font-family: monospace;">
              <a href="mailto:${email}" style="color: #34d399; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #94a3b8; font-size: 13px; font-weight: 600; vertical-align: top;">Questions or Specific Notes (Optional):</td>
            <td style="padding: 12px 0; color: #f1f5f9; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${cleanNotes}</td>
          </tr>
        </table>

        <div style="background-color: #1e293b; padding: 14px 18px; border-radius: 12px; font-size: 12px; color: #94a3b8;">
          💡 <strong>Tip:</strong> Simply hit <em>Reply</em> in your email client to respond directly to <strong>${name}</strong> at <span style="color: #34d399;">${email}</span>.
        </div>
      </div>
    `;

    const textEmail = `
New App Proposal Request
---------------------------------------
Gym Name: ${cleanGym}
Your Name & Role: ${name}
Work Email Address: ${email}
Questions or Specific Notes (Optional): ${cleanNotes}
---------------------------------------
Reply directly to: ${email}
    `.trim();

    let emailSent = false;
    let sendError: string | null = null;

    // Strategy A: Resend (Modern API)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM || 'FitScale Engine <onboarding@resend.dev>',
          to: [TO_EMAIL],
          replyTo: email,
          subject: `✦ New Proposal Request: ${cleanGym} - ${name}`,
          html: htmlEmail,
          text: textEmail,
        });

        if (!error) {
          emailSent = true;
          console.log(`[Resend] Successfully sent proposal email for ${cleanGym} to ${TO_EMAIL}`);
        } else {
          sendError = error.message;
          console.error('[Resend Error]', error);
        }
      } catch (err: any) {
        sendError = err?.message || 'Resend exception';
        console.error('[Resend Exception]', err);
      }
    }

    // Strategy B: Nodemailer SMTP / Gmail App Password
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!emailSent && smtpPass) {
      try {
        const smtpUser = process.env.SMTP_USER || TO_EMAIL;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"FitScale Demo Engine" <${smtpUser}>`,
          to: TO_EMAIL,
          replyTo: email,
          subject: `✦ New Proposal Request: ${cleanGym} - ${name}`,
          html: htmlEmail,
          text: textEmail,
        });

        emailSent = true;
        console.log(`[SMTP] Successfully sent proposal email for ${cleanGym} to ${TO_EMAIL}`);
      } catch (smtpErr: any) {
        sendError = smtpErr?.message || 'SMTP exception';
        console.error('[SMTP Exception]', smtpErr);
      }
    }

    // Log proposal record to server output
    console.log(`[Proposal Inquiry Recorded] Gym: "${cleanGym}" | Name: "${name}" | Email: "${email}" | Notes: "${cleanNotes}" | Delivered: ${emailSent}`);

    return NextResponse.json({
      success: true,
      delivered: emailSent,
      sendError: emailSent ? null : sendError,
      message: emailSent
        ? 'Proposal inquiry forwarded directly to your email'
        : 'Proposal recorded in CRM store',
    });
  } catch (error: any) {
    console.error('Proposal route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

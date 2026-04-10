export async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!apiKey) {
      return { ok: false, error: 'RESEND_API_KEY is not configured' };
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Viber Street <noreply@viberstreet.com>',
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend API ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

export function verificationEmailHtml(code: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #7c3aed;">Viber Street</h2>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
    </div>
  `;
}

export function docDeliveryEmailHtml(productName: string, docContent: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #7c3aed;">Viber Street</h2>
      <p>Thanks for downloading <strong>${productName}</strong>! Here's your AI Vibe Coding documentation:</p>
      <hr style="border: 1px solid #e5e7eb; margin: 16px 0;">
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; font-size: 13px;">
${docContent}
      </div>
      <hr style="border: 1px solid #e5e7eb; margin: 16px 0;">
      <p style="color: #6b7280; font-size: 12px;">You can also find this document in your downloads on viberstreet.com</p>
    </div>
  `;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

if (!RESEND_API_KEY) {
  console.warn('Warning: RESEND_API_KEY is not set. Registration emails will not be sent.');
}

export async function sendRegistrationSuccessEmail({ to, name }) {
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY');
  }

  const payload = {
    from: RESEND_FROM_EMAIL,
    to,
    subject: 'Welcome to Quiz Platform!',
    html: `<p>Hi ${name},</p><p>Welcome to Quiz Platform! Your account has been created successfully.</p><p>Log in any time to start taking quizzes and tracking your progress.</p><p>Thanks,<br/>The Quiz Platform Team</p>`,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    const message = result.error?.message || JSON.stringify(result);
    throw new Error(`Resend API error: ${message}`);
  }

  return result;
}

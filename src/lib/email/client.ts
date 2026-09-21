import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const rawFrom = process.env.EMAIL_FROM ?? "certificats@contact.bonjour-ai.fr";
const from = rawFrom.includes("<") ? rawFrom : `BONJOUR IA <${rawFrom}>`;

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<{ sent: boolean }> {
  if (!resend) {
    console.log(
      `[email:stub] RESEND_API_KEY absent — email non envoyé.\n  to: ${params.to}\n  subject: ${params.subject}`
    );
    return { sent: false };
  }

  await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  return { sent: true };
}

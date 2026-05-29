import "server-only";
import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

const apiKey =
  process.env.RESEND_API_KEY || "re_B46qaP9e_5sXZP4vtgDA7kAYGAUwFLA7c";

if (!apiKey) {
  throw new Error("Missing RESEND_API_KEY");
}

export const resend = new Resend(apiKey);

// Helper function to send emails via Resend
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

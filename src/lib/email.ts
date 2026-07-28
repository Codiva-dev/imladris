import { Resend } from "resend";
import {
  bitacoraOpenEmail,
  convocationEmail,
  founderInviteEmail,
  memberInviteEmail,
} from "@/lib/email/templates";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return (
    process.env.RESEND_FROM_EMAIL ?? "Imladris <consejo@imladris.online>"
  );
}

async function send(input: { to: string; subject: string; html: string }) {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY no configurada");
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendInvitationEmail(input: {
  to: string;
  inviterName: string;
  councilName: string;
  inviteUrl: string;
  role?: "ORGANIZADOR" | "MIEMBRO";
}) {
  const template = memberInviteEmail(input);
  await send({ to: input.to, ...template });
}

export async function sendFounderInviteEmail(input: {
  to: string;
  founderName?: string;
  fundarUrl: string;
}) {
  const template = founderInviteEmail(input);
  await send({ to: input.to, ...template });
}

export async function sendConvocationEmail(input: {
  to: string;
  councilName: string;
  actionUrl: string;
}) {
  const template = convocationEmail(input);
  await send({ to: input.to, ...template });
}

export async function sendBitacoraOpenEmail(input: {
  to: string;
  councilName: string;
  closesAtLabel: string;
  bitacoraUrl: string;
}) {
  const template = bitacoraOpenEmail(input);
  await send({ to: input.to, ...template });
}

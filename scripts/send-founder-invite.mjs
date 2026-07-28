/**
 * Envía el correo de fundador.
 * Uso: node --env-file=.env.local scripts/send-founder-invite.mjs
 */
import { Resend } from "resend";

const FOREST = "#20372E";
const GOLD = "#C8A96B";
const PARCHMENT = "#EFE6D3";
const RIVENDELL = "#4F7A63";

const TO = process.argv[2] ?? "";
const BASE = (process.env.BETTER_AUTH_URL ?? "https://imladris.online").replace(
  /\/$/,
  "",
);
const FUNDAR = `${BASE}/fundar`;

const LEAF = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="${GOLD}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="${GOLD}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const html = `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:${FOREST};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${FOREST};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:520px;background:#1a2e26;border:1px solid ${RIVENDELL};">
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;">
              ${LEAF}
              <p style="margin:18px 0 0;font-family:Georgia,serif;font-size:13px;letter-spacing:0.22em;color:${GOLD};text-transform:uppercase;">Imladris</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;"><div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);opacity:0.45;"></div></td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:28px;color:${PARCHMENT};">Fundar el Consejo</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;text-align:center;font-family:Georgia,serif;font-size:17px;line-height:1.65;color:rgba(239,230,211,0.78);">
              <p style="margin:0;">Se te confía abrir <span style="color:${PARCHMENT};">El Consejo de Elrond</span>. Serás el organizador: convocatorias, invitaciones y el ritual del círculo.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 36px;">
              <a href="${FUNDAR}" style="display:inline-block;background:${GOLD};color:${FOREST};font-family:Georgia,serif;font-size:17px;text-decoration:none;padding:14px 28px;">Abrir el Consejo</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;text-align:center;font-family:Georgia,serif;font-size:12px;letter-spacing:0.08em;color:rgba(200,169,107,0.55);">Imladris · El Consejo de Elrond</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error("Missing RESEND_API_KEY");
  process.exit(1);
}

const from =
  process.env.RESEND_FROM_EMAIL ?? "Imladris <onboarding@resend.dev>";

const resend = new Resend(key);
const { data, error } = await resend.emails.send({
  from,
  to: TO,
  subject: "Fundar el Consejo de Elrond",
  html,
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}

console.log("Sent founder invite to", TO, "id:", data?.id);
console.log("CTA:", FUNDAR);

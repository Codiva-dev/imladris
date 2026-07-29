const FOREST = "#20372E";
const GOLD = "#C8A96B";
const PARCHMENT = "#EFE6D3";
const RIVENDELL = "#4F7A63";

/** Hoja Lucide (paths) como SVG inline para email. */
const LEAF_SVG = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="${GOLD}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="${GOLD}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type ShellProps = {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote?: string;
};

/** Envoltorio ritual compartido - manuscrito / bosque / oro. */
export function emailShell({
  preheader,
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote = "Imladris · El Consejo de Elrond",
}: ShellProps) {
  const safeTitle = escapeHtml(title);
  const safeCta = escapeHtml(ctaLabel);
  const safeUrl = escapeHtml(ctaUrl);
  const safeFooter = escapeHtml(footerNote);
  const safePreheader = escapeHtml(preheader);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:${FOREST};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safePreheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${FOREST};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#1a2e26;border:1px solid ${RIVENDELL};">
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;">
              ${LEAF_SVG}
              <p style="margin:18px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.22em;color:${GOLD};text-transform:uppercase;">
                Imladris
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;text-align:center;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);opacity:0.45;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.25;color:${PARCHMENT};">
                ${safeTitle}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.65;color:rgba(239,230,211,0.78);">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 32px 36px;">
              <a href="${safeUrl}"
                 style="display:inline-block;background:${GOLD};color:${FOREST};font-family:Georgia,'Times New Roman',serif;font-size:17px;text-decoration:none;padding:14px 28px;border-radius:2px;">
                ${safeCta}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:0.08em;color:rgba(200,169,107,0.55);">
              ${safeFooter}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function founderInviteEmail(input: {
  founderName?: string;
  fundarUrl: string;
}) {
  const name = input.founderName ? escapeHtml(input.founderName) : null;
  return {
    subject: "Fundar el Consejo de Elrond",
    html: emailShell({
      preheader: "Se te confía la apertura de Imladris.",
      title: "Fundar el Consejo",
      bodyHtml: name
        ? `<p style="margin:0 0 12px;">${name},</p>
           <p style="margin:0;">Se te confía abrir <span style="color:${PARCHMENT};">El Consejo de Elrond</span>. Serás el organizador: convocatorias, invitaciones y el ritual del círculo.</p>`
        : `<p style="margin:0;">Se te confía abrir <span style="color:${PARCHMENT};">El Consejo de Elrond</span>. Serás el organizador: convocatorias, invitaciones y el ritual del círculo.</p>`,
      ctaLabel: "Abrir el Consejo",
      ctaUrl: input.fundarUrl,
    }),
  };
}

export function memberInviteEmail(input: {
  inviterName: string;
  councilName: string;
  inviteUrl: string;
  role?: "ORGANIZADOR" | "MIEMBRO";
}) {
  const inviter = escapeHtml(input.inviterName);
  const council = escapeHtml(input.councilName);
  const asOrganizer = input.role === "ORGANIZADOR";

  return {
    subject: asOrganizer
      ? `${input.inviterName} te nombra organizador de ${input.councilName}`
      : `${input.inviterName} te convoca a ${input.councilName}`,
    html: emailShell({
      preheader: asOrganizer
        ? `Has sido nombrado organizador de ${input.councilName}.`
        : `${input.inviterName} te invita a ${input.councilName}.`,
      title: asOrganizer ? "Organizador del Consejo" : "Has sido convocado",
      bodyHtml: asOrganizer
        ? `<p style="margin:0;"><span style="color:${PARCHMENT};">${inviter}</span> te nombra organizador de <span style="color:${PARCHMENT};">${council}</span>.</p>`
        : `<p style="margin:0;"><span style="color:${PARCHMENT};">${inviter}</span> te invita a <span style="color:${PARCHMENT};">${council}</span>.</p>`,
      ctaLabel: "Entrar al Consejo",
      ctaUrl: input.inviteUrl,
    }),
  };
}

export function convocationEmail(input: {
  councilName: string;
  actionUrl: string;
}) {
  const council = escapeHtml(input.councilName);
  return {
    subject: `Convocatoria · ${input.councilName}`,
    html: emailShell({
      preheader: `Nueva convocatoria de ${input.councilName}. Indica tu disponibilidad.`,
      title: "Nueva convocatoria",
      bodyHtml: `<p style="margin:0;"> <span style="color:${PARCHMENT};">${council}</span> abre una nueva convocatoria. Indica tu disponibilidad y, si quieres, propón hasta dos temas.</p>`,
      ctaLabel: "Indicar disponibilidad",
      ctaUrl: input.actionUrl,
    }),
  };
}

export function bitacoraOpenEmail(input: {
  councilName: string;
  closesAtLabel: string;
  bitacoraUrl: string;
}) {
  const council = escapeHtml(input.councilName);
  const closes = escapeHtml(input.closesAtLabel);
  return {
    subject: `Bitácora abierta · ${input.councilName}`,
    html: emailShell({
      preheader: `La bitácora de ${input.councilName} está abierta.`,
      title: "Bitácora abierta",
      bodyHtml: `<p style="margin:0 0 12px;">El Consejo <span style="color:${PARCHMENT};">${council}</span> ha concluido.</p>
        <p style="margin:0;">Tienes hasta ${closes} para dejar tu huella.</p>`,
      ctaLabel: "Abrir bitácora",
      ctaUrl: input.bitacoraUrl,
    }),
  };
}

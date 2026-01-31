require("dotenv/config");

const comprobanteTurnoTemplate = require("../emailTemplates/comprobanteTurno");
const recuperarPasswordTemplate = require("../emailTemplates/recuperarPassword");

const provider = String(process.env.EMAIL_PROVIDER || "auto").toLowerCase();

const hasResend = Boolean(process.env.RESEND_API_KEY);
const hasSmtp = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let resendClient = null;
if (provider === "resend" || (provider === "auto" && hasResend && !hasSmtp)) {
  try {
    // eslint-disable-next-line global-require
    const { Resend } = require("resend");
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("Email provider: Resend");
  } catch (e) {
    console.error("No se pudo inicializar Resend:", e?.message || e);
  }
}

let transporter = null;
if (provider === "smtp" || provider === "auto") {
  // Fallback SMTP (puede fallar en Render por bloqueo de puertos)
  // eslint-disable-next-line global-require
  const nodemailer = require("nodemailer");
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true para 465, false para 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });

  transporter
    .verify()
    .then(() => console.log("SMTP listo"))
    .catch((e) => console.error("Error SMTP verify:", e?.message || e));
}

const defaultFrom = process.env.EMAIL_FROM || "Delfina Nails Studio <onboarding@resend.dev>";

function normalizeTo(to) {
  if (Array.isArray(to)) {
    return to.map((t) => String(t || "").trim()).filter(Boolean);
  }
  return String(to || "").trim();
}

async function sendEmail({ to, subject, html }) {
  const toNorm = normalizeTo(to);
  if (!toNorm || (Array.isArray(toNorm) && toNorm.length === 0)) {
    throw new Error("Destinatario (to) vacío");
  }

  // 1) Intentar Resend si está configurado
  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: defaultFrom,
        to: toNorm,
        subject,
        html,
      });
      return;
    } catch (e) {
      // En plan 'auto', fall back a SMTP si existe.
      if (provider !== "auto" || !transporter) throw e;
      console.error("Resend falló, intentando SMTP:", e?.message || e);
    }
  }

  // 2) SMTP
  if (!transporter) {
    throw new Error("No hay proveedor de email configurado (SMTP o Resend)");
  }

  await transporter.sendMail({
    from: defaultFrom,
    to: toNorm,
    subject,
    html,
  });
}

async function enviarComprobanteTurno({
  to,
  nombre,
  servicios,
  seña,
  total,
  pagoId,
  fecha,
  hora,
  extras,
  restoAPagar,
}) {
  await sendEmail({
    to,
    subject: "¡Tu turno fue reservado con éxito!",
    html: comprobanteTurnoTemplate({
      nombre,
      servicios,
      seña,
      total,
      pagoId,
      fecha,
      hora,
      extras,
      restoAPagar,
    }),
  });
}

async function sendPasswordRecoveryEmail(to, token) {
  const minutos = 10;
  const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontend}/recuperar?token=${token}`;
  await sendEmail({
    to,
    subject: "Recuperación de contraseña",
    html: recuperarPasswordTemplate({ resetUrl, minutos }),
  });
}

module.exports = {
  enviarComprobanteTurno,
  sendPasswordRecoveryEmail,
};

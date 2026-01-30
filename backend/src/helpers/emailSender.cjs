require("dotenv/config");

const nodemailer = require("nodemailer");
const comprobanteTurnoTemplate = require("../emailTemplates/comprobanteTurno");
const recuperarPasswordTemplate = require("../emailTemplates/recuperarPassword");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

const transporter = nodemailer.createTransport({
  // Si en Render definís SMTP_HOST/SMTP_PORT/SMTP_SECURE, lo toma.
  // Si no, usa Gmail por SMTP estándar.
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true para 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Evita cuelgues silenciosos
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

// Log de diagnóstico (útil en Render Logs)
transporter
  .verify()
  .then(() => console.log("SMTP listo"))
  .catch((e) => console.error("Error SMTP verify:", e?.message || e));

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
  const mailOptions = {
    from: process.env.EMAIL_FROM || `Delfina Nails Studio <${process.env.EMAIL_USER}>`,
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
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordRecoveryEmail(to, token) {
  const minutos = 10;
  const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontend}/recuperar?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Delfina Nails Studio" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Recuperación de contraseña",
    html: recuperarPasswordTemplate({ resetUrl, minutos }),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  enviarComprobanteTurno,
  sendPasswordRecoveryEmail,
};

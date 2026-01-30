require("dotenv/config");

const nodemailer = require("nodemailer");
const comprobanteTurnoTemplate = require("../emailTemplates/comprobanteTurno");
const recuperarPasswordTemplate = require("../emailTemplates/recuperarPassword");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    from: `Delfina Nails Studio <${process.env.EMAIL_USER}>`,
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
    from: `"Delfina Nails Studio" <${process.env.EMAIL_USER}>`,
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

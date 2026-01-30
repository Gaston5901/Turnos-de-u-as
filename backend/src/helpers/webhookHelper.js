import TurnosModel from "../models/turnosSchema.js";
import ServiciosModel from "../models/serviciosSchema.js";
import { enviarComprobanteTurno } from "./emailSender.cjs";

function pickTurnoIdFromPago(pago) {
  const metadata = pago?.metadata || {};
  return (
    metadata.turnoId ||
    metadata.turno_id ||
    pago?.external_reference ||
    null
  );
}

export async function procesarPagoAprobado(pago) {
  // IMPORTANTE: no crear turnos “a ciegas” desde el pago,
  // porque el schema requiere usuario/servicio (ObjectId).
  const turnoId = pickTurnoIdFromPago(pago);
  if (!turnoId) {
    console.log("[Webhook] Pago aprobado sin turnoId/metadata. Ignorando.");
    return;
  }

  const monto = Number(pago?.transaction_amount ?? 0);
  const pagoId = String(pago?.id || "");

  const turno = await TurnosModel.findByIdAndUpdate(
    turnoId,
    {
      estado: "confirmado",
      pagoId,
      montoPagado: monto,
    },
    { new: true }
  );

  if (!turno) {
    console.log("[Webhook] No se encontró turno para turnoId:", turnoId);
    return;
  }

  // Enviar email de confirmación (si hay email guardado en el turno)
  try {
    const servicioDoc = turno.servicio ? await ServiciosModel.findById(turno.servicio) : null;
    const serviciosArr = [
      {
        title: servicioDoc?.nombre || "Servicio",
        unit_price: servicioDoc?.precio || 0,
      },
    ];

    const fechaIso = turno.fecha instanceof Date ? turno.fecha.toISOString().slice(0, 10) : String(turno.fecha);
    const to = turno.email || pago?.payer?.email;
    if (!to) return;

    await enviarComprobanteTurno({
      to,
      nombre: turno.nombre || pago?.payer?.first_name || "",
      servicios: serviciosArr,
      seña: turno.montoPagado || monto,
      total: turno.montoTotal || servicioDoc?.precio || monto,
      pagoId: turno.pagoId || pagoId,
      fecha: fechaIso,
      hora: turno.hora || "",
      extras: null,
    });
  } catch (error) {
    console.error("[Webhook] Error enviando email:", error);
  }
}

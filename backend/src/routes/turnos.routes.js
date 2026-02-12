
import { Router } from "express";
import {
  crearTurno,
  crearTurnoTransferencia,
  obtenerTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  obtenerTurnosPorUsuario,
  devolverSenia,
  aprobarTransferencia,
  rechazarTransferencia
} from "../controllers/turnos.controllers.js";
import uploadComprobante from "../middleware/uploadComprobante.js";

const router = Router();

// Endpoints admin para aprobar/rechazar transferencia
router.patch(":id/aprobar-transferencia", aprobarTransferencia);
router.patch(":id/rechazar-transferencia", rechazarTransferencia);

router.get("/", obtenerTurnos);
router.get("/:id", obtenerTurno);
router.post("/", crearTurno);
// Nuevo endpoint para turnos con transferencia
router.post("/transferencia", uploadComprobante.single('comprobante'), crearTurnoTransferencia);
router.put("/:id", actualizarTurno);
router.delete("/:id", eliminarTurno);
// Turnos por usuario
router.get("/usuario/:usuarioId", obtenerTurnosPorUsuario);

// Endpoint para marcar seña como devuelta
router.patch("/:id/devolver-senia", devolverSenia);

export default router;

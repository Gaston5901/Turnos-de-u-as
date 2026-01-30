import { Router } from "express";
import {
  crearTurno,
  obtenerTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  obtenerTurnosPorUsuario,
  devolverSenia
} from "../controllers/turnos.controllers.js";

const router = Router();

router.get("/", obtenerTurnos);
router.get("/:id", obtenerTurno);
router.post("/", crearTurno);
router.put("/:id", actualizarTurno);
router.delete("/:id", eliminarTurno);
// Turnos por usuario
router.get("/usuario/:usuarioId", obtenerTurnosPorUsuario);

// Endpoint para marcar seña como devuelta
router.patch("/:id/devolver-senia", devolverSenia);

export default router;

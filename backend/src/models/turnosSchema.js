import mongoose from "mongoose";


const turnoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true
  },
  servicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Servicios",
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ["pendiente", "confirmado", "cancelado", "realizado", "completado"],
    default: "pendiente"
  },
  pagoId: {
    type: String,
    default: ''
  },
  montoPagado: {
    type: Number,
    default: 0
  },
  montoTotal: {
    type: Number,
    default: 0
  },
  registroEstadistica: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  nombre: {
    type: String,
    default: ''
  },
  telefono: {
    type: String,
    default: ''
  },
  comentario: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  seniaDevuelta: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Turnos", turnoSchema);

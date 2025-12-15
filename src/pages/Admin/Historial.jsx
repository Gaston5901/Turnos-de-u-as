import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI } from '../../services/api';
import { History, Search } from 'lucide-react';
import { format } from 'date-fns';
import './Admin.css';

/* =====================================================
   MODAL TURNO DETALLE — PREMIUM
===================================================== */
function ModalTurnoDetalle({ turno, usuario, servicio, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = '');
  }, []);

  const cerrarOverlay = (e) => {
    if (e.target.classList.contains('modal-turno-overlay')) {
      onClose();
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalPop {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0 }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1 }
        }
      `}</style>

      <div
        className="modal-turno-overlay"
        onClick={cerrarOverlay}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,10,20,0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          animation: 'modalFadeIn .25s'
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(14px)',
          borderRadius: 26,
          padding: '36px 34px',
          width: '100%',
          maxWidth: 440,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 28px 70px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.45)',
          zIndex: 1001,
          animation: 'modalPop .35s cubic-bezier(.22,1,.36,1)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 18,
            fontSize: 30,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#d13fa0',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 34 }}>📋</span>
          <h2 style={{ margin: 0, color: '#d13fa0' }}>{servicio?.nombre}</h2>
        </div>

        <div style={{ fontSize: 16, lineHeight: 1.9, color: '#333' }}>
          <div><b>Cliente:</b> {usuario?.nombre} <span style={{ color: '#888' }}>({usuario?.telefono})</span></div>
          <div><b>Fecha:</b> {format(new Date(turno.fecha + 'T00:00:00'), 'dd/MM/yyyy')} · <b>Hora:</b> {turno.hora} hs</div>

          <hr style={{ border: 'none', height: 1, background: 'linear-gradient(to right, transparent, #d13fa0, transparent)', margin: '14px 0' }} />

          <div><b>Total:</b> <span style={{ color: '#388e3c' }}>${turno.montoTotal.toLocaleString()}</span></div>
          <div><b>Pagado:</b> <span style={{ color: '#1976d2' }}>${turno.montoPagado.toLocaleString()}</span></div>
          <div><b>Resta:</b> <span style={{ color: '#ff9800' }}>${(turno.montoTotal - turno.montoPagado).toLocaleString()}</span></div>

          <hr style={{ border: 'none', height: 1, background: 'linear-gradient(to right, transparent, #d13fa0, transparent)', margin: '14px 0' }} />

          <div><b>ID de pago:</b> <span style={{ color: '#d13fa0', fontWeight: 600 }}>{turno.pagoId}</span></div>
          <div>
            <b>Estado:</b>{' '}
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                background:
                  turno.estado === 'confirmado'
                    ? 'linear-gradient(135deg,#fff3cd,#ffe69c)'
                    : 'linear-gradient(135deg,#d1f7e2,#a5e6c8)',
                color: turno.estado === 'confirmado' ? '#856404' : '#1e7e34'
              }}
            >
              {turno.estado}
            </span>
          </div>

          <div style={{ fontSize: 13, color: '#999', marginTop: 10 }}>
            Creado: {format(new Date(turno.createdAt), 'dd/MM/yyyy HH:mm')}
          </div>
        </div>
      </div>
    </>
  );
}

/* =====================================================
   HISTORIAL — CARDS PREMIUM
===================================================== */
const Historial = () => {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState({});
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalTurnoId, setModalTurnoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [t, s, u] = await Promise.all([
        turnosAPI.getAll(),
        serviciosAPI.getAll(),
        usuariosAPI.getAll(),
      ]);

      const sMap = {};
      s.data.forEach(x => sMap[x.id] = x);

      const uMap = {};
      u.data.forEach(x => uMap[x.id] = x);

      setServicios(sMap);
      setUsuarios(uMap);
      setTurnos(t.data.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const turnosFiltrados = turnos.filter(t => {
    const estadoOk = filtroEstado === 'todos' || t.estado === filtroEstado;
    const b = busqueda.toLowerCase();
    const buscaOk =
      !b ||
      servicios[t.servicioId]?.nombre.toLowerCase().includes(b) ||
      usuarios[t.usuarioId]?.nombre.toLowerCase().includes(b) ||
      t.pagoId.toLowerCase().includes(b);
    return estadoOk && buscaOk;
  });

  if (loading) {
    return <p style={{ padding: 100, textAlign: 'center' }}>Cargando historial...</p>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1><History size={40} /> Historial de Turnos</h1>
        <p>Todos los turnos registrados en el sistema</p>
      </div>

      <div className="container">
        <div className="turnos-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              placeholder="Buscar por servicio, cliente o pago..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtros">
            {['todos','confirmado','completado'].map(f => (
              <button
                key={f}
                className={`filtro-btn ${filtroEstado === f ? 'active' : ''}`}
                onClick={() => setFiltroEstado(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {turnosFiltrados.map(turno => {
          const servicio = servicios[turno.servicioId];
          const usuario = usuarios[turno.usuarioId];

          return (
            <div
              key={turno.id}
              className="turno-admin-card compacto"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                marginBottom: 14,
                borderRadius: 18,
                background: 'linear-gradient(180deg,#fff,#fff7fb)',
                border: '1px solid #f3d1e6',
                boxShadow: '0 8px 22px rgba(209,63,160,0.14)'
              }}
            >
              <div>
                <b style={{ color: '#d13fa0' }}>{servicio?.nombre}</b>
                <div>{usuario?.nombre}</div>
                <small>
                  {format(new Date(turno.fecha+'T00:00:00'),'dd/MM/yyyy')} · {turno.hora} hs
                </small>
              </div>

              <button
                onClick={() => setModalTurnoId(turno.id)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f5f5f5',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                ⋮
              </button>

              {modalTurnoId === turno.id && (
                <ModalTurnoDetalle
                  turno={turno}
                  usuario={usuario}
                  servicio={servicio}
                  onClose={() => setModalTurnoId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Historial;

import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI, horariosAPI } from '../../services/api';
import { Calendar, Check, X, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import './Admin.css';

const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState({});
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    nombre: '',
    telefono: '',
    email: '',
    servicioId: '',
    fecha: '',
    hora: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [turnosRes, serviciosRes, usuariosRes] = await Promise.all([
        turnosAPI.getAll(),
        serviciosAPI.getAll(),
        usuariosAPI.getAll(),
      ]);

      const serviciosMap = {};
      serviciosRes.data.forEach((s) => {
        serviciosMap[s.id] = s;
      });

      const usuariosMap = {};
      usuariosRes.data.forEach((u) => {
        usuariosMap[u.id] = u;
      });

      setServicios(serviciosMap);
      setUsuarios(usuariosMap);
      setTurnos(turnosRes.data.sort((a, b) => {
        if (a.fecha === b.fecha) {
          return a.hora.localeCompare(b.hora);
        }
        return b.fecha.localeCompare(a.fecha);
      }));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const completarTurno = async (turnoId) => {
    try {
      await turnosAPI.update(turnoId, { estado: 'completado' });
      toast.success('Turno completado');
      cargarDatos();
    } catch (error) {
      toast.error('Error al completar el turno');
    }
  };

  const cancelarTurno = async (turnoId) => {
    if (window.confirm('¿Estás segura de cancelar este turno?')) {
      try {
        await turnosAPI.delete(turnoId);
        toast.success('Turno cancelado');
        cargarDatos();
      } catch (error) {
        toast.error('Error al cancelar el turno');
      }
    }
  };

  const crearTurnoPresencial = async (e) => {
    e.preventDefault();
    
    try {
      // Verificar si el usuario ya existe
      let usuario = Object.values(usuarios).find(u => u.email === nuevoTurno.email);
      
      if (!usuario) {
        // Crear nuevo usuario
        const nuevoUsuario = {
          nombre: nuevoTurno.nombre,
          email: nuevoTurno.email,
          telefono: nuevoTurno.telefono,
          password: 'temporal123',
          rol: 'cliente',
        };
        const userRes = await usuariosAPI.create(nuevoUsuario);
        usuario = userRes.data;
      }

      const servicio = servicios[nuevoTurno.servicioId];
      const turnoData = {
        usuarioId: usuario.id,
        servicioId: parseInt(nuevoTurno.servicioId),
        fecha: nuevoTurno.fecha,
        hora: nuevoTurno.hora,
        estado: 'confirmado',
        pagoId: 'PRESENCIAL' + Date.now(),
        montoPagado: 0,
        montoTotal: servicio.precio,
        createdAt: new Date().toISOString(),
      };

      await turnosAPI.create(turnoData);
      toast.success('Turno creado exitosamente');
      setMostrarFormulario(false);
      setNuevoTurno({
        nombre: '',
        telefono: '',
        email: '',
        servicioId: '',
        fecha: '',
        hora: '',
      });
      cargarDatos();
    } catch (error) {
      toast.error('Error al crear el turno');
      console.error(error);
    }
  };

  const turnosFiltrados = turnos.filter((turno) => {
    const cumpleFiltro =
      filtro === 'todos' ||
      (filtro === 'hoy' && turno.fecha === format(new Date(), 'yyyy-MM-dd')) ||
      (filtro === 'confirmados' && turno.estado === 'confirmado') ||
      (filtro === 'completados' && turno.estado === 'completado');

    const cumpleBusqueda =
      busqueda === '' ||
      servicios[turno.servicioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuarios[turno.usuarioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      turno.pagoId.toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltro && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando turnos...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>
          <Calendar size={40} />
          Gestión de Turnos
        </h1>
        <p>Administrá y controlá todos los turnos</p>
      </div>

      <div className="container">
        <div className="turnos-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por servicio, cliente o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtros">
            <button
              className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltro('todos')}
            >
              Todos
            </button>
            <button
              className={`filtro-btn ${filtro === 'hoy' ? 'active' : ''}`}
              onClick={() => setFiltro('hoy')}
            >
              Hoy
            </button>
            <button
              className={`filtro-btn ${filtro === 'confirmados' ? 'active' : ''}`}
              onClick={() => setFiltro('confirmados')}
            >
              Confirmados
            </button>
            <button
              className={`filtro-btn ${filtro === 'completados' ? 'active' : ''}`}
              onClick={() => setFiltro('completados')}
            >
              Completados
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            <Plus size={20} />
            Nuevo Turno Presencial
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-turno">
            <h3>Crear Turno Presencial</h3>
            <form onSubmit={crearTurnoPresencial}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre del Cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nuevoTurno.nombre}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={nuevoTurno.telefono}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={nuevoTurno.email}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Servicio</label>
                  <select
                    className="form-input"
                    value={nuevoTurno.servicioId}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, servicioId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    {Object.values(servicios).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} - ${s.precio}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-input"
                    value={nuevoTurno.fecha}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    className="form-input"
                    value={nuevoTurno.hora}
                    onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Crear Turno
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="turnos-tabla">
          {turnosFiltrados.length > 0 ? (
            turnosFiltrados.map((turno) => {
              const servicio = servicios[turno.servicioId];
              const usuario = usuarios[turno.usuarioId];
              return (
                <div key={turno.id} className="turno-admin-card">
                  <div className="turno-admin-info">
                    <div className="turno-admin-header">
                      <h3>{servicio?.nombre}</h3>
                      <span className={`badge badge-${turno.estado === 'confirmado' ? 'warning' : 'success'}`}>
                        {turno.estado === 'confirmado' ? 'Confirmado' : 'Completado'}
                      </span>
                    </div>
                    <div className="turno-admin-detalles">
                      <p>
                        <strong>Cliente:</strong> {usuario?.nombre} | {usuario?.telefono}
                      </p>
                      <p>
                        <strong>Fecha:</strong> {format(new Date(turno.fecha + 'T00:00:00'), 'dd/MM/yyyy')} | 
                        <strong> Hora:</strong> {turno.hora} hs
                      </p>
                      <p>
                        <strong>Total:</strong> ${turno.montoTotal.toLocaleString()} | 
                        <strong> Pagado:</strong> ${turno.montoPagado.toLocaleString()} | 
                        <strong> Resta:</strong> ${(turno.montoTotal - turno.montoPagado).toLocaleString()}
                      </p>
                      <p className="turno-id">ID: {turno.pagoId}</p>
                    </div>
                  </div>
                  <div className="turno-admin-acciones">
                    {turno.estado === 'confirmado' && (
                      <button
                        className="btn-accion completar"
                        onClick={() => completarTurno(turno.id)}
                        title="Completar"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <button
                      className="btn-accion cancelar"
                      onClick={() => cancelarTurno(turno.id)}
                      title="Cancelar"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">No se encontraron turnos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Turnos;

import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI } from '../../services/api';
import { History, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import './Admin.css';

const Historial = () => {
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState({});
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

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
      serviciosRes.data.forEach((s) => { serviciosMap[s.id] = s; });
      const usuariosMap = {};
      usuariosRes.data.forEach((u) => { usuariosMap[u.id] = u; });

      setServicios(serviciosMap);
      setUsuarios(usuariosMap);
      setTurnos(turnosRes.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const turnosFiltrados = turnos.filter((turno) => {
    const cumpleEstado = filtroEstado === 'todos' || turno.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' ||
      servicios[turno.servicioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuarios[turno.usuarioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      turno.pagoId.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando historial...</p>
      </div>
    );
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
              type="text"
              placeholder="Buscar por servicio, cliente o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtros">
            <button className={`filtro-btn ${filtroEstado === 'todos' ? 'active' : ''}`} onClick={() => setFiltroEstado('todos')}>Todos</button>
            <button className={`filtro-btn ${filtroEstado === 'confirmado' ? 'active' : ''}`} onClick={() => setFiltroEstado('confirmado')}>Confirmados</button>
            <button className={`filtro-btn ${filtroEstado === 'completado' ? 'active' : ''}`} onClick={() => setFiltroEstado('completado')}>Completados</button>
          </div>
        </div>

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
                      <p><strong>Cliente:</strong> {usuario?.nombre} | {usuario?.telefono}</p>
                      <p><strong>Fecha:</strong> {format(new Date(turno.fecha + 'T00:00:00'), 'dd/MM/yyyy')} | <strong>Hora:</strong> {turno.hora} hs</p>
                      <p><strong>Total:</strong> ${turno.montoTotal.toLocaleString()} | <strong>Pagado:</strong> ${turno.montoPagado.toLocaleString()} | <strong>Resta:</strong> ${(turno.montoTotal - turno.montoPagado).toLocaleString()}</p>
                      <p className="turno-id">ID: {turno.pagoId}</p>
                      <p style={{fontSize:'12px',color:'#999'}}>Creado: {format(new Date(turno.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
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

export default Historial;

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI } from '../../services/api';
import { LayoutDashboard, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import './Admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    turnosHoy: 0,
    turnosMes: 0,
    gananciasMes: 0,
    clientes: 0,
  });
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [servicios, setServicios] = useState({});
  const [loading, setLoading] = useState(true);

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
      setServicios(serviciosMap);

      const hoy = format(new Date(), 'yyyy-MM-dd');
      const inicioMes = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const finMes = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const turnosDelDia = turnosRes.data.filter((t) => t.fecha === hoy);
      const turnosDelMes = turnosRes.data.filter(
        (t) => t.fecha >= inicioMes && t.fecha <= finMes
      );

      const gananciasMes = turnosDelMes.reduce((sum, t) => sum + t.montoPagado, 0);
      const clientesUnicos = usuariosRes.data.filter((u) => u.rol === 'cliente').length;

      setStats({
        turnosHoy: turnosDelDia.length,
        turnosMes: turnosDelMes.length,
        gananciasMes,
        clientes: clientesUnicos,
      });

      setTurnosHoy(turnosDelDia.sort((a, b) => a.hora.localeCompare(b.hora)));
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>
          <LayoutDashboard size={40} />
          Panel de Administración
        </h1>
        <p>Bienvenida al panel de control</p>
      </div>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)' }}>
              <Calendar size={32} />
            </div>
            <div className="stat-info">
              <h3>Turnos Hoy</h3>
              <p className="stat-number">{stats.turnosHoy}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2196f3, #42a5f5)' }}>
              <TrendingUp size={32} />
            </div>
            <div className="stat-info">
              <h3>Turnos Este Mes</h3>
              <p className="stat-number">{stats.turnosMes}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ff9800, #ffa726)' }}>
              <DollarSign size={32} />
            </div>
            <div className="stat-info">
              <h3>Ganancias del Mes</h3>
              <p className="stat-number">${stats.gananciasMes.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
              <Users size={32} />
            </div>
            <div className="stat-info">
              <h3>Clientes Registrados</h3>
              <p className="stat-number">{stats.clientes}</p>
            </div>
          </div>
        </div>

        <div className="admin-sections">
          <div className="admin-section">
            <h2>Turnos de Hoy</h2>
            {turnosHoy.length > 0 ? (
              <div className="turnos-hoy-list">
                {turnosHoy.map((turno, index) => {
                  const servicio = servicios[turno.servicioId];
                  return (
                    <div key={turno.id} className="turno-hoy-item">
                      <div className="turno-hora">{turno.hora}</div>
                      <div className="turno-detalles">
                        <h4>{servicio?.nombre}</h4>
                        <p>ID: {turno.pagoId}</p>
                      </div>
                      <div className={`turno-estado ${turno.estado}`}>
                        {turno.estado === 'confirmado' ? 'Confirmado' : 'Completado'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">No hay turnos programados para hoy</p>
            )}
          </div>

          <div className="admin-section">
            <h2>Accesos Rápidos</h2>
            <div className="quick-actions">
              <Link to="/admin/turnos" className="quick-action-card">
                <Calendar size={32} />
                <h3>Gestionar Turnos</h3>
                <p>Ver, crear y administrar turnos</p>
              </Link>
              <Link to="/admin/estadisticas" className="quick-action-card">
                <TrendingUp size={32} />
                <h3>Estadísticas</h3>
                <p>Reportes y gráficos detallados</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

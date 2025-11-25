import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI } from '../../services/api';
import { TrendingUp, DollarSign, Calendar, Award } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import './Admin.css';

const Estadisticas = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [stats, setStats] = useState({
    totalTurnos: 0,
    totalGanancias: 0,
    promedioGanancia: 0,
    servicioMasSolicitado: null,
    serviciosStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    try {
      const [turnosRes, serviciosRes] = await Promise.all([
        turnosAPI.getAll(),
        serviciosAPI.getAll(),
      ]);

      const serviciosMap = {};
      serviciosRes.data.forEach((s) => {
        serviciosMap[s.id] = s;
      });

      let fechaInicio, fechaFin;
      if (periodo === 'mes') {
        fechaInicio = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        fechaFin = format(endOfMonth(new Date()), 'yyyy-MM-dd');
      } else {
        fechaInicio = format(startOfYear(new Date()), 'yyyy-MM-dd');
        fechaFin = format(endOfYear(new Date()), 'yyyy-MM-dd');
      }

      const turnosFiltrados = turnosRes.data.filter(
        (t) => t.fecha >= fechaInicio && t.fecha <= fechaFin
      );

      const totalGanancias = turnosFiltrados.reduce((sum, t) => sum + t.montoPagado, 0);
      const promedioGanancia = turnosFiltrados.length > 0 
        ? Math.round(totalGanancias / turnosFiltrados.length) 
        : 0;

      // Estadísticas por servicio
      const serviciosCount = {};
      const serviciosGanancias = {};

      turnosFiltrados.forEach((turno) => {
        const servicioId = turno.servicioId;
        serviciosCount[servicioId] = (serviciosCount[servicioId] || 0) + 1;
        serviciosGanancias[servicioId] = (serviciosGanancias[servicioId] || 0) + turno.montoPagado;
      });

      const serviciosStats = Object.keys(serviciosCount).map((id) => ({
        servicio: serviciosMap[id],
        cantidad: serviciosCount[id],
        ganancias: serviciosGanancias[id],
      })).sort((a, b) => b.cantidad - a.cantidad);

      const servicioMasSolicitado = serviciosStats.length > 0 ? serviciosStats[0] : null;

      setStats({
        totalTurnos: turnosFiltrados.length,
        totalGanancias,
        promedioGanancia,
        servicioMasSolicitado,
        serviciosStats,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>
          <TrendingUp size={40} />
          Estadísticas y Reportes
        </h1>
        <p>Análisis detallado del negocio</p>
      </div>

      <div className="container">
        <div className="periodo-selector">
          <button
            className={`btn ${periodo === 'mes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriodo('mes')}
          >
            Este Mes
          </button>
          <button
            className={`btn ${periodo === 'año' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setPeriodo('año')}
          >
            Este Año
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card-large">
            <div className="stat-icon-large" style={{ background: 'linear-gradient(135deg, #2196f3, #42a5f5)' }}>
              <Calendar size={40} />
            </div>
            <div className="stat-info-large">
              <h3>Total de Turnos</h3>
              <p className="stat-number-large">{stats.totalTurnos}</p>
              <span className="stat-label">En {periodo === 'mes' ? 'este mes' : 'este año'}</span>
            </div>
          </div>

          <div className="stat-card-large">
            <div className="stat-icon-large" style={{ background: 'linear-gradient(135deg, #4caf50, #66bb6a)' }}>
              <DollarSign size={40} />
            </div>
            <div className="stat-info-large">
              <h3>Total Ganancias (Señas)</h3>
              <p className="stat-number-large">${stats.totalGanancias.toLocaleString()}</p>
              <span className="stat-label">Solo señas pagadas</span>
            </div>
          </div>

          <div className="stat-card-large">
            <div className="stat-icon-large" style={{ background: 'linear-gradient(135deg, #ff9800, #ffa726)' }}>
              <TrendingUp size={40} />
            </div>
            <div className="stat-info-large">
              <h3>Promedio por Turno</h3>
              <p className="stat-number-large">${stats.promedioGanancia.toLocaleString()}</p>
              <span className="stat-label">Ganancia promedio</span>
            </div>
          </div>

          <div className="stat-card-large">
            <div className="stat-icon-large" style={{ background: 'linear-gradient(135deg, #9c27b0, #ba68c8)' }}>
              <Award size={40} />
            </div>
            <div className="stat-info-large">
              <h3>Servicio Más Solicitado</h3>
              <p className="stat-number-large" style={{ fontSize: '20px' }}>
                {stats.servicioMasSolicitado?.servicio?.nombre || 'N/A'}
              </p>
              <span className="stat-label">
                {stats.servicioMasSolicitado?.cantidad || 0} reservas
              </span>
            </div>
          </div>
        </div>

        <div className="servicios-estadisticas">
          <h2>Ranking de Servicios</h2>
          <div className="ranking-list">
            {stats.serviciosStats.map((item, index) => (
              <div key={item.servicio.id} className="ranking-item">
                <div className="ranking-position">{index + 1}</div>
                <div className="ranking-info">
                  <h4>{item.servicio.nombre}</h4>
                  <div className="ranking-bars">
                    <div className="ranking-bar">
                      <span className="bar-label">Cantidad de reservas</span>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(item.cantidad / stats.serviciosStats[0].cantidad) * 100}%`,
                            background: 'linear-gradient(135deg, #2196f3, #42a5f5)',
                          }}
                        ></div>
                        <span className="bar-value">{item.cantidad}</span>
                      </div>
                    </div>
                    <div className="ranking-bar">
                      <span className="bar-label">Ganancias (señas)</span>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(item.ganancias / stats.serviciosStats[0].ganancias) * 100}%`,
                            background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                          }}
                        ></div>
                        <span className="bar-value">${item.ganancias.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="info-adicional">
          <div className="info-card">
            <h3>💡 Información Importante</h3>
            <ul>
              <li>Las ganancias mostradas corresponden únicamente a las señas pagadas (50%)</li>
              <li>Para ver las ganancias totales, multiplicá las señas por 2</li>
              <li>Los turnos completados ya incluyen el pago del resto en el local</li>
              <li>Ganancia total estimada del {periodo === 'mes' ? 'mes' : 'año'}: <strong>${(stats.totalGanancias * 2).toLocaleString()}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;

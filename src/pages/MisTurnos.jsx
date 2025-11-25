import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { turnosAPI, serviciosAPI } from '../services/api';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './MisTurnos.css';

const MisTurnos = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [turnosRes, serviciosRes] = await Promise.all([
        turnosAPI.getByUsuario(user.id),
        serviciosAPI.getAll(),
      ]);

      const serviciosMap = {};
      serviciosRes.data.forEach((s) => {
        serviciosMap[s.id] = s;
      });

      setServicios(serviciosMap);
      setTurnos(turnosRes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const turnosFuturos = turnos.filter((t) => new Date(t.fecha) >= new Date().setHours(0, 0, 0, 0));
  const turnosPasados = turnos.filter((t) => new Date(t.fecha) < new Date().setHours(0, 0, 0, 0));

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando tus turnos...</p>
      </div>
    );
  }

  return (
    <div className="mis-turnos-page">
      <div className="mis-turnos-header">
        <h1>Mis Turnos</h1>
        <p>Administrá tus reservas</p>
      </div>

      <div className="container">
        {turnos.length === 0 ? (
          <div className="no-turnos">
            <div className="no-turnos-visual">
              <Calendar size={80} style={{color:'#e91e63', marginBottom:16}} />
              <h2 style={{fontWeight:700, color:'#9c27b0'}}>¡No tenés turnos reservados!</h2>
              <p style={{fontSize:18, color:'#555', marginBottom:24}}>Todavía no reservaste ningún turno.<br />Haz clic abajo para agendar tu primera cita y disfrutar nuestros servicios.</p>
              <Link to="/reservar" className="btn btn-primary" style={{fontSize:18, padding:'12px 32px'}}>
                Reservar Turno
              </Link>
            </div>
          </div>
        ) : (
          <>
            {turnosFuturos.length > 0 && (
              <div className="turnos-section">
                <h2 className="section-title">
                  <CheckCircle size={28} />
                  Próximos Turnos
                </h2>
                <div className="turnos-grid">
                  {turnosFuturos.map((turno) => {
                    const servicio = servicios[turno.servicioId];
                    return (
                      <div key={turno.id} className="turno-card proximo">
                        <div className="turno-badge">Confirmado</div>
                        <h3>{servicio?.nombre}</h3>
                        <div className="turno-info">
                          <div className="info-item">
                            <Calendar size={18} />
                            <span>{format(new Date(turno.fecha + 'T00:00:00'), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={18} />
                            <span>{turno.hora} hs</span>
                          </div>
                        </div>
                        <div className="turno-pago">
                          <div className="pago-item">
                            <span>Seña pagada:</span>
                            <strong>${turno.montoPagado.toLocaleString()}</strong>
                          </div>
                          <div className="pago-item">
                            <span>Resto a pagar:</span>
                            <strong>${(turno.montoTotal - turno.montoPagado).toLocaleString()}</strong>
                          </div>
                        </div>
                        <div className="turno-footer">
                          <span className="turno-id">ID: {turno.pagoId}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {turnosPasados.length > 0 && (
              <div className="turnos-section mt-4">
                <h2 className="section-title">
                  <XCircle size={28} />
                  Historial
                </h2>
                <div className="turnos-grid">
                  {turnosPasados.map((turno) => {
                    const servicio = servicios[turno.servicioId];
                    return (
                      <div key={turno.id} className="turno-card pasado">
                        <div className="turno-badge completado">Completado</div>
                        <h3>{servicio?.nombre}</h3>
                        <div className="turno-info">
                          <div className="info-item">
                            <Calendar size={18} />
                            <span>{format(new Date(turno.fecha + 'T00:00:00'), 'dd/MM/yyyy', { locale: es })}</span>
                          </div>
                          <div className="info-item">
                            <Clock size={18} />
                            <span>{turno.hora} hs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisTurnos;

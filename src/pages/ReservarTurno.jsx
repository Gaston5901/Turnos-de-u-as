
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviciosAPI, horariosAPI } from '../services/api';
// import { crearPreferencia as crearPreferenciaMP } from '../services/mercadoPago';
import { useCarrito } from '../store/useCarritoStore';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Check } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { toast } from 'react-toastify';
import './ReservarTurno.css';



const ReservarTurno = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarAlCarrito } = useCarrito();
  
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [estadoHorarios, setEstadoHorarios] = useState({ todos: [], ocupados: [], disponibles: [] });
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    cargarServicios();
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) cargarEstadoHorarios(fechaSeleccionada);
  }, [fechaSeleccionada]);

  const cargarServicios = async () => {
    try {
      const response = await serviciosAPI.getAll();
      setServicios(response.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadoHorarios = async (fecha) => {
    try {
      const resp = await horariosAPI.getPorDia();
      const horariosPorDia = resp.data || {};

      const day = new Date(fecha + 'T00:00:00').getDay();
      const normales = Array.isArray(horariosPorDia[String(day)]) ? horariosPorDia[String(day)] : [];
      const extras = Array.isArray(horariosPorDia[fecha]) ? horariosPorDia[fecha] : [];

      // Logs de depuración
      console.log('Día de la semana:', day);
      console.log('Horarios normales:', normales);
      console.log('Horarios extras:', extras);

      if (normales.length === 0) {
        console.warn('No hay horarios normales configurados para este día de la semana (' + day + '). Verifica tu db.json.');
      }

      const limpiarHora = h => String(h).trim().padStart(5, '0');
      const todos = Array.from(new Set([...normales, ...extras].map(limpiarHora))).sort((a, b) => {
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        return ah !== bh ? ah - bh : am - bm;
      });

      // Usar el servicio turnosAPI para obtener los turnos
      const turnosResp = await import('../services/api').then(mod => mod.turnosAPI.getAll());
      const turnos = turnosResp.data || [];
      const ocupados = turnos
      .filter(t => t.fecha === fecha && ["pendiente", "confirmado"].includes(t.estado))
      .map(t => t.hora);

      setEstadoHorarios({
        todos,
        ocupados,
        disponibles: todos.filter(h => !ocupados.includes(h))
      });
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const seleccionarServicio = (servicio) => {
    setServicioSeleccionado(servicio);
    setPaso(2);
  };

  const seleccionarFecha = (fecha) => {
    setFechaSeleccionada(fecha);
    setHoraSeleccionada('');
    setPaso(3);
  };

  const seleccionarHora = (hora, ocupado = false) => {
    if (ocupado) {
      toast.error('Ese horario ya está reservado');
      return;
    }

    setHoraSeleccionada(hora);

    if (servicioSeleccionado && fechaSeleccionada) {
      toast.info(
        `Turno seleccionado: ${servicioSeleccionado.nombre} - ${format(new Date(fechaSeleccionada + 'T00:00:00'), 'dd/MM')} ${hora} hs. Seña 50% y resto en el estudio.`,
        { autoClose: 6000 }
      );
    }
  };

  const buscarProximoDisponible = async () => {
    let base = new Date(fechaSeleccionada + 'T00:00:00');

    for (let i = 1; i <= 30; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      if (d.getDay() === 0) continue;

      const fechaStr = format(d, 'yyyy-MM-dd');
      const estado = await horariosAPI.getEstadoDia(fechaStr);

      if (estado.disponibles.length > 0) {
        setFechaSeleccionada(fechaStr);
        setEstadoHorarios(estado);
        setHoraSeleccionada(estado.disponibles[0]);

        toast.success(`Próximo disponible: ${format(d, 'dd/MM')} ${estado.disponibles[0]} hs`);
        return;
      }
    }

    toast.warn('No se encontró un horario disponible en los próximos días');
  };

  const agregarAlCarritoYContinuar = () => {
    if (!user) {
      // Guardar selección en localStorage y redirigir a login
      if (servicioSeleccionado && fechaSeleccionada && horaSeleccionada) {
        localStorage.setItem('reservaPendiente', JSON.stringify({
          servicioSeleccionado,
          fechaSeleccionada,
          horaSeleccionada
        }));
      }
      toast.info('Iniciá sesión o creá tu cuenta para continuar');
      navigate('/login');
      return;
    }
    // Si está logueado, flujo normal
    agregarAlCarrito(servicioSeleccionado, fechaSeleccionada, horaSeleccionada);
    navigate('/carrito');
  };

  const generarFechasDisponibles = () => {
    const fechas = [];
    const hoy = startOfToday();

    for (let i = 0; i < 14; i++) {
      const fecha = addDays(hoy, i);
      if (fecha.getDay() !== 0) fechas.push(fecha);
    }

    return fechas;
  };

  if (loading)
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );

  return (
    <div className="reservar-page">
      <div className="reservar-header">
        <h1>
          <span className="header-icon">
            <Calendar size={28} />
          </span>
          Reservar Turno
        </h1>
        <p>Seleccioná servicio, fecha y horario</p>
      </div>

      <div className="container">
        {/* PASOS */}
        <div className="progress-steps">
          <div className={`step ${paso >= 1 ? 'active' : ''} ${paso > 1 ? 'completed' : ''}`}>
            <div className="step-number">{paso > 1 ? <Check size={20} /> : '1'}</div>
            <span>Servicio</span>
          </div>
          <div className={`step ${paso >= 2 ? 'active' : ''} ${paso > 2 ? 'completed' : ''}`}>
            <div className="step-number">{paso > 2 ? <Check size={20} /> : '2'}</div>
            <span>Fecha</span>
          </div>
          <div className={`step ${paso >= 3 ? 'active' : ''} ${paso > 3 ? 'completed' : ''}`}>
            <div className="step-number">{paso > 3 ? <Check size={20} /> : '3'}</div>
            <span>Horario</span>
          </div>
        </div>

        {/* PASO 1 – SERVICIOS */}
        {paso === 1 && (
          <div className="paso-container">
            <h2 className="paso-title">
              <Calendar size={28} />
              Seleccioná el servicio
            </h2>

            <div className="servicios-grid-reserva">
              {servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  className="servicio-card-reserva"
                  onClick={() => seleccionarServicio(servicio)}
                >
                  <h3>{servicio.nombre}</h3>
                  <p>{servicio.descripcion}</p>
                  <div className="servicio-info-reserva">
                    <span className="precio">${servicio.precio.toLocaleString()}</span>
                    <span className="duracion">
                      <Clock size={16} />
                      {servicio.duracion} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 – FECHAS */}
        {paso === 2 && servicioSeleccionado && (
          <div className="paso-container">
            <h2 className="paso-title">
              <Calendar size={28} />
              Seleccioná la fecha
            </h2>

            <div className="servicio-seleccionado-info">
              <p>
                Servicio: <strong>{servicioSeleccionado.nombre}</strong>
              </p>
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>
                Cambiar servicio
              </button>
            </div>

            <div className="fechas-grid">
              {generarFechasDisponibles().map((fecha) => {
                const fechaStr = format(fecha, 'yyyy-MM-dd');
                const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

                return (
                  <div
                    key={fechaStr}
                    className={`fecha-card ${fechaSeleccionada === fechaStr ? 'selected' : ''}`}
                    onClick={() => seleccionarFecha(fechaStr)}
                  >
                    <div className="fecha-dia">{dias[fecha.getDay()]}</div>
                    <div className="fecha-numero">{fecha.getDate()}</div>
                    <div className="fecha-mes">{meses[fecha.getMonth()]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 3 – HORARIOS */}
        {paso === 3 && servicioSeleccionado && (
          <div className="paso-container">
            <h2 className="paso-title">
              <Clock size={28} />
              Seleccioná el horario
            </h2>

            <div className="servicio-seleccionado-info">
              <p>
                Servicio: <strong>{servicioSeleccionado.nombre}</strong> | Fecha:{' '}
                <strong>{format(new Date(fechaSeleccionada + 'T00:00:00'), 'dd/MM/yyyy')}</strong>
              </p>
              <button className="btn btn-secondary" onClick={() => setPaso(2)}>
                Cambiar fecha
              </button>
            </div>

            {estadoHorarios.todos.length > 0 ? (
              <>
                <div className="horarios-grid">
                  {estadoHorarios.todos.map((hora) => {
                    const ocupado = estadoHorarios.ocupados.includes(hora);

                    return (
                      <div
                        key={hora}
                        className={`hora-card ${horaSeleccionada === hora ? 'selected' : ''} ${
                          ocupado ? 'ocupado' : ''
                        }`}
                        onClick={() => seleccionarHora(hora, ocupado)}
                      >
                        <Clock size={20} />
                        {hora} hs {ocupado && <span className="tag-reservado">Reservado</span>}
                      </div>
                    );
                  })}
                </div>

                {estadoHorarios.disponibles.length === 0 && (
                  <div className="no-horarios">
                    <p>Todos los horarios de este día están reservados.</p>
                    <button className="btn btn-primary" onClick={buscarProximoDisponible}>
                      Ir al próximo disponible
                    </button>
                  </div>
                )}

                {horaSeleccionada && estadoHorarios.disponibles.includes(horaSeleccionada) && (
                  <div className="resumen-reserva">
                    <h3>Resumen de tu reserva</h3>

                    <div className="resumen-item">
                      <span>Servicio:</span>
                      <strong>{servicioSeleccionado.nombre}</strong>
                    </div>

                    <div className="resumen-item">
                      <span>Fecha:</span>
                      <strong>
                        {format(new Date(fechaSeleccionada + 'T00:00:00'), 'dd/MM/yyyy')}
                      </strong>
                    </div>

                    <div className="resumen-item">
                      <span>Horario:</span>
                      <strong>{horaSeleccionada} hs</strong>
                    </div>

                    <div className="resumen-item">
                      <span>Precio total:</span>
                      <strong>${servicioSeleccionado.precio.toLocaleString()}</strong>
                    </div>

                    <div className="resumen-item resumen-seña">
                      <span>Seña (50%):</span>
                      <strong className="precio-seña">
                        ${(servicioSeleccionado.precio / 2).toLocaleString()}
                      </strong>
                    </div>

                    <div className="anuncio-local">Dirección: Barrio San Martín mza A casa 5</div>

                    <button className="btn btn-primary btn-reservar" onClick={agregarAlCarritoYContinuar}>
                      Continuar al pago (carrito)
                    </button>

                  </div>
                )}
              </>
            ) : (
              <div className="no-horarios">
                <p>Este día no tiene horarios configurados.</p>
                <button className="btn btn-secondary" onClick={() => setPaso(2)}>
                  Elegir otra fecha
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservarTurno;

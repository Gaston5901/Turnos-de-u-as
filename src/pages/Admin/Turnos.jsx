import { useState, useEffect } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI, horariosAPI } from '../../services/api';
import { Calendar, Check, X, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import HorarioSelectorAdmin from './HorarioSelectorAdmin';
import { toast } from 'react-toastify';
import './Admin.css';

const Turnos = () => {
  // Estado para modal de edición
  const [editando, setEditando] = useState(false);
  const handleEditarTurno = (turno) => {
    // Prepara el objeto editable con los datos del turno y del usuario
    const usuario = usuarios[turno.usuarioId] || {};
    setTurnoEditar({
      ...turno,
      nombre: usuario.nombre || '',
      telefono: usuario.telefono || '',
      email: usuario.email || '',
    });
    setEditando(true);
  };
  const cerrarModalEditar = () => {
    setTurnoEditar(null);
    setEditando(false);
  };

  // Guardar cambios de edición
  const guardarEdicionTurno = async (e) => {
    e.preventDefault();
    try {
      // Actualiza usuario si cambió
      await usuariosAPI.update(turnoEditar.usuarioId, {
        nombre: turnoEditar.nombre,
        telefono: turnoEditar.telefono,
        email: turnoEditar.email,
      });
      // Actualiza turno con todos los datos relevantes
      await turnosAPI.update(turnoEditar.id, {
        usuarioId: turnoEditar.usuarioId,
        servicioId: parseInt(turnoEditar.servicioId),
        fecha: turnoEditar.fecha,
        hora: turnoEditar.hora,
        email: turnoEditar.email,
        nombre: turnoEditar.nombre,
        telefono: turnoEditar.telefono,
      });
      toast.success('Turno editado correctamente');
      cerrarModalEditar();
      await cargarDatos(); // Espera la recarga para asegurar que se actualice la vista
    } catch (error) {
      toast.error('Error al editar el turno');
      console.error(error);
    }
  };

  // --- ESTADO Y FUNCIONES PARA MODAL HORARIOS EXTRAS ---
  const [mostrarHorariosExtras, setMostrarHorariosExtras] = useState(false);
  const [fechaHorariosExtras, setFechaHorariosExtras] = useState('');
  const [horariosExtras, setHorariosExtras] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState('');
  const [editandoHorario, setEditandoHorario] = useState(null);

  // Cargar horarios extras para la fecha seleccionada
  const cargarHorariosExtras = async (fecha) => {
    try {
      const resp = await horariosAPI.getPorDia();
      let horarios = [];
      if (resp.data && resp.data[fecha]) {
        horarios = resp.data[fecha];
      } else if (resp.data) {
        // Si no hay horarios específicos para la fecha, busca por día de la semana
        const day = new Date(fecha + 'T00:00:00').getDay();
        if (resp.data[String(day)]) {
          horarios = resp.data[String(day)];
        }
      }
      setHorariosExtras(Array.isArray(horarios) ? horarios : []);
    } catch (error) {
      setHorariosExtras([]);
    }
  };

  // Guardar horarios extras en la base
  const guardarHorariosExtras = async () => {
    if (!fechaHorariosExtras) {
      toast.error('Selecciona una fecha');
      return;
    }
    try {
      const resp = await horariosAPI.getPorDia();
      // Verifica que el payload sea un objeto con arrays como valores
      const nuevos = { ...resp.data, [fechaHorariosExtras]: Array.isArray(horariosExtras) ? horariosExtras : [] };
      const resUpdate = await horariosAPI.setPorDia(nuevos);
      if (resUpdate?.error) {
        toast.error('Error: ' + (resUpdate.error.message || JSON.stringify(resUpdate.error)));
      } else {
        toast.success('Horarios extras guardados');
        setMostrarHorariosExtras(false);
        cargarHorariosExtras(fechaHorariosExtras);
      }
    } catch (error) {
      toast.error('Error al guardar horarios: ' + (error?.message || JSON.stringify(error)));
      console.error('Error al guardar horarios:', error);
    }
  };
    // Estado para modal de edición
    const [turnoEditar, setTurnoEditar] = useState(null);
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
      toast.error('Error al cargar los datos de turnos');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearTurnoPresencial = async (e) => {
    e.preventDefault();
    try {
      let usuario = Object.values(usuarios).find(u => u.email === nuevoTurno.email);
      if (!usuario) {
        const nuevoUsuario = {
          nombre: nuevoTurno.nombre?.trim() || '',
          email: nuevoTurno.email?.trim() || '',
          telefono: nuevoTurno.telefono?.trim() || '',
          password: 'temporal123',
          rol: 'cliente',
        };
        console.log('Payload usuario:', nuevoUsuario);
        try {
          const userRes = await usuariosAPI.create(nuevoUsuario);
          usuario = userRes.data;
        } catch (userError) {
          // Mostrar todos los errores de validación del backend
          if (userError?.response?.data?.errores) {
            userError.response.data.errores.forEach(err => {
              toast.error('Error usuario: ' + err.msg);
            });
          } else if (userError?.response?.data?.msg) {
            toast.error('Error usuario: ' + userError.response.data.msg);
          } else if (userError?.response?.data?.message) {
            toast.error('Error usuario: ' + userError.response.data.message);
          } else {
            toast.error('Error al crear usuario');
          }
          console.error(userError);
          return;
        }
      }
      const servicio = servicios[nuevoTurno.servicioId];
      const montoSeña = Math.round(servicio.precio * 0.5);
      const turnoData = {
        usuario: usuario.id, // Mongo espera 'usuario' como ObjectId
        servicio: servicio.id || servicio._id, // Mongo espera 'servicio' como ObjectId
        fecha: nuevoTurno.fecha,
        hora: nuevoTurno.hora,
        estado: 'confirmado',
        pagoId: 'PRESENCIAL' + Date.now(),
        montoPagado: montoSeña,
        montoTotal: servicio.precio,
        createdAt: new Date().toISOString(),
        // Extras para frontend
        email: usuario.email,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
      };
      await turnosAPI.create(turnoData);
      toast.success('Turno creado exitosamente con seña pagada');
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

  // Declaraciones fuera de cualquier función/render
  const hoyStr = format(new Date(), 'yyyy-MM-dd');
  const turnosFiltrados = turnos.filter((turno) => {
    let esValido = false;
    if (filtro === 'todos') {
      esValido = turno.fecha >= hoyStr && turno.estado !== 'completado';
    } else if (filtro === 'hoy') {
      esValido = turno.fecha === hoyStr && turno.estado !== 'completado';
    }
    const cumpleBusqueda =
      busqueda === '' ||
      servicios[turno.servicioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuarios[turno.usuarioId]?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      turno.pagoId.toLowerCase().includes(busqueda.toLowerCase());
    return esValido && cumpleBusqueda;
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
            <>
                <button
                  className="btn-horarios-extras"
                  onClick={() => setMostrarHorariosExtras(true)}
                  style={{
                    marginLeft: '18px',
                    background: 'linear-gradient(90deg, #d13fa0 0%, #ff5ec4 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 24px',
                    fontWeight: 'bold',
                    fontSize: '1.08rem',
                    boxShadow: '0 4px 18px rgba(209,63,160,0.18)',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'all 0.18s',
                    outline: 'none',
                    opacity: 1,
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #ff5ec4 0%, #d13fa0 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(209,63,160,0.25)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #d13fa0 0%, #ff5ec4 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(209,63,160,0.18)';
                  }}
                >
                  <span style={{marginRight:'8px',fontWeight:'bold',fontSize:'1.1em'}}>+</span>Agregar horarios extras
                </button>
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
              {/* Modal de horarios extras */}
              {mostrarHorariosExtras && (
                <div className="modal-horarios-extras-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={() => setMostrarHorariosExtras(false)}>
                  <div className="modal-horarios-extras" style={{background:'#fff',borderRadius:'22px',boxShadow:'0 8px 40px rgba(180,0,90,0.18)',padding:'0',minWidth:'340px',maxWidth:'95vw',width:'420px',animation:'modalScaleIn .4s',position:'relative',display:'flex',flexDirection:'column',maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
                    <button style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:'1.3rem',color:'#d13fa0',cursor:'pointer',zIndex:2}} onClick={() => setMostrarHorariosExtras(false)} title="Cerrar">×</button>
                    <div style={{padding:'38px 38px 0 38px',overflowY:'auto',flex:'1 1 auto'}}>
                      <h3 style={{marginBottom:'22px',fontWeight:'bold',fontSize:'1.25rem',color:'#d13fa0'}}>Gestionar horarios extras</h3>
                      <label style={{fontWeight:'bold',color:'#222'}}>Fecha especial</label>
                      <input type="date" value={fechaHorariosExtras} onChange={e => {setFechaHorariosExtras(e.target.value); cargarHorariosExtras(e.target.value);}} style={{marginBottom:'18px',padding:'8px',borderRadius:'8px',border:'1.5px solid #d13fa0',fontSize:'1rem',color:'#222'}} />
                      {fechaHorariosExtras && (
                        <>
                          <div style={{marginBottom:'12px'}}>
                            <label style={{fontWeight:'bold',color:'#222'}}>Horarios para {fechaHorariosExtras}:</label>
                            <ul style={{listStyle:'none',padding:0}}>
                              {horariosExtras.map((h,i) => (
                                <li key={i} style={{display:'flex',alignItems:'center',marginBottom:'6px'}}>
                                  {editandoHorario === i ? (
                                    <input type="text" value={nuevoHorario} onChange={e => setNuevoHorario(e.target.value)} style={{padding:'4px',borderRadius:'6px',border:'1px solid #d13fa0',marginRight:'8px',width:'90px'}} />
                                  ) : (
                                    <span style={{fontWeight:'bold',color:'#d13fa0',marginRight:'8px'}}>{h}</span>
                                  )}
                                  {editandoHorario === i ? (
                                    <>
                                      <button style={{background:'#d13fa0',color:'#fff',border:'none',borderRadius:'6px',padding:'2px 8px',marginRight:'4px'}} onClick={() => {const arr=[...horariosExtras];arr[i]=nuevoHorario;setHorariosExtras(arr);setEditandoHorario(null);}}>Guardar</button>
                                      <button style={{background:'#eee',color:'#d13fa0',border:'none',borderRadius:'6px',padding:'2px 8px'}} onClick={() => setEditandoHorario(null)}>Cancelar</button>
                                    </>
                                  ) : (
                                    <>
                                      <button style={{background:'#e7b2e6',color:'#fff',border:'none',borderRadius:'6px',padding:'2px 8px',marginRight:'4px'}} onClick={() => {setEditandoHorario(i);setNuevoHorario(h);}}>Editar</button>
                                      <button style={{background:'#fff',color:'#d13fa0',border:'1px solid #d13fa0',borderRadius:'6px',padding:'2px 8px'}} onClick={() => {const arr=[...horariosExtras];arr.splice(i,1);setHorariosExtras(arr);}}>Eliminar</button>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div style={{display:'flex',alignItems:'center',marginBottom:'18px'}}>
                            <input type="text" value={nuevoHorario} onChange={e => setNuevoHorario(e.target.value)} placeholder="Nuevo horario (ej: 18:00)" style={{padding:'4px',borderRadius:'6px',border:'1px solid #d13fa0',marginRight:'8px',width:'90px'}} />
                            <button style={{background:'#d13fa0',color:'#fff',border:'none',borderRadius:'6px',padding:'2px 12px',fontWeight:'bold'}} onClick={() => {if(nuevoHorario){setHorariosExtras([...horariosExtras,nuevoHorario]);setNuevoHorario('');}}}>Agregar</button>
                          </div>
                          <div style={{display:'flex',justifyContent:'flex-end',gap:'12px',marginBottom:'18px'}}>
                            <button style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'8px 22px',fontWeight:'bold',fontSize:'1rem'}} onClick={() => setMostrarHorariosExtras(false)}>Cancelar</button>
                            <button style={{background:'linear-gradient(90deg,#d13fa0,#e7b2e6)',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 22px',fontWeight:'bold',fontSize:'1rem'}} onClick={guardarHorariosExtras} disabled={!fechaHorariosExtras}>Guardar cambios</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
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
          <div className="modal-turno-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,animation:'fadeInBg .4s'}} onClick={() => { setMostrarFormulario(false); setNuevoTurno({ nombre: '', telefono: '', email: '', servicioId: '', fecha: '', hora: '' }); }}>
            <div className="modal-turno" style={{background:'linear-gradient(135deg,#fff 80%,#e7b2e6 100%)',borderRadius:'22px',boxShadow:'0 8px 40px rgba(180,0,90,0.18)',padding:'0',minWidth:'340px',maxWidth:'95vw',width:'520px',animation:'modalScaleIn .4s',position:'relative',display:'flex',flexDirection:'column',maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
              <button style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:'1.3rem',color:'#d13fa0',cursor:'pointer',zIndex:2}} onClick={() => { setMostrarFormulario(false); setNuevoTurno({ nombre: '', telefono: '', email: '', servicioId: '', fecha: '', hora: '' }); }} title="Cerrar">×</button>
              {/* Flujo igual al cliente: servicio, fecha, horario */}
              <div style={{padding:'38px 38px 0 38px',overflowY:'auto',flex:'1 1 auto'}}>
                <h3 style={{marginBottom:'22px',fontWeight:'bold',fontSize:'1.35rem',color:'#d13fa0'}}>Crear Turno Presencial</h3>
                {/* Paso 1: Servicio */}
                {!nuevoTurno.servicioId && (
                  <div>
                    <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
                      <button className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'7px 18px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s',marginRight:'16px'}} onClick={() => setMostrarFormulario(false)}>
                        Cancelar
                      </button>
                      <h4 style={{margin:0}}>Seleccioná el servicio</h4>
                    </div>
                    <div className="servicios-grid-reserva">
                      {Object.values(servicios).map((servicio) => (
                        <div key={servicio.id} className="servicio-card-reserva" onClick={() => setNuevoTurno({ ...nuevoTurno, servicioId: servicio.id })}>
                          <h3>{servicio.nombre}</h3>
                          <p>{servicio.descripcion}</p>
                          <div className="servicio-info-reserva">
                            <span className="precio">${servicio.precio.toLocaleString()}</span>
                            <span className="duracion">{servicio.duracion} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Paso 2: Fecha */}
                {nuevoTurno.servicioId && !nuevoTurno.fecha && (
                  <div>
                    <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
                      <button className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'7px 18px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s',marginRight:'16px'}} onClick={() => setNuevoTurno({ ...nuevoTurno, servicioId: '' })}>
                        ← Volver
                      </button>
                      <h4 style={{margin:0}}>Seleccioná la fecha</h4>
                    </div>
                    <div className="fechas-grid">
                      {Array.from({length:14}).map((_,i) => {
                        const hoy = new Date();
                        const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()+i);
                        if (fecha.getDay() === 0) return null;
                        const fechaStr = fecha.toISOString().slice(0,10);
                        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                        return (
                          <div key={fechaStr} className={`fecha-card ${nuevoTurno.fecha === fechaStr ? 'selected' : ''}`} onClick={() => setNuevoTurno({ ...nuevoTurno, fecha: fechaStr })}>
                            <div className="fecha-dia">{dias[fecha.getDay()]}</div>
                            <div className="fecha-numero">{fecha.getDate()}</div>
                            <div className="fecha-mes">{meses[fecha.getMonth()]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Paso 3: Horario */}
                {nuevoTurno.servicioId && nuevoTurno.fecha && !nuevoTurno.hora && (
                  <div>
                    <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
                      <button className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'7px 18px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s',marginRight:'16px'}} onClick={() => setNuevoTurno({ ...nuevoTurno, fecha: '' })}>
                        ← Volver
                      </button>
                      <h4 style={{margin:0}}>Seleccioná el horario</h4>
                    </div>
                    <HorarioSelectorAdmin fecha={nuevoTurno.fecha} onSelect={hora => setNuevoTurno({ ...nuevoTurno, hora })} />
                  </div>
                )}
                {/* Paso 4: Datos cliente y resumen */}
                {nuevoTurno.servicioId && nuevoTurno.fecha && nuevoTurno.hora && (
                  <form onSubmit={crearTurnoPresencial} style={{marginTop:'18px'}}>
                    <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
                      <button type="button" className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'7px 18px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s',marginRight:'16px'}} onClick={() => setNuevoTurno({ ...nuevoTurno, hora: '' })}>
                        ← Volver
                      </button>
                      <h4 style={{margin:0}}>Datos del cliente</h4>
                    </div>
                    <div className="form-grid" style={{gap:'18px'}}>
                      <div className="form-group">
                        <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Nombre del Cliente</label>
                        <input type="text" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={nuevoTurno.nombre} onChange={e => setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Teléfono</label>
                        <input type="tel" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={nuevoTurno.telefono} onChange={e => setNuevoTurno({ ...nuevoTurno, telefono: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Email</label>
                        <input type="email" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={nuevoTurno.email} onChange={e => setNuevoTurno({ ...nuevoTurno, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-actions" style={{display:'flex',gap:'12px',padding:'18px 0',borderTop:'1px solid #eee',background:'rgba(255,255,255,0.95)',justifyContent:'flex-end',position:'sticky',bottom:0,zIndex:1}}>
                      <button type="submit" className="btn btn-primary" style={{background:'linear-gradient(90deg,#d13fa0,#e7b2e6)',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 22px',fontWeight:'bold',fontSize:'1rem',boxShadow:'0 2px 8px rgba(209,63,160,0.08)',transition:'0.2s'}}>Crear Turno</button>
                      <button type="button" className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px 22px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s'}} onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      {/* Modal de edición de turno */}
      {editando && turnoEditar && (
        <div className="modal-turno-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,animation:'fadeInBg .4s'}} onClick={cerrarModalEditar}>
          <div className="modal-turno" style={{background:'linear-gradient(135deg,#fff 80%,#e7b2e6 100%)',borderRadius:'22px',boxShadow:'0 8px 40px rgba(180,0,90,0.18)',padding:'0',minWidth:'340px',maxWidth:'95vw',width:'520px',animation:'modalScaleIn .4s',position:'relative',display:'flex',flexDirection:'column',maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
            <button style={{position:'absolute',top:18,right:18,background:'none',border:'none',fontSize:'1.3rem',color:'#d13fa0',cursor:'pointer',zIndex:2}} onClick={cerrarModalEditar} title="Cerrar">×</button>
            {/* Flujo igual al cliente: servicio, fecha, horario */}
            <div style={{padding:'38px 38px 0 38px',overflowY:'auto',flex:'1 1 auto'}}>
              <h3 style={{marginBottom:'22px',fontWeight:'bold',fontSize:'1.35rem',color:'#d13fa0'}}>Editar Turno</h3>
              {/* Paso 1: Servicio */}
              {!turnoEditar.servicioId && (
                <div>
                  <h4>Seleccioná el servicio</h4>
                  <div className="servicios-grid-reserva">
                    {Object.values(servicios).map((servicio) => (
                      <div key={servicio.id} className="servicio-card-reserva" onClick={() => setTurnoEditar({ ...turnoEditar, servicioId: servicio.id })}>
                        <h3>{servicio.nombre}</h3>
                        <p>{servicio.descripcion}</p>
                        <div className="servicio-info-reserva">
                          <span className="precio">${servicio.precio.toLocaleString()}</span>
                          <span className="duracion">{servicio.duracion} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Paso 2: Fecha */}
              {turnoEditar.servicioId && !turnoEditar.fecha && (
                <div>
                  <h4>Seleccioná la fecha</h4>
                  <div className="fechas-grid">
                    {Array.from({length:14}).map((_,i) => {
                      const hoy = new Date();
                      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()+i);
                      if (fecha.getDay() === 0) return null;
                      const fechaStr = fecha.toISOString().slice(0,10);
                      const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                      const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                      return (
                        <div key={fechaStr} className={`fecha-card ${turnoEditar.fecha === fechaStr ? 'selected' : ''}`} onClick={() => setTurnoEditar({ ...turnoEditar, fecha: fechaStr })}>
                          <div className="fecha-dia">{dias[fecha.getDay()]}</div>
                          <div className="fecha-numero">{fecha.getDate()}</div>
                          <div className="fecha-mes">{meses[fecha.getMonth()]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Paso 3: Horario */}
              {turnoEditar.servicioId && turnoEditar.fecha && !turnoEditar.hora && (
                <HorarioSelectorAdmin fecha={turnoEditar.fecha} onSelect={hora => setTurnoEditar({ ...turnoEditar, hora })} />
              )}
              {/* Paso 4: Datos cliente y resumen */}
              {turnoEditar.servicioId && turnoEditar.fecha && turnoEditar.hora && (
                <form onSubmit={guardarEdicionTurno} style={{marginTop:'18px'}}>
                  <div className="form-grid" style={{gap:'18px'}}>
                    <div className="form-group">
                      <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Nombre del Cliente</label>
                      <input type="text" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={turnoEditar.nombre} onChange={e => setTurnoEditar({ ...turnoEditar, nombre: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Teléfono</label>
                      <input type="tel" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={turnoEditar.telefono} onChange={e => setTurnoEditar({ ...turnoEditar, telefono: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{color:'#222',fontWeight:'bold'}}>Email</label>
                      <input type="email" className="form-input" style={{background:'#fff',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px',fontSize:'1rem',color:'#222'}} value={turnoEditar.email} onChange={e => setTurnoEditar({ ...turnoEditar, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-actions" style={{display:'flex',gap:'12px',padding:'18px 0',borderTop:'1px solid #eee',background:'rgba(255,255,255,0.95)',justifyContent:'flex-end',position:'sticky',bottom:0,zIndex:1}}>
                    <button type="button" className="btn btn-secondary" style={{background:'#fff',color:'#d13fa0',border:'1.5px solid #d13fa0',borderRadius:'8px',padding:'10px 22px',fontWeight:'bold',fontSize:'1rem',transition:'0.2s'}} onClick={cerrarModalEditar}>Cerrar</button>
                    <button type="submit" className="btn btn-primary" style={{background:'linear-gradient(90deg,#d13fa0,#e7b2e6)',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 22px',fontWeight:'bold',fontSize:'1rem',boxShadow:'0 2px 8px rgba(209,63,160,0.08)',transition:'0.2s'}}>Guardar Cambios</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

        <div className="turnos-tabla">
          {turnosFiltrados.length > 0 ? (
            turnosFiltrados.map((turno) => {
              const servicio = servicios[turno.servicioId];
              const usuario = usuarios[turno.usuarioId];
              const tachado = turno.estado === 'reservado' || turno.estado === 'cancelado';
              // Badge de estado
              let badgeLabel = '';
              let badgeClass = '';
              if (turno.estado === 'cancelado') {
                badgeLabel = 'Cancelado';
                badgeClass = 'danger';
              } else if (turno.estado === 'confirmado') {
                badgeLabel = 'Confirmado';
                badgeClass = 'warning';
              } else {
                badgeLabel = 'Completado';
                badgeClass = 'success';
              }
              return (
                <div key={turno.id} className="turno-admin-card">
                  <div className="turno-admin-info">
                    <div className="turno-admin-header">
                      <h3 style={tachado ? {textDecoration:'line-through',color:'#888'} : {}}>{servicio?.nombre}</h3>
                      <span
                        className={`badge badge-${badgeClass}`}
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          borderRadius: 14,
                          padding: '4px 18px',
                          marginLeft: 10,
                          background:
                            badgeClass === 'danger'
                              ? 'linear-gradient(90deg,#ff5e7e 0%,#ffb199 100%)'
                              : badgeClass === 'warning'
                              ? 'linear-gradient(90deg,#ffe259 0%,#ffa751 100%)'
                              : 'linear-gradient(90deg,#43e97b 0%,#38f9d7 100%)',
                          color: badgeClass === 'danger' ? '#fff' : '#222',
                          border: 'none',
                          boxShadow: badgeClass === 'danger' ? '0 2px 8px #ff5e7e33' : badgeClass === 'warning' ? '0 2px 8px #ffe25933' : '0 2px 8px #43e97b33',
                          letterSpacing: 0.5,
                          textShadow: badgeClass === 'danger' ? '0 1px 2px #c62828' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                    <div className="turno-admin-detalles" style={tachado ? {textDecoration:'line-through',color:'#888'} : {}}>
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
                        <strong> Resta:</strong> {(turno.montoTotal - turno.montoPagado).toLocaleString()}
                      </p>
                      <p className="turno-id">ID: {turno.pagoId}</p>
                    </div>
                  </div>
                  <div className="turno-admin-acciones">
                    <button
                      className="btn-accion editar"
                      onClick={() => handleEditarTurno(turno)}
                      title="Editar"
                    >
                      Editar
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

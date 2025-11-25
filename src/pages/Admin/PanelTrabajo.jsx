import { useEffect, useState } from 'react';
import { turnosAPI, serviciosAPI, usuariosAPI } from '../../services/api';
import { CalendarDays, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import './Admin.css';

const PanelTrabajo = () => {
  const [loading, setLoading] = useState(true);
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [turnosManana, setTurnosManana] = useState([]);
  const [turnosExpirados, setTurnosExpirados] = useState([]);
  const [servicios, setServicios] = useState({});
  const [usuarios, setUsuarios] = useState({});

  const hoyStr = format(new Date(), 'yyyy-MM-dd');
  const mananaStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const cargar = async () => {
    try {
      const [turnosRes, serviciosRes, usuariosRes] = await Promise.all([
        turnosAPI.getAll(),
        serviciosAPI.getAll(),
        usuariosAPI.getAll(),
      ]);
      const serviciosMap = {}; serviciosRes.data.forEach(s => serviciosMap[s.id] = s);
      const usuariosMap = {}; usuariosRes.data.forEach(u => usuariosMap[u.id] = u);
      setServicios(serviciosMap); setUsuarios(usuariosMap);

      const todos = turnosRes.data;
      setTurnosHoy(todos.filter(t => t.fecha === hoyStr && t.estado !== 'completado').sort((a,b)=>a.hora.localeCompare(b.hora)));
      setTurnosManana(todos.filter(t => t.fecha === mananaStr && t.estado !== 'completado').sort((a,b)=>a.hora.localeCompare(b.hora)));
      setTurnosExpirados(todos.filter(t => t.fecha < hoyStr && t.estado !== 'completado').sort((a,b)=>a.fecha.localeCompare(b.fecha)));
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ cargar(); }, []);

  const marcarCompletado = async (id) => {
    try {
      await turnosAPI.update(id, { estado: 'completado' });
      toast.success('Turno marcado como completado');
      cargar();
    } catch { toast.error('Error al actualizar'); }
  };

  const renderLista = (lista) => (
    lista.length ? lista.map(t => {
      const s = servicios[t.servicioId];
      const u = usuarios[t.usuarioId];
      return (
        <div key={t.id} className="turno-hoy-item">
          <div className="turno-hora">{t.hora}</div>
          <div className="turno-detalles">
            <h4>{s?.nombre}</h4>
            <p>{u?.nombre} / {u?.telefono}</p>
            <p className="turno-id">ID: {t.pagoId}</p>
          </div>
          <button className="btn-accion completar" onClick={()=>marcarCompletado(t.id)} title="Completar">
            <CheckCircle size={20} />
          </button>
        </div>
      );
    }) : <p className="no-data">Sin turnos</p>
  );

  if (loading) return <div className="container" style={{textAlign:'center',padding:'80px'}}><div className="spinner"></div><p>Cargando panel de trabajo...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1><CalendarDays size={40}/> Panel de Trabajo</h1>
        <p>Gestiona los turnos de hoy, mañana y expirados</p>
      </div>
      <div className="container">
        <div className="admin-sections">
          <div className="admin-section">
            <h2>Hoy ({format(new Date(), 'dd/MM')})</h2>
            {renderLista(turnosHoy)}
          </div>
          <div className="admin-section">
            <h2>Mañana ({format(addDays(new Date(),1), 'dd/MM')})</h2>
            {renderLista(turnosManana)}
          </div>
          <div className="admin-section">
            <h2><AlertTriangle size={18}/> Expirados</h2>
            {renderLista(turnosExpirados)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelTrabajo;

import { useState, useEffect } from 'react';
import { serviciosAPI } from '../../services/api';
import { Package, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import './Admin.css';

const ServiciosAdmin = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    duracion: '',
    imagen: '',
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    try {
      const res = await serviciosAPI.getAll();
      setServicios(res.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        precio: parseFloat(formData.precio),
        duracion: parseInt(formData.duracion),
      };

      if (editando) {
        await serviciosAPI.update(editando.id, data);
        toast.success('Servicio actualizado');
      } else {
        await serviciosAPI.create(data);
        toast.success('Servicio creado');
      }

      resetForm();
      cargarServicios();
    } catch (error) {
      toast.error('Error al guardar servicio');
      console.error(error);
    }
  };

  const handleEditar = (servicio) => {
    setEditando(servicio);
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio.toString(),
      descripcion: servicio.descripcion,
      duracion: servicio.duracion.toString(),
      imagen: servicio.imagen || '',
    });
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás segura de eliminar este servicio?')) {
      try {
        await serviciosAPI.delete(id);
        toast.success('Servicio eliminado');
        cargarServicios();
      } catch (error) {
        toast.error('Error al eliminar servicio');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', descripcion: '', duracion: '', imagen: '' });
    setEditando(null);
    setMostrarForm(false);
  };

  const serviciosFiltrados = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1><Package size={40} /> Gestión de Servicios</h1>
        <p>Crea, edita y administra los servicios del estudio</p>
      </div>

      <div className="container">
        <div className="turnos-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setMostrarForm(!mostrarForm); }}>
            <Plus size={20} /> Nuevo Servicio
          </button>
        </div>

        {mostrarForm && (
          <div className="formulario-turno">
            <h3>{editando ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre del Servicio</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (minutos)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.duracion}
                    onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL Imagen</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    placeholder="/servicios/imagen.jpg"
                  />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editando ? 'Actualizar' : 'Crear'} Servicio
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="servicios-grid">
          {serviciosFiltrados.length > 0 ? (
            serviciosFiltrados.map((servicio) => (
              <div key={servicio.id} className="servicio-admin-card">
                <div className="servicio-admin-info">
                  <h3>{servicio.nombre}</h3>
                  <p className="servicio-desc">{servicio.descripcion}</p>
                  <div className="servicio-detalles">
                    <p><strong>Precio:</strong> ${servicio.precio.toLocaleString()}</p>
                    <p><strong>Duración:</strong> {servicio.duracion} min</p>
                  </div>
                </div>
                <div className="servicio-admin-acciones">
                  <button className="btn-accion editar" onClick={() => handleEditar(servicio)} title="Editar">
                    <Edit2 size={18} />
                  </button>
                  <button className="btn-accion cancelar" onClick={() => handleEliminar(servicio.id)} title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No se encontraron servicios</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiciosAdmin;

import { useState, useEffect } from 'react';
import { usuariosAPI } from '../../services/api';
import { Users, Search, Shield, User as UserIcon } from 'lucide-react';
import './Admin.css';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await usuariosAPI.getAll();
      setUsuarios(res.data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const cumpleRol = filtroRol === 'todos' || u.rol === filtroRol;
    const cumpleBusqueda = busqueda === '' ||
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.telefono && u.telefono.includes(busqueda));
    return cumpleRol && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1><Users size={40} /> Gestión de Usuarios</h1>
        <p>Visualiza todos los usuarios registrados</p>
      </div>

      <div className="container">
        <div className="turnos-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtros">
            <button className={`filtro-btn ${filtroRol === 'todos' ? 'active' : ''}`} onClick={() => setFiltroRol('todos')}>Todos</button>
            <button className={`filtro-btn ${filtroRol === 'cliente' ? 'active' : ''}`} onClick={() => setFiltroRol('cliente')}>Clientes</button>
            <button className={`filtro-btn ${filtroRol === 'admin' ? 'active' : ''}`} onClick={() => setFiltroRol('admin')}>Admins</button>
          </div>
        </div>

        <div className="usuarios-grid">
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.id}
                className="usuario-card"
                style={usuario.rol === 'cliente' ? { border: '2px solid #38bdf8', boxShadow: '0 0 8px #b6eaff55' } : {}}
              >
                <div className="usuario-icon">
                  {usuario.rol === 'admin' ? <Shield size={32} /> : <UserIcon size={32} />}
                </div>
                <div className="usuario-info">
                  <h2 style={{fontSize:'1.25rem',marginBottom:'4px'}}>{usuario.nombre || '(Sin nombre)'}</h2>
                  {usuario.rol === 'admin' ? (
                    <span className="badge badge-admin" style={{ background: 'gold', color: '#333', fontWeight: 'bold', padding: '6px 16px', borderRadius: '16px', fontSize: '1rem', marginTop: '8px', display: 'inline-block', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span role="img" aria-label="corona" style={{fontSize:'1.3em',marginRight:'4px'}}>👑</span>Admin
                    </span>
                  ) : (
                    <>
                      <p style={{ color: '#2563eb', fontWeight: 500, marginBottom: 2 }}>Gmail: {usuario.email}</p>
                      <p style={{ color: '#059669', fontWeight: 500, marginBottom: 8 }}>Teléfono: {usuario.telefono ? usuario.telefono : '(Sin cargar)'}</p>
                      <span className="badge badge-cliente" style={{ background: '#e0f7fa', color: '#0288d1', fontWeight: 'bold', borderRadius: '16px', padding: '5px 14px', fontSize: '1rem', marginTop: '4px', display: 'inline-block' }}>Cliente</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No se encontraron usuarios</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosAdmin;

import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../store/useCarritoStore';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cantidadItems } = useCarrito();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Delfina Nails Studio</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {(!user || isAdmin()) && (
            <NavLink end to="/" className={({isActive}) => `navbar-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
              Inicio
            </NavLink>
          )}
          <NavLink to="/servicios" className={({isActive}) => `navbar-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Servicios
          </NavLink>
          <NavLink to="/reservar" className={({isActive}) => `navbar-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Reservar Turno
          </NavLink>

          {user ? (
            <>
              <NavLink to="/mis-turnos" className={({isActive}) => `navbar-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Mis Turnos
              </NavLink>
              {!isAdmin() && (
                <NavLink to="/carrito" className={({isActive}) => `navbar-link cart-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  <ShoppingCart size={20} />
                  {cantidadItems > 0 && <span className="cart-badge">{cantidadItems}</span>}
                </NavLink>
              )}
              {isAdmin() && (
                <>
                  <NavLink to="/admin/panel" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    <LayoutDashboard size={18} /> Panel
                  </NavLink>
                  <NavLink to="/admin/panel-trabajo" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Trabajo
                  </NavLink>
                  <NavLink to="/admin/turnos" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Turnos
                  </NavLink>
                  <NavLink to="/admin/historial" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Historial
                  </NavLink>
                  <NavLink to="/admin/estadisticas" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Estadísticas
                  </NavLink>
                  <NavLink to="/admin/servicios-admin" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Servicios
                  </NavLink>
                  <NavLink to="/admin/usuarios" className={({isActive}) => `navbar-link admin-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    Usuarios
                  </NavLink>
                </>
              )}
              <div className="navbar-user">
                <User size={18} />
                <span>{user.nombre}</span>
              </div>
              <button className="navbar-link logout-btn" onClick={logout}>
                <LogOut size={18} />
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({isActive}) => `navbar-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" className={({isActive}) => `btn btn-primary navbar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

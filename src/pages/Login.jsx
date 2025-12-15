import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && (user.rol === 'admin' || user.rol === 'superadmin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Email o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={48} className="auth-icon" />
          <h1>Iniciar Sesión</h1>
          <p>Bienvenido/a de nuevo</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label id="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label id="password" className="form-label">Contraseña</label>
            <div className="password-wrapper">
              <input
                type={formData.showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder=""
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setFormData({...formData, showPassword: !formData.showPassword})}>
                {formData.showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <LogIn size={20} />
            Iniciar Sesión
          </button>

          {loading && (
            <div className="spinner-fullscreen">
              <span className="spinner">
                <svg viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeDasharray="31.4 31.4" transform="rotate(-90 25 25)">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </span>
            </div>
          )}
          <div className="recover-link">
            <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>

        <div className="auth-footer">
          <p>¿No tenés cuenta? <Link to="/register">Registrate aquí</Link></p>
          <p className="mt-2">
            <small>Usuario de prueba: admin@turnos.com / admin123</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

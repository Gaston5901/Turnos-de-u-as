import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/');
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
          <div className="form-group">
            <label className="form-label">Email</label>
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
            <label className="form-label">Contraseña</label>
            <div className="password-wrapper">
              <input
                type={formData.showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-password" onClick={() => setFormData({...formData, showPassword: !formData.showPassword})}>
                {formData.showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit">
            <LogIn size={20} />
            Iniciar Sesión
          </button>
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

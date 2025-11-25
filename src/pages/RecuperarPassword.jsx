import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

const RecuperarPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const solicitar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/recover-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Error');
      toast.success('Código enviado al email');
      setStep(2);
    } catch {
      toast.error('No se pudo enviar el código');
    } finally { setLoading(false); }
  };

  const restablecer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      if (!res.ok) throw new Error('Error');
      toast.success('Contraseña restablecida');
      setStep(3);
    } catch {
      toast.error('Error al restablecer');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <LogIn size={48} className="auth-icon" />
          <h1>Recuperar Contraseña</h1>
          <p>{step === 1 ? 'Ingresa tu email' : step === 2 ? 'Código y nueva contraseña' : 'Listo'}</p>
        </div>
        {step === 1 && (
          <form onSubmit={solicitar} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Código'}</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={restablecer} className="auth-form">
            <div className="form-group">
              <label className="form-label">Código</label>
              <input type="text" className="form-input" value={token} onChange={e=>setToken(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input type="password" className="form-input" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Procesando...' : 'Restablecer'}</button>
          </form>
        )}
        {step === 3 && (
          <div style={{textAlign:'center', padding:'20px'}}>
            <Mail size={48} />
            <p>Contraseña actualizada. Ahora podés <Link to="/login">iniciar sesión</Link>.</p>
          </div>
        )}
        <div className="auth-footer">
          <Link to="/login">Volver a Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;

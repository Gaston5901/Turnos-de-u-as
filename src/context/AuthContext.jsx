import { createContext, useContext, useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await usuariosAPI.login(email, password);
      if (userData) {
        const userWithToken = { ...userData, token: 'mock-token-' + Date.now() };
        localStorage.setItem('user', JSON.stringify(userWithToken));
        setUser(userWithToken);
        toast.success('¡Bienvenido/a!');
        return true;
      } else {
        toast.error('Email o contraseña incorrectos');
        return false;
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const users = await usuariosAPI.getAll();
      const emailExists = users.data.find((u) => u.email === userData.email);
      
      if (emailExists) {
        toast.error('El email ya está registrado');
        return false;
      }

      const newUser = {
        ...userData,
        rol: 'cliente',
        id: Date.now(),
      };

      const response = await usuariosAPI.create(newUser);
      const userWithToken = { ...response.data, token: 'mock-token-' + Date.now() };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);
      toast.success('¡Registro exitoso!');
      return true;
    } catch (error) {
      toast.error('Error al registrarse');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Sesión cerrada');
    window.location.href = '/login';
  };

  const isAdmin = () => {
    return user && (user.rol === 'admin' || user.rol === 'superadmin');
  };

  const isSuperAdmin = () => {
    return user && user.rol === 'superadmin';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

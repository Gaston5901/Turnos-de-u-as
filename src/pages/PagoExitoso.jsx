import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = location.search || '?status=approved';
    navigate(`/carrito${search}`, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="carrito-vacio">
      <h2>Redirigiendo al carrito...</h2>
      <p>Si no pasa nada, hace click abajo.</p>
      <Link className="btn btn-primary" to="/carrito?status=approved">
        Volver a la tienda
      </Link>
    </div>
  );
};

export default PagoExitoso;

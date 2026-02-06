import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PagoFallido = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = location.search || '?status=failure';
    navigate(`/carrito${search}`, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="carrito-vacio">
      <h2>Pago no completado</h2>
      <p>Te llevamos al carrito para reintentar.</p>
      <Link className="btn btn-primary" to="/carrito?status=failure">
        Volver a la tienda
      </Link>
    </div>
  );
};

export default PagoFallido;

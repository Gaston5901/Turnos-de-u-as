import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PagoPendiente = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const search = location.search || '?status=pending';
    navigate(`/carrito${search}`, { replace: true });
  }, [location.search, navigate]);

  return (
    <div className="carrito-vacio">
      <h2>Pago pendiente</h2>
      <p>Te llevamos al carrito para revisar el estado.</p>
      <Link className="btn btn-primary" to="/carrito?status=pending">
        Volver a la tienda
      </Link>
    </div>
  );
};

export default PagoPendiente;

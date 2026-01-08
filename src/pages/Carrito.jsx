import { crearPreferencia } from '../services/mercadoPago';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../store/useCarritoStore';
import { useAuth } from '../context/AuthContext';
import { turnosAPI } from '../services/api';
import { ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import './Carrito.css';

const Carrito = () => {
  const navigate = useNavigate();
  const { items, eliminarDelCarrito, vaciarCarrito, calcularTotal, calcularSeña } = useCarrito();
  const { user } = useAuth();
  const [procesando, setProcesando] = useState(false);

  // Botón para pagar con Mercado Pago
  const pagarConMercadoPago = async () => {
    if (!user) { toast.error('Debes iniciar sesión para continuar'); navigate('/login'); return; }
    setProcesando(true);
    try {
      const carritoMP = items.map(item => ({
        titulo: item.servicio.nombre,
        precio: item.servicio.precio / 2, // Seña 50%
        cantidad: 1
      }));
      
      const data = await crearPreferencia(carritoMP);
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error('No se pudo iniciar el pago');
      }
    } catch (e) {
      toast.error('Error al conectar con Mercado Pago');
    } finally {
      setProcesando(false);
    }
  };

  const procesarPago = async () => {
    if (!user) { toast.error('Debes iniciar sesión para continuar'); navigate('/login'); return; }
    setProcesando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación pago

      const pagoIdGlobal = 'MP' + Date.now() + Math.random().toString(36).substr(2, 9);
      const serviciosEmail = [];
      for (const item of items) {
        const turnoData = {
          // usuario: user.id, // NO enviar este campo
          email: user.email,
          nombre: user.nombre,
          telefono: user.telefono || '',
          servicio: item.servicio.id,
          fecha: item.fecha,
          hora: item.hora,
          estado: 'confirmado',
          pagoId: pagoIdGlobal,
          montoPagado: item.servicio.precio / 2,
          montoTotal: item.servicio.precio,
          createdAt: new Date().toISOString(),
        };
        await turnosAPI.create(turnoData);
        serviciosEmail.push({
          nombre: item.servicio.nombre,
          precio: item.servicio.precio,
          fecha: item.fecha,
          hora: item.hora,
        });
      }
      // Enviar comprobante al backend
      try {
        await fetch('http://localhost:4000/api/email/comprobante', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            nombre: user.nombre,
            servicios: serviciosEmail,
            seña: calcularSeña(),
            total: calcularTotal(),
            pagoId: pagoIdGlobal,
          })
        });
      } catch (e) {
        console.error('Error enviando email comprobante', e);
      }

      toast.success('¡Turno confirmado en Delfina Nails Studio! Email enviado.');
      toast.info('Dirección: Barrio San Martín mza A casa 5. Recordá llegar 5 minutos antes.', { autoClose: 7000 });
      vaciarCarrito();
      navigate('/mis-turnos');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago. Intenta nuevamente.');
    } finally { setProcesando(false); }
  };

  if (items.length === 0) {
    return (
      <div className="carrito-vacio">
        <ShoppingCart size={80} />
        <h2>Tu carrito está vacío</h2>
        <p>Agregá servicios para reservar tus turnos</p>
        <button className="btn btn-primary" onClick={() => navigate('/reservar')}>Explorar Servicios</button>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <h1>
          <span className="header-icon"><ShoppingCart size={28} /></span>
          Mi Carrito
        </h1>
      </div>
      <div className="container">
        <div className="carrito-content">
          <div className="carrito-items">
            {items.map((item) => (
              <div key={item.id} className="carrito-item">
                <div className="item-info">
                  <h3>{item.servicio.nombre}</h3>
                  <p className="item-fecha">📅 {format(new Date(item.fecha + 'T00:00:00'), 'dd/MM/yyyy')} - 🕐 {item.hora} hs</p>
                  <p className="item-duracion">⏱️ Duración: {item.servicio.duracion} minutos</p>
                </div>
                <div className="item-precio">
                  <div className="precio-total"><span className="label">Precio total:</span><span className="valor">${item.servicio.precio.toLocaleString()}</span></div>
                  <div className="precio-seña"><span className="label">Seña (50%):</span><span className="valor">${(item.servicio.precio / 2).toLocaleString()}</span></div>
                </div>
                <button className="btn-eliminar" onClick={() => eliminarDelCarrito(item.id)} title="Eliminar"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>

          <div className="carrito-resumen">
            <div className="resumen-card">
              <h3>Resumen de Compra</h3>
              <div className="resumen-detalle"><span>Cantidad de servicios:</span><strong>{items.length}</strong></div>
              <div className="resumen-detalle"><span>Total servicios:</span><strong>${calcularTotal().toLocaleString()}</strong></div>
              <div className="resumen-seña-total"><span>Total a pagar (50% seña):</span><strong className="precio-final">${calcularSeña().toLocaleString()}</strong></div>
              <div className="resumen-info">
                <p>💳 Seña segura con Mercado Pago</p>
                <p>📧 Email de confirmación</p>
                <p>🏠 Dirección: Barrio San Martín mza A casa 5</p>
                <p>💰 Resto en el estudio</p>
              </div>
              <button className="btn btn-primary btn-pagar" onClick={procesarPago} disabled={procesando}>
                {procesando ? (<><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>Procesando...</>) : (<><CreditCard size={20} />Pagar (prueba local)</>)}
              </button>
              <button className="btn btn-secondary btn-pagar" style={{marginTop:8}} onClick={pagarConMercadoPago} disabled={procesando}>
                {procesando ? (<><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>Procesando...</>) : (<><CreditCard size={20} />Pagar con Mercado Pago</>)}
              </button>
              <button className="btn btn-secondary mt-2" onClick={() => navigate('/reservar')}>Agregar más servicios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;

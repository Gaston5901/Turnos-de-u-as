import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const TurnosTransferenciaModal = ({ onClose }) => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTurnos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/turnos/en-proceso');
      // Asegura que turnos sea un array
      setTurnos(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los turnos');
      setTurnos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Simulación de turnos para demo
    setTurnos([
      {
        _id: '1',
        clienteNombre: 'Ana López',
        metodoPago: 'Transferencia',
        entidad: 'Mercado Pago',
        fecha: '12/02/2026',
        hora: '10:00',
        servicio: 'Uñas gel',
        monto: 5000,
        comprobanteTransferencia: 'https://via.placeholder.com/150',
        seña: 2500,
      },
      {
        _id: '2',
        clienteNombre: 'Juan Pérez',
        metodoPago: 'Transferencia',
        entidad: 'Tarjeta Naranja',
        fecha: '13/02/2026',
        hora: '15:00',
        servicio: 'Esmaltado',
        monto: 3000,
        comprobanteTransferencia: '',
        seña: 1500,
      },
    ]);
    setLoading(false);
  }, []);

  const handleAccion = async (id, accion) => {
    const accionTexto = accion === 'confirmar' ? 'confirmar' : 'rechazar';
    const accionColor = accion === 'confirmar' ? '#388e3c' : '#e91e63';
    // SweetAlert2 con popup sobre el modal, sin cerrar el modal
    const result = await Swal.fire({
      title: `¿Seguro que quieres ${accionTexto} este turno?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accionTexto}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: accionColor,
      cancelButtonColor: '#888',
      background: '#fff',
      color: '#222',
      allowOutsideClick: false,
      allowEscapeKey: true,
      backdrop: true,
      target: document.body, // fuerza el popup sobre todo
      heightAuto: true,
      customClass: {
        popup: 'swal2-over-modal',
      },
    });
    if (!result.isConfirmed) return;
    try {
      await new Promise(res => setTimeout(res, 600));
      await fetchTurnos();
      Swal.fire({
        title: `Turno ${accion === 'confirmar' ? 'confirmado' : 'rechazado'} correctamente`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#fff',
        color: '#222',
        target: document.body,
        heightAuto: true,
        customClass: {
          popup: 'swal2-over-modal',
        },
      });
    } catch (err) {
      Swal.fire({
        title: 'Error al actualizar el turno',
        icon: 'error',
        background: '#fff',
        color: '#222',
        target: document.body,
        heightAuto: true,
        customClass: {
          popup: 'swal2-over-modal',
        },
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 18,
        padding: 32,
        minWidth: 320,
        maxWidth: 700,
        width: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        position: 'relative',
        border: '1.5px solid #e91e63',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1500, // BAJADO para que SweetAlert2 lo supere
      }}>
        <button onClick={onClose} style={{position:'absolute',top:18,right:18,fontSize:28,background:'none',border:'none',cursor:'pointer',color:'#e91e63',fontWeight:'bold'}}>×</button>
        <h2 style={{marginBottom:24, color:'#e91e63', fontWeight:700, fontSize:28, textAlign:'center'}}>Turnos a confirmar <span style={{fontWeight:400, fontSize:20}}>(Transferencia)</span></h2>
        {loading ? <div>Cargando...</div> : error ? <div>{error}</div> : (
          <div style={{width:'100%',overflowX:'auto'}}>
            <table style={{width:'100%',fontSize:16,background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #e91e6322',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#fce4ec',color:'#e91e63'}}>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Cliente</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Método</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Entidad</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Fecha/Hora</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Servicio</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Monto</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Seña</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Comprobante</th>
                  <th style={{padding:'10px 8px',fontWeight:700}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center',padding:20}}>No hay turnos pendientes</td></tr>
                ) : (
                  turnos.map(turno => (
                    <tr key={turno._id} style={{borderBottom:'1px solid #f8bbd0'}}>
                      <td style={{padding:'10px 8px',fontWeight:500}}>{turno.clienteNombre}</td>
                      <td style={{padding:'10px 8px'}}>{turno.metodoPago}</td>
                      <td style={{padding:'10px 8px'}}>{turno.entidad}</td>
                      <td style={{padding:'10px 8px'}}>{turno.fecha?.split('/').reverse().join('/')} <span style={{color:'#e91e63',fontWeight:600}}>{turno.hora}</span></td>
                      <td style={{padding:'10px 8px'}}>{turno.servicio}</td>
                      <td style={{padding:'10px 8px',fontWeight:600,color:'#388e3c'}}>${turno.monto}</td>
                      <td style={{padding:'10px 8px',fontWeight:600,color:'#e91e63'}}>${turno.senia ?? Math.round(turno.monto * 0.5)}</td>
                      <td style={{padding:'10px 8px'}}>
                        {turno.comprobanteTransferencia ? (
                          <a href={turno.comprobanteTransferencia} target="_blank" rel="noopener noreferrer" style={{color:'#e91e63',textDecoration:'underline',fontWeight:600}}>Ver</a>
                        ) : <span style={{color:'#888'}}>No adjunto</span>}
                      </td>
                      <td style={{padding:'10px 8px',display:'flex',gap:10,justifyContent:'center',alignItems:'center'}}>
                        <button
                          style={{
                            background:'#fff',
                            color:'#388e3c',
                            border:'2px solid #388e3c',
                            borderRadius: '50%',
                            width: 44,
                            height: 44,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            fontWeight:700,
                            fontSize:26,
                            cursor:'pointer',
                            boxShadow:'0 2px 8px #388e3c22',
                            transition:'all 0.18s',
                            outline:'none',
                          }}
                          onClick={() => handleAccion(turno._id, 'confirmar')}
                          onMouseOver={e=>{e.currentTarget.style.background='#388e3c';e.currentTarget.style.color='#fff';}}
                          onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#388e3c';}}
                          title="Confirmar"
                        >
                          ✔
                        </button>
                        <button
                          style={{
                            background:'#fff',
                            color:'#e91e63',
                            border:'2px solid #e91e63',
                            borderRadius: '50%',
                            width: 44,
                            height: 44,
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            fontWeight:700,
                            fontSize:26,
                            cursor:'pointer',
                            boxShadow:'0 2px 8px #e91e6322',
                            transition:'all 0.18s',
                            outline:'none',
                          }}
                          onClick={() => handleAccion(turno._id, 'rechazar')}
                          onMouseOver={e=>{e.currentTarget.style.background='#e91e63';e.currentTarget.style.color='#fff';}}
                          onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='#e91e63';}}
                          title="Rechazar"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TurnosTransferenciaModal;

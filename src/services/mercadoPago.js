import { API_BASE_URL } from '../config/apiBaseUrl.js';

export const crearPreferencia = async (carrito) => {
  const res = await fetch(`${API_BASE_URL}/pagos/crear-preferencia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ carrito })
  });

  return res.json();
};

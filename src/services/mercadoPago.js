export const crearPreferencia = async (carrito) => {
  const res = await fetch("http://localhost:4000/api/pagos/crear-preferencia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ carrito })
  });

  return res.json();
};

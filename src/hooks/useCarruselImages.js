import { useEffect, useState } from 'react';

// Hook para obtener imágenes del carrusel desde la API
export default function useCarruselImages() {
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/carrusel')
      .then(res => res.json())
      .then(data => setImagenes(Array.isArray(data.imagenes) ? data.imagenes : []))
      .catch(() => setImagenes([]));
  }, []);

  return imagenes;
}

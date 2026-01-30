import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/apiBaseUrl.js';

// Hook para obtener imágenes del carrusel desde la API
export default function useCarruselImages() {
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/carrusel`)
      .then(res => res.json())
      .then(data => setImagenes(Array.isArray(data.imagenes) ? data.imagenes : []))
      .catch(() => setImagenes([]));
  }, []);

  return imagenes;
}

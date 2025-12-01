import { useEffect, useState } from 'react';
import './HeroCarousel.css';

const images = [
  '/carrusel1.jpg',
  '/carrusel2.jpg',
  '/carrusel3.jpg',
  '/carrusel4.jpg'
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-carousel">
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`Carrusel ${idx+1}`}
          className={`carousel-img${idx === current ? ' active' : ''}`}
          style={{zIndex: idx === current ? 2 : 1}}
        />
      ))}
      <div className="carousel-indicators">
        {images.map((_, idx) => (
          <span key={idx} className={idx === current ? 'active' : ''}></span>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Hero.css';

const heroTopBackground = `${import.meta.env.BASE_URL}images/background.png`;

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = React.useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );

    const target = contentRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, []);

  const goToCollections = () => {
    const scrollToCollections = () => {
      const section = document.getElementById('collections');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollToCollections, 250);
      return;
    }

    scrollToCollections();
  };

  return (
    <section className="hero-container">
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${heroTopBackground})`,
          backgroundPosition: 'top center',
        }}
      ></div>
      
      <div ref={contentRef} className={`hero-content ${isVisible ? 'visible' : ''}`}>
        <span className="hero-kicker">New Season Collection</span>
        <h1 className="animate-pop">Elevate Your Style</h1>
        <p className="animate-fade">Discover the latest trends in digital fashion.</p>
        <div className="hero-btns">
          <button className="btn-primary" type="button" onClick={() => navigate('/shop')}>Shop Now</button>
          <button className="btn-secondary" type="button" onClick={goToCollections}>View Collections</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
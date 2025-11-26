const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-overlay">
        <div className="hero-branding" aria-label="Marca Ampily">
          <span className="hero-logo-wrapper">
            <img
              src="/A.png"
              alt="Logo da Ampily"
              className="hero-logo"
              loading="lazy"
            />
          </span>
          <div>
            <p className="hero-branding-name">AMPILY</p>
            <p className="hero-branding-tagline">
              Estratégia, tecnologia e comunidade em um só lugar.
            </p>
          </div>
        </div>
        <div className="hero-message">
          <h1 id="hero-heading">
            Ampliando as MPE&apos;s com Inspiracao, Aprendizados e Resultados
            Imediatos
          </h1>
        </div>
      </div>
    </section>
  );
};

export default Hero;

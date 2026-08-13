import './Hero.css';

export function Hero() {
  return (
    <section className="hero" aria-label="Hacker House Goa 2026">
      <div className="container hero__content">
        <div className="hero__title-wrapper">
          <h1 className="hero__title">
            HACKER HOUSE
          </h1>
          <div className="hero__title-hindi">गोवा</div>
        </div>
        
        <div className="hero__footer">
          <div className="hero__footer-left">
            GOA, INDIA <span className="dot">·</span> 28 - 31 OCT 2026
          </div>
          <div className="hero__footer-right">
            2:47 PM STUDIO
          </div>
        </div>
      </div>
      
      {/* Decorative beach elements below */}
      <div className="hero__illustration">
        <div className="sea-line" />
      </div>
    </section>
  );
}

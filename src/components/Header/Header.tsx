import './Header.css';

export function Header() {
  return (
    <header className="header" role="banner">
      <div className="container header__inner">
        <div className="header__brand">
          <div className="brand-time">2:47PM</div>
          <div className="brand-studio">STUDIO</div>
        </div>

      </div>
    </header>
  );
}

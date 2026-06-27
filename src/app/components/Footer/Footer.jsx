import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <img src="/logoLargo.png" alt="Ritnova 360" className="footer__logo" />
          <p className="footer__tagline">
            La academia de danza online más vibrante de Colombia. Aprende, baila y transforma tu vida.
          </p>
          <div className="footer__socials">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="footer__social">Instagram</a>
            <a href="https://www.tiktok.com/en/" target="_blank" rel="noopener noreferrer" className="footer__social">TikTok</a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="footer__social">YouTube</a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Academia</h4>
          <a href="#">Sobre Nosotros</a>
          <a href="#">Nuestros Profesores</a>
          <a href="#">Blog</a>
          <a href="#">Comunidad</a>
        </div>

        <div className="footer__col">
          <h4>Cursos</h4>
          <a href="#">Salsa</a>
          <a href="#">Bachata</a>
          <a href="#">Hip-Hop</a>
          <a href="#">Reggaetón</a>
          <a href="#">Zumba</a>
        </div>

        <div className="footer__col">
          <h4>Soporte</h4>
          <a href="#">Centro de ayuda</a>
          <a href="#">Términos y condiciones</a>
          <a href="#">Política de privacidad</a>
          <a href="#">Contacto</a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© 2026 Ritnova360. Todos los derechos reservados.</p>
        <p>Cali, Colombia · soporte@ritnova360.com · +57 300 123 4567</p>
      </div>
    </footer>
  );
}

export default Footer;

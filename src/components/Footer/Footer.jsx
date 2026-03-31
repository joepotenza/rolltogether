/*
  Footer.jsx
  Site Footer
*/

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__text">
        <p className="footer__developer">Developed by Joe Potenza</p>
        <a
          className="footer__attribution"
          href="https://www.vecteezy.com/free-vector/d20-dice"
        >
          D20 Dice Vectors by Vecteezy
        </a>
      </div>
      <p className="footer__copyright">&copy; 2026</p>
    </footer>
  );
}

export default Footer;

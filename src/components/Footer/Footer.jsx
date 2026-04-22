/*
  Footer.jsx
  Site Footer
*/

import "./Footer.css";
import { Link } from "react-router";

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
      <p className="footer__copyright">
        <span>2026</span>
        <span>
          &#8286; <Link to="/privacy">Privacy Policy</Link>
        </span>
        <span>
          &#8286; <Link to="/terms">Terms of Service</Link>
        </span>
      </p>
    </footer>
  );
}

export default Footer;

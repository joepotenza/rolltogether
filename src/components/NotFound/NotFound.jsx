/*
  NotFound.jsx
  Generic 404 page
*/
import "./NotFound.css";
import notFoundImage from "../../images/404.png";
function NotFound({ message = "" }) {
  return (
    <div className="notfound">
      <img className="notfound__image" src={notFoundImage} alt={message} />
      <div className="notfound__message">{message}</div>
    </div>
  );
}
export default NotFound;

/*
  ErrorPage.jsx
  Generic Error Page
*/
import "./ErrorPage.css";
function ErrorPage() {
  return (
    <div className="errpage">
      <h1 className="errpage__title">An Error Has Occurred</h1>
      <div className="errpage__message">
        Please reload the page to try again
      </div>
    </div>
  );
}
export default ErrorPage;

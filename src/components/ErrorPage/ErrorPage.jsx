import "./ErrorPage.css";
//import notFoundImage from "../../images/404.png";
function ErrorPage({ type = "error", message = "" }) {
  return (
    <>
      <h1>An Error Has Occurred</h1>
      <h3>Please try again</h3>
    </>
  );
}
export default ErrorPage;

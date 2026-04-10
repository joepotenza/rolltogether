import "./Login.css";
import "../Form/Form.css";
import LoginForm from "../LoginForm/LoginForm";

function Login({ onSubmit }) {
  return (
    <main className="login__content">
      <h2 className="login__title">Log In</h2>
      <LoginForm mode="Login" onSubmit={onSubmit} />
    </main>
  );
}
export default Login;

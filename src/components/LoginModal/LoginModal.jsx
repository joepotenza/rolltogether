import LoginForm from "../LoginForm/LoginForm";

function LoginModal({ isOpen, onOpen, onClose, onSubmit, signupHandler }) {
  return (
    <LoginForm
      mode="LoginModal"
      isOpen={isOpen}
      oOpen={onOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      signupHandler={signupHandler}
    />
  );
}
export default LoginModal;

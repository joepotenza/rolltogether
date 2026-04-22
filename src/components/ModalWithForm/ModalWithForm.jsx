/*
  ModalWithForm.jsx
  Wrapper for any modal that includes a form
*/

import "./ModalWithForm.css";
import Modal from "../Modal/Modal";

function ModalWithForm({
  name,
  title,
  buttonText,
  submittingButtonText = "Submitting...",
  isOpen,
  onClose,
  onSubmit,
  onOpen,
  children,
  signupHandler,
  loginHandler,
  isSubmitting,
}) {
  return (
    <Modal name={name} isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
      <button
        className="modal__close-btn"
        type="button"
        onClick={onClose}
      ></button>
      <div className="modal__header">
        <h2 className="modal__title">{title}</h2>
      </div>
      <form className="modal__form" name={name} onSubmit={onSubmit} noValidate>
        {children}
        <button
          className={`modal__submit-btn modal__submit-btn-type_${name}`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingButtonText : buttonText}
        </button>
        {name === "user-login" ? (
          <button
            className="modal__signup-btn"
            type="button"
            onClick={signupHandler}
          >
            or Sign Up
          </button>
        ) : name === "user-signup" ? (
          <button
            className="modal__signup-btn"
            type="button"
            onClick={loginHandler}
          >
            or Log In
          </button>
        ) : (
          ""
        )}
      </form>
    </Modal>
  );
}

export default ModalWithForm;

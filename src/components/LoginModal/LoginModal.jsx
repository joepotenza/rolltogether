import validator from "validator";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect, useState } from "react";

function LoginModal({ isOpen, onOpen, onClose, onSubmit, signupHandler }) {
  const [loginError, setLoginError] = useState("");

  const defaultValues = {
    username: "",
    password: "",
  };

  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = "Please enter your username or email address.";
    }

    if (!values.password) {
      errors.password = "Please enter your password.";
    }

    return errors;
  };

  // Handle any errors caught by .catch() when submitting the form
  const handleLoginError = (err) => {
    if (err.message === "Failed to fetch") {
      setLoginError("Could not connect to database. Please try again.");
    } else {
      setLoginError(err.message);
    }
  };

  const { values, handleChange, errors, resetForm, handleSubmit } =
    useFormWithValidation(defaultValues, validate);

  const handleFormSubmit = (evt) => {
    setLoginError("");
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(trimmedValues, resetForm, handleLoginError),
    );
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <ModalWithForm
      name="user-login"
      title="Log In"
      buttonText="Log In"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      signupHandler={signupHandler}
    >
      <label
        htmlFor="login-username"
        className={`modal__label ${errors.username ? "modal__label_has-error" : ""}`}
      >
        Username or Email Address
        <input
          type="text"
          name="username"
          value={values.username}
          onChange={handleChange}
          className={`modal__input ${errors.username ? "modal__input_has-error" : ""}`}
          id="login-username"
          placeholder="Username or email"
        />
        <span
          className={`modal__error ${errors.username ? "modal__error_has-error" : ""}`}
          id="login-username-error"
        >
          {errors.username}
        </span>
      </label>

      <label
        htmlFor="login-password"
        className={`modal__label ${errors.password ? "modal__label_has-error" : ""}`}
      >
        Password
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          className={`modal__input ${errors.password ? "modal__input_has-error" : ""}`}
          id="login-password"
          placeholder="Password"
        />
        <span
          className={`modal__error ${errors.password ? "modal__error_has-error" : ""}`}
          id="login-password-error"
        >
          {errors.password}
        </span>
      </label>
      <span
        className={`modal__error ${loginError ? "modal__error_has-error" : ""}`}
      >
        {loginError}
      </span>
    </ModalWithForm>
  );
}
export default LoginModal;

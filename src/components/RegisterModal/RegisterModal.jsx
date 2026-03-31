import validator from "validator";
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect } from "react";

function RegisterModal({ isOpen, onOpen, onClose, onRegister, loginHandler }) {
  const defaultValues = {
    email: "",
    password: "",
    name: "",
    avatar: "",
  };

  const validate = (values) => {
    const errors = {};

    if (!values.email.trim()) {
      errors.email = "Email is required.";
    } else if (!validator.isEmail(values.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!values.password) {
      errors.password = "Please enter a password.";
    }

    if (!values.name) {
      errors.name = "Please enter a name.";
    }

    if (!values.avatar) {
      errors.avatar = "Please enter an Avatar URL.";
    } else {
      try {
        new URL(values.avatar);
      } catch {
        errors.avatar = "Please enter a valid URL.";
      }
    }

    return errors;
  };

  const { values, handleChange, errors, resetForm, handleSubmit } =
    useFormWithValidation(defaultValues, validate);

  const handleFormSubmit = (evt) => {
    handleSubmit(evt, (trimmedValues) => onRegister(trimmedValues, resetForm));
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <ModalWithForm
      name="user-signup"
      title="Sign Up"
      buttonText="Sign Up"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      loginHandler={loginHandler}
    >
      <label
        htmlFor="signup-email"
        className={`modal__label ${errors.email ? "modal__label_has-error" : ""}`}
      >
        Email *
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          className={`modal__input ${errors.email ? "modal__input_has-error" : ""}`}
          id="signup-email"
          placeholder="Email"
        />
        <span
          className={`modal__error ${errors.email ? "modal__error_has-error" : ""}`}
          id="signup-email-error"
        >
          {errors.email}
        </span>
      </label>

      <label
        htmlFor="signup-password"
        className={`modal__label ${errors.password ? "modal__label_has-error" : ""}`}
      >
        Password *
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          className={`modal__input ${errors.password ? "modal__input_has-error" : ""}`}
          id="signup-password"
          placeholder="Password"
        />
        <span
          className={`modal__error ${errors.password ? "modal__error_has-error" : ""}`}
          id="signup-password-error"
        >
          {errors.password}
        </span>
      </label>

      <label
        htmlFor="signup-name"
        className={`modal__label ${errors.name ? "modal__label_has-error" : ""}`}
      >
        Name *
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          className={`modal__input ${errors.name ? "modal__input_has-error" : ""}`}
          id="signup-name"
          placeholder="Name"
        />
        <span
          className={`modal__error ${errors.name ? "modal__error_has-error" : ""}`}
          id="signup-name-error"
        >
          {errors.name}
        </span>
      </label>

      <label
        htmlFor="signup-avatar"
        className={`modal__label ${errors.avatar ? "modal__label_has-error" : ""}`}
      >
        Avatar URL *
        <input
          type="text"
          name="avatar"
          value={values.avatar}
          onChange={handleChange}
          className={`modal__input ${errors.avatar ? "modal__input_has-error" : ""}`}
          id="signup-avatar"
          placeholder="Avatar URL"
        />
        <span
          className={`modal__error ${errors.avatar ? "modal__error_has-error" : ""}`}
          id="signup-avatar-error"
        >
          {errors.avatar}
        </span>
      </label>
    </ModalWithForm>
  );
}
export default RegisterModal;

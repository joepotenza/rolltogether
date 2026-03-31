import "./Login.css";
import "../Form/Form.css";
//import validator from "validator";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect, useState } from "react";
import { Link } from "react-router";

function Login({ onSubmit }) {
  const [loginError, setLoginError] = useState("");

  const defaultValues = {
    username: "",
    password: "",
  };

  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = "Please enter your username or email address";
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
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(trimmedValues, resetForm, handleLoginError),
    );
  };

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <main className="login__content">
      <h2 className="login__title">Log In</h2>

      <form
        className="form login__form"
        name="login-form-full"
        onSubmit={handleFormSubmit}
        noValidate
      >
        <label
          htmlFor="login-username"
          className={`form__label ${errors.username ? "form__label_has-error" : ""}`}
        >
          Username or Email Address
          <input
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            className={`form__input ${errors.username ? "form__input_has-error" : ""}`}
            id="login-username"
            placeholder="Username or email"
          />
          <span
            className={`form__error ${errors.username ? "form__error_has-error" : ""}`}
            id="login-username-error"
          >
            {errors.username}
          </span>
        </label>

        <label
          htmlFor="login-password"
          className={`form__label ${errors.password ? "form__label_has-error" : ""}`}
        >
          Password
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            className={`form__input ${errors.password ? "form__input_has-error" : ""}`}
            id="login-password"
            placeholder="Password"
          />
          <span
            className={`form__error ${errors.password ? "form__error_has-error" : ""}`}
            id="login-password-error"
          >
            {errors.password}
          </span>
        </label>

        <span
          className={`form__error ${loginError ? "form__error_has-error" : ""}`}
        >
          {loginError}
        </span>

        <button
          className={`form__submit-btn form__submit-btn-type_login`}
          type="submit"
        >
          Login
        </button>
        <Link to="/signup" className="form__signup-btn">
          or Sign Up
        </Link>
      </form>
    </main>
  );
}
export default Login;

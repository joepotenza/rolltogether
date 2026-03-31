import "./Signup.css";
import "../Form/Form.css";
import validator from "validator";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import AvatarGenerator from "../AvatarGenerator/AvatarGenerator";
import PasswordStrengthChecker from "../PasswordStrengthChecker/PasswordStrengthChecker";

function Signup({ onSubmit }) {
  const [signupError, setSignupError] = useState("");

  const defaultValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    avatar: "",
  };

  const validate = (values) => {
    const errors = {};
    const regex = /[^a-zA-Z0-9]/gi;

    if (!values.username) {
      errors.username = "Please enter a username.";
    } else if (values.username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (values.username.length > 30) {
      errors.username = "Username can not be longer than 30 characters.";
    } else if (regex.test(values.username)) {
      errors.username = "Username can not contain spaces or special characters";
    }

    if (!values.name) {
      errors.name = "Please enter your name.";
    } else if (values.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (values.name.length > 30) {
      errors.name = "Name can not be longer than 30 characters.";
    }

    if (!values.email) {
      errors.email = "Email is required.";
    } else if (!validator.isEmail(values.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!values.password) {
      errors.password = "Please enter a password.";
    } /*else if (passwordStrength < 2) {
      errors.password = "Please choose a stronger password.";
    }*/
    if (!values.password_confirm) {
      errors.password_confirm = "Please confirm your password.";
    } else if (values.password !== values.password_confirm) {
      errors.password_confirm = "Passwords do not match.";
    }

    if (!values.avatar) {
      errors.avatar = "Please choose an avatar.";
    }

    return errors;
  };

  /*const [passwordStrength, setPasswordStrength] = useState(0);*/

  const {
    values,
    handleChange,
    errors,
    resetForm,
    handleSubmit,
    setValues,
    setErrors,
    setIsValid,
  } = useFormWithValidation(defaultValues, validate);

  // Handle any errors caught by .catch() when submitting the form
  const handleSignupError = (err) => {
    if (err.message === "Failed to fetch") {
      setSignupError("Could not connect to database. Please try again.");
    } else {
      setSignupError(err.message);
    }
  };

  const handleFormSubmit = (evt) => {
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(trimmedValues, resetForm, handleSignupError),
    );
  };

  const handleAvatarChange = (avatar) => {
    setValues((prevValues) => {
      const nextValues = { ...prevValues, avatar };
      /*Update errors for the avatar field
      const fieldErrors = validate(nextValues).avatar;
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors, avatar: fieldErrors };
        setIsValid(Object.values(nextErrors).every((message) => !message));
        return nextErrors;
      });*/
      return nextValues;
    });
  };

  const handleAvatarError = (err) => {
    console.error(err);
  };

  /*const handleUpdatePasswordStrength = (evaluation) => {
    setPasswordStrength(evaluation ? evaluation.score : 0);
  };*/

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <main className="signup__content">
      <h2 className="signup__title">Sign Up</h2>

      <form
        className="form signup__form"
        name="signup-form-full"
        onSubmit={handleFormSubmit}
        noValidate
      >
        <label
          htmlFor="signup-username"
          className={`form__label ${errors.username ? "form__label_has-error" : ""}`}
        >
          Username
          <input
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            className={`form__input ${errors.username ? "form__input_has-error" : ""}`}
            id="signup-username"
            placeholder="Username"
            maxLength={30}
          />
          <span
            className={`form__error ${errors.username ? "form__error_has-error" : ""}`}
            id="signup-username-error"
          >
            {errors.username}
          </span>
        </label>
        <label
          htmlFor="signup-email"
          className={`form__label ${errors.email ? "form__label_has-error" : ""}`}
        >
          Email
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className={`form__input ${errors.email ? "form__input_has-error" : ""}`}
            id="signup-email"
            placeholder="Email"
          />
          <span
            className={`form__error ${errors.email ? "form__error_has-error" : ""}`}
            id="signup-email-error"
          >
            {errors.email}
          </span>
        </label>
        <label
          htmlFor="signup-password"
          className={`form__label ${errors.password ? "form__label_has-error" : ""}`}
        >
          Password
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            className={`form__input ${errors.password ? "form__input_has-error" : ""}`}
            id="signup-password"
            placeholder="Password"
          />
          {/*<PasswordStrengthChecker
            password={values.password}
            onUpdate={handleUpdatePasswordStrength}
          />*/}
          <span
            className={`form__error ${errors.password ? "form__error_has-error" : ""}`}
            id="signup-password-error"
          >
            {errors.password}
          </span>
        </label>

        <label
          htmlFor="signup-password-confirm"
          className={`form__label ${errors.password_confirm ? "form__label_has-error" : ""}`}
        >
          Confirm your password
          <input
            type="password"
            name="password_confirm"
            value={values.password_confirm}
            onChange={handleChange}
            className={`form__input ${errors.password_confirm ? "form__input_has-error" : ""}`}
            id="signup-password-confirm"
            placeholder="Confirm password"
          />
          <span
            className={`form__error ${errors.password_confirm ? "form__error_has-error" : ""}`}
            id="signup-password-confirm-error"
          >
            {errors.password_confirm}
          </span>
        </label>

        <label
          htmlFor="signup-name"
          className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
        >
          Your Name
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
            id="signup-name"
            placeholder="Name"
            maxLength={30}
          />
          <span
            className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
            id="signup-name-error"
          >
            {errors.name}
          </span>
        </label>
        <label
          className={`form__label ${errors.avatar ? "form__label_has-error" : ""}`}
        >
          Choose Your Avatar
        </label>

        <AvatarGenerator
          onChange={handleAvatarChange}
          onError={handleAvatarError}
        />

        <span
          className={`form__error ${errors.avatar ? "form__error_has-error" : ""}`}
          id="signup-avatar-error"
        >
          {errors.avatar}
        </span>

        <span
          className={`form__error signup__error ${signupError ? "form__error_has-error" : ""}`}
        >
          {signupError}
        </span>

        <button
          className={`form__submit-btn form__submit-btn-type_signup`}
          type="submit"
        >
          Sign Up
        </button>
        <Link to="/login" className="form__login-btn">
          or Log In
        </Link>
      </form>
    </main>
  );
}
export default Signup;

/*
  Signup.jsx
  Signup Form
*/

import "./Signup.css";
import "../Form/Form.css";
import validator from "validator";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router";
import { BANNED_WORDS } from "../../utils/constants";
import AvatarGenerator from "../AvatarGenerator/AvatarGenerator";
import PageContext from "../../contexts/PageContext";

// import PasswordStrengthChecker from "../PasswordStrengthChecker/PasswordStrengthChecker";

function Signup({ onSignup }) {
  /*const [passwordStrength, setPasswordStrength] = useState(0);*/
  const { authAPI, getPrettierErrorMessage } = useContext(PageContext);

  const [signupError, setSignupError] = useState("");

  const defaultValues = {
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    avatar: "",
  };

  // Custom resolver for form validation including banned words check
  const resolver = (values) => {
    const errors = {};

    // Username validation
    if (!values.username) {
      errors.username = { message: "Please enter a username" };
    } else if (values.username.length > 20) {
      errors.username = {
        message: "Username can not be longer than 20 characters",
      };
    } else if (values.username.length < 3) {
      errors.username = { message: "Username must be at least 3 characters" };
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      errors.username = {
        message: "Username must only contain letters, numbers, and underscores",
      };
    } else {
      // Check for banned words
      const lowerUsername = values.username.toLowerCase();
      if (BANNED_WORDS.some((word) => lowerUsername.includes(word))) {
        errors.username = { message: "Your username contains a banned word" };
      }
    }

    // Email validation
    if (!values.email) {
      errors.email = { message: "Please enter an email address" };
    } else if (!validator.isEmail(values.email)) {
      errors.email = { message: "Please enter a valid email address" };
    }

    // Password validation
    if (!values.password) {
      errors.password = { message: "Please enter a password" };
    } else if (values.password.length < 8) {
      errors.password = { message: "Password must be at least 8 characters" };
    }

    // Password confirm validation
    if (!values.password_confirm) {
      errors.password_confirm = { message: "Please confirm your password" };
    } else if (values.password_confirm.length < 8) {
      errors.password_confirm = {
        message: "Password must be at least 8 characters",
      };
    } else if (values.password_confirm !== values.password) {
      errors.password_confirm = { message: "Passwords do not match" };
    }

    // Name validation
    if (!values.name) {
      errors.name = { message: "Please enter your name" };
    } else if (values.name.length > 30) {
      errors.name = { message: "Name can not be longer than 30 characters" };
    } else {
      // Check for banned words
      const lowerName = values.name.toLowerCase();
      if (BANNED_WORDS.some((word) => lowerName.includes(word))) {
        errors.name = { message: "Your name contains a banned word" };
      }
    }

    if (!values.invite) {
      errors.invite = { message: "Please enter your invite code" };
    }

    // Avatar validation
    if (!values.avatar) {
      errors.avatar = { message: "Please choose an avatar" };
    }

    return { values, errors };
  };

  const {
    register,
    handleSubmit,
    control,
    subscribe,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm({
    mode: "onBlur",
    defaultValues,
    resolver,
  });
  const password = useWatch({ control, name: "password" });
  useEffect(() => {
    // make sure to unsubscribe;
    const callback = subscribe({
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        setSignupError("");
      },
    });

    return () => callback();
  }, [subscribe]);
  // register("avatar", { required: true }); // Moved to resolver

  // process form submit and then call onSignup which will tell App.jsx to sign in the new user
  const handleFormSubmit = async (data) => {
    await authAPI
      .registerUser(data)
      .then(() => {
        // User registered successfully, handle login (be sure to use properties of "data" to get password)
        onSignup(data);
      })
      .catch(handleSignupError);
  };

  // Handle any errors caught by .catch() when submitting the form
  const handleSignupError = (err) => {
    setSignupError(getPrettierErrorMessage(err));
  };

  // When the avatar chages, update the form field value
  const handleAvatarChange = useCallback(
    (avatar) => {
      setValue("avatar", avatar);
    },
    [setValue],
  );

  const handleAvatarError = useCallback(
    (err) => {
      setError("avatar", { type: "custom", message: err.message });
      console.error(err);
    },
    [setError],
  );

  /*const handleUpdatePasswordStrength = (evaluation) => {
    setPasswordStrength(evaluation ? evaluation.score : 0);
  };*/

  return (
    <main className="signup__content">
      <h2 className="signup__title">Sign Up</h2>

      <form
        className="form signup__form"
        name="signup-form-full"
        onSubmit={handleSubmit(handleFormSubmit)}
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
            className={`form__input ${errors.username ? "form__input_has-error" : ""}`}
            id="signup-username"
            placeholder="Username"
            maxLength={20}
            {...register("username")}
          />
          <span
            className={`form__error ${errors.username ? "form__error_has-error" : ""}`}
            id="signup-username-error"
          >
            {errors.username?.message}
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
            className={`form__input ${errors.email ? "form__input_has-error" : ""}`}
            id="signup-email"
            placeholder="Email"
            {...register("email")}
          />
          <span
            className={`form__error ${errors.email ? "form__error_has-error" : ""}`}
            id="signup-email-error"
          >
            {errors.email?.message}
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
            className={`form__input ${errors.password ? "form__input_has-error" : ""}`}
            id="signup-password"
            placeholder="Password"
            minLength={8}
            {...register("password")}
          />
          {/*<PasswordStrengthChecker
            password={values.password}
            onUpdate={handleUpdatePasswordStrength}
          />*/}
          <span
            className={`form__error ${errors.password ? "form__error_has-error" : ""}`}
            id="signup-password-error"
          >
            {errors.password?.message}
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
            className={`form__input ${errors.password_confirm ? "form__input_has-error" : ""}`}
            id="signup-password-confirm"
            placeholder="Confirm password"
            minLength={8}
            {...register("password_confirm")}
          />
          <span
            className={`form__error ${errors.password_confirm ? "form__error_has-error" : ""}`}
            id="signup-password-confirm-error"
          >
            {errors.password_confirm?.message}
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
            className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
            id="signup-name"
            placeholder="Name"
            maxLength={30}
            {...register("name")}
          />
          <span
            className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
            id="signup-name-error"
          >
            {errors.name?.message}
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
          {errors.avatar?.message}
        </span>
        <span
          className={`form__error signup__error ${signupError ? "form__error_has-error" : ""}`}
        >
          {signupError}
        </span>

        <div className="signup__beta-card">
          <label
            htmlFor="signup-invite"
            className={`form__label ${errors.invite ? "form__label_has-error" : ""}`}
          >
            Invite Code
            <p>
              RollTogether is currently in beta testing and requires an invite
              code to join
            </p>
            <input
              type="text"
              name="invite"
              className={`form__input signup__code ${errors.invite ? "form__input_has-error" : ""}`}
              id="signup-invite"
              placeholder="Invite Code"
              maxLength={6}
              minLength={6}
              {...register("invite", {
                required: "Please enter your invite code",
                maxLength: {
                  value: 7,
                  message: "Please enter your invite code",
                },
                minLength: {
                  value: 7,
                  message: "Please enter your invite code",
                },
                onChange: (evt) =>
                  (evt.target.value = evt.target.value.trim().toUpperCase()),
                shouldUnregister: true,
              })}
            />
            <span
              className={`form__error ${errors.invite ? "form__error_has-error" : ""}`}
              id="signup-invite-error"
            >
              {errors.invite?.message}
            </span>
          </label>
        </div>

        <button
          className={`form__submit-btn form__submit-btn-type_signup`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Sign Up"}
        </button>
        <Link to="/login" className="form__login-btn">
          or Log In
        </Link>
      </form>
    </main>
  );
}
export default Signup;

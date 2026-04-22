/*
    LoginForm.jsx
    Login form that is included in both Login.jsx and LoginModal.jsx to eliminate duplicate code
*/
import ModalWithForm from "../ModalWithForm/ModalWithForm";
import PageContext from "../../contexts/PageContext";
import { useForm } from "react-hook-form";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router";

function LoginForm({
  mode = "Login",
  onSubmit,
  isOpen,
  onOpen,
  onClose,
  signupHandler,
}) {
  const { getPrettierErrorMessage } = useContext(PageContext);
  const defaultValues = {
    username: "",
    password: "",
  };

  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    subscribe,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    mode: "onBlur",
    defaultValues,
  });
  useEffect(() => {
    // make sure to unsubscribe;
    const callback = subscribe({
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        setLoginError("");
      },
    });

    return () => callback();
  }, [subscribe]);

  // Handle any errors caught by .catch() when submitting the form
  const handleLoginError = (err) => {
    setLoginError(getPrettierErrorMessage(err));
  };

  // call login in App.jsx (same as used in LoginModal)
  const handleFormSubmit = async (data) => {
    await onSubmit(data, handleLoginError);
  };

  useEffect(() => {
    if (mode === "LoginModal" && isOpen) {
      setValue("username", "");
      setValue("password", "");
    }
  }, [isOpen]);

  return (
    <>
      {mode === "Login" ? (
        <form
          className="form login__form"
          name="login-form-full"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <LoginFields
            register={register}
            errors={errors}
            loginError={loginError}
          />
          <button
            className={`form__submit-btn form__submit-btn-type_login`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <Link to="/signup" className="form__signup-btn">
            or Sign Up
          </Link>
        </form>
      ) : (
        <ModalWithForm
          name="user-login"
          title="Log In"
          buttonText="Log In"
          submittingButtonText="Logging in..."
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          onSubmit={handleSubmit(handleFormSubmit)}
          signupHandler={signupHandler}
          isSubmitting={isSubmitting}
        >
          <LoginFields
            register={register}
            errors={errors}
            loginError={loginError}
          />
        </ModalWithForm>
      )}
    </>
  );
}

function LoginFields({ register, errors, loginError }) {
  return (
    <>
      <label
        htmlFor="login-username"
        className={`form__label ${errors.username ? "form__label_has-error" : ""}`}
      >
        Username or Email Address
        <input
          type="text"
          name="username"
          className={`form__input ${errors.username ? "form__input_has-error" : ""}`}
          id="login-username"
          placeholder="Username or email"
          maxLength={20}
          minLength={3}
          {...register("username", {
            required: "Please enter your username",
            maxLength: {
              value: 20,
              message: "Username can not be longer than 20 characters",
            },
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
            shouldUnregister: true,
          })}
        />
        <span
          className={`form__error ${errors.username ? "form__error_has-error" : ""}`}
          id="login-username-error"
        >
          {errors.username?.message}
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
          className={`form__input ${errors.password ? "form__input_has-error" : ""}`}
          id="login-password"
          placeholder="Password"
          minLength={8}
          {...register("password", {
            required: "Please enter your password",
            shouldUnregister: true,
          })}
        />
        <span
          className={`form__error ${errors.password ? "form__error_has-error" : ""}`}
          id="login-password-error"
        >
          {errors.password?.message}
        </span>
      </label>

      <span
        className={`form__error form__error_bold ${loginError ? "form__error_has-error" : ""}`}
      >
        {loginError}
      </span>
    </>
  );
}

export default LoginForm;

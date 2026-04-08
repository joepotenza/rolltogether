/*
    ProfileForm.jsx
    Edit Profile form
*/

import "./ProfileForm.css";
import { useState, useContext } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import AvatarGenerator from "../AvatarGenerator/AvatarGenerator";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PageContext from "../../contexts/PageContext";
import ConfirmDeleteModal from "../ConfirmDeleteModal/ConfirmDeleteModal";

function ProfileForm({
  userInfo,
  onSubmit,
  onReceiveOAuthCallback,
  onConfirmRevokeOAuth,
}) {
  const [editProfileError, setEditProfileError] = useState("");
  const { currentUser } = useContext(CurrentUserContext);
  const { activeModal, handleCloseModal, handleOpenDeleteModal } =
    useContext(PageContext);
  const [googleError, setGoogleError] = useState("");
  const [googleSuccess, setGoogleSuccess] = useState("");
  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "Please enter your name.";
    } else if (values.name.length > 30) {
      errors.name = "Name can not be longer than 30 characters.";
    }

    if (!values.avatar) {
      errors.avatar = "Please choose an avatar.";
    }

    return errors;
  };

  const defaultValues = { name: userInfo.name, avatar: userInfo.avatar };

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

  const handleEditProfileError = (err) => {
    setEditProfileError(err.message);
  };

  const handleEditProfileSuccess = () => {
    document
      .querySelector(".profile__success")
      .classList.add("profile__success_visible");
  };

  const handleFormSubmit = (evt) => {
    document
      .querySelector(".profile__success")
      .classList.remove("profile__success_visible");
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(trimmedValues, handleEditProfileSuccess, handleEditProfileError),
    );
  };

  const handleAvatarChange = (avatar) => {
    setValues((prevValues) => {
      const nextValues = { ...prevValues, avatar };
      return nextValues;
    });
  };

  const handleAvatarError = (err) => {
    console.error(err);
  };

  /*
    handleStartOAuthProcess
    User clicks on "connect my google calendar" button
    Asks Google for a code that is then sent to the backend for validation
  */
  const handleStartOAuthProcess = (evt) => {
    try {
      console.log("Initializing Google Auth");
      evt.preventDefault();
      setGoogleError("");
      setGoogleSuccess("");
      const scope =
        "https://www.googleapis.com/auth/calendar.freebusy " +
        "https://www.googleapis.com/auth/calendar.events.freebusy " +
        "https://www.googleapis.com/auth/calendar.calendarlist.readonly " +
        "email openid";
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id:
          "464925076280-6duigj70rvmdvm0ia1gbevbfkvr8gclm.apps.googleusercontent.com",
        scope,
        callback: (response) => {
          onReceiveOAuthCallback(response, scope, handleBackendOAuthResponse);
        },
      });
      client.requestCode();
    } catch (err) {
      setGoogleError(err.message);
    }
  };

  /*
    handleBackendOAuthResponse
    After the backend checks the OAuth code validity, it calls this function and the UI is updated 
    to let the user know of its success or failure (result.isOk = true/false, result.message)
  */
  const handleBackendOAuthResponse = (result) => {
    console.log("handleBackendOAuthResponse ", result);
    if (result.isOk) {
      // Success
      setGoogleSuccess(result.message);
    } else {
      // Error
      setGoogleError(result.message);
    }
  };

  const handleRevokeOAuthError = (err) => {
    console.log(err);
    const msg =
      err?.message || "An error occurred on the server. Please try again.";
    document.querySelector(".modal__delete-error").textContent = msg;
  };

  return (
    <>
      <h1 className="profile__title">Edit Profile</h1>
      <div className="profile__manager">
        <form className="profile__form" onSubmit={handleFormSubmit}>
          <div className="profile__form-content">
            <div className="profile__form-fields">
              <label
                htmlFor="profile-name"
                className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
              >
                Your Name
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
                  id="profile-name"
                  placeholder="Name"
                  maxLength={30}
                />
                <span
                  className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
                  id="profile-name-error"
                >
                  {errors.name}
                </span>
              </label>
            </div>
            <div className="profile__form-avatar">
              <label
                className={`form__label ${errors.avatar ? "form__label_has-error" : ""}`}
              >
                Choose Your Avatar
              </label>
              <AvatarGenerator
                defaultValue={currentUser.avatar}
                onChange={handleAvatarChange}
                onError={handleAvatarError}
                showReset={true}
              />

              <span
                className={`form__error ${errors.avatar ? "form__error_has-error" : ""}`}
                id="profile-avatar-error"
              >
                {errors.avatar}
              </span>
            </div>
          </div>

          <span
            className={`form__error profile__error ${editProfileError ? "form__error_has-error" : ""}`}
          >
            {editProfileError}
          </span>
          <span className="profile__success">
            Profile updated successfully!
          </span>
          <button
            className={`form__submit-btn form__submit-btn-type_profile`}
            type="submit"
          >
            Edit Profile
          </button>
        </form>
        <div className="profile__google">
          <h2 className="profile__subtitle">
            {userInfo.isGoogleConnected && !userInfo.isGoogleRevoked
              ? "Un-"
              : userInfo.isGoogleRevoked
                ? "Re-"
                : ""}
            Link Your Google Calendar
          </h2>
          <div
            className={`profile__google-status ${googleError ? "profile__google-error" : ""}`}
          >
            {googleSuccess ? googleSuccess : googleError ? googleError : ""}
          </div>
          <p className="profile__google-text">
            {userInfo.isGoogleConnected && !userInfo.isGoogleRevoked
              ? "Your Google Calendar is linked to your account, enabling easier session scheduling. If you want to un-link your Google Calendar, use the button below."
              : userInfo.isGoogleRevoked
                ? "We lost access to your Google Calendar! Use the button below to re-link your account so we can use it to make scheduling your sessions easier."
                : "Use the button below to link your Google Calendar, which will allow us to automatically factor in your availability when scheduling sessions."}
          </p>
          {userInfo.isGoogleConnected && !userInfo.isGoogleRevoked ? (
            <button
              type="button"
              onClick={handleOpenDeleteModal}
              className="form__submit-btn form__submit-btn-type_revoke"
            >
              Revoke Google Calendar Access
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartOAuthProcess}
              className="google__button_type_continue profile__google-btn"
            />
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={activeModal === "delete"}
        onClose={handleCloseModal}
        confirmationText="Are you sure you want to revoke access to your Google Account?"
        confirmButtonText="Yes, un-link my Google Account"
        confirmDeleteHandler={(evt) =>
          onConfirmRevokeOAuth(handleRevokeOAuthError)
        }
        cancelDeleteHandler={handleCloseModal}
      />
    </>
  );
}
export default ProfileForm;

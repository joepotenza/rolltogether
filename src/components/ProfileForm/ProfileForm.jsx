/*
    ProfileForm.jsx
    Edit Profile form
*/

import { useState, useEffect, useContext } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import AvatarGenerator from "../AvatarGenerator/AvatarGenerator";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function ProfileForm({ userInfo, onSubmit }) {
  const [editProfileError, setEditProfileError] = useState("");
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "Please enter your name.";
    } else if (values.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
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
    // success message
  };

  const handleFormSubmit = (evt) => {
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(trimmedValues, handleEditProfileSuccess, handleEditProfileError),
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

  return (
    <div className="profile__manager">
      <h2 className="profile__title">Edit Profile</h2>
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

        <button
          className={`form__submit-btn form__submit-btn-type_profile`}
          type="submit"
        >
          Edit Profile
        </button>
      </form>
    </div>
  );
}
export default ProfileForm;

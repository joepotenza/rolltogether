/*
  GroupApplication.jsx
  Sub-component of Group.jsx for users to apply to an open group
*/

import "../Form/Form.css";
import { useEffect } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";

function GroupApplication({ onSubmit }) {
  const defaultValues = {
    message: "",
  };

  const editorToolbar =
    "blocks | bold italic forecolor | link image | bullist numlist outdent indent | removeformat";

  const validate = (values) => {
    const errors = {};

    if (!values.message.trim()) {
      errors.message = "You must include a message";
    }

    return errors;
  };

  const { values, handleChange, errors, resetForm, handleSubmit } =
    useFormWithValidation(defaultValues, validate);

  const handleFormSubmit = (evt) => {
    handleSubmit(evt, (trimmedValues) => onSubmit(trimmedValues, resetForm));
  };

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <div className="group__application">
      <h2 className="application__header">Apply for Group</h2>
      <p>
        Use the field below to include a message to the GM. You should provide
        some information about yourself, your gaming experience, what type of
        character you wish to play, and your availability. You will receive an
        email notification when the GM approves or denies your application.
      </p>
      <form name="group-application" onSubmit={handleFormSubmit}>
        <label
          htmlFor="application-message"
          className={`form__label ${errors.message ? "form__label_has-error" : ""}`}
        >
          <textarea
            name="message"
            value={values.message}
            onChange={handleChange}
            className={`form__input form__textarea ${errors.message ? "form__input_has-error" : ""}`}
            id="application-message"
            placeholder="Enter a short message to send to the GM"
            maxLength={500}
          />
          <span
            className={`form__error ${errors.message ? "form__error_has-error" : ""}`}
            id="application-message-error"
          >
            {errors.message}
          </span>
        </label>
        <button
          className="form__submit-btn form__submit-btn-type_application"
          type="submit"
        >
          Apply for Group
        </button>
      </form>
    </div>
  );
}
export default GroupApplication;

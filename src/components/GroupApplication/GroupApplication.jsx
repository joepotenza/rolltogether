/*
  GroupApplication.jsx
  Sub-component of Group.jsx for users to apply to an open group
*/

import "../Form/Form.css";
import "./GroupApplication.css";
import { useEffect, useState } from "react";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";

function GroupApplication({ groupInfo, onSubmit, myApplications }) {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    message: "",
  };

  const validate = (values) => {
    const errors = {};

    if (!values.message.trim()) {
      errors.message = "You must include a message";
    }

    return errors;
  };

  const { values, handleChange, errors, resetForm, handleSubmit } =
    useFormWithValidation(defaultValues, validate);

  const handleSubmitError = (err) => {
    setIsSubmitting(false);
    if (err.message === "Failed to fetch") {
      setSubmitError("Could not connect to database. Please try again.");
    } else {
      setSubmitError(err.message);
    }
  };

  const handleFormSubmit = (evt) => {
    setIsSubmitting(true);
    handleSubmit(evt, (trimmedValues) =>
      onSubmit(
        trimmedValues,
        () => {
          resetForm();
          setSubmitError("");
          setIsSubmitting(false);
        },
        handleSubmitError,
      ),
    );
  };

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <div className="group__application">
      <h2 className="application__header">Apply for This Group</h2>
      <p>
        Use the field below to include a message to the GM. You should provide
        some information about yourself, your gaming experience, what type of
        character you wish to play, and your availability. You will receive an
        email notification when the GM approves or denies your application.
      </p>
      <form name="group-application" onSubmit={handleFormSubmit}>
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
          className={`form__error form__error_bold ${errors.message ? "form__error_has-error" : ""}`}
          id="application-message-error"
        >
          {errors.message}
        </span>
        <span
          className={`form__error form__error_bold ${submitError ? "form__error_has-error" : ""}`}
        >
          {submitError}
        </span>
        <button
          className="form__submit-btn form__submit-btn-type_application"
          type="submit"
          disabled={isSubmitting}
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
export default GroupApplication;

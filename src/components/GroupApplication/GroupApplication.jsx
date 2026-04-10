/*
  GroupApplication.jsx
  Sub-component of Group.jsx for users to apply to an open group
*/

import "../Form/Form.css";
import "./GroupApplication.css";
import { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { BANNED_WORDS } from "../../utils/constants";
import PageContext from "../../contexts/PageContext";

function GroupApplication({ onSubmit, myApplications }) {
  const { getPrettierErrorMessage } = useContext(PageContext);
  const [submitError, setSubmitError] = useState("");

  const defaultValues = {
    message: "",
  };

  const resolver = (values) => {
    const errors = {};
    // Message validation
    if (!values.message) {
      errors.message = {
        message: "Please enter a message for your application",
      };
    } else if (values.message.length > 500) {
      errors.message = {
        message: "Message can not be longer than 500 characters",
      };
    } else if (values.message.length < 3) {
      errors.message = { message: "Message must be at least 10 characters" };
    } else {
      // Check for banned words
      const lowerMessage = values.message.toLowerCase();
      if (BANNED_WORDS.some((word) => lowerMessage.includes(word))) {
        errors.message = { message: "Your message contains a banned word" };
      }
    }

    return { values, errors };
  };
  const {
    register,
    handleSubmit,
    watch,
    subscribe,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm({
    mode: "onBlur",
    defaultValues,
    resolver,
  });

  const handleSubmitError = (err) => {
    setSubmitError(getPrettierErrorMessage(err));
  };

  const handleFormSubmit = async (data) => {
    setSubmitError("");
    await onSubmit(data, handleSubmitError);
  };

  useEffect(() => {
    // make sure to unsubscribe;
    const callback = subscribe({
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        setSubmitError("");
      },
    });

    return () => callback();
  }, [subscribe]);

  return (
    <div className="group__application">
      {myApplications && myApplications.length ? (
        <h2 className="application__header">
          Your application
          {myApplications[0].status === "new"
            ? " is being reviewed"
            : myApplications[0].status === "approved"
              ? " has been approved!"
              : " was denied"}
        </h2>
      ) : (
        <>
          <h2 className="application__header">Apply for This Group</h2>
          <p>
            Use the field below to include a message to the GM. You should
            provide some information about yourself, your gaming experience,
            what type of character you wish to play, and your availability. You
            will receive an email notification when the GM approves or denies
            your application.
          </p>
          <form
            name="group-application"
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <textarea
              name="message"
              className={`form__input form__textarea ${errors.message ? "form__input_has-error" : ""}`}
              id="application-message"
              placeholder="Enter a short message to send to the GM"
              maxLength={500}
              minLength={10}
              {...register("message")}
            />
            <span
              className={`form__error form__error_bold ${errors.message ? "form__error_has-error" : ""}`}
              id="application-message-error"
            >
              {errors.message?.message}
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
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
export default GroupApplication;

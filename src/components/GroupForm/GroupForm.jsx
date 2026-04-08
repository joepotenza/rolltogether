/*
    GroupForm.jsx
    Form for creating/editing a group
*/

import "../Form/Form.css";
import "./GroupForm.css";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect, useState, useContext } from "react";
import PageContext from "../../contexts/PageContext";
import { useNavigate } from "react-router";
import WYSIWYG from "../WYSIWYG/WYSIWYG";
import DOMPurify from "dompurify";

function GroupForm({ groupInfo, onSubmit, onGoBack }) {
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { groupAPI } = useContext(PageContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let defaultValues;
  if (groupInfo) {
    defaultValues = {
      _id: groupInfo._id,
      name: groupInfo.name,
      summary: groupInfo.summary,
      description: groupInfo.description,
      system: groupInfo.system._id,
      isHomebrew: groupInfo.isHomebrew,
      story: groupInfo.story,
      type: groupInfo.type,
      openSlots: groupInfo.slots.open,
      slotLimit: groupInfo.slots.total,
    };
  } else {
    defaultValues = {
      _id: "",
      name: "",
      summary: "",
      description: "",
      system: "",
      isHomebrew: true,
      story: "",
      type: "",
      openSlots: 0,
      slotLimit: 1,
    };
  }

  const validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = "Please enter a group name";
    } else if (values.name.length < 3) {
      errors.name = "Group name must be at least 3 characters";
    } else if (values.name.length > 300) {
      errors.name = "Group name must be less than 300 characters";
    }

    if (!values.summary) {
      errors.summary = "Please enter a short summary";
    } else if (values.summary.length > 500) {
      errors.summary = "Summary can not be longer than 500 characters";
    }

    if (!values.description) {
      errors.description = "Please enter a group description";
    }

    if (!values.system) {
      errors.system = "Please choose a game edition";
    }

    if (values.isHomebrew === "false" && !values.story) {
      errors.story = "Please enter the name of the pre-made campaign";
    }

    if (!values.type) {
      errors.type = "Please choose how your group will meet";
    }

    if (parseInt(values.openSlots) < 0) {
      errors.openSlots = "Please enter a valid number";
    }

    if (parseInt(values.slotLimit) < 1) {
      errors.slotLimit = "Please enter the seat limit";
    }

    return errors;
  };

  const {
    values,
    handleChange,
    handleWYSIWYGChange,
    errors,
    resetForm,
    handleSubmit,
  } = useFormWithValidation(defaultValues, validate);

  const handleSubmitError = (err) => {
    setIsSubmitting(false);
    if (err.message === "Failed to fetch") {
      setSubmitError("Could not connect to database. Please try again.");
    } else {
      setSubmitError(err.message);
    }
  };

  // submit form: sanitize the data and submit to API
  const handleFormSubmit = (evt) => {
    setIsSubmitting(true);
    handleSubmit(evt, (trimmedValues) => {
      const slots = {
        open: parseInt(trimmedValues.openSlots),
        total: parseInt(trimmedValues.slotLimit),
      };
      const data = { ...trimmedValues, slots };
      data.name = DOMPurify.sanitize(data.name);
      data.summary = DOMPurify.sanitize(data.summary);
      data.story = trimmedValues.isHomebrew
        ? ""
        : DOMPurify.sanitize(data.story);
      data.description = DOMPurify.sanitize(data.description);

      if (!groupInfo) {
        // submit new group
        groupAPI
          .createGroup(data)
          .then((group) => {
            setIsSubmitting(false);
            navigate(`/group/${group._id}?created=1`);
          })
          .catch(handleSubmitError);
      } else if (onSubmit) {
        // submit edit group
        groupAPI
          .editGroup(groupInfo._id, values)
          .then((group) => {
            setIsSubmitting(false);
            onSubmit(group);
          })
          .catch(handleSubmitError);
      }
    });
  };

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <div className="groupform">
      <h1 className="groupform__title">
        {groupInfo ? "Edit Group" : "Create a New Group"}
      </h1>
      <form name="group-form" onSubmit={handleFormSubmit}>
        <label
          htmlFor="group-name"
          className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
        >
          Group Name
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
            id="group-name"
            placeholder="Name"
            maxLength={300}
          />
          <span
            className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
            id="group-name-error"
          >
            {errors.name}
          </span>
        </label>
        <label
          htmlFor="group-summary"
          className={`form__label ${errors.summary ? "form__label_has-error" : ""}`}
        >
          Summary (for listings page)
          <textarea
            name="summary"
            value={values.summary}
            onChange={handleChange}
            className={`form__input form__textarea ${errors.summary ? "form__input_has-error" : ""}`}
            id="group-summary"
            placeholder="Enter a short summary to display on the main listings page"
            maxLength={500}
          />
          <span
            className={`form__error ${errors.summary ? "form__error_has-error" : ""}`}
            id="group-summary-error"
          >
            {errors.summary}
          </span>
        </label>
        <div className="groupform__details">
          <div className="groupform__detail">
            <label
              htmlFor="group-homebrew"
              className={`form__label ${errors.story ? "form__label_has-error" : ""}`}
            >
              Is your campaign pre-made or Homebrew?
              <select
                name="isHomebrew"
                className="form__select"
                defaultValue={defaultValues.isHomebrew}
                onChange={handleChange}
                id="group-homebrew"
              >
                <option value="false">Pre-made</option>
                <option value="true">Homebrew</option>
              </select>
            </label>
          </div>
          {(!values.isHomebrew || values.isHomebrew === "false") && (
            <div className="groupform__detail">
              <label
                htmlFor="group-story"
                className={`form__label ${errors.story ? "form__label_has-error" : ""}`}
              >
                What is the name of the pre-made story?
                <input
                  type="text"
                  name="story"
                  value={values.story}
                  onChange={handleChange}
                  className={`form__input ${errors.story ? "form__input_has-error" : ""}`}
                  id="group-story"
                  placeholder="Story name"
                  maxLength={300}
                />
              </label>
            </div>
          )}
        </div>
        <span
          className={`form__error form__error_bold ${errors.story ? "form__error_has-error" : ""}`}
          id="group-story-error"
        >
          {errors.story}
        </span>

        <div className="groupform__details">
          <div className="groupform__detail">
            <label
              htmlFor="group-system"
              className={`form__label ${errors.system ? "form__label_has-error" : ""}`}
            >
              Game Edition
              <select
                name="system"
                className="form__select"
                defaultValue={defaultValues.system}
                onChange={handleChange}
                id="group-system"
              >
                <option value=""></option>
                <option value="69c9a1262f30caed2bb17327">D&amp;D 3.5e</option>
                <option value="69c9a14e2f30caed2bb17328">D&amp;D 5e</option>
                <option value="69c9a1572f30caed2bb17329">D&amp;D 5.5e</option>
              </select>
            </label>
          </div>
          <div className="groupform__detail">
            <label
              htmlFor="group-type"
              className={`form__label ${errors.type ? "form__label_has-error" : ""}`}
            >
              Meeting Type
              <select
                name="type"
                className="form__select"
                defaultValue={defaultValues.type}
                onChange={handleChange}
                id="group-type"
              >
                <option value=""></option>
                <option value="online">Online</option>
                <option value="inperson">In Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
          </div>
        </div>
        <div className="groupform__detail-errors">
          <span
            className={`form__error ${errors.system ? "form__error_has-error" : ""}`}
            id="group-system-error"
          >
            {errors.system}
          </span>
          <span
            className={`form__error ${errors.type ? "form__error_has-error" : ""}`}
            id="group-type-error"
          >
            {errors.type}
          </span>
        </div>

        <div className="groupform__details">
          <div className="groupform__detail">
            <label
              htmlFor="group-openSlots"
              className={`form__label ${errors.openSlots ? "form__label_has-error" : ""}`}
            >
              # of Open Seats
              <input
                type="number"
                min={0}
                name="openSlots"
                value={values.openSlots}
                onChange={handleChange}
                className={`form__input form__input_type_number ${errors.openSlots ? "form__input_has-error" : ""}`}
                id="group-openSlots"
                placeholder=""
                maxLength={3}
              />
            </label>
          </div>
          <div className="groupform__detail">
            <label
              htmlFor="group-slotLimit"
              className={`form__label ${errors.slotLimit ? "form__label_has-error" : ""}`}
            >
              # of Total Players
              <input
                type="number"
                min={1}
                name="slotLimit"
                value={values.slotLimit}
                onChange={handleChange}
                className={`form__input form__input_type_number ${errors.slotLimit ? "form__input_has-error" : ""}`}
                id="group-slotLimit"
                placeholder=""
                maxLength={3}
              />
            </label>
          </div>
        </div>
        <div className="groupform__detail-errors">
          <span
            className={`form__error ${errors.openSlots ? "form__error_has-error" : ""}`}
            id="group-openSlots-error"
          >
            {errors.openSlots}
          </span>
          <span
            className={`form__error ${errors.slotLimit ? "form__error_has-error" : ""}`}
            id="group-slotLimit-error"
          >
            {errors.slotLimit}
          </span>
        </div>
        <label
          htmlFor="group-description"
          className={`form__label ${errors.description ? "form__label_has-error" : ""}`}
        >
          Description
        </label>
        <WYSIWYG
          initialContent={values.description}
          onChange={(content) => handleWYSIWYGChange("description", content)}
        />
        {/*options={{ toolbar: editorToolbar }}*/}
        <span
          className={`form__error form__error_bold ${errors.description ? "form__error_has-error" : ""}`}
          id="groupform-description-error"
        >
          {errors.description}
        </span>
        <span
          className={`form__error form__error_bold ${submitError ? "form__error_has-error" : ""}`}
        >
          {submitError}
        </span>
        <button
          className={`form__submit-btn form__submit-btn-type_application`}
          type="submit"
          disabled={isSubmitting}
        >
          {groupInfo ? "Edit Group" : "Create Group"}
        </button>
        <button
          className="groupform_cancel-btn"
          onClick={onGoBack}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
export default GroupForm;

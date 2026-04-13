/*
    GroupForm.jsx
    Form for creating/editing a group
*/

import "../Form/Form.css";
import "./GroupForm.css";
import { useEffect, useState, useContext } from "react";
import { useForm, useWatch } from "react-hook-form";
import { hasBadWords } from "../../utils/constants";
import PageContext from "../../contexts/PageContext";
import { useNavigate } from "react-router";
import WYSIWYG from "../WYSIWYG/WYSIWYG";
import DOMPurify from "dompurify";

function GroupForm({ groupInfo, onSubmit, onGoBack }) {
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { groupAPI, getPrettierErrorMessage } = useContext(PageContext);

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

  // Custom resolver for form validation including banned words check
  const resolver = (values) => {
    const errors = {};

    // Name validation
    if (!values.name) {
      errors.name = { message: "Please enter a group name" };
    } else if (values.name.length > 300) {
      errors.name = { message: "Group can not be longer than 300 characters" };
    } else if (values.name.length < 3) {
      errors.name = { message: "Group name must be at least 3 characters" };
    } else {
      // Check for banned words
      const lowerName = values.name.toLowerCase();
      if (hasBadWords(lowerName)) {
        errors.name = { message: "Your group name contains a banned word" };
      }
    }

    // Summary validation
    if (!values.summary) {
      errors.summary = { message: "Please enter a short summary" };
    } else if (values.summary.length > 500) {
      errors.summary = {
        message: "Summary can not be longer than 500 characters",
      };
    } else if (values.summary.length < 10) {
      errors.summary = { message: "Summary must be at least 10 characters" };
    } else {
      // Check for banned words
      const lowerSummary = values.summary.toLowerCase();
      if (hasBadWords(lowerSummary)) {
        errors.summary = { message: "Your summary contains a banned word" };
      }
    }

    // Story validation
    if (values.isHomebrew === "false" && !values.story) {
      errors.story = {
        message: "Please enter the name of the campaign story",
      };
    } else if (values.story && values.story.length > 300) {
      errors.story = {
        message: "Story name can not be longer than 300 characters",
      };
    } else if (values.story) {
      // Check for banned words
      const lowerStory = values.story.toLowerCase();
      if (hasBadWords(lowerStory)) {
        errors.story = { message: "Your story name contains a banned word" };
      }
    }

    // Game system validation
    if (!values.system) {
      errors.system = { message: "Please choose a game edition" };
    }

    // Game type validation
    if (!values.type) {
      errors.type = { message: "Please choose how your group will meet" };
    }

    // Slot validation
    if (typeof values.openSlots === "undefined") {
      errors.openSlots = { message: "Please enter the number of open seats" };
    } else if (parseInt(values.openSlots) < 0) {
      errors.openSlots = {
        message: "Please enter a valid number of open seats",
      };
    }
    if (typeof values.slotLimit === "undefined") {
      errors.slotLimit = {
        message: "Please enter the number of total players",
      };
    } else if (parseInt(values.slotLimit) < 1) {
      errors.slotLimit = {
        message: "Please enter a valid number of total players",
      };
    } else if (parseInt(values.openSlots) > parseInt(values.slotLimit)) {
      errors.openSlots = {
        message: "Open seats can not be more than total seats",
      };
    }

    // Description validation
    if (!values.description) {
      errors.description = {
        message: "Please enter a description for your group",
      };
    } else {
      const onlyText = DOMPurify.sanitize(values.description, {
        ALLOWED_TAGS: [],
      })
        .replaceAll("\u00A0", " ")
        .replaceAll("&nbsp;", " ")
        .replace(/[\r\n]+/g, " ")
        .trim();
      if (onlyText.length === 0) {
        errors.description = {
          message: "Please enter a description for your group",
        };
      } else {
        // Check for banned words
        const lowerDescription = onlyText.toLowerCase();

        if (hasBadWords(lowerDescription)) {
          errors.description = {
            message: "Your description contains a banned word",
          };
        }
      }
    }

    return { values, errors };
  };

  const {
    register,
    handleSubmit,
    subscribe,
    control,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    clearErrors,
  } = useForm({
    mode: "onBlur",
    defaultValues,
    resolver,
  });

  const isHomebrew = useWatch({ control, name: "isHomebrew" });

  // handleSubmitError will trigger if server responds with error
  const handleSubmitError = (err) => {
    setSubmitError(getPrettierErrorMessage(err));
  };

  // handleFormError will trigger if any validation errors occur
  const handleFormError = (errors) => {
    setSubmitError("Please check your input and try again");
  };

  // submit form: sanitize the data and submit to API
  const handleFormSubmit = async (values) => {
    const slots = {
      open: parseInt(getValues("openSlots")),
      total: parseInt(getValues("slotLimit")),
    };
    const data = { ...values, slots };
    data.name = DOMPurify.sanitize(data.name);
    data.summary = DOMPurify.sanitize(data.summary);
    data.story =
      data.isHomebrew.toString() === "true"
        ? ""
        : DOMPurify.sanitize(data.story);
    data.description = DOMPurify.sanitize(data.description);

    // console.log(data);

    if (!groupInfo) {
      // submit new group
      await groupAPI
        .createGroup(data)
        .then((group) => {
          navigate(`/group/${group._id}?created=1`);
        })
        .catch(handleSubmitError);
    } else {
      // submit edit group
      await groupAPI
        .editGroup(groupInfo._id, data)
        .then((group) => {
          onSubmit(group);
        })
        .catch(handleSubmitError);
    }
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
    <div className="groupform">
      <h1 className="groupform__title">
        {groupInfo ? "Edit Group" : "Create a New Group"}
      </h1>
      <form
        name="group-form"
        onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
      >
        <label
          htmlFor="group-name"
          className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
        >
          Group Name
          <input
            type="text"
            name="name"
            className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
            id="group-name"
            placeholder="Name"
            minLength={3}
            maxLength={300}
            {...register("name")}
          />
          <span
            className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
            id="group-name-error"
          >
            {errors.name?.message}
          </span>
        </label>
        <label
          htmlFor="group-summary"
          className={`form__label ${errors.summary ? "form__label_has-error" : ""}`}
        >
          Summary (for listings page)
          <textarea
            name="summary"
            className={`form__input form__textarea ${errors.summary ? "form__input_has-error" : ""}`}
            id="group-summary"
            placeholder="Enter a short summary to display on the main listings page"
            maxLength={500}
            minLength={10}
            {...register("summary")}
          />
          <span
            className={`form__error ${errors.summary ? "form__error_has-error" : ""}`}
            id="group-summary-error"
          >
            {errors.summary?.message}
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
                id="group-homebrew"
                {...register("isHomebrew")}
              >
                <option value="false">Pre-made</option>
                <option value="true">Homebrew</option>
              </select>
            </label>
          </div>
          {(!isHomebrew || isHomebrew === "false") && (
            <div className="groupform__detail">
              <label
                htmlFor="group-story"
                className={`form__label ${errors.story ? "form__label_has-error" : ""}`}
              >
                What is the name of the pre-made story?
                <input
                  type="text"
                  name="story"
                  className={`form__input ${errors.story ? "form__input_has-error" : ""}`}
                  id="group-story"
                  placeholder="Story name"
                  maxLength={300}
                  {...register("story")}
                />
              </label>
            </div>
          )}
        </div>
        <span
          className={`form__error form__error_bold ${errors.story ? "form__error_has-error" : ""}`}
          id="group-story-error"
        >
          {errors.story?.message}
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
                className={`form__select ${errors.system ? "form__select_has-error" : ""}`}
                id="group-system"
                {...register("system")}
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
                className={`form__select ${errors.type ? "form__select_has-error" : ""}`}
                id="group-type"
                {...register("type")}
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
            {errors.system?.message}
          </span>
          <span
            className={`form__error ${errors.type ? "form__error_has-error" : ""}`}
            id="group-type-error"
          >
            {errors.type?.message}
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
                className={`form__input form__input_type_number ${errors.openSlots ? "form__input_has-error" : ""}`}
                id="group-openSlots"
                placeholder=""
                maxLength={3}
                {...register("openSlots")}
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
                className={`form__input form__input_type_number ${errors.slotLimit ? "form__input_has-error" : ""}`}
                id="group-slotLimit"
                placeholder=""
                maxLength={3}
                {...register("slotLimit")}
              />
            </label>
          </div>
        </div>
        <div className="groupform__detail-errors">
          <span
            className={`form__error ${errors.openSlots ? "form__error_has-error" : ""}`}
            id="group-openSlots-error"
          >
            {errors.openSlots?.message}
          </span>
          <span
            className={`form__error ${errors.slotLimit ? "form__error_has-error" : ""}`}
            id="group-slotLimit-error"
          >
            {errors.slotLimit?.message}
          </span>
        </div>
        <label
          htmlFor="group-description"
          className={`form__label ${errors.description ? "form__label_has-error" : ""}`}
        >
          Description
        </label>
        <WYSIWYG
          initialContent={defaultValues.description}
          onChange={(content) => {
            setValue("description", content);
            if (content.length > 0) clearErrors("description");
          }}
        />
        {/*options={{ toolbar: editorToolbar }}*/}
        <span
          className={`form__error form__error_bold ${errors.description ? "form__error_has-error" : ""}`}
          id="groupform-description-error"
        >
          {errors.description?.message}
        </span>
        <button
          className={`form__submit-btn form__submit-btn-type_application`}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Submitting..."
            : groupInfo
              ? "Edit Group"
              : "Create Group"}
        </button>
        {groupInfo && (
          <button
            className="groupform__cancel-btn"
            onClick={onGoBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <span
          className={`form__error form__error_bold ${submitError ? "form__error_has-error" : ""}`}
        >
          {submitError}
        </span>
      </form>
    </div>
  );
}
export default GroupForm;

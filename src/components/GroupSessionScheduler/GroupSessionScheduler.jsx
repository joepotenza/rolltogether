/*
    GroupSessionScheduler.jsx
    Allows the owner to schedule a group session
*/

import "./GroupSessionScheduler.css";
import "../Form/Form.css";
import { useFormWithValidation } from "../../hooks/useFormWithValidation";
import { useEffect, useState, useContext } from "react";
import PageContext from "../../contexts/PageContext";
import GoogleCalendarScheduler from "../GoogleCalendarScheduler/GoogleCalendarScheduler";
import UserAvatar from "../UserAvatar/UserAvatar";
import WYSIWYG from "../WYSIWYG/WYSIWYG";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DOMPurify from "dompurify";
import checkIcon from "../../images/check_icon.svg";

function GroupSessionScheduler({ groupInfo, sessionInfo, onSubmit, onGoBack }) {
  const { groupAPI } = useContext(PageContext);
  const [submitError, setSubmitError] = useState("");
  const [datePickerMode, setDatePickerMode] = useState("manual");
  const [timeChosenFromGoogleScheduler, setTimeChosenFromGoogleScheduler] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the user's timezone short (like PST or EDT)
  const tz = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName").value;

  let defaultValues;
  if (sessionInfo._id) {
    defaultValues = {
      group: groupInfo._id,
      _id: sessionInfo._id,
      name: sessionInfo.name,
      date: sessionInfo.date,
      preSessionNotes: sessionInfo.preSessionNotes,
      postSessionNotes: sessionInfo.postSessionNotes,
      areNotesVisibleToMembers: sessionInfo.areNotesVisibleToMembers,
      attendees: sessionInfo.attendees,
    };
  } else {
    defaultValues = {
      group: groupInfo._id,
      _id: "",
      name: "",
      date: "",
      preSessionNotes: "",
      postSessionNotes: "",
      areNotesVisibleToMembers: false,
      attendees: [],
    };
  }

  // Select or deselect an attendee for this session
  const handleSelectAttendee = (evt, userId) => {
    evt.preventDefault();
    // search the attendee list for the user
    let isSelected = false;
    let attendee;
    let attendees = [...values.attendees];
    for (let i = 0; i < values.attendees.length; i++) {
      attendee = values.attendees[i];
      if (attendee._id === userId) {
        // user selected already, delete from the list
        isSelected = true;
        attendees.splice(i, 1);
        break;
      }
    }
    const btn = document.getElementById(`attendee-${userId}`);
    if (isSelected) {
      // remove the selected class
      btn.classList.remove("attendee__selected");
    } else {
      // add selected class and add attendee to array
      btn.classList.add("attendee__selected");
      attendee = groupInfo.members.find((member) => member._id === userId);
      attendees.push(attendee);
    }
    const newValues = { ...values, attendees };
    setValues(newValues);
  };

  // checks if a member is one of the selected attendees
  const isMemberAttendee = (id) => {
    return values.attendees.find((attendee) => attendee._id === id);
  };

  /** Form Validation **/
  const validate = (values) => {
    const errors = {};

    setSubmitError("");

    console.log(values.date);

    if (!values.name) {
      errors.name = "Please enter a group name";
    } else if (values.name.length < 3) {
      errors.name = "Group name must be at least 3 characters";
    } else if (values.name.length > 300) {
      errors.name = "Group name must be less than 300 characters";
    }

    if (!values.date) {
      errors.date = "Please select a date for the session";
    } else if (isNaN(Date.parse(values.date))) {
      errors.date = "Please select a date for the session";
    }

    if (Object.values(errors).length > 0) {
      // This makes sure the user sees an error by the submit button
      // since the form is so long they may not see the fields above
      setSubmitError("Please check all input and try again");
    }

    return errors;
  };

  const {
    values,
    setValues,
    handleChange,
    handleWYSIWYGChange,
    handleDatePickerChange,
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

  //submit form: sanitize the data and submit to API via parent component
  const handleFormSubmit = (evt) => {
    setIsSubmitting(true);
    handleSubmit(evt, (trimmedValues) => {
      //fix attendees array to just be IDs
      const data = { ...trimmedValues };
      for (let i = 0; i < data.attendees.length; i++) {
        data.attendees[i] = data.attendees[i]._id;
      }
      // Sanitize HTML
      data.preSessionNotes = DOMPurify.sanitize(data.preSessionNotes);
      data.postSessionNotes = DOMPurify.sanitize(data.postSessionNotes);

      onSubmit(trimmedValues, handleSubmitError);
    });
  };

  // Do Google Calendar schedule matching
  const handleStartMatching = (
    {
      start,
      end,
      groupId = groupInfo._id,
      userIds,
      minUsers,
      minDuration,
      prefStartHour,
      prefEndHour,
    },
    onComplete,
    onError,
  ) => {
    console.log(
      "Session Scheduler: handleStartMatching",
      start,
      end,
      userIds,
      minUsers,
      minDuration,
      prefStartHour,
      prefEndHour,
    );
    //clear date picker and make sure it isn't shown
    handleDatePickerChange("date", "", false);
    setTimeChosenFromGoogleScheduler(false);
    groupAPI
      .freebusy({
        start,
        end,
        groupId,
        userIds,
        minUsers,
        minDuration,
        prefStartHour,
        prefEndHour,
      })
      .then((response) => {
        onComplete(response);
      })
      .catch((err) => {
        onError(err);
      });
  };

  // When a date is picked from the google calendar scheduler, set the date and flag it so the session date form field gets shown
  const handleSelectGoogleCalendarTime = (chosenDate) => {
    handleDatePickerChange("date", chosenDate);
    setTimeChosenFromGoogleScheduler(chosenDate && chosenDate !== "");
  };

  // When switching from manual to google mode, clear out the date variable so it's not hidden
  // in the background and silently submitted by accident
  const handleSwitchDatePickerMode = (mode) => {
    if (mode === "google") {
      console.log("clearing date on switch to google");
      const nextValues = { ...values, date: "" };
      setValues(nextValues);
    }
    setDatePickerMode(mode);
  };

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <div className="session__scheduler">
      <h2 className="scheduler__title">
        {sessionInfo.name ? sessionInfo.name : "Schedule a Session"}
      </h2>
      <form
        name="scheduler-form"
        className="scheduler__form"
        onSubmit={handleFormSubmit}
      >
        <label
          htmlFor="scheduler-name"
          className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
        >
          Session Name
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
            id="scheduler-name"
            placeholder="Name"
            maxLength={300}
          />
          <span
            className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
            id="scheduler-name-error"
          >
            {errors.name}
          </span>
        </label>

        <label
          htmlFor="scheduler-attendees"
          className={`form__label ${errors.attendees ? "form__label_has-error" : ""}`}
        >
          Who will be attending?
          <span
            className={`form__error ${errors.attendees ? "form__error_has-error" : ""}`}
            id="scheduler-attendees-error"
          >
            {errors.attendees}
          </span>
        </label>

        <p className="scheduler__attendee-text">
          Select attendees for the session:
        </p>
        <div className="scheduler__attendees">
          {groupInfo.members.map((member) => (
            <div
              id={`attendee-${member._id}`}
              className={`attendee ${isMemberAttendee(member._id) ? "attendee_selected" : ""}`}
              key={member._id}
            >
              <img src={checkIcon} className="attendee__checkmark" />
              <button
                type="button"
                className="attendee__avatar-btn"
                id={`attendee-avatar-btn-${member._id}`}
                onClick={(evt) => handleSelectAttendee(evt, member._id)}
              >
                <UserAvatar avatarClass="attendee" user={member} />
              </button>
              <div className="attendee__name">{member.username}</div>
            </div>
          ))}
        </div>

        <div className="scheduler__date-card">
          <div className="date-card__mode">
            <button
              className={`date-card__btn date-card__btn_manual ${datePickerMode === "manual" ? "date-card__btn_selected" : ""}`}
              type="button"
              onClick={() => handleSwitchDatePickerMode("manual")}
            >
              Set time manually
            </button>
            <button
              className={`date-card__btn date-card__btn_google ${datePickerMode === "google" ? "date-card__btn_selected" : ""}`}
              type="button"
              onClick={() => handleSwitchDatePickerMode("google")}
            >
              Find a time (Google)
            </button>
          </div>

          {datePickerMode === "google" && (
            <GoogleCalendarScheduler
              attendees={values.attendees}
              onStartMatching={handleStartMatching}
              error={errors.google}
              onSelectTime={handleSelectGoogleCalendarTime}
              tz={tz}
            />
          )}

          {(datePickerMode === "manual" || timeChosenFromGoogleScheduler) && (
            <label
              htmlFor="scheduler-date"
              className={`form__label_type_session-date ${errors.date ? "form__label_has-error" : ""}`}
            >
              Session Date (Timezone: {tz})
              <div className="scheduler__date">
                <DatePicker
                  selected={values.date}
                  onChange={(date) => handleDatePickerChange("date", date)}
                  timeInputLabel="Time:"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  showTimeInput
                  showIcon
                  className="form__datepicker"
                />
              </div>
            </label>
          )}
          <span
            className={`form__error form__error_bold ${errors.date ? "form__error_has-error" : ""}`}
            id="scheduler-date-error"
          >
            {errors.date}
          </span>
        </div>

        <div className="scheduler__preSessionNotes">
          <label
            htmlFor="scheduler-preSessionNotes"
            className={`form__label ${errors.preSessionNotes ? "form__label_has-error" : ""}`}
          >
            Pre-Session Notes
          </label>
          <WYSIWYG
            initialContent={values.preSessionNotes}
            onChange={(content) =>
              handleWYSIWYGChange("preSessionNotes", content)
            }
          />
          <span
            className={`form__error form__error_bold ${errors.preSessionNotes ? "form__error_has-error" : ""}`}
            id="groupform-preSessionNotes-error"
          >
            {errors.preSessionNotes}
          </span>
        </div>

        {sessionInfo._id && (
          <div className="scheduler__postSessionNotes">
            <label
              htmlFor="scheduler-postSessionNotes"
              className={`form__label ${errors.postSessionNotes ? "form__label_has-error" : ""}`}
            >
              Post-Session Notes
            </label>
            <WYSIWYG
              initialContent={values.postSessionNotes}
              onChange={(content) =>
                handleWYSIWYGChange("postSessionNotes", content)
              }
            />
            <span
              className={`form__error form__error_bold ${errors.postSessionNotes ? "form__error_has-error" : ""}`}
              id="groupform-postSessionNotes-error"
            >
              {errors.postSessionNotes}
            </span>
          </div>
        )}
        <label
          htmlFor="scheduler-areNotesVisibleToMembers"
          className={`form__label ${errors.areNotesVisibleToMembers ? "form__label_has-error" : ""}`}
        >
          Should session notes be visible to group members?
          <select
            id="scheduler-areNotesVisibleToMembers"
            className="form__select"
            name="areNotesVisibleToMembers"
            defaultValue={values.areNotesVisibleToMembers}
            onChange={handleChange}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>

        <span
          className={`form__error form__error_bold ${submitError ? "form__error_has-error" : ""}`}
        >
          {submitError}
        </span>
        <button
          className={`form__submit-btn form__submit-btn-type_scheduler`}
          type="submit"
          disabled={isSubmitting}
        >
          {sessionInfo.name ? "Edit Session" : "Schedule Session"}
        </button>
        <button
          className="scheduler_cancel-btn"
          onClick={onGoBack}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
export default GroupSessionScheduler;

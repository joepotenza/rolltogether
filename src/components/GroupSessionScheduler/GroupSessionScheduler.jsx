/*
    GroupSessionScheduler.jsx
    Allows the owner to schedule a group session
*/

import "./GroupSessionScheduler.css";
import "../Form/Form.css";
import { useEffect, useState, useContext, useMemo } from "react";
import {
  useForm,
  useWatch,
  FormProvider,
  useFieldArray,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DOMPurify from "dompurify";
import { hasBadWords } from "../../utils/constants";
import PageContext from "../../contexts/PageContext";
import GoogleCalendarScheduler from "../GoogleCalendarScheduler/GoogleCalendarScheduler";
import UserAvatar from "../UserAvatar/UserAvatar";
import WYSIWYG from "../WYSIWYG/WYSIWYG";
import checkIcon from "../../images/check_icon.svg";

function GroupSessionScheduler({ groupInfo, sessionInfo, onSubmit, onGoBack }) {
  console.log("render GroupSessionScheduler");
  const { groupAPI, getPrettierErrorMessage } = useContext(PageContext);
  const [submitError, setSubmitError] = useState("");
  const [datePickerMode, setDatePickerMode] = useState("manual");
  const [timeChosenFromGoogleScheduler, setTimeChosenFromGoogleScheduler] =
    useState(false);

  // Get the user's timezone short (like PST or EDT)
  const tz = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName").value;

  const resolver = (values) => {
    const errors = {};

    // Name validation
    if (!values.name) {
      errors.name = { message: "Please enter a session name" };
    } else if (values.name.length > 300) {
      errors.name = {
        message: "Session name can not be longer than 300 characters",
      };
    } else {
      // Check for banned words
      const lowerName = values.name.toLowerCase();

      if (hasBadWords(lowerName)) {
        errors.name = { message: "Your session name contains a banned word" };
      }
    }

    // Attendee validation
    if (!values.attendees || values.attendees.length === 0) {
      errors.attendees = {
        root: {
          message: "Please select at least one attendee for the session",
        },
      };
    }

    // Date validation
    if (!values.date || isNaN(Date.parse(values.date))) {
      errors.date = {
        message: "Please select a date for the session",
      };
    }

    // Pre-session notes validation (optional, but check banned words if present)
    if (values.preSessionNotes) {
      const onlyText = DOMPurify.sanitize(values.preSessionNotes, {
        ALLOWED_TAGS: [],
      })
        .replaceAll("\u00A0", " ")
        .replaceAll("&nbsp;", " ")
        .replace(/[\r\n]+/g, " ")
        .trim();
      if (onlyText.length > 0) {
        // Check for banned words
        const lowerPreNotes = onlyText.toLowerCase();
        if (hasBadWords(lowerPreNotes)) {
          errors.preSessionNotes = {
            message: "Your pre-session notes contain a banned word",
          };
        }
      }
    }

    // Post-session notes validation (optional, but check banned words if present)
    if (values.postSessionNotes) {
      const onlyText = DOMPurify.sanitize(values.postSessionNotes, {
        ALLOWED_TAGS: [],
      })
        .replaceAll("\u00A0", " ")
        .replaceAll("&nbsp;", " ")
        .replace(/[\r\n]+/g, " ")
        .trim();
      if (onlyText.length > 0) {
        // Check for banned words
        const lowerPostNotes = onlyText.toLowerCase();
        if (hasBadWords(lowerPostNotes)) {
          errors.postSessionNotes = {
            message: "Your post-session notes contain a banned word",
          };
        }
      }
    }

    return { values, errors };
  };

  const defaultValues = useMemo(() => {
    if (sessionInfo._id) {
      return {
        group: groupInfo._id,
        _id: sessionInfo._id,
        name: sessionInfo.name,
        date: sessionInfo.date,
        preSessionNotes: sessionInfo.preSessionNotes,
        postSessionNotes: sessionInfo.postSessionNotes,
        areNotesVisibleToMembers: sessionInfo.areNotesVisibleToMembers,
        attendees: sessionInfo.attendees,
      };
    }

    return {
      group: groupInfo._id,
      _id: "",
      name: "",
      date: "",
      preSessionNotes: "",
      postSessionNotes: "",
      areNotesVisibleToMembers: "none",
      attendees: [],
    };
  }, [
    groupInfo._id,
    sessionInfo._id,
    sessionInfo.name,
    sessionInfo.date,
    sessionInfo.preSessionNotes,
    sessionInfo.postSessionNotes,
    sessionInfo.areNotesVisibleToMembers,
    sessionInfo.attendees,
  ]);

  const methods = useForm({
    mode: "onBlur",
    defaultValues,
    resolver,
  });
  const {
    register,
    reset,
    handleSubmit,
    subscribe,
    control,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    clearErrors,
  } = methods;

  const { replace } = useFieldArray({
    control,
    name: "attendees",
  });

  const attendees = useWatch({ control, name: "attendees" });
  const selectedDate = useWatch({ control, name: "date" });

  // Select or deselect an attendee for this session
  const handleSelectAttendee = (evt, userId) => {
    evt.preventDefault();
    // search the attendee list for the user

    let theAttendees = attendees ? [...attendees] : [];

    const index = theAttendees.findIndex((attendee) => attendee._id === userId);
    const isSelected = index > -1;
    const btn = document.getElementById(`attendee-${userId}`);
    if (isSelected) {
      // remove from the attendees array
      theAttendees.splice(index, 1);
      // remove the selected class
      btn.classList.remove("attendee__selected");
    } else {
      // add selected class and add attendee to array
      btn.classList.add("attendee__selected");
      const attendee = groupInfo.members.find(
        (member) => member._id === userId,
      );
      theAttendees.push(attendee);
    }

    replace(theAttendees);
  };

  // checks if a member is one of the selected attendees
  const isMemberAttendee = (id) => {
    return attendees && attendees.some((attendee) => attendee._id === id);
  };

  // form submit returned error
  const handleSubmitError = (err) => {
    setSubmitError(getPrettierErrorMessage(err));
  };

  // handleFormError will trigger if any validation errors occur
  const handleFormError = (errors) => {
    setSubmitError("Please check your input and try again");
  };

  //submit form: sanitize the data and submit to API via parent component
  const handleFormSubmit = async (values) => {
    //fix attendees array to just be IDs
    const data = { ...values };
    for (let i = 0; i < data.attendees.length; i++) {
      data.attendees[i] = data.attendees[i]._id;
    }
    // Sanitize HTML
    data.preSessionNotes = DOMPurify.sanitize(data.preSessionNotes);
    data.postSessionNotes = DOMPurify.sanitize(data.postSessionNotes);

    await onSubmit(data, handleSubmitError);
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
    //clear date picker and make sure it isn't shown
    setValue("date", "");
    clearErrors("date");
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
    const isDateValid = chosenDate && !isNaN(Date.parse(chosenDate));
    if (isDateValid) {
      setValue("date", chosenDate);
      clearErrors("date");
    }
    setTimeChosenFromGoogleScheduler(isDateValid);
  };

  // When switching from manual to google mode, clear out the date variable so it's not hidden
  // in the background and silently submitted by accident
  const handleSwitchDatePickerMode = (mode) => {
    if (mode === "google") {
      setValue("date", "");
    }
    setDatePickerMode(mode);
  };

  useEffect(() => {
    console.log("useeffect reset");
    reset(defaultValues);
    setTimeChosenFromGoogleScheduler(
      defaultValues.date && defaultValues.date !== "",
    );
  }, [defaultValues, reset]);

  useEffect(() => {
    console.log("useeffect subscribe");
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
    <FormProvider {...methods}>
      <div className="session__scheduler">
        {groupInfo.members.length === 0 ? (
          <h2 className="scheduler__title">
            Can not schedule a session without members
          </h2>
        ) : (
          <>
            <h2 className="scheduler__title">
              {sessionInfo.name ? sessionInfo.name : "Schedule a Session"}
            </h2>
            <form
              name="scheduler-form"
              className="scheduler__form"
              onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
            >
              <label
                htmlFor="scheduler-name"
                className={`form__label ${errors.name ? "form__label_has-error" : ""}`}
              >
                Session Name
                <input
                  type="text"
                  name="name"
                  className={`form__input ${errors.name ? "form__input_has-error" : ""}`}
                  id="scheduler-name"
                  placeholder="Name"
                  maxLength={300}
                  {...register("name")}
                />
                <span
                  className={`form__error ${errors.name ? "form__error_has-error" : ""}`}
                  id="scheduler-name-error"
                >
                  {errors.name?.message}
                </span>
              </label>

              <label
                className={`form__label ${errors.attendees ? "form__label_has-error" : ""}`}
              >
                Who will be attending?
                <span
                  className={`form__error ${errors.attendees ? "form__error_has-error" : ""}`}
                  id="scheduler-attendees-error"
                >
                  {errors.attendees?.root?.message}
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
                    attendees={attendees}
                    onStartMatching={handleStartMatching}
                    error={errors.google}
                    onSelectTime={handleSelectGoogleCalendarTime}
                    tz={tz}
                  />
                )}

                {(datePickerMode === "manual" ||
                  timeChosenFromGoogleScheduler) && (
                  <label
                    className={`form__label_type_session-date ${errors.date ? "form__label_has-error" : ""}`}
                  >
                    Session Date (Timezone: {tz})
                    <div className="scheduler__date">
                      <DatePicker
                        name="date"
                        onChange={(value) => {
                          setValue("date", value);
                        }}
                        selected={selectedDate}
                        timeInputLabel="Time:"
                        dateFormat="MM/dd/yyyy h:mm aa"
                        showTimeInput
                        showIcon
                        closeOnScroll
                        className="form__datepicker"
                      />
                    </div>
                  </label>
                )}
                <span
                  className={`form__error form__error_bold ${errors.date ? "form__error_has-error" : ""}`}
                  id="scheduler-date-error"
                >
                  {errors.date?.message}
                </span>
              </div>

              <div className="scheduler__preSessionNotes">
                <label
                  className={`form__label ${errors.preSessionNotes ? "form__label_has-error" : ""}`}
                >
                  Pre-Session Notes
                </label>
                <WYSIWYG
                  initialContent={defaultValues.preSessionNotes}
                  onChange={(content) => setValue("preSessionNotes", content)}
                />
                <span
                  className={`form__error form__error_bold ${errors.preSessionNotes ? "form__error_has-error" : ""}`}
                  id="groupform-preSessionNotes-error"
                >
                  {errors.preSessionNotes?.message}
                </span>
              </div>

              {sessionInfo._id && (
                <div className="scheduler__postSessionNotes">
                  <label
                    className={`form__label ${errors.postSessionNotes ? "form__label_has-error" : ""}`}
                  >
                    Post-Session Notes
                  </label>
                  <WYSIWYG
                    initialContent={defaultValues.postSessionNotes}
                    onChange={(content) =>
                      setValue("postSessionNotes", content)
                    }
                  />
                  <span
                    className={`form__error form__error_bold ${errors.postSessionNotes ? "form__error_has-error" : ""}`}
                    id="groupform-postSessionNotes-error"
                  >
                    {errors.postSessionNotes?.message}
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
                  {...register("areNotesVisibleToMembers")}
                >
                  <option value="none">Members can't see session notes</option>
                  <option value="pre">Only pre-session notes</option>
                  <option value="post">Only post-session notes</option>
                  <option value="all">Members can see all notes</option>
                </select>
              </label>

              <button
                className={`form__submit-btn form__submit-btn-type_scheduler`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : sessionInfo.name
                    ? "Edit Session"
                    : "Schedule Session"}
              </button>
              <button
                className="scheduler__cancel-btn"
                onClick={onGoBack}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <span
                className={`form__error form__error_bold ${submitError ? "form__error_has-error" : ""}`}
              >
                {submitError}
              </span>
            </form>
          </>
        )}
      </div>
    </FormProvider>
  );
}
export default GroupSessionScheduler;

/*
  GoogleCalendarScheduler.jsx
  Sub-component of GroupSessionScheduler that displays the Google Calendar matching for a group session
*/

import "./GoogleCalendarScheduler.css";
import { useEffect, useMemo, useState, useContext } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import DatePicker from "react-datepicker";
import { friendlyDate } from "../../utils/constants";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PageContext from "../../contexts/PageContext";

function GoogleCalendarScheduler({ onStartMatching, onSelectTime, tz }) {
  console.log("render GoogleCalendarScheduler");
  const { currentUser } = useContext(CurrentUserContext);
  const { getPrettierErrorMessage } = useContext(PageContext);
  const [matchingError, setMatchingError] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [minUsers, setMinUsers] = useState(1);
  const [minDuration, setMinDuration] = useState(30);
  const [prefStartHour, setPrefStartHour] = useState(-1);
  const [prefEndHour, setPrefEndHour] = useState(-1);
  const [isMatchingCalendars, setIsMatchingCalendars] = useState(false);
  const [disconnectedUsers, setDisconnectedUsers] = useState([]);
  const [matchingResults, setMatchingResults] = useState([]);
  const { control } = useFormContext();

  const attendees = useWatch({ control, name: "attendees" });

  const onChangeDateRange = (dates) => {
    const [s, e] = dates;
    setStart(s);
    setEnd(e);
  };

  // Is the Google Calendar connected for the GM?
  const isOwnerConnected = useMemo(() => {
    return currentUser.isGoogleConnected && !currentUser.isGoogleRevoked;
  }, [currentUser]);

  // calculate how many attendees have Google calendar connected
  const attendeesWithGoogleConnected = useMemo(() => {
    return attendees.filter((attendee) => {
      return attendee.isGoogleConnected && !attendee.isGoogleRevoked;
    });
  }, [attendees]);

  // # of attendees + the GM if they are also linked
  const totalAttendees = useMemo(() => {
    return attendeesWithGoogleConnected.length + (isOwnerConnected ? 1 : 0);
  }, [attendeesWithGoogleConnected, currentUser]);

  // There must be at least 2 attendees with Google connected to be able to search
  const enoughAttendeesAvailable = useMemo(() => {
    return totalAttendees > 1;
  }, [totalAttendees]);

  // show loading spinner, then collect the data and send it to the API.
  const handleStartMatching = (evt) => {
    try {
      evt.preventDefault();
      setIsMatchingCalendars(true);
      setDisconnectedUsers([]);
      setMatchingError("");
      const userIds = attendeesWithGoogleConnected.map(
        (attendee) => attendee._id,
      );
      if (isOwnerConnected) {
        userIds.push(currentUser._id);
      }

      // getTimezoneOffset returns minutes from UTC (e.g., EST is 240 or 300), divide by 60 to get hours
      const offsetHours = new Date().getTimezoneOffset() / 60;

      // Adjust local hours to UTC
      // We use (h + 24) % 24 to handle cases where the offset pushes the hour into the previous or next day

      /* To combat the issue with -1 and appearing / disappearing select boxes, get the value directly from the select box
      const prefStartHourFromSelect = parseInt(
        document.getElementById("time-prefStartHour").value,
      );
      const prefEndHourFromSelect =
        prefStartHourFromSelect !== -1
          ? parseInt(document.getElementById("time-prefEndHour").value)
          : -1;
      */

      let s = prefStartHour;
      let e = prefEndHour;

      // If start is set but there's no preferred end time, set it to a 24 hour window
      if (s !== -1 && e === -1) {
        e = s === 0 ? 23 : s - 1;
      }
      const prefStartUTC = s === -1 ? -1 : (s + offsetHours + 24) % 24;
      const prefEndUTC = e === -1 ? -1 : (e + offsetHours + 24) % 24;

      onStartMatching(
        {
          start,
          end,
          userIds,
          minUsers,
          minDuration,
          prefStartHour: prefStartUTC,
          prefEndHour: prefEndUTC,
        },
        handleMatchingComplete,
        handleMatchingError,
      );
    } catch (err) {
      handleMatchingError(err);
    }
  };

  // Finished matching
  const handleMatchingComplete = (response) => {
    setIsMatchingCalendars(false);
    setDisconnectedUsers(response.disconnectedUsers);
    setMatchingResults(response.blocks);
    if (!response.blocks.length) {
      setMatchingError("No results found for the provided time window");
    } else {
      setMatchingError("");
    }
    console.log(response);
  };

  // Google Calendar matching had an error of any kind
  const handleMatchingError = (err) => {
    console.error(err);
    setIsMatchingCalendars(false);
    if (typeof err.disconnectedUsers === "undefined") {
      setDisconnectedUsers([]);
    } else {
      setDisconnectedUsers(err.disconnectedUsers);
    }
    setMatchingError(getPrettierErrorMessage(err));
  };

  // Duration map for select box
  const generateDurationOptions = () => {
    const options = [];
    const minMinutes = 30;
    const maxMinutes = 12 * 60; // 720 minutes

    for (let minutes = minMinutes; minutes <= maxMinutes; minutes += 30) {
      let label = "";

      if (minutes < 60) {
        label = `${minutes} minutes`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const hourText = hours === 1 ? "1 hour" : `${hours} hours`;
        const minuteText =
          remainingMinutes > 0 ? ` ${remainingMinutes} mins` : "";

        label = `${hourText}${minuteText}`;
      }

      options.push({ value: minutes, label: label });
    }

    return options;
  };

  const durationOptions = useMemo(
    () => generateDurationOptions(),
    [generateDurationOptions],
  );

  /* When the user selects or de-selects an attendee, the already matched results
  should go away to avoid any UI issues like incorrect numbers of available players
  and to make it clear the scheduler needs to be re-run to check availability */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    console.log("attendees changed, clearing results");
    setMatchingResults([]);
    setDisconnectedUsers([]);
    setMatchingError("");
  }, [attendees]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="scheduler__matcher">
      <h3 className="matcher__title">Google Calendar (all times in {tz})</h3>
      <p className="matcher__count">
        {isOwnerConnected
          ? "Your Google Calendar is connected. "
          : "Visit your profile page to connect your Google Calendar for schedule matching. "}
        {attendees.length ? (
          <>
            {attendeesWithGoogleConnected.length} attendee
            {attendeesWithGoogleConnected.length !== 1
              ? "s have "
              : " has "}{" "}
            Google Calendar connected.{" "}
          </>
        ) : (
          "Select attendees to match Google Calendar availability"
        )}
      </p>
      <label className="matcher__daterange">
        Select a date range to search for available times:
        <div className="daterange">
          <DatePicker
            selected={start}
            onChange={onChangeDateRange}
            startDate={start}
            endDate={end}
            selectsRange
            dateFormat="MM/dd/yyyy"
            showIcon
            closeOnScroll
            className="form__daterange"
          />
        </div>
      </label>
      {/* <div className="matcher__recap">
        {!start || !end
          ? ""
          : `Searching from ${start.toLocaleString([], {
              dateStyle: "short",
            })} to ${end.toLocaleString([], {
              dateStyle: "short",
            })}`}
      </div> */}
      <div className="matcher__prefs">
        <label className="matcher__time-window">
          Preferred time window:
          <div className="time-window">
            <select
              id="time-prefStartHour"
              value={prefStartHour}
              onChange={(e) => setPrefStartHour(parseInt(e.target.value))}
              className="form__select"
            >
              <option value={-1}>Any</option>
              {[...Array(24)].map((_, i) => (
                <option key={i} value={i}>
                  {i > 12 ? `${i - 12} PM` : i === 0 ? "12 AM" : `${i} AM`}
                </option>
              ))}
            </select>
            <span>to</span>
            <select
              id="time-prefEndHour"
              value={prefEndHour}
              onChange={(e) => setPrefEndHour(parseInt(e.target.value))}
              className="form__select"
            >
              <option value={-1}>Any</option>
              {[...Array(24)].map((_, i) => (
                <option key={i} value={i}>
                  {i > 12 ? `${i - 12} PM` : i === 0 ? "12 AM" : `${i} AM`}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className="matcher__duration">
          Minimum session duration:
          <div className="duration">
            <select
              value={minDuration}
              onChange={(e) => setMinDuration(parseInt(e.target.value))}
              className="form__select"
              id="matcher-minDuration"
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </label>
        <label className="matcher__minimum-users">
          Minimum number of people {isOwnerConnected ? "(including you)" : ""}:
          <div className="minimum-users">
            <select
              value={minUsers}
              onChange={(e) => setMinUsers(parseInt(e.target.value))}
              className="form__select"
              id="matcher-minUsers"
            >
              {[...Array(Math.max(totalAttendees, 1))].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
      <button
        className="matcher__link-btn"
        type="button"
        onClick={handleStartMatching}
        disabled={
          !enoughAttendeesAvailable || !start || !end || isMatchingCalendars
        }
      >
        {!enoughAttendeesAvailable
          ? "Select attendees with calendars to match"
          : `Check availability for ${
              totalAttendees !== 1
                ? `${totalAttendees} people`
                : `${totalAttendees} person`
            }`}
      </button>

      <span
        className={`form__error form__error_bold matcher__error ${matchingError ? "form__error_has-error" : ""}`}
        id="matcher-range-error"
      >
        {matchingError}
      </span>
      <div className="matcher__content">
        <div
          className={`matcher__loading ${isMatchingCalendars ? "matcher__loading_visible" : ""}`}
        >
          <span className="matcher__spinner"></span>
          Checking calendars...
        </div>

        {!isMatchingCalendars && (
          <div className="matcher__availability-card">
            {disconnectedUsers.length > 0 && (
              <div className="availability-card__warning">
                <strong className="warning__top">
                  Some calendars couldn't be checked
                </strong>
                <p className="warning__text">
                  These players may have conflicts or disconnected Calendar
                  access:
                </p>
                <ul className="warning__conflicts">
                  {disconnectedUsers.map((user) => (
                    <li>{user}</li>
                  ))}
                </ul>
              </div>
            )}

            {matchingResults.length > 0 && (
              <div className="best-times">
                <h4 className="best-times__header">
                  {matchingResults.findIndex(
                    (r) => r.availablePlayers === totalAttendees,
                  ) > -1
                    ? "⭐ Best Available Times (all players available)"
                    : "⚠️ No available times for all players"}
                </h4>

                <div className="best-times__grid">
                  {matchingResults.map((result, i) => (
                    <div
                      className={`time-card ${result.availablePlayers === totalAttendees ? "time-card_best" : ""}`}
                      key={i}
                      onClick={() => onSelectTime(result.start)}
                    >
                      <div className="time-card__title">
                        {result.availablePlayers === totalAttendees ? "⭐" : ""}{" "}
                        {friendlyDate(result.start)}
                      </div>
                      <div className="time-card__range">
                        {new Date(result.start).toLocaleTimeString([], {
                          timeStyle: "short",
                        })}{" "}
                        -{" "}
                        {new Date(result.end).toLocaleTimeString([], {
                          timeStyle: "short",
                        })}
                      </div>
                      <div className="time-card__meta">
                        {result.availablePlayers === totalAttendees
                          ? "All players available"
                          : `⚠️ ${totalAttendees - result.availablePlayers}/${totalAttendees} unavailable: ${result.unavailablePlayerList.join(", ")}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default GoogleCalendarScheduler;

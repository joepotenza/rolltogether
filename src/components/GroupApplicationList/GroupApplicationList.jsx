/*
  GroupApplicationList.jsx
  Sub-component of Group.jsx for owners to manage applications
*/

import "../Form/Form.css";
import "./GroupApplicationList.css";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { prettyDateFormat } from "../../utils/constants";
import UserAvatar from "../UserAvatar/UserAvatar";
import PreLoader from "../PreLoader/PreLoader";

function GroupApplicationList({
  api,
  groupInfo,
  applicationList,
  isApplicationListLoading,
  onApprove,
}) {
  const [isResponding, setIsResponding] = useState(false);

  /*
    Messages from users and responses from the GM are stored in order
    to trim them on display and provide a "read more" link
  */
  const initialResponseValues = useMemo(() => {
    const values = {};
    applicationList.forEach((app) => {
      values[app._id] = "";
    });
    return values;
  }, [applicationList]);

  const fullMessages = useMemo(() => {
    const messages = {};
    applicationList.forEach((app) => {
      messages[app._id] = app.message;
    });
    return messages;
  }, [applicationList]);

  const [responseValues, setResponseValues] = useState({});
  const [responseErrors, setResponseErrors] = useState({});
  const responseValuesDisplay = {
    ...initialResponseValues,
    ...responseValues,
  };
  const responseErrorsDisplay = {
    ...initialResponseValues,
    ...responseErrors,
  };

  const handleResponseChange = (evt, appId) => {
    const { value } = evt.target;
    setResponseValues((prevValues) => ({
      ...prevValues,
      [appId]: value,
    }));
    setResponseErrors((prevErrors) => ({
      ...prevErrors,
      [appId]: "",
    }));
  };

  // Once the "read more" link is clicked, the full message replaces all the content
  const revealMore = (appId) => {
    document.getElementById(`app-message-${appId}`).textContent =
      fullMessages[appId];
  };

  // Update app status
  const handleUpdateApplication = (appId, status) => {
    const response = responseValues[appId] || "";
    setIsResponding(true);
    api
      .updateApplicationStatus({
        groupId: groupInfo._id,
        appId,
        status,
        response,
      })
      .then((data) => {
        if (data && data.group && data.app) {
          // remove the buttons and textarea and update the status icon
          const statusDiv = document.getElementById(`app-status-${appId}`);
          statusDiv.classList.remove("application__status_new");
          statusDiv.classList.add(`application__status_${status}`);
          statusDiv.textContent = `${status.charAt(0).toUpperCase()}${status.substring(1)}`;
          document.getElementById(`app-buttons-${appId}`).remove();
          document.getElementById(`app-error-${appId}`).remove();

          // If approved, call back to parent to update open slots
          if (status === "approved" && onApprove) {
            onApprove();
          }
        } else {
          const newErrors = {
            ...responseErrors,
            [appId]: "An error occurred, please try again.",
          };
          setResponseErrors(newErrors);
        }
        setIsResponding(false);
      })
      .catch((err) => {
        const newErrors = { ...responseErrors, [appId]: err.message };
        setResponseErrors(newErrors);
        setIsResponding(false);
      });
  };

  return (
    <div className="group__applications">
      <h2 className="applications__header">
        {!applicationList.length
          ? "No applications yet."
          : `Group Applications (${applicationList.length})`}
      </h2>

      {isApplicationListLoading ? (
        <PreLoader />
      ) : (
        <div className="applications__list">
          {!applicationList.length ? (
            <p>When players apply to join your group, they’ll appear here.</p>
          ) : (
            applicationList.map((app, i) => {
              return (
                <div
                  className={`application ${app.status === "new" ? "application_type_new" : ""}`}
                  key={app._id}
                >
                  <div className="application__main">
                    <Link
                      to={`/user/${app.user.username}`}
                      className="application__avatar"
                    >
                      <UserAvatar avatarClass="application" user={app.user} />
                    </Link>
                    <div className="application__details">
                      <Link
                        to={`/user/${app.user.username}`}
                        className="application__username"
                      >
                        {app.user.username}
                      </Link>
                      <div className="application__date">
                        {prettyDateFormat(app.createdAt)}
                      </div>
                      <div
                        className="application__message"
                        id={`app-message-${app._id}`}
                      >
                        {app.message.substring(0, 200)}{" "}
                        {app.message.length > 200 && (
                          <button
                            className="application__more"
                            onClick={() => {
                              revealMore(app._id);
                            }}
                          >
                            Read more...
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      className={`application__status application__status_${app.status}`}
                      id={`app-status-${app._id}`}
                    >
                      {`${app.status.charAt(0).toUpperCase()}${app.status.substring(1)}`}
                    </div>
                  </div>
                  {app.status === "new" ? (
                    <>
                      <div
                        className="application__buttons"
                        id={`app-buttons-${app._id}`}
                      >
                        <textarea
                          name="response"
                          className={`form__input application__textarea`}
                          id="application-response"
                          placeholder="Add a note (optional)"
                          maxLength={500}
                          value={responseValuesDisplay[app._id]}
                          onChange={(evt) => handleResponseChange(evt, app._id)}
                        />
                        <button
                          className="application__button application__button_type_approve"
                          onClick={() =>
                            handleUpdateApplication(app._id, "approved")
                          }
                          disabled={isResponding}
                        >
                          Approve
                        </button>
                        <button
                          className="application__button application__button_type_deny"
                          onClick={() =>
                            handleUpdateApplication(app._id, "denied")
                          }
                          disabled={isResponding}
                        >
                          Deny
                        </button>
                      </div>
                      <div
                        className="application__error"
                        id={`app-error-${app._id}`}
                      >
                        {responseErrorsDisplay[app._id]}
                      </div>
                    </>
                  ) : app.response ? (
                    <div
                      className="application__response"
                      id={`app-response-${app._id}`}
                    >
                      {app.response && (
                        <div className="application__response-label">
                          Your response:
                        </div>
                      )}
                      {app.response}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
export default GroupApplicationList;

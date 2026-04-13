/*
    GroupAdminstration.jsx
    Shows the available functions for an owner or member of a group
    or the application button / status for non-members
*/

import "./GroupAdministration.css";

function GroupAdministration({
  groupInfo,
  applicationList,
  sessionList,
  isOwner,
  isMember,
  displayMode,
  onGoBack,
  onOpenEditForm,
  onOpenScheduler,
  onOpenSessionList,
  onOpenApplicationList,
  onOpenApplicationForm,
  myApplications,
}) {
  return (
    <div className="group__administration">
      {displayMode != "description" && (
        <button
          className="administration__button administration__button_type_applications"
          onClick={onGoBack}
        >
          Go Back
        </button>
      )}
      {!isOwner && !isMember && displayMode !== "apply" ? (
        myApplications && myApplications.length ? (
          <button
            className="administration__button admininistraion__button_type_apply administration__button_disabled"
            disabled
          >
            {myApplications[0].status === "new"
              ? "Your application is being reviewed"
              : myApplications[0].status === "approved"
                ? "✅ Your application was approved!"
                : "❌ Your application was denied"}
          </button>
        ) : groupInfo.slots.open < 1 ? (
          <button
            className="administration__button admininistraion__button_type_apply administration__button_disabled"
            disabled
          >
            Applications are currently closed
          </button>
        ) : (
          <button
            className="administration__button administration__button_type_apply"
            onClick={onOpenApplicationForm}
          >
            Apply for this group
          </button>
        )
      ) : (
        ""
      )}
      {isOwner && displayMode !== "edit" && (
        <button
          className="administration__button administration__button_type_edit"
          onClick={onOpenEditForm}
        >
          Edit Group
        </button>
      )}
      {isOwner && displayMode !== "applicationList" && (
        <button
          className="administration__button administration__button_type_applications"
          onClick={onOpenApplicationList}
        >
          Applications ({applicationList.length})
        </button>
      )}
      {(isOwner || isMember) && displayMode !== "sessionList" && (
        <button
          className="administration__button administration__button_type_sessions"
          onClick={onOpenSessionList}
        >
          {`Sessions (${sessionList.length})`}
        </button>
      )}
      {isOwner && displayMode !== "scheduler" && (
        <button
          className="administration__button administration__button_type_schedule"
          onClick={onOpenScheduler}
        >
          Schedule Session
        </button>
      )}
    </div>
  );
}
export default GroupAdministration;

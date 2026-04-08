/*
    GroupSessionList.jsx
    Session history for a group
*/

import "./GroupSessionList.css";
import { useState, useContext } from "react";
import PreLoader from "../PreLoader/PreLoader";
import UserAvatar from "../UserAvatar/UserAvatar";
import Modal from "../Modal/Modal";
import ConfirmDeleteModal from "../ConfirmDeleteModal/ConfirmDeleteModal";
import DOMPurify from "dompurify";
import PageContext from "../../contexts/PageContext";

function GroupSessionList({
  groupInfo,
  sessionList,
  isOwner,
  isMember,
  isSessionListLoading,
  handleToggleSessions,
  handleEditSession,
  handleDeleteSession,
}) {
  const [deleteSessionText, setDeleteSessionText] = useState("");
  const [deleteSessionId, setDeleteSessionId] = useState("");
  const {
    activeModal,
    handleOpenSessionNotesModal,
    handleOpenDeleteModal,
    handleCloseModal,
  } = useContext(PageContext);

  // show modal with session notes
  const viewSessionNotes = (sessionId) => {
    const session = sessionList.find((session) => session._id === sessionId);
    const preSessionNotes = session.preSessionNotes;
    const postSessionNotes = session.postSessionNotes;
    document.querySelector(".modal__preSessionNotes").innerHTML =
      DOMPurify.sanitize(preSessionNotes);
    document.querySelector(".modal__postSessionNotes").innerHTML =
      DOMPurify.sanitize(postSessionNotes);
    handleOpenSessionNotesModal();
  };

  // Show confirmation when user wants to delete session, this dynamically sets the text and opens the modal.
  // the modal will call this component's parent's handler when done
  const showDeleteConfirmationModal = (sessionId, name) => {
    setDeleteSessionText(
      `Are you sure you want to delete session ("${name}")? This action is permanent.`,
    );
    setDeleteSessionId(sessionId);
    handleOpenDeleteModal();
  };

  // delete session resulted in an error, update modal
  const handleDeleteSessionError = (err) => {
    const msg =
      err?.message || "An error occurred on the server. Please try again.";
    document.querySelector(".modal__delete-error").textContent = msg;
  };

  return (
    <div className="group__sessions">
      <ConfirmDeleteModal
        isOpen={activeModal === "delete"}
        onClose={handleCloseModal}
        confirmationText={deleteSessionText}
        confirmDeleteHandler={(success, fail) =>
          handleDeleteSession(deleteSessionId, success, (err) => {
            handleDeleteSessionError(err);
            fail(err);
          })
        }
        cancelDeleteHandler={handleCloseModal}
      />
      <Modal
        name="session-notes"
        isOpen={activeModal === "session-notes"}
        onClose={handleCloseModal}
      >
        <button
          className="modal__close-btn"
          type="button"
          onClick={handleCloseModal}
        />
        <div className="modal__header">
          <h2 className="modal__title">Session Notes</h2>
        </div>
        <div className="modal__scroller">
          <h2 className="modal__title modal__title_type_notes">
            Pre-Session Notes
          </h2>
          <div className="modal__preSessionNotes"></div>
          <h2 className="modal__title modal__title_type_notes">
            Post-Session Notes
          </h2>
          <div className="modal__postSessionNotes"></div>
        </div>
      </Modal>
      <h2 className="sessions__header">
        Session History ({sessionList.length})
      </h2>
      {isSessionListLoading ? (
        <PreLoader />
      ) : (
        <div className="sessions__list">
          {!sessionList.length ? (
            <div>No sessions found</div>
          ) : (
            sessionList.map((session) => {
              return (
                <div className="session" key={session._id}>
                  <div className="session__top">
                    <div className="session__name">{session.name}</div>
                    <div className="session__date">
                      {new Date(session.date).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div className="session__attendee-header">Attendees:</div>
                  <div className="session__attendees">
                    {session.attendees.map((attendee) => (
                      <div className="attendee" key={attendee.username}>
                        <UserAvatar avatarClass="attendee" user={attendee} />
                        <div className="attendee__name">
                          {attendee.username}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="session__buttons">
                    {(isOwner || session.areNotesVisibleToMembers) && (
                      <button
                        className="session__button session__button_type_notes"
                        onClick={() => viewSessionNotes(session._id)}
                      >
                        View Session Notes
                      </button>
                    )}
                    {isOwner && (
                      <>
                        <button
                          className="session__button session__button_type_edit"
                          onClick={() => handleEditSession(session)}
                        >
                          Edit
                        </button>
                        <button
                          className="session__button session__button_type_delete"
                          onClick={() =>
                            showDeleteConfirmationModal(
                              session._id,
                              session.name,
                            )
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
export default GroupSessionList;

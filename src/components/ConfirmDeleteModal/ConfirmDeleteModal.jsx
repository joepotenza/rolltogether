/*
  ConfirmDeleteModal.jsx
  Popup Modal for confirming a delete action
*/
import "./ConfirmDeleteModal.css";
import { useState } from "react";
import Modal from "../Modal/Modal";

function ConfirmDeleteModal({
  isOpen,
  onClose,
  confirmDeleteHandler,
  cancelDeleteHandler,
  confirmationText = "Are you sure you want to delete this item? This action is irreversible.",
  confirmButtonText = "Yes, delete item",
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleDeleteSuccess = () => {
    setIsSubmitted(false);
  };
  const handleDeleteFailure = () => {
    setIsSubmitted(false);
  };
  const handleDelete = () => {
    setIsSubmitted(true);
    confirmDeleteHandler(handleDeleteSuccess, handleDeleteFailure);
  };
  return (
    <Modal name="delete" isOpen={isOpen} onClose={onClose}>
      <button
        className="modal__close-btn modal__close-btn_type_delete"
        type="button"
        onClick={onClose}
      ></button>
      <div className="modal__delete-container">
        <div className="modal__delete-content">{confirmationText}</div>
        <div className="modal__delete-error"></div>
        <button
          className="modal__delete-confirm"
          type="button"
          onClick={handleDelete}
          disabled={isSubmitted}
        >
          {confirmButtonText}
        </button>
        <button
          className="modal__delete-cancel"
          type="button"
          onClick={cancelDeleteHandler}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;

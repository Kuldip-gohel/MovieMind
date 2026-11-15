import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Modal from './Modal';
import { useLatest } from '../hooks/useCinematic';

/**
 * Confirmation dialog shown before destructive actions (deleting a movie).
 */
export default function ConfirmationModal({
  isOpen,
  title = 'Delete Movie',
  message: messageProp,
  movieTitle: movieTitleProp,
  confirmText = 'Delete Movie',
  cancelText = 'Cancel',
  onConfirm,
  onClose
}) {
  // Keep the text while the closing animation plays.
  const message = useLatest(messageProp);
  const movieTitle = useLatest(movieTitleProp);
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={460} labelledBy="confirm-title">
      <div className="modal-header">
        <h3 id="confirm-title">{title}</h3>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="modal-body confirm-body">
        <div className="confirm-icon-box">
          <AlertTriangle size={28} />
        </div>
        <p className="confirm-lead">{movieTitle ? `Delete "${movieTitle}"?` : 'Are you sure?'}</p>
        <p className="confirm-text">
          {message || 'This movie will be removed permanently from your collection and your statistics will update immediately.'}
        </p>
      </div>

      <div className="modal-footer center">
        <button type="button" className="btn-ghost" onClick={onClose}>
          {cancelText}
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

import React from 'react';
import { CheckCircle2, AlertCircle, Info, Trash2, X } from 'lucide-react';

/**
 * Floating glass toasts that confirm add / edit / delete / status actions.
 */
export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        if (toast.type === 'delete') Icon = Trash2;
        else if (toast.type === 'info') Icon = Info;
        else if (toast.type === 'error') Icon = AlertCircle;

        return (
          <div key={toast.id} className={`toast ${toast.type || 'success'}`}>
            <Icon className="toast-icon" size={18} />
            <span className="toast-msg">{toast.message}</span>
            <button type="button" className="toast-dismiss" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

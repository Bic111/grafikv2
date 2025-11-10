/**
 * ConfirmDialog component
 * Modal dialog for confirming actions
 */

import React from 'react';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Title of the dialog */
  title: string;
  /** Message/content of the dialog */
  message: string;
  /** Label for confirm button */
  confirmLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  /** Whether confirm button is destructive (red) */
  isDestructive?: boolean;
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Callback when canceled */
  onCancel: () => void;
  /** Whether the dialog is loading */
  isLoading?: boolean;
}

/**
 * ConfirmDialog component
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps): JSX.Element | null {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming || isLoading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || isLoading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            }`}
          >
            {isConfirming ? 'Potwierddzam...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

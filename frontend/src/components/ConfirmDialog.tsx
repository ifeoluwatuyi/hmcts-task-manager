import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirm',
  onConfirm, onCancel, isLoading, danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-crown-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-modal animate-scale-in overflow-hidden">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto
            ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <svg className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-crown-800 text-lg text-center mb-2">{title}</h3>
          <p className="text-sm text-slate-500 font-sans text-center leading-relaxed">{message}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold font-sans text-slate-600
                         bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => void onConfirm()}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold font-sans text-white
                         transition-colors disabled:opacity-50 flex items-center justify-center gap-2
                         ${danger
                           ? 'bg-red-600 hover:bg-red-700'
                           : 'bg-crown-800 hover:bg-crown-700'}`}
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

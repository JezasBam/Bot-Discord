import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onAdditionalAction?: () => void;
  additionalButtonText?: string;
}

export function ConfirmationModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  onAdditionalAction,
  additionalButtonText = "Additional Action",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-discord-dark rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-discord-light">
          <h3 className="text-lg font-semibold text-discord-text">localhost:3001 says</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-discord-light rounded transition-colors"
          >
            <X size={18} className="text-discord-muted" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-discord-text mb-6">{message}</p>
          
          <div className="flex gap-3 justify-end">
            {onAdditionalAction && (
              <button
                onClick={onAdditionalAction}
                className="px-4 py-2 bg-discord-blurple text-white rounded hover:bg-discord-blurple/80 transition-colors"
              >
                {additionalButtonText}
              </button>
            )}
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-discord-light text-discord-text rounded hover:bg-discord-lighter transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-discord-green text-white rounded hover:bg-discord-green/80 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

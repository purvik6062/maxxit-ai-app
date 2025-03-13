import React from "react";
import { X } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="z-50 w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl p-6 mx-4 transform -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2 fixed">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="flex items-center mt-6 gap-1">
            <h3 className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-center text-2xl font-semibold text-transparent">
              Coming Soon!
            </h3>
            <div>🚀✨</div>
          </div>
          <p className="mt-2 text-center text-gray-300">
            Exciting developments are underway! Our team is working hard to
            bring you cutting-edge AI-powered trading features. Stay tuned for
            updates! 🛠️💡
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;

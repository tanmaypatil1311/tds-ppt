import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({ message, onClose, title = 'Success' }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 animate-slide-up">
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800 mb-1">{title}</h3>
          <p className="text-sm text-green-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-600 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
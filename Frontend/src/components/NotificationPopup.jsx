import React from 'react';
import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationPopup = ({ type = 'error', message, onClose }) => {
  const types = {
    error: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      Icon: XCircle
    },
    success: {
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
      Icon: CheckCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
      Icon: AlertCircle
    }
  };

  const { bgColor, textColor, iconColor, Icon } = types[type] || types.error;

  return (
    <div className={`rounded-md ${bgColor} p-4 animate-shake`}>
      <div className="flex justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${textColor}`}>
              {message}
            </p>
          </div>
        </div>
        <div className="pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${iconColor} hover:${bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${bgColor}`}
            >
              <span className="sr-only">Dismiss</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
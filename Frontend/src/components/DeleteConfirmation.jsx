import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DeleteConfirmation = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-red-100 p-3">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{title || 'Confirm Deletion'}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this item'}?`}
              </p>
              <p className="text-sm text-red-600 mt-2 font-medium">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation; 
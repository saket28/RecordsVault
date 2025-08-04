import React from 'react';
import { Icon } from './Icons';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, itemName, itemType }) => {
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    onConfirm();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Icon type="trash" className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete {itemType}</h3>
            <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                    Are you sure you want to delete <span className="font-semibold">{itemName}</span>? 
                    This will also delete all associated items and cannot be undone.
                </p>
            </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleConfirm}
            >
                Delete
            </button>
            <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

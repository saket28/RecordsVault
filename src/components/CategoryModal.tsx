import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialName, title }: CategoryModalProps) => {
  const [name, setName] = useState<string>(initialName || '');
  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">{title || 'Add New Category'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200">
            <Icon type="close" className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hobbies & Collectibles"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end items-center p-5 bg-slate-50 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="ml-3 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
              {title ? 'Rename Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

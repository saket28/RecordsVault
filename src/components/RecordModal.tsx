import * as React from 'react';
import { useState, useEffect } from 'react';
import { RecordItem } from '../types';
import { Icon } from './Icons';

type RecordFormData = Omit<RecordItem, 'record_id' | 'created_at'> & { name: string };

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecordFormData, id?: number) => void;
  initialData?: RecordItem | null;
  categoryName: string;
  categoryId: number;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: keyof Omit<RecordFormData, 'category_id'>;
  required?: boolean;
  disabled?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, name, required = false, disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
        />
    </div>
);

export const RecordModal: React.FC<RecordModalProps> = (props) => {
  // Helper to generate record name
  function generateRecordKey(institute_name: string | null, account_name: string | null, account_owner: string | null) {
    return [institute_name, account_name, account_owner].filter(Boolean).join(' - ');
  }

  const { isOpen, onClose, onSave, initialData, categoryName, categoryId } = props;
  const [record, setRecord] = useState<RecordFormData>({
    name: '', contact_information: '', institute_name: '', account_name: '', account_owner: '', id_number: '', credentials: '', location: '', nominee: '', notes: '', category_id: categoryId,
  });

  useEffect(() => {
    const defaultState: RecordFormData = {
      name: '', contact_information: '', institute_name: '', account_name: '', account_owner: '', id_number: '', credentials: '', location: '', nominee: '', notes: '', category_id: categoryId      
    };
    if (initialData) {
        // Exclude DB-only fields from the form state
        const { record_id, created_at, ...formData } = initialData;
        setRecord({ ...formData, name: generateRecordKey(formData.institute_name, formData.account_name, formData.account_owner) });
    } else {
        setRecord(defaultState);
    }
  }, [initialData, categoryId, isOpen]);

  useEffect(() => {
    setRecord(prev => ({
      ...prev,
      name: generateRecordKey(prev.institute_name, prev.account_name, prev.account_owner)
    }));
  }, [record.institute_name, record.account_name, record.account_owner]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'name') return; // Prevent manual edit
    setRecord(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(record, initialData?.record_id);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Record' : 'Add New Record'}</h2>
            <p className="text-sm text-slate-500">In category: {categoryName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200">
            <Icon type="close" className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField label="Record Name" name="name" value={record.name} onChange={handleChange} required disabled placeholder='Auto-generated' />
              </div>
              <InputField label="Institute Name" name="institute_name" value={record.institute_name || ''} onChange={handleChange} placeholder="e.g., UIDAI, State Bank of India" />
              <InputField label="Contact Information" name="contact_information" value={record.contact_information || ''} onChange={handleChange} placeholder="e.g., Phone, Email, Contact Person" />
              <InputField label="Account Name" name="account_name" value={record.account_name || ''} onChange={handleChange} placeholder="e.g., John Doe" />
              <InputField label="ID Number" name="id_number" value={record.id_number || ''} onChange={handleChange} placeholder="Account No, Policy No, PAN" />
              <InputField label="Account Owner" name="account_owner" value={record.account_owner || ''} onChange={handleChange} placeholder="e.g., Self, Joint with Spouse" />
              <InputField label="Credentials" name="credentials" value={record.credentials || ''} onChange={handleChange} placeholder="Username, Customer ID info" />
              <InputField label="Location" name="location" value={record.location || ''} onChange={handleChange} placeholder="e.g., Locker #123, File at home" />
              <InputField label="Nominee" name="nominee" value={record.nominee || ''} onChange={handleChange} placeholder="e.g., Jane Doe (Spouse)" />
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={record.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional information, e.g., maturity dates, interest rates, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
          </div>

          <div className="flex justify-end items-center p-5 bg-slate-50 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" className="ml-3 px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
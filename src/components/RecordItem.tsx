import * as React from 'react';
import { RecordItem as RecordItemType } from '../types';
import { Icon } from './Icons';

// Sub-component props
interface RecordComponentProps {
  item: RecordItemType;
  onEdit: (item: RecordItemType) => void;
  onDelete: (id: number) => void;
}

// Detail View (The original component)
const RecordItemDetail: React.FC<RecordComponentProps> = (props) => {
  const { item, onEdit, onDelete } = props;
  interface DetailRowProps {
    label: string;
    value?: string | null;
  }
  const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2 border-b border-slate-100 last:border-b-0">
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="text-sm text-slate-800 text-right break-words">{value}</dd>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="p-5 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 truncate">{item.name}</h3>
      </div>
      <div className="p-5 flex-grow">
        <dl className="space-y-1">
          <DetailRow label="Institute Name" value={item.institute_name} />
          <DetailRow label="Contact Information" value={item.contact_information} />
          <DetailRow label="Account Name" value={item.account_name} />
          <DetailRow label="ID Number" value={item.id_number} />
          <DetailRow label="Account Owner" value={item.account_owner} />
          <DetailRow label="Credentials Info" value={item.credentials} />
          <DetailRow label="Location" value={item.location} />
          <DetailRow label="Nominee" value={item.nominee} />
          {item.notes && (
            <div className="pt-3">
              <dt className="text-sm font-medium text-slate-500 mb-1">Notes</dt>
              <dd className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{item.notes}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="flex justify-end p-3 bg-slate-50 border-t border-slate-200 space-x-2">
        <button onClick={() => onEdit(item)} className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors" aria-label={`Edit ${item.name}`}>
          <Icon type="edit" className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(item.record_id)} className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors" aria-label={`Delete ${item.name}`}>
          <Icon type="trash" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Card View (A more compact card)
const RecordItemCard: React.FC<RecordComponentProps> = (props) => {
  const { item, onEdit, onDelete } = props;
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-md text-slate-800 truncate mb-1">{item.name}</h3>
        <p className="text-sm text-slate-500 truncate">{item.contact_information}</p>
        <p className="text-sm text-slate-500 truncate">{item.institute_name}</p>
        <div className="mt-3 pt-3 border-t border-slate-100">
             <p className="text-xs text-slate-400">Owner</p>
             <p className="text-sm text-slate-700 font-medium truncate">{item.account_owner || 'N/A'}</p>
        </div>
      </div>
      <div className="flex justify-end p-2 bg-slate-50 border-t border-slate-200 space-x-1">
        <button onClick={() => onEdit(item)} className="p-2 text-slate-500 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors" aria-label={`Edit ${item.name}`}>
          <Icon type="edit" className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.record_id)} className="p-2 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors" aria-label={`Delete ${item.name}`}>
          <Icon type="trash" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// List View (A dense row)
const RecordListItem: React.FC<RecordComponentProps> = (props) => {
  const { item, onEdit, onDelete } = props;
  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center p-3">
        <div className="flex-shrink-0 mr-4">
            <Icon type="document" className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-slate-800 truncate">{item.name}</p>
            <div className="flex flex-col md:flex-row md:gap-x-4 text-sm text-slate-500">
                <p className="truncate">{item.contact_information}</p>
                <p className="truncate">{item.institute_name}</p>
                <p className="truncate"><span className="hidden md:inline-block md:mr-1">•</span>Owner: {item.account_owner || 'N/A'}</p>
            </div>
        </div>
        <div className="ml-auto flex items-center space-x-0 md:space-x-1 pl-2">
            <button onClick={() => onEdit(item)} className="p-2 text-slate-500 rounded-full hover:bg-slate-200 transition-colors" aria-label={`Edit ${item.name}`}>
                <Icon type="edit" className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(item.record_id)} className="p-2 text-slate-500 rounded-full hover:bg-slate-200 transition-colors" aria-label={`Delete ${item.name}`}>
                <Icon type="trash" className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

// Main dispatcher component
export type ViewMode = 'list' | 'card' | 'detail';

interface RecordItemProps extends RecordComponentProps {
    viewMode: ViewMode;
}

export const RecordItem: React.FC<RecordItemProps> = (props) => {
  const { item, viewMode, onEdit, onDelete } = props;
  switch (viewMode) {
    case 'list':
      return <RecordListItem item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'card':
      return <RecordItemCard item={item} onEdit={onEdit} onDelete={onDelete} />;
    case 'detail':
    default:
      return <RecordItemDetail item={item} onEdit={onEdit} onDelete={onDelete} />;
  }
};
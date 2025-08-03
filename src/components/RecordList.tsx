import React, { useState } from 'react';
import { Category, RecordItem as RecordItemType } from '../types';
import { RecordItem } from './RecordItem';
import { Icon } from './Icons';
import { ViewMode } from './RecordItem';

interface RecordListProps {
  category: Category | undefined;
  records: RecordItemType[];
  onAddItem: (categoryId: number) => void;
  onEditItem: (item: RecordItemType) => void;
  onDeleteItem: (itemId: number, itemName: string) => void;
}

export const RecordList: React.FC<RecordListProps> = ({ category, records, onAddItem, onEditItem, onDeleteItem }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('detail');

  if (!category) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <Icon type="document" className="w-24 h-24 text-slate-300 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-600">Welcome to RecordVault</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          Select a category from the sidebar to view its records, or add a new category to get started.
        </p>
      </div>
    );
  }

  const ViewSwitcher: React.FC = () => (
    <div className="flex items-center bg-slate-200 rounded-lg p-1">
      {(['list', 'card', 'detail'] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`p-1.5 rounded-md transition-colors ${
            viewMode === mode
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'
          }`}
          aria-label={`Switch to ${mode} view`}
        >
          <Icon type={mode === 'list' ? 'viewList' : mode === 'card' ? 'viewCard' : 'viewDetail'} className="w-5 h-5" />
        </button>
      ))}
    </div>
  );

  const containerClasses: Record<ViewMode, string> = {
      list: 'flex flex-col gap-2',
      card: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
      detail: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
  };

  return (
    <main className="flex-grow p-6 md:p-8 bg-slate-50 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{category.name}</h1>
        <div className="flex items-center gap-4">
          <ViewSwitcher />
          <button
            onClick={() => onAddItem(category.category_id)}
            disabled={!category.is_enabled}
            className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Icon type="plus" className="w-5 h-5 mr-2" />
            <span>Add Record</span>
          </button>
        </div>
      </div>
      
      {!category.is_enabled && (
        <div className="text-center py-10 px-6 border-2 border-dashed border-slate-300 rounded-lg bg-white mb-8">
           <Icon type="eyeSlash" className="w-12 h-12 text-slate-400 mx-auto mb-3" />
           <h3 className="text-lg font-semibold text-slate-600">Category Disabled</h3>
           <p className="text-slate-500 mt-1">Enable this category from the sidebar to add or view records.</p>
        </div>
      )}

      {category.is_enabled && records.length > 0 ? (
        <div className={containerClasses[viewMode]}>
          {records.map((item) => (
            <RecordItem key={item.record_id} item={item} viewMode={viewMode} onEdit={onEditItem} onDelete={(id) => onDeleteItem(id, item.name)} />
          ))}
        </div>
      ) : category.is_enabled && (
        <div className="text-center py-20 px-6 border-2 border-dashed border-slate-300 rounded-lg bg-white">
          <Icon type="document" className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No records yet.</h3>
          <p className="text-slate-500 mt-1">Click "Add Record" to add the first item in this category.</p>
        </div>
      )}
    </main>
  );
};
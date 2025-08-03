import React from 'react';
import { Category } from '../types';
import { Icon } from './Icons';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: number, name: string) => void;
  onToggleCategory: (id: number) => void;
  onRenameCategory: (id: number, name: string) => void;
  onGenerateReport: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
  const {
    categories,
    selectedCategoryId,
    onSelectCategory,
    onAddCategory,
    onDeleteCategory,
    onToggleCategory,
    onRenameCategory,
    onGenerateReport,
    onSignOut,
  } = props;

  return (
    <aside className="w-full md:w-1/4 lg:w-1/5 xl:w-1/6 bg-white p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center mb-6">
        <Icon type="document" className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800 ml-2">RecordVault</h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Categories</h2>
        <button
          onClick={onAddCategory}
          className="p-1 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
          aria-label="Add new category"
        >
          <Icon type="plus" className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-grow overflow-y-auto -mr-2 pr-2">
        <ul>
          {categories.map((category: Category) => (
            <li key={category.category_id} className="my-1">
              <div
                onClick={() => onSelectCategory(category.category_id)}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                  !category.is_enabled ? 'opacity-50' : ''
                } ${
                  selectedCategoryId === category.category_id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center truncate">
                    <Icon type="category" className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{category.name}</span>
                </div>

                <div className={`flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRenameCategory(category.category_id, category.name); }}
                    className={`p-1 rounded-full transition-colors text-slate-500 hover:bg-yellow-100 hover:text-yellow-600`}
                    aria-label={`Rename category ${category.name}`}
                  >
                    <Icon type="edit" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleCategory(category.category_id); }}
                    className={`p-1 rounded-full transition-colors ${selectedCategoryId === category.category_id ? 'text-blue-200 hover:bg-blue-700 hover:text-white' : 'text-slate-500 hover:bg-blue-100 hover:text-blue-600'}`}
                    aria-label={category.is_enabled ? `Disable category ${category.name}` : `Enable category ${category.name}`}
                  >
                    <Icon type={category.is_enabled ? 'eye' : 'eyeSlash'} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.category_id, category.name); }}
                    className={`p-1 rounded-full transition-colors ${selectedCategoryId === category.category_id ? 'text-blue-200 hover:bg-blue-700 hover:text-white' : 'text-slate-500 hover:bg-red-100 hover:text-red-600'}`}
                    aria-label={`Delete category ${category.name}`}
                  >
                    <Icon type="trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
           <button
            onClick={onGenerateReport}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 font-medium transition-colors"
          >
            <Icon type="download" className="w-5 h-5 mr-2" />
            Generate Report
          </button>
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            Sign Out & Lock Vault
          </button>
      </div>
    </aside>
  );
};
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { checkUserExists, createUserData, getDecryptedUserData, saveEncryptedUserData, getActiveUser, setActiveUser, clearActiveUser } from './lib/storage';
import { Category, RecordItem, AppData } from './types';
import { Sidebar } from './components/Sidebar';
import { RecordList } from './components/RecordList';
import { RecordModal } from './components/RecordModal';
import { CategoryModal } from './components/CategoryModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Auth } from './components/Auth';

type ModalState = 
  | { type: 'ADD_ITEM', categoryId: number }
  | { type: 'EDIT_ITEM', item: RecordItem }
  | { type: 'ADD_CATEGORY' }
  | { type: 'DELETE_ITEM', itemId: number, itemName: string }
  | { type: 'DELETE_CATEGORY', categoryId: number, categoryName: string }
  | { type: 'RENAME_CATEGORY', categoryId: number, categoryName: string }
  | null;

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [data, setData] = useState<AppData>({ categories: [], records: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  
  const handleRenameCategory = (categoryId: number, newName: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.category_id === categoryId ? { ...c, name: newName } : c
      )
    }));
    setModalState(null);
  };

  useEffect(() => {
    // On initial load, clear any session to ensure a clean login.
    clearActiveUser();
    setLoading(false);
  }, []);
  
  // Persist data to local storage whenever it changes
  useEffect(() => {
    if (username && password && !loading) {
      saveEncryptedUserData(username, password, data);
    }
  }, [data, username, password, loading]);

  // Effect to handle selecting a default category
  useEffect(() => {
     if (data.categories.length > 0 && (!selectedCategoryId || !data.categories.find(c => c.category_id === selectedCategoryId))) {
       const firstEnabledCategory = data.categories.find(c => c.is_enabled);
       setSelectedCategoryId(firstEnabledCategory ? firstEnabledCategory.category_id : data.categories[0].category_id);
     } else if (data.categories.length === 0) {
       setSelectedCategoryId(null);
     }
  }, [data.categories, selectedCategoryId]);
  
  const handleLogin = async (user: string, pass: string) => {
    const sanitizedUser = user.trim();
    const sanitizedPass = pass.trim();
    
    let appData;
    if (checkUserExists(sanitizedUser)) {
      appData = await getDecryptedUserData(sanitizedUser, sanitizedPass);
    } else {
      appData = await createUserData(sanitizedUser, sanitizedPass);
    }
    
    setData(appData);
    setUsername(sanitizedUser);
    setPassword(sanitizedPass);
    setActiveUser(sanitizedUser);
  };
  
  const handleLogout = () => {
    clearActiveUser();
    setUsername(null);
    setPassword(null);
    setData({ categories: [], records: []});
    setSelectedCategoryId(null);
  };
  
  const handleSaveRecord = (item: Omit<RecordItem, 'record_id' | 'created_at'>, id?: number) => {
    const now = new Date().toISOString();
    if (id) { // Editing existing record
      setData(prev => ({
        ...prev,
        records: prev.records.map(r => r.record_id === id ? { ...r, ...item } : r)
      }));
    } else { // Adding new record
      const newRecord: RecordItem = { ...item, record_id: Date.now(), created_at: now };
      setData(prev => ({...prev, records: [...prev.records, newRecord]}));
    }
    setModalState(null);
  };
  
  const handleDeleteItem = () => {
    if (modalState?.type !== 'DELETE_ITEM') return;
    setData(prev => ({ ...prev, records: prev.records.filter(r => r.record_id !== modalState.itemId) }));
    setModalState(null);
  };

  const handleSaveCategory = (name: string) => {
    const newCategory: Category = { category_id: Date.now(), name, created_at: new Date().toISOString(), is_enabled: true };
    setData(prev => ({...prev, categories: [...prev.categories, newCategory]}));
    setModalState(null);
  };
  
  const handleToggleCategory = (categoryId: number) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.category_id === categoryId ? { ...c, is_enabled: !c.is_enabled } : c
      )
    }));
  };

  const handleDeleteCategory = () => {
    if (modalState?.type !== 'DELETE_CATEGORY') return;
    const { categoryId } = modalState;
    setData(prev => ({
      categories: prev.categories.filter(c => c.category_id !== categoryId),
      records: prev.records.filter(r => r.category_id !== categoryId)
    }));
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    }
    setModalState(null);
  };
  
  const handleGenerateReport = () => {
    let markdown = `# RecordVault Report for ${username}\n\n`;
    
    data.categories
      .filter(c => c.is_enabled)
      .forEach(category => {
        const categoryRecords = data.records.filter(r => r.category_id === category.category_id);
        if (categoryRecords.length === 0) {
          // Skip empty categories
          return;
        }
        markdown += `## ${category.name}\n\n`;
        categoryRecords.forEach(record => {
          markdown += `### ${record.name}\n\n`;
          Object.entries(record).forEach(([key, value]) => {
            if (value && key !== 'record_id' && key !== 'category_id' && key !== 'created_at' && key !== 'name') {
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              markdown += `- **${label}:** ${value}\n`;
            }
          });
          markdown += `\n`;
        });
      });
      
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recordvault-report-${username?.toLowerCase().replace(/\s/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const sortedCategories = useMemo<Category[]>(() => {
    return [...data.categories].sort((a, b) => {
        if (a.is_enabled !== b.is_enabled) {
            return a.is_enabled ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
  }, [data.categories]);
  
  const selectedCategory = data.categories.find(cat => cat.category_id === selectedCategoryId);
  const selectedRecords = useMemo(() => {
      if (!selectedCategoryId) return [];
      return data.records.filter(r => r.category_id === selectedCategoryId).sort((a,b) => a.name.localeCompare(b.name));
  }, [data.records, selectedCategoryId]);
  
  const getModalContent = () => {
    if (!modalState) return null;

    switch(modalState.type) {
      case 'ADD_ITEM':
        const parentCategoryForAdd = data.categories.find(c => c.category_id === modalState.categoryId);
        return <RecordModal isOpen={true} onClose={() => setModalState(null)} onSave={handleSaveRecord} categoryName={parentCategoryForAdd?.name || ''} categoryId={modalState.categoryId} />;
      case 'EDIT_ITEM':
        const parentCategoryForEdit = data.categories.find(c => c.category_id === modalState.item.category_id);
        return <RecordModal isOpen={true} onClose={() => setModalState(null)} onSave={handleSaveRecord} initialData={modalState.item} categoryName={parentCategoryForEdit?.name || ''} categoryId={modalState.item.category_id}/>;
      case 'ADD_CATEGORY':
        return <CategoryModal isOpen={true} onClose={() => setModalState(null)} onSave={handleSaveCategory} />;
      case 'DELETE_ITEM':
        return <DeleteConfirmModal isOpen={true} onClose={() => setModalState(null)} onConfirm={handleDeleteItem} itemName={modalState.itemName} itemType="record" />;
      case 'DELETE_CATEGORY':
        return <DeleteConfirmModal isOpen={true} onClose={() => setModalState(null)} onConfirm={handleDeleteCategory} itemName={modalState.categoryName} itemType="category" />;
      case 'RENAME_CATEGORY':
        return <CategoryModal isOpen={true} onClose={() => setModalState(null)} onSave={(newName: string) => handleRenameCategory(modalState.categoryId, newName)} initialName={modalState.categoryName} title="Rename Category" />;
      default:
        return null;
    }
  }
  
  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center text-slate-500">Initializing...</div>;
  }
  
  if (!username || !password) {
    return <Auth onLogin={handleLogin}/>;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-100 font-sans">
      <Sidebar
        categories={sortedCategories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onAddCategory={() => setModalState({ type: 'ADD_CATEGORY' })}
        onDeleteCategory={(id: number, name: string) => setModalState({type: 'DELETE_CATEGORY', categoryId: id, categoryName: name})}
        onToggleCategory={handleToggleCategory}
        onRenameCategory={(id: number, name: string) => setModalState({ type: 'RENAME_CATEGORY', categoryId: id, categoryName: name })}
        onGenerateReport={handleGenerateReport}
        onSignOut={handleLogout}
      />
      <RecordList
        category={selectedCategory}
        records={selectedRecords}
        onAddItem={(categoryId) => setModalState({ type: 'ADD_ITEM', categoryId })}
        onEditItem={(item) => setModalState({ type: 'EDIT_ITEM', item })}
        onDeleteItem={(itemId, itemName) => setModalState({type: 'DELETE_ITEM', itemId, itemName})}
      />
      {getModalContent()}
    </div>
  );
};

export default App;
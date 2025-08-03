import React, { useState } from 'react';
import { Icon } from './Icons';

interface AuthProps {
    onLogin: (username: string, password: string) => Promise<void>;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    try {
        await onLogin(username, password);
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-6">
                <Icon type="document" className="w-12 h-12 text-blue-600 mb-2" />
                <h1 className="text-3xl font-bold text-slate-800">RecordVault</h1>
                <p className="text-slate-500 mt-1">A secure, private, encrypted vault for your records.</p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <input
                        id="username"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        type="text"
                        placeholder="e.g., John Doe"
                        value={username}
                        required
                        autoFocus
                        autoComplete="username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Vault Password</label>
                    <input
                        id="password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        type="password"
                        placeholder="Your secret password"
                        value={password}
                        required
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                 <p className="text-xs text-slate-500 !mt-2">If the name doesn't exist, a new encrypted vault will be created. Your data never leaves your computer.</p>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                    >
                        {loading ? 'Opening Vault...' : 'Open My Vault'}
                    </button>
                </div>
            </form>
        </div>
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} RecordVault. All your data is encrypted and stored locally.</p>
        </footer>
    </div>
  );
};
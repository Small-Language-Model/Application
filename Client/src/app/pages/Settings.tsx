import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patchUser, deleteUser } from '../lib/api';
import { useNavigate } from 'react-router';

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, isLoading, logout, setAuthToken } = useAuth();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
    if (user) {
      setFullName(user.name);
    }
  }, [user, isLoading, navigate]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const doSave = async () => {
    setShowSaveConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const form = new FormData();
      form.append('full_name', fullName);
      if (password) form.append('password', password);
      if (file) form.append('profile_image', file);

      await patchUser(user.id, form, token);
      // refresh user in context
      await setAuthToken(token);
      setInfoMessage('Profile updated successfully.');
    } catch (err) {
      setInfoMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');
      await deleteUser(user.id, token);
      logout();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <img
                src={user.profileImageUrl ?? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover mb-4"
              />
              <label className="text-sm text-slate-600 mb-2">Change profile image</label>
              <label className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
                Choose file
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <p className="mt-2 text-xs text-slate-500 text-center">
                {file ? file.name : 'No file chosen'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-lg mb-4" />

              <label className="block text-sm font-medium mb-2">Email (cannot change)</label>
              <input value={user.email} readOnly className="w-full p-3 border rounded-lg mb-4 bg-slate-50" />

              <label className="block text-sm font-medium mb-2">New password (optional)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-6" />

              <div className="flex gap-3">
                <button onClick={() => setShowSaveConfirm(true)} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Save changes'}</button>
                <button onClick={() => setShowDeleteConfirm(true)} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer disabled:cursor-not-allowed">Delete account</button>
              </div>
              {infoMessage && <p className="mt-4 text-sm text-slate-600">{infoMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      {showSaveConfirm && (
        <ConfirmModal
          title="Save changes"
          message="Save changes to your profile?"
          onConfirm={doSave}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete account"
          message="Are you sure you want to delete your account? This cannot be undone."
          onConfirm={doDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

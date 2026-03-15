'use client';

import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <p className="text-sm text-slate-500">Account</p>
            <p className="font-medium text-slate-800">
              {user?.username ?? 'User'}
            </p>
            {user?.id != null && (
              <p className="text-sm text-slate-600 mt-1">ID: {user.id}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-500">Settings</p>
            <p className="text-slate-600 text-sm">Manage your preferences here.</p>
          </div>
          <button
            onClick={signOut}
            className="mt-4 w-full py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

export default function ProfilePage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <p className="text-sm text-slate-500">Account</p>
            <p className="font-medium text-slate-800">EchoVoice User</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Settings</p>
            <p className="text-slate-600 text-sm">Manage your preferences here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

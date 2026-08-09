'use client';

import React, { useState } from 'react';

interface ProfileSchema {
  name: string;
  email: string;
  bio: string;
  avatarInitials: string;
}

export default function Profile() {
  const [profileData, setProfileData] = useState<ProfileSchema>({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software engineer focusing on building scalable systems, server telemetries, and automation engines.',
    avatarInitials: 'JD'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Developer Profile</h2>
        <p className="text-slate-400 text-sm mt-1">Manage public profile card, bio summary, and workspace presence.</p>
      </div>

      {/* Main card */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl" />

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar and Main Header Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-900/60">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/10">
              {profileData.avatarInitials}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">{profileData.name}</h3>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">Core System Admin</p>
              <p className="text-[10px] text-slate-500 mt-1">Joined workspace node in May 2026</p>
            </div>
          </div>

          {/* Form details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Developer Identity</label>
              <input 
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Communication Endpoint (Email)</label>
              <input 
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Operator Biography</label>
              <textarea 
                rows={5}
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500">
              Identity parameters will sync to active GitHub review modules.
            </p>
            
            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                  Changes synchronized!
                </span>
              )}
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/10 transition-colors focus:outline-none"
              >
                Sync Profile
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

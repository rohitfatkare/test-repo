'use client';

import React, { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Notification Toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [apiAlerts, setApiAlerts] = useState(true);
  const [securityLogs, setSecurityLogs] = useState(false);

  // Preferences Toggles
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>('dark');
  const [logLevel, setLogLevel] = useState<'debug' | 'info' | 'warn'>('info');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving changes...');
    setTimeout(() => {
      setSaveStatus('Settings successfully saved!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Configure user accounts, authentication rules, and platform preferences.</p>
        </div>
        {saveStatus && (
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 animate-pulse">
            {saveStatus}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1 bg-slate-950/20 border border-slate-800/40 rounded-2xl custom-scrollbar shrink-0">
          {[
            { id: 'profile', name: 'Profile Settings' },
            { id: 'security', name: 'Security & Auth' },
            { id: 'notifications', name: 'Notifications' },
            { id: 'preferences', name: 'System Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <div className="lg:col-span-3 bg-slate-950/40 border border-slate-800/60 p-6 sm:p-8 rounded-2xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Profile Information</h3>
                  <p className="text-xs text-slate-500 mt-1">Update your developer information and credentials.</p>
                </div>

                {/* Avatar upload layout */}
                <div className="flex items-center gap-4 py-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
                    JD
                  </div>
                  <div>
                    <button type="button" className="text-xs font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors">
                      Change Photo
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">SVG, PNG, or JPG. Max file size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Developer Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Software engineer focusing on building scalable systems, server telemetries, and automation engines."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Security & Credentials</h3>
                  <p className="text-xs text-slate-500 mt-1">Change your password and manage safety rules.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900/60 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Two-Factor Authentication (2FA)</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Secure your administrator account using time-based OTP tokens.</p>
                    </div>
                    <button type="button" className="text-xs font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 hover:bg-indigo-500/10 px-3.5 py-2 rounded-xl transition-all">
                      Configure 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Notifications</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure email dispatch systems and real-time slack triggers.</p>
                </div>

                <div className="space-y-4">
                  {/* Switch 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/20 border border-slate-900 rounded-xl">
                    <div>
                      <label className="text-xs font-bold text-slate-200">System Digest Digests</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Receive compiled weekly traffic, CPU trends, and task states.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailDigest(!emailDigest)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        emailDigest ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        emailDigest ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Switch 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/20 border border-slate-900 rounded-xl">
                    <div>
                      <label className="text-xs font-bold text-slate-200">API Endpoint Spikes</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Notify instantly when server response time crosses 500ms limit.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setApiAlerts(!apiAlerts)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        apiAlerts ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        apiAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Switch 3 */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/20 border border-slate-900 rounded-xl">
                    <div>
                      <label className="text-xs font-bold text-slate-200">Security Access Attempts</label>
                      <p className="text-[10px] text-slate-500 mt-0.5">Push alerts when someone attempts unauthorized terminal connections.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityLogs(!securityLogs)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        securityLogs ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        securityLogs ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Preferences</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure layout visual aesthetics and control log priorities.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Display Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['dark', 'light', 'system'] as const).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setThemeMode(theme)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                            themeMode === theme
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Logging Priority</label>
                    <select
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="debug">DEBUG - Log everything</option>
                      <option value="info">INFO - Production level logs</option>
                      <option value="warn">WARN - Capture warnings/errors only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="border-t border-slate-900/60 pt-6 flex gap-3 justify-end">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/40"
              >
                Reset Default
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10 transition-colors"
              >
                Save Settings Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

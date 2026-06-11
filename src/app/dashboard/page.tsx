'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const user = { name: "Test User", role: "admin" };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-indigo-500/10">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">System Operator</p>
          <h2 className="text-2xl font-bold sm:text-3xl mt-1">Welcome back, {user.name}!</h2>
          <p className="text-xs text-indigo-100 mt-2 max-w-md leading-relaxed">
            Your workspace console is fully operational. You have administrative access to all repository nodes and telemetry stats.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-lg">Role: {user.role}</span>
            <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-lg">Region: Global-West</span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics Card */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Repository Review Stats</h3>
            <p className="text-xs text-slate-500 mt-0.5">Summary of PR review metrics for this repository.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">PRs Analyzed</p>
              <p className="text-xl font-bold text-white mt-1">12</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Comments Posted</p>
              <p className="text-xl font-bold text-white mt-1">47</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Review Accuracy</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">98.4%</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Average Speed</p>
              <p className="text-xl font-bold text-white mt-1">45s</p>
            </div>
          </div>

          <Link
            href="/analytics"
            className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 border border-slate-700/60 hover:bg-slate-700 transition-colors"
          >
            Detailed Analytics
          </Link>
        </div>

        {/* Action Panel Card */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Workspace Controls</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick triggers and account customization.</p>
          </div>

          <div className="space-y-3.5 my-6">
            <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-850 rounded-xl text-xs">
              <div>
                <p className="font-bold text-slate-200">Configure Profile</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Change bios, emails, and avatars.</p>
              </div>
              <Link href="/profile" className="text-indigo-400 hover:text-indigo-300 font-semibold">Edit</Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-850 rounded-xl text-xs">
              <div>
                <p className="font-bold text-slate-200">System Preferences</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Modify debug levels and access security.</p>
              </div>
              <Link href="/settings" className="text-indigo-400 hover:text-indigo-300 font-semibold">Change</Link>
            </div>
          </div>

          <Link
            href="/projects"
            className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10 transition-colors"
          >
            Manage Active Projects
          </Link>
        </div>
      </div>

      {/* Code Review Checklist / Static Alerts */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Pending Code Review Checks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Unused Imports</span>
              <span className="text-[10px] font-bold text-amber-400 font-mono">1 Detected</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Found in page.tsx line 3 (next/image).</p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">Unused Functions</span>
              <span className="text-[10px] font-bold text-amber-400 font-mono">2 Detected</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Found in profile/page.tsx line 14.</p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200">TypeScript any Types</span>
              <span className="text-[10px] font-bold text-rose-400 font-mono font-semibold">3 Detected</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Found in profile state declaration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

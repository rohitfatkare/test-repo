'use client';

import React from 'react';
import Link from 'next/link';
import { Counter } from "@/components/Counter";
import { 
  DashboardIcon, 
  ProjectsIcon, 
  AnalyticsIcon, 
  ProfileIcon, 
  SettingsIcon 
} from "@/components/Icons";

export default function Home() {
  const features = [
    {
      title: "Real-time Dashboard",
      description: "Access live metrics, workspace summaries, and active widgets.",
      href: "/dashboard",
      icon: DashboardIcon,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Projects Directory",
      description: "Manage repository nodes, track progress, and allocate budgets.",
      href: "/projects",
      icon: ProjectsIcon,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Telemetry Analytics",
      description: "Visualize computing loads, server latencies, and active stream logs.",
      href: "/analytics",
      icon: AnalyticsIcon,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Developer Profile",
      description: "Edit developer credentials, change bios, and manage accounts.",
      href: "/profile",
      icon: ProfileIcon,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "System Settings",
      description: "Customize theme preference, logging limits, and access security.",
      href: "/settings",
      icon: SettingsIcon,
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-slate-800/80 rounded-3xl p-8 sm:p-10 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 -mb-10 w-32 h-32 rounded-full bg-purple-500/5 blur-2xl" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Antigravity Workspace v1.0
          </span>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight leading-tight">
            Next-Gen Autonomous AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Control Panel
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Welcome to the developer playground. This panel integrates real-time mock telemetry dashboards, project directory grids, server settings tabs, and live counter states.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link 
              href="/dashboard"
              className="bg-white text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            >
              Enter Dashboard
            </Link>
            <Link 
              href="/projects"
              className="bg-slate-800/80 border border-slate-700/60 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Manage Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Shortcuts */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Workspace Sub-systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Link 
                key={idx}
                href={feature.href}
                className="group bg-slate-950/30 border border-slate-800/60 rounded-2xl p-6 hover:bg-slate-950/60 hover:border-slate-700/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 rounded-full bg-slate-800/5 blur-xl group-hover:bg-indigo-500/5 transition-all duration-300" />
                
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 group-hover:text-white mt-4 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-2 flex items-center text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span>Explore module</span>
                  <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Interactive Node component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Interactive Playground State</h3>
            <p className="text-xs text-slate-500 mt-0.5">Test real-time client reactivity and dynamic API fetching below.</p>
          </div>
          <Counter />
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">System Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active connections and framework modules.</p>
          </div>
          <div className="space-y-4 my-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Framework</span>
              <span className="text-slate-200 font-bold font-mono">Next.js 16.2.4</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Tailwind Engine</span>
              <span className="text-slate-200 font-bold font-mono">v4.0.0</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">React Core</span>
              <span className="text-slate-200 font-bold font-mono">v19.0.0</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Active Node Host</span>
              <span className="text-emerald-400 font-bold font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                localhost:3000
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500">Workspace is fully optimized and running in development sandbox.</p>
        </div>
      </div>
    </div>
  );
}

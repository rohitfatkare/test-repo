'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  DashboardIcon,
  ProjectsIcon,
  AnalyticsIcon,
  ProfileIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  BellIcon,
  SearchIcon,
  LogOutIcon
} from './Icons';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { name: 'Projects', href: '/projects', icon: ProjectsIcon },
  { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
  { name: 'Profile', href: '/profile', icon: ProfileIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname === '/') return 'Home';
    const activeItem = sidebarItems.find(item => item.href !== '/' && pathname?.startsWith(item.href));
    return activeItem ? activeItem.name : 'Console';
  };

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setNotificationsOpen(false);
      setProfileMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans text-slate-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-950 border-r border-slate-800/60 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60 bg-slate-950">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-200 tracking-wide text-lg">
                Antigravity
              </span>
              <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-widest mt-[-2px]">
                Control Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-400 rounded-r-md" />
                )}
                <Icon
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:scale-110 group-hover:text-slate-100'
                  }`}
                  size={18}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/30 transition-colors">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  JD
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">John Doe</p>
              <p className="text-xs text-slate-400 truncate">john@example.com</p>
            </div>
            <button className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10">
              <LogOutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-850 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 bg-slate-950">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 tracking-wide text-base">
              Antigravity
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <XIcon size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-xs">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">John Doe</p>
              <p className="text-xs text-slate-400 truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/60 relative z-30">
          {/* Left side: Toggle Menu (mobile) & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 md:hidden focus:outline-none"
            >
              <MenuIcon size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                Workspace
              </span>
              <span className="text-slate-400 hidden sm:inline-block">/</span>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right side: Search, Notifications, Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <SearchIcon size={16} />
              </div>
              <input
                type="text"
                placeholder="Search resources, stats..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[10px] text-slate-500 border border-slate-800 bg-slate-950 px-1.5 my-2 rounded font-mono">
                ⌘K
              </span>
            </div>

            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors focus:outline-none relative"
              >
                <BellIcon size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl py-2 z-50 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <button className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-slate-900 border-b border-slate-800/40 transition-colors cursor-pointer">
                      <div className="flex gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-200">New performance spike detected</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-900 border-b border-slate-800/40 transition-colors cursor-pointer">
                      <div className="flex gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-200">Database backup completed</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-900 transition-colors cursor-pointer">
                      <div className="flex gap-2.5">
                        <div className="w-2 h-2 bg-slate-600 rounded-full mt-1.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-400">System update successfully installed</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  JD
                </div>
                <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl py-1 z-50 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">John Doe</p>
                    <p className="text-[10px] text-slate-500 truncate">john@example.com</p>
                  </div>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-slate-800 my-1" />
                  <button 
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

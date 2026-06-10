'use client';

import React, { useState } from 'react';
import { PlusIcon, SearchIcon } from '@/components/Icons';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  category: 'Frontend' | 'Backend' | 'AI' | 'Fullstack';
  team: string[];
  dueDate: string;
  budget: string;
}

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Antigravity AI Assistant',
    description: 'Developing a next-generation agentic AI coding helper capable of deep logic thinking.',
    status: 'In Progress',
    progress: 78,
    category: 'AI',
    team: ['JD', 'AN', 'RF'],
    dueDate: 'June 15, 2026',
    budget: '$45,000'
  },
  {
    id: '2',
    name: 'HopeOF Portal',
    description: 'A premium humanitarian platform designed to handle donation processing and event management.',
    status: 'Completed',
    progress: 100,
    category: 'Fullstack',
    team: ['JD', 'RF'],
    dueDate: 'May 08, 2026',
    budget: '$18,500'
  },
  {
    id: '3',
    name: 'Create Receipt Service',
    description: 'Microservice for generating high-fidelity PDF receipts and invoices with visual editor templates.',
    status: 'Completed',
    progress: 100,
    category: 'Backend',
    team: ['AN', 'JD'],
    dueDate: 'April 20, 2026',
    budget: '$8,200'
  },
  {
    id: '4',
    name: 'Digitrix Enterprise CRM',
    description: 'Corporate client dashboard featuring lead generation pipelines, real-time analytics, and client profiles.',
    status: 'In Progress',
    progress: 42,
    category: 'Fullstack',
    team: ['JD', 'MS', 'RF'],
    dueDate: 'July 10, 2026',
    budget: '$62,000'
  },
  {
    id: '5',
    name: 'Neural Code Analyzer',
    description: 'LLM-powered tool to automatically detect code vulnerabilities, memory leaks, and performance bottlenecks.',
    status: 'On Hold',
    progress: 15,
    category: 'AI',
    team: ['AN', 'MS'],
    dueDate: 'Sept 01, 2026',
    budget: '$30,000'
  },
  {
    id: '6',
    name: 'Interactive UI Library',
    description: 'Custom React design system with Tailwind styling, accessible elements, and rich responsive aesthetics.',
    status: 'In Progress',
    progress: 60,
    category: 'Frontend',
    team: ['RF', 'JD'],
    dueDate: 'June 30, 2026',
    budget: '$12,000'
  }
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeFilter, setActiveFilter] = useState<'All' | 'In Progress' | 'Completed' | 'On Hold'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Frontend' | 'Backend' | 'AI' | 'Fullstack'>('Frontend');
  const [newBudget, setNewBudget] = useState('$10,000');
  const [newDueDate, setNewDueDate] = useState('June 30, 2026');

  const filteredProjects = projects.filter(project => {
    const matchesFilter = activeFilter === 'All' || project.status === activeFilter;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesc) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newName,
      description: newDesc,
      status: 'In Progress',
      progress: 0,
      category: newCategory,
      team: ['JD'],
      dueDate: newDueDate,
      budget: newBudget
    };

    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    // Reset inputs
    setNewName('');
    setNewDesc('');
    setNewCategory('Frontend');
    setNewBudget('$10,000');
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'On Hold': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const getCategoryColor = (category: Project['category']) => {
    switch (category) {
      case 'AI': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Frontend': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'Backend': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Fullstack': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Projects Directory</h2>
          <p className="text-slate-400 text-sm mt-1">Manage active workspace repositories, teams, and timelines.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none"
        >
          <PlusIcon size={16} />
          Create Project
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Projects</p>
          <p className="text-2xl font-bold text-slate-200 mt-2">{projects.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">✔ Active and archived</p>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-slate-200 mt-2">
            {projects.filter(p => p.status === 'In Progress').length}
          </p>
          <p className="text-[10px] text-indigo-400 mt-1">● Active developments</p>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-slate-200 mt-2">
            {projects.filter(p => p.status === 'Completed').length}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">▲ 100% success rate</p>
        </div>
        <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Projected Budget</p>
          <p className="text-2xl font-bold text-slate-200 mt-2">$175.9k</p>
          <p className="text-[10px] text-indigo-400 mt-1">⌘ Across 6 nodes</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/20 border border-slate-800/40 p-3.5 rounded-2xl">
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'In Progress', 'Completed', 'On Hold'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeFilter === filter
                  ? 'bg-slate-800 text-white shadow-inner border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <SearchIcon size={14} />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group bg-slate-950/30 border border-slate-800/60 rounded-2xl p-6 hover:bg-slate-950/60 hover:border-slate-700/60 transition-all duration-300 flex flex-col relative overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(project.category)}`}>
                {project.category}
              </span>
              <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(project.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  project.status === 'Completed' ? 'bg-emerald-400' : project.status === 'In Progress' ? 'bg-indigo-400' : 'bg-amber-400'
                }`} />
                {project.status}
              </span>
            </div>

            {/* Title & Description */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-white group-hover:translate-x-0.5 transition-transform duration-200">
                {project.name}
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Progress Section */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-semibold">Progress</span>
                <span className="text-slate-300 font-bold">{project.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex -space-x-1.5 overflow-hidden">
                {project.team.map((initial, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-indigo-400 shadow-sm"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <div>
                  <p className="text-[8px] text-slate-600 font-medium uppercase tracking-wider">Due Date</p>
                  <p className="text-slate-400 font-semibold mt-0.5">{project.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-600 font-medium uppercase tracking-wider">Budget</p>
                  <p className="text-slate-400 font-semibold mt-0.5">{project.budget}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-950/20 border border-slate-800/40 rounded-2xl">
            <p className="text-slate-400 text-sm">No projects matching your search.</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Create New Project</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HopeOF Donation Portal"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your project, features, goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="AI">AI</option>
                    <option value="Fullstack">Fullstack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Budget</label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/10"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

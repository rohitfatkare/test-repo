'use client';

import React, { useState, useEffect } from 'react';
import { SearchIcon, PlusIcon } from '@/components/Icons';

interface Issue {
  id: string;
  lineRange: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  before: string;
  after: string;
}

interface ReviewResult {
  score: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  maintainability: 'High' | 'Medium' | 'Low';
  issues: Issue[];
  summary: string;
}

const examples = {
  javascript: {
    name: 'JS SQL Injection & Leak',
    lang: 'javascript',
    code: `// Express handler with security & performance flaws
const express = require('express');
const app = express();
const db = require('./db');

// global cache leaky array
const requestLogs = [];

app.get('/user', async (req, res) => {
  const id = req.query.id;
  requestLogs.push({ time: Date.now(), ip: req.ip }); // Memory Leak!

  // SQL Injection Vulnerability!
  const query = "SELECT * FROM users WHERE id = " + id;
  
  db.query(query, (err, result) => {
    if (err) throw err; 
    res.json(result);
  });
});`
  },
  typescript: {
    name: 'TS Any Type & Async Bugs',
    lang: 'typescript',
    code: `// TypeScript function with bad types and unhandled promise
interface UserData {
  id: string;
  name: string;
}

async function fetchUserConfig(userId: any): Promise<any> {
  const response = await fetch(\`/api/config/\${userId}\`);
  const data: any = await response.json();
  
  // Unhandled error scenario
  if (!data) {
    return null;
  }
  
  // Mutable mutations without validation
  data.lastFetched = new Date().toISOString();
  return data;
}

function renderUserProfile(user: any) {
  // Potential crash if user is null/undefined
  console.log(user.name.toUpperCase());
  fetchUserConfig(user.id); // Missing await or catch!
}`
  },
  python: {
    name: 'Python O(N^2) Complexity',
    lang: 'python',
    code: `# Python list match checks causing excessive computation complexity
def find_intersection_pairs(list_a, list_b):
    pairs = []
    # Nested iteration runs in O(A * B) time!
    for item_a in list_a:
        for item_b in list_b:
            if item_a['id'] == item_b['id']:
                if item_a not in pairs: # Redundant lookup on list!
                    pairs.append(item_a)
    return pairs`
  }
};

const mockReviews: Record<string, ReviewResult> = {
  javascript: {
    score: 38,
    criticalCount: 2,
    warningCount: 1,
    infoCount: 1,
    maintainability: 'Low',
    summary: 'Critical security vulnerability (SQL Injection) and a severe memory leak detected. Global variable caching poses operational risks under sustained traffic.',
    issues: [
      {
        id: 'js-1',
        lineRange: 'Line 14',
        type: 'critical',
        category: 'Security',
        message: 'SQL Injection hazard. User inputs passed directly into database execution can lead to data leaks or total node deletion.',
        before: 'const query = "SELECT * FROM users WHERE id = " + id;\ndb.query(query, (err, result) => { ... });',
        after: 'const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [id], (err, result) => { ... });'
      },
      {
        id: 'js-2',
        lineRange: 'Line 10',
        type: 'critical',
        category: 'Memory Leak',
        message: 'Global array mutation without bounds controls. This array will continuously expand and cause Heap out-of-memory crashes.',
        before: 'const requestLogs = [];\n// inside handler:\nrequestLogs.push({ time: Date.now(), ip: req.ip });',
        after: '// Use a bounded cache or external store like Redis\nconst LRU = require("lru-cache");\nconst cache = new LRU({ max: 500 });\n// inside handler:\ncache.set(Date.now(), { ip: req.ip });'
      },
      {
        id: 'js-3',
        lineRange: 'Line 16',
        type: 'warning',
        category: 'Error Handling',
        message: 'Throwing asynchronous errors inside callbacks can terminate the node server. Use express error middleware instead.',
        before: 'if (err) throw err;',
        after: 'if (err) return next(err);'
      }
    ]
  },
  typescript: {
    score: 64,
    criticalCount: 1,
    warningCount: 2,
    infoCount: 1,
    maintainability: 'Medium',
    summary: 'The code works but defeats the type-safety checks of TypeScript by overusing "any". An unhandled asynchronous promise call was also identified.',
    issues: [
      {
        id: 'ts-1',
        lineRange: 'Line 23',
        type: 'critical',
        category: 'Async Flow',
        message: 'Asynchronous function call is invoked without "await" or ".catch()". Unhandled rejections will trigger node warnings or crashes.',
        before: 'fetchUserConfig(user.id);',
        after: 'await fetchUserConfig(user.id).catch(err => console.error(err));'
      },
      {
        id: 'ts-2',
        lineRange: 'Line 7, 19',
        type: 'warning',
        category: 'TypeScript Standards',
        message: 'Avoid declaring types as "any". Define explicit interfaces to enforce safe object access across compile states.',
        before: 'async function fetchUserConfig(userId: any): Promise<any> {\nfunction renderUserProfile(user: any) {',
        after: 'async function fetchUserConfig(userId: string): Promise<UserData> {\nfunction renderUserProfile(user: UserData) {'
      },
      {
        id: 'ts-3',
        lineRange: 'Line 21',
        type: 'warning',
        category: 'Null Safety',
        message: 'Accessing properties of potentially null objects directly will crash the client. Apply optional chaining.',
        before: 'console.log(user.name.toUpperCase());',
        after: 'console.log(user?.name?.toUpperCase() ?? "GUEST");'
      }
    ]
  },
  python: {
    score: 81,
    criticalCount: 0,
    warningCount: 2,
    infoCount: 1,
    maintainability: 'High',
    summary: 'No critical security hazards, but high computational complexity. Query scales quadratically, causing high CPU load under large array lists.',
    issues: [
      {
        id: 'py-1',
        lineRange: 'Lines 5-7',
        type: 'warning',
        category: 'Complexity',
        message: 'Nested double loops execute in O(N^2) complexity. Use dictionary hash indexing to query pairs in O(N) linear time.',
        before: 'for item_a in list_a:\n    for item_b in list_b:\n        if item_a[\'id\'] == item_b[\'id\']:',
        after: 'set_b = {item[\'id\'] for item in list_b}\npairs = [item for item in list_a if item[\'id\'] in set_b]'
      },
      {
        id: 'py-2',
        lineRange: 'Line 8',
        type: 'warning',
        category: 'Optimization',
        message: 'Checking membership in list object takes O(K) complexity, magnifying overall computation. Hash set check is O(1).',
        before: 'if item_a not in pairs:\n    pairs.append(item_a)',
        after: '# Not required if using set/comprehension\npairs = list({item[\'id\']: item for item in pairs}.values())'
      }
    ]
  }
};

export default function Reviewer() {
  const [code, setCode] = useState(examples.javascript.code);
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python' | 'custom'>('javascript');
  
  // Review configuration
  const [auditSecurity, setAuditSecurity] = useState(true);
  const [auditPerformance, setAuditPerformance] = useState(true);
  const [auditStyle, setAuditStyle] = useState(true);

  // Loading analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ReviewResult | null>(null);

  // Selected issue for diff view
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const steps = [
    'Parsing abstract syntax tree (AST)...',
    'Auditing security tokens & memory scopes...',
    'Evaluating control flow & complexity index...',
    'Generating refactored syntax recommendations...'
  ];

  // Load example code
  const handleSelectExample = (lang: 'javascript' | 'typescript' | 'python') => {
    setLanguage(lang);
    setCode(examples[lang].code);
    setAnalysisResult(null);
    setSelectedIssueId(null);
  };

  // Run simulated review
  const handleRunReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisResult(null);
    setSelectedIssueId(null);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const timer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setIsAnalyzing(false);
            
            // Build the result
            let result: ReviewResult;
            if (language !== 'custom' && mockReviews[language]) {
              result = { ...mockReviews[language] };
            } else {
              // Custom code analysis
              const hasAny = code.includes('any');
              const hasEval = code.includes('eval(');
              const hasLoop = code.includes('for ') || code.includes('while ');
              const hasConsole = code.includes('console.log');

              const issues: Issue[] = [];
              if (hasEval) {
                issues.push({
                  id: 'cust-eval',
                  lineRange: 'Line Match',
                  type: 'critical',
                  category: 'Security Risk',
                  message: 'Potential remote code execution vulnerability detected through the use of eval(). Avoid dynamic code execution.',
                  before: 'eval(userInput);',
                  after: 'JSON.parse(userInput); // Or secure schema validation'
                });
              }
              if (hasAny) {
                issues.push({
                  id: 'cust-any',
                  lineRange: 'Line Match',
                  type: 'warning',
                  category: 'Strict Types',
                  message: 'Overuse of type "any" disables compile-time type verification. Specify exact object properties.',
                  before: 'let payload: any = ...',
                  after: 'interface PayloadSchema { id: string; val: number; }\nlet payload: PayloadSchema = ...'
                });
              }
              if (hasLoop) {
                issues.push({
                  id: 'cust-loop',
                  lineRange: 'Line Match',
                  type: 'info',
                  category: 'Complexity Check',
                  message: 'Check iteration bounds to avoid CPU core execution lockups in heavy workflows.',
                  before: 'for (let i = 0; i < arr.length; i++) { ... }',
                  after: 'arr.forEach(element => { ... }); // Or filter/map operations'
                });
              }
              if (hasConsole) {
                issues.push({
                  id: 'cust-log',
                  lineRange: 'Line Match',
                  type: 'info',
                  category: 'Telemetry Clean',
                  message: 'Production build contains console statements. Strip debugging triggers before staging.',
                  before: 'console.log(debugInfo);',
                  after: '// Remove logs or use structured Winston/Pino logger'
                });
              }

              // Default safety issue if no issues found
              if (issues.length === 0) {
                issues.push({
                  id: 'cust-good',
                  lineRange: 'Workspace',
                  type: 'info',
                  category: 'Optimization',
                  message: 'Code conforms to basic lint directives. Added structured export declarations for reusable builds.',
                  before: 'module.exports = { run };',
                  after: 'export const run = () => { ... };'
                });
              }

              const criticals = issues.filter(i => i.type === 'critical').length;
              const warnings = issues.filter(i => i.type === 'warning').length;
              const infos = issues.filter(i => i.type === 'info').length;

              const computedScore = Math.max(10, 100 - (criticals * 25) - (warnings * 12) - (infos * 4));

              result = {
                score: computedScore,
                criticalCount: criticals,
                warningCount: warnings,
                infoCount: infos,
                maintainability: computedScore > 80 ? 'High' : computedScore > 50 ? 'Medium' : 'Low',
                summary: `Custom analysis found ${issues.length} audit recommendations. Review the suggestions below to optimize execution safety and latency bounds.`,
                issues
              };
            }
            
            // Apply checkbox filters
            if (!auditSecurity) {
              result.issues = result.issues.filter(i => i.category !== 'Security' && i.category !== 'Security Risk');
            }
            if (!auditPerformance) {
              result.issues = result.issues.filter(i => i.category !== 'Complexity' && i.category !== 'Memory Leak' && i.category !== 'Complexity Check');
            }
            if (!auditStyle) {
              result.issues = result.issues.filter(i => i.type !== 'info');
            }

            // Recalculate stats
            result.criticalCount = result.issues.filter(i => i.type === 'critical').length;
            result.warningCount = result.issues.filter(i => i.type === 'warning').length;
            result.infoCount = result.issues.filter(i => i.type === 'info').length;
            result.score = Math.max(10, 100 - (result.criticalCount * 25) - (result.warningCount * 12) - (result.infoCount * 4));

            setAnalysisResult(result);
            if (result.issues.length > 0) {
              setSelectedIssueId(result.issues[0].id);
            }
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [isAnalyzing, code, language, auditSecurity, auditPerformance, auditStyle]);

  // Apply suggested fix
  const handleApplyFix = (issue: Issue) => {
    if (!analysisResult) return;

    // Search and replace code snippet
    // Clean up carriage returns to prevent mismatch
    const normalizedCode = code.replace(/\r\n/g, '\n');
    const targetBefore = issue.before.replace(/\r\n/g, '\n');
    const targetAfter = issue.after.replace(/\r\n/g, '\n');

    let updatedCode = normalizedCode;
    if (normalizedCode.includes(targetBefore)) {
      updatedCode = normalizedCode.replace(targetBefore, targetAfter);
    } else {
      // Partial matching logic fallback
      const linesBefore = targetBefore.split('\n')[0].trim();
      const index = normalizedCode.indexOf(linesBefore);
      if (index !== -1) {
        // Simple search index injection
        const beforeLinesCount = targetBefore.split('\n').length;
        const codeLines = normalizedCode.split('\n');
        const searchLines = targetBefore.split('\n');
        
        // Find matching block indices
        let matchIndex = -1;
        for (let i = 0; i <= codeLines.length - searchLines.length; i++) {
          let matches = true;
          for (let j = 0; j < searchLines.length; j++) {
            if (!codeLines[i + j].trim().includes(searchLines[j].trim())) {
              matches = false;
              break;
            }
          }
          if (matches) {
            matchIndex = i;
            break;
          }
        }

        if (matchIndex !== -1) {
          codeLines.splice(matchIndex, beforeLinesCount, targetAfter);
          updatedCode = codeLines.join('\n');
        }
      }
    }

    setCode(updatedCode);

    // Remove fixed issue from results list
    const updatedIssues = analysisResult.issues.filter(i => i.id !== issue.id);
    const criticals = updatedIssues.filter(i => i.type === 'critical').length;
    const warnings = updatedIssues.filter(i => i.type === 'warning').length;
    const infos = updatedIssues.filter(i => i.type === 'info').length;
    const computedScore = Math.min(100, Math.max(10, 100 - (criticals * 25) - (warnings * 12) - (infos * 4)));

    setAnalysisResult({
      ...analysisResult,
      score: computedScore,
      criticalCount: criticals,
      warningCount: warnings,
      infoCount: infos,
      issues: updatedIssues,
      summary: updatedIssues.length > 0 
        ? `Applied refactor fix. ${updatedIssues.length} issues remaining in directory.` 
        : 'All issues successfully resolved! Code quality score is optimal.'
    });

    if (updatedIssues.length > 0) {
      setSelectedIssueId(updatedIssues[0].id);
    } else {
      setSelectedIssueId(null);
    }
  };

  const currentIssue = analysisResult?.issues.find(i => i.id === selectedIssueId);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Code Reviewer</h2>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous static analyzer audits code for security issues, complexity spikes, and best practices.
          </p>
        </div>
      </div>

      {/* Preset Loader */}
      <div className="bg-slate-950/20 border border-slate-800/40 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Buggy Examples:</span>
        <button
          onClick={() => handleSelectExample('javascript')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            language === 'javascript'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
          }`}
        >
          {examples.javascript.name}
        </button>
        <button
          onClick={() => handleSelectExample('typescript')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            language === 'typescript'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
          }`}
        >
          {examples.typescript.name}
        </button>
        <button
          onClick={() => handleSelectExample('python')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            language === 'python'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
          }`}
        >
          {examples.python.name}
        </button>
        <button
          onClick={() => {
            setLanguage('custom');
            setCode('');
            setAnalysisResult(null);
            setSelectedIssueId(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            language === 'custom'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
          }`}
        >
          ⌨ Clear / Paste Custom Code
        </button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Code Input (2 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleRunReview} className="bg-slate-950/40 border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Input Header */}
            <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-slate-400 font-mono ml-3 uppercase tracking-wider">
                  Source editor ({language})
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono">Lines: {code.split('\n').length}</span>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="flex-1 relative font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste target script here to evaluate compiler health..."
                className="w-full h-full bg-slate-950/20 text-slate-300 p-5 focus:outline-none resize-none overflow-y-auto leading-relaxed custom-scrollbar selection:bg-indigo-500/20"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Audit Settings Panel */}
            <div className="p-4 bg-slate-950/70 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={auditSecurity}
                    onChange={(e) => setAuditSecurity(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900"
                  />
                  Security Audit
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={auditPerformance}
                    onChange={(e) => setAuditPerformance(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900"
                  />
                  Complexity Limits
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={auditStyle}
                    onChange={(e) => setAuditStyle(e.target.checked)}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900"
                  />
                  Style & Quality
                </label>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !code.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Code Review'}
              </button>
            </div>
          </form>

          {/* Code Review Progress Banner */}
          {isAnalyzing && (
            <div className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl space-y-4 animate-pulse">
              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-400 font-bold font-mono">Running Static Audit Pipeline...</span>
                <span className="text-slate-500 font-semibold">{Math.round(((analysisStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium font-mono">
                {steps[analysisStep]}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Results & Diff viewer (2 cols if no issues, else 2 cols layout) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Welcome Placeholder */}
          {!isAnalyzing && !analysisResult && (
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-8 text-center h-[520px] flex flex-col justify-center items-center">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-200">No active review</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                Paste your custom script or load a preset example then click <span className="text-indigo-400 font-bold">Run Code Review</span> to audit file quality.
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {!isAnalyzing && analysisResult && (
            <div className="space-y-6">
              {/* Score summary card */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between gap-6">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Health Rating</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{analysisResult.score}</span>
                    <span className="text-xs text-slate-500 font-bold">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      analysisResult.score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : analysisResult.score >= 50
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {analysisResult.score >= 80 ? 'Good Code' : analysisResult.score >= 50 ? 'Needs Work' : 'Risky Code'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Maintainability: <strong className="text-slate-300">{analysisResult.maintainability}</strong>
                    </span>
                  </div>
                </div>

                {/* Score wheel circle */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="transparent" 
                      stroke={analysisResult.score >= 80 ? '#10b981' : analysisResult.score >= 50 ? '#f59e0b' : '#f43f5e'} 
                      strokeWidth="3" 
                      strokeDasharray={`${analysisResult.score} 100`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-slate-300">{analysisResult.score}%</span>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Critical</p>
                  <p className={`text-lg font-bold mt-1 ${analysisResult.criticalCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {analysisResult.criticalCount}
                  </p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Warnings</p>
                  <p className={`text-lg font-bold mt-1 ${analysisResult.warningCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {analysisResult.warningCount}
                  </p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Optimizations</p>
                  <p className={`text-lg font-bold mt-1 ${analysisResult.infoCount > 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {analysisResult.infoCount}
                  </p>
                </div>
              </div>

              {/* Summary message */}
              <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
                {analysisResult.summary}
              </div>

              {/* Issue list */}
              {analysisResult.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Audit Findings</h4>
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    {analysisResult.issues.map((issue) => (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 block ${
                          selectedIssueId === issue.id
                            ? 'bg-slate-950/80 border-slate-700 shadow-md'
                            : 'bg-slate-950/20 border-slate-850 hover:bg-slate-950/40 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            issue.type === 'critical'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : issue.type === 'warning'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {issue.category}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono font-semibold">{issue.lineRange}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-200 mt-2 truncate">{issue.message}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/25 p-6 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                    ✔
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">No issues found!</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Your code conforms fully to target metrics. No critical errors or vulnerabilities were detected.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Diff Comparison & Recommendations (Full Width below editor) */}
      {!isAnalyzing && analysisResult && currentIssue && (
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Refactor Recommendation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed comparison of current implementation vs optimized code.
              </p>
            </div>
            
            <button
              onClick={() => handleApplyFix(currentIssue)}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors focus:outline-none"
            >
              Apply Refactor Fix
            </button>
          </div>

          {/* Description & Explanation */}
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-indigo-400">Diagnosis:</h4>
            <p className="text-slate-300 leading-relaxed">
              {currentIssue.message}
            </p>
          </div>

          {/* Diff Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Before (Buggy Code) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Current Block</span>
              <div className="bg-slate-950 border border-rose-500/10 rounded-xl p-4 font-mono text-xs overflow-x-auto text-rose-200 min-h-[120px] flex items-center leading-relaxed">
                <pre className="w-full">
                  {currentIssue.before.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className="text-rose-500/40 select-none">-</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* After (Optimized Code) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Optimized Suggestion</span>
              <div className="bg-slate-950 border border-emerald-500/10 rounded-xl p-4 font-mono text-xs overflow-x-auto text-emerald-200 min-h-[120px] flex items-center leading-relaxed">
                <pre className="w-full">
                  {currentIssue.after.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className="text-emerald-500/40 select-none">+</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

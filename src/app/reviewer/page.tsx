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

interface HistoryItem {
  id: string;
  timestamp: string;
  language: string;
  score: number;
  code: string;
  result: ReviewResult;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface PullRequest {
  id: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'draft' | 'checking' | 'ready' | 'merging' | 'merged';
  modifiedFiles: string[];
  ciLogs: string[];
  ciChecks: {
    lint: 'pending' | 'running' | 'success' | 'failed';
    security: 'pending' | 'running' | 'success' | 'failed';
    tests: 'pending' | 'running' | 'success' | 'failed';
  };
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
  },
  cache: {
    score: 55,
    criticalCount: 1,
    warningCount: 1,
    infoCount: 0,
    maintainability: 'Medium',
    summary: 'Memory leak hazard found in cache. Unbounded logs accumulation will exceed Node process execution boundaries under high throughput.',
    issues: [
      {
        id: 'cache-1',
        lineRange: 'Line 6',
        type: 'critical',
        category: 'Memory Leak',
        message: 'Unbounded array `logs` grows continuously. Since this array is globally scoped, the garbage collector cannot clean it up, leading to OOM crash.',
        before: 'const logs = [];\n\nfunction addToCache(key, value) {\n  logs.push({ key, value, timestamp: Date.now() });',
        after: '// Use bounded cache libraries or Redis for logging persistence\nconst logs = []; // Keep logs local or prune periodically\nfunction addToCache(key, value) {\n  if (logs.length >= 100) logs.shift(); // Bound memory consumption\n  logs.push({ key, value, timestamp: Date.now() });'
      },
      {
        id: 'cache-2',
        lineRange: 'Line 5',
        type: 'warning',
        category: 'Style & Quality',
        message: 'Global variable cache is mutable and not guarded against concurrency. Wrap in a thread-safe structure or use private scopes.',
        before: 'const cache = {};',
        after: 'const cache = new Map();'
      }
    ]
  },
  package: {
    score: 76,
    criticalCount: 0,
    warningCount: 2,
    infoCount: 0,
    maintainability: 'High',
    summary: 'Dependency vulnerabilities found. Axios version has high-risk security flaws (CVE-2021-3749) that can expose application endpoints to SSRF.',
    issues: [
      {
        id: 'package-1',
        lineRange: 'Line 5',
        type: 'warning',
        category: 'Security Risk',
        message: 'Axios 0.21.1 has a high vulnerability to SSRF. Upgrade dependency target to >= 0.21.2 to receive security patch.',
        before: '"axios": "0.21.1",',
        after: '"axios": "^0.21.4",'
      },
      {
        id: 'package-2',
        lineRange: 'Line 6',
        type: 'warning',
        category: 'Security Risk',
        message: 'Express 4.17.1 has multiple security vulnerability issues. Upgrade to stable v4.19.2+ or v5.0.0.',
        before: '"express": "4.17.1",',
        after: '"express": "^4.19.2",'
      }
    ]
  },
  auth: {
    score: 42,
    criticalCount: 2,
    warningCount: 0,
    infoCount: 1,
    maintainability: 'Low',
    summary: 'Critical security vulnerability: JWT signing secret key is hardcoded directly in code, exposing key signing capabilities if git repositories leak.',
    issues: [
      {
        id: 'auth-1',
        lineRange: 'Line 4',
        type: 'critical',
        category: 'Security',
        message: 'Exposed credentials threat. Hardcoding secret keys allows key leaks via repository exposure. Pull secrets from environment configurations.',
        before: 'const JWT_SECRET = "super-secret-key-12345-never-share";',
        after: 'const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET environment variable is missing!"); })();'
      },
      {
        id: 'auth-2',
        lineRange: 'Line 6',
        type: 'critical',
        category: 'Strict Types',
        message: 'Type "any" disables TypeScript compilation type safety checks. Use explicit user payload interface/type.',
        before: 'export function generateToken(payload: any) {',
        after: 'interface UserJWTPayload { id: string; role: string; email: string; }\nexport function generateToken(payload: UserJWTPayload) {'
      }
    ]
  }
};

const getSimulatedResponse = (question: string, issue: Issue): string => {
  const q = question.toLowerCase();

  if (q.includes('why') || q.includes('reason') || q.includes('explain') || q.includes('flag')) {
    if (issue.category === 'Security' || issue.category === 'Security Risk') {
      return `This is marked as a critical security issue because direct interpolation of user inputs into commands (like SQL or system commands) bypasses parameterized shielding. An attacker can append inputs like "1 OR 1=1" to view unauthorized database tables, or execute payloads that delete database nodes. By using parameterized queries, the database engine treats input strictly as data, never executable statements.`;
    }
    if (issue.category === 'Memory Leak') {
      return `A memory leak occurs because JavaScript's garbage collector only releases objects when there are no active references to them. Since the requestLogs array is defined in the global scope, it is never collected. Every HTTP call appends a new object, continuously increasing heap usage until the node process runs out of memory (OOM crash). Bounded caches like LRU automatically prune old keys to maintain a stable memory footprint.`;
    }
    if (issue.category === 'Complexity' || issue.category === 'Complexity Check') {
      return `Double nested loops cause O(N^2) complexity because for every single item in the first list, we must iterate through the entire second list. If both lists have 10,000 items, that is 100,000,000 operations! By indexing the second list into a hash set first, checking presence becomes a constant-time O(1) operation, reducing the total lookup to linear O(N) time.`;
    }
    return `This issue was flagged because the current code structure creates execution risks, poor maintainability, or suboptimal performance. Refactoring it simplifies the call stack and ensures the compiler can optimize the execution path.`;
  }

  if (q.includes('alternative') || q.includes('other') || q.includes('different') || q.includes('else')) {
    if (issue.category === 'Security' || issue.category === 'Security Risk') {
      return `Yes, an alternative approach is to use an Object-Relational Mapper (ORM) like Prisma, Sequelize, or Mongoose. ORMs automatically parameterize queries under the hood. For example:
\`\`\`javascript
const user = await db.user.findUnique({ where: { id } });
\`\`\`
This completely eliminates manual SQL syntax hazards!`;
    }
    if (issue.category === 'Complexity') {
      return `In Python, you can also use set intersection directly to extract matched objects, which is highly readable and extremely fast:
\`\`\`python
# Alternative set intersection
keys_a = set(item['id'] for item in list_a)
keys_b = set(item['id'] for item in list_b)
common_ids = keys_a.intersection(keys_b)
pairs = [item for item in list_a if item['id'] in common_ids]
\`\`\``;
    }
    return `Alternatively, you could abstract this logic into a helper utility or use a robust middleware library to intercept errors or validate shapes at the boundaries of your system.`;
  }

  if (q.includes('how') && q.includes('fix')) {
    return `To apply the fix, you can click the "Apply Refactor Fix" button at the top right of this panel. This will automatically parse the file and substitute the buggy block with the optimized code shown in the diff comparison.`;
  }

  // Fallback response
  return `That's a great question! For this particular issue (${issue.category}), it is recommended to replace the current syntax with the suggested code block because it enhances code safety, aligns with standard linter directives, and prevents potential runtime exceptions. Let me know if you would like me to detail any specific line of the suggestion!`;
};

export default function Reviewer() {
  // Mock Workspace files
  const [workspaceFiles, setWorkspaceFiles] = useState<{
    [path: string]: {
      name: string;
      path: string;
      language: 'javascript' | 'typescript' | 'python' | 'custom';
      code: string;
      originalCode: string;
      result: ReviewResult | null;
      status: 'idle' | 'clean' | 'warning' | 'critical';
    }
  }>({
    'src/utils/db.js': {
      name: 'db.js',
      path: 'src/utils/db.js',
      language: 'javascript',
      code: examples.javascript.code,
      originalCode: examples.javascript.code,
      result: null,
      status: 'idle'
    },
    'src/services/cache.js': {
      name: 'cache.js',
      path: 'src/services/cache.js',
      language: 'javascript',
      code: `// Express memory cache leaky implementation
const cache = {};
const logs = [];

function addToCache(key, value) {
  // leak: unbounded array grows continuously
  logs.push({ key, value, timestamp: Date.now() });
  cache[key] = value;
}`,
      originalCode: `// Express memory cache leaky implementation
const cache = {};
const logs = [];

function addToCache(key, value) {
  // leak: unbounded array grows continuously
  logs.push({ key, value, timestamp: Date.now() });
  cache[key] = value;
}`,
      result: null,
      status: 'idle'
    },
    'src/routes/auth.ts': {
      name: 'auth.ts',
      path: 'src/routes/auth.ts',
      language: 'typescript',
      code: `// Token verification service with exposed signing key
import jwt from 'jsonwebtoken';

const JWT_SECRET = "super-secret-key-12345-never-share"; // Exposed Secret!

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}`,
      originalCode: `// Token verification service with exposed signing key
import jwt from 'jsonwebtoken';

const JWT_SECRET = "super-secret-key-12345-never-share"; // Exposed Secret!

export function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}`,
      result: null,
      status: 'idle'
    },
    'src/helpers/utils.py': {
      name: 'utils.py',
      path: 'src/helpers/utils.py',
      language: 'python',
      code: examples.python.code,
      originalCode: examples.python.code,
      result: null,
      status: 'idle'
    },
    'package.json': {
      name: 'package.json',
      path: 'package.json',
      language: 'custom',
      code: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "axios": "0.21.1",
    "express": "4.17.1",
    "jsonwebtoken": "8.5.1"
  }
}`,
      originalCode: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "axios": "0.21.1",
    "express": "4.17.1",
    "jsonwebtoken": "8.5.1"
  }
}`,
      result: null,
      status: 'idle'
    },
    'custom.txt': {
      name: 'custom.txt',
      path: 'custom.txt',
      language: 'custom',
      code: '',
      originalCode: '',
      result: null,
      status: 'idle'
    }
  });

  const [selectedFilePath, setSelectedFilePath] = useState<string>('src/utils/db.js');
  const [code, setCode] = useState(examples.javascript.code);
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python' | 'custom'>('javascript');

  // Review configuration
  const [auditSecurity, setAuditSecurity] = useState(true);
  const [auditPerformance, setAuditPerformance] = useState(true);
  const [auditStyle, setAuditStyle] = useState(true);

  // Selected AI Model
  const [selectedModel, setSelectedModel] = useState<'gemini-flash' | 'gemini-pro' | 'claude-sonnet'>('gemini-flash');

  // Loading analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuditingAll, setIsAuditingAll] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ReviewResult | null>(null);

  // Selected issue for diff view
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Copy suggestion state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Git & PR Simulation States
  const [activeTab, setActiveTab] = useState<'editor' | 'pr'>('editor');
  const [activePR, setActivePR] = useState<PullRequest | null>(null);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Helper selectors
  const modifiedFilesList = Object.entries(workspaceFiles)
    .filter(([path, file]) => file.code.trim() !== file.originalCode.trim())
    .map(([path]) => path);

  const hasModifiedFiles = modifiedFilesList.length > 0;

  // Recent reviews history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Interactive Explainer Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Console logs state
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Load workspace file into editor
  useEffect(() => {
    const file = workspaceFiles[selectedFilePath];
    if (file) {
      setCode(file.code);
      setLanguage(file.language);
      setAnalysisResult(file.result);
      if (file.result && file.result.issues.length > 0) {
        setSelectedIssueId(file.result.issues[0].id);
      } else {
        setSelectedIssueId(null);
      }
    }
  }, [selectedFilePath]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setWorkspaceFiles(prev => ({
      ...prev,
      [selectedFilePath]: {
        ...prev[selectedFilePath],
        code: newCode
      }
    }));
  };

  const handleCopyCode = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const steps = isAuditingAll
    ? [
      'Auditing src/utils/db.js (SQL & Leaks)...',
      'Auditing src/services/cache.js (Memory Cache Leaks)...',
      'Auditing src/routes/auth.ts (Exposed Credentials)...',
      'Auditing src/helpers/utils.py (Linear Optimization)...',
      'Auditing package.json (Dependency Vulnerability Scans)...'
    ]
    : selectedModel === 'gemini-pro'
      ? [
        'Initializing deep neural parser...',
        'Auditing memory vectors & potential leaks...',
        'Evaluating AST tree & computational complexity...',
        'Structuring secure refactoring nodes...',
        'Generating deep optimized recommendations...'
      ]
      : selectedModel === 'claude-sonnet'
        ? [
          'Compiling tokens & imports...',
          'Auditing security boundary vectors...',
          'Verifying lint constraints & standards...',
          'Refining model output alignment...',
          'Assembling syntax diff recommendations...'
        ]
        : [ // gemini-flash
          'Parsing code tree...',
          'Auditing security & memory leaks...',
          'Generating fast suggestions...'
        ];

  const stepDelay = isAuditingAll
    ? 600
    : selectedModel === 'gemini-pro'
      ? 700
      : selectedModel === 'claude-sonnet'
        ? 1000
        : 500;

  // Load example code
  const handleSelectExample = (lang: 'javascript' | 'typescript' | 'python') => {
    setLanguage(lang);
    setCode(examples[lang].code);
    setAnalysisResult(null);
    setSelectedIssueId(null);
  };

  // Run workspace-wide audit
  const handleRunWorkspaceAudit = () => {
    setIsAnalyzing(true);
    setIsAuditingAll(true);
    setAnalysisStep(0);
    setAnalysisResult(null);
    setSelectedIssueId(null);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setConsoleLogs([
      `[${timestamp}] [SYSTEM] Workspace audit initiated.`,
      `[${timestamp}] [SYSTEM] Searching directories for source files... Found 5 target files.`,
      `[${timestamp}] [SYSTEM] Active Model: ${selectedModel.toUpperCase()}. Initializing worker threads...`,
    ]);
  };

  // Run simulated review
  const handleRunReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setIsAuditingAll(false);
    setAnalysisStep(0);
    setAnalysisResult(null);
    setSelectedIssueId(null);

    // Initialize telemetry logs
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setConsoleLogs([
      `[${timestamp}] [SYSTEM] Pipeline initialization request received.`,
      `[${timestamp}] [SYSTEM] Target model: ${selectedModel.toUpperCase()}`,
      `[${timestamp}] [SYSTEM] Buffer size: ${code.length} characters. AST tokenizer warm-up started.`,
    ]);
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    const timer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setIsAnalyzing(false);

            if (isAuditingAll) {
              setIsAuditingAll(false);

              // Populate all files results
              setWorkspaceFiles(prevFiles => {
                const updated = { ...prevFiles };

                updated['src/utils/db.js'].result = { ...mockReviews.javascript };
                updated['src/utils/db.js'].status = 'critical';

                updated['src/services/cache.js'].result = { ...mockReviews.cache };
                updated['src/services/cache.js'].status = 'critical';

                updated['src/routes/auth.ts'].result = { ...mockReviews.auth };
                updated['src/routes/auth.ts'].status = 'critical';

                updated['src/helpers/utils.py'].result = { ...mockReviews.python };
                updated['src/helpers/utils.py'].status = 'warning';

                updated['package.json'].result = { ...mockReviews.package };
                updated['package.json'].status = 'warning';

                return updated;
              });

              // Set active file results
              const currentFileKey =
                selectedFilePath === 'src/utils/db.js' ? 'javascript' :
                  selectedFilePath === 'src/services/cache.js' ? 'cache' :
                    selectedFilePath === 'src/routes/auth.ts' ? 'auth' :
                      selectedFilePath === 'src/helpers/utils.py' ? 'python' :
                        'package';

              const currentFileResult = mockReviews[currentFileKey];
              setAnalysisResult(currentFileResult);
              if (currentFileResult.issues.length > 0) {
                setSelectedIssueId(currentFileResult.issues[0].id);
              }

              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setConsoleLogs(prevLogs => [
                ...prevLogs,
                `[${timestamp}] [SYSTEM] Workspace audit completed successfully.`,
                `[${timestamp}] [SYSTEM] 5 files scanned. 3 critical issues, 4 warnings identified.`
              ]);

            } else {
              // Build the result for single file
              let result: ReviewResult;
              if (selectedFilePath === 'src/utils/db.js') {
                result = { ...mockReviews.javascript };
              } else if (selectedFilePath === 'src/services/cache.js') {
                result = { ...mockReviews.cache };
              } else if (selectedFilePath === 'src/routes/auth.ts') {
                result = { ...mockReviews.auth };
              } else if (selectedFilePath === 'src/helpers/utils.py') {
                result = { ...mockReviews.python };
              } else if (selectedFilePath === 'package.json') {
                result = { ...mockReviews.package };
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

              // Save to workspace file result
              setWorkspaceFiles(prevFiles => ({
                ...prevFiles,
                [selectedFilePath]: {
                  ...prevFiles[selectedFilePath],
                  result: result,
                  status: result.issues.length > 0
                    ? (result.issues.some(i => i.type === 'critical') ? 'critical' : 'warning')
                    : 'clean'
                }
              }));

              // Append to history log
              const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setHistory(prev => [
                {
                  id: Date.now().toString(),
                  timestamp,
                  language,
                  score: result.score,
                  code,
                  result
                },
                ...prev
              ]);

              // Terminal completion log
              setConsoleLogs(prev => [
                ...prev,
                `[${timestamp}] [SYSTEM] Audit completed successfully. Quality score determined: ${result.score}/100.`,
                `[${timestamp}] [SYSTEM] Found ${result.issues.length} audit recommendations. Ready.`
              ]);
            }
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, stepDelay);

    return () => clearInterval(timer);
  }, [isAnalyzing, code, language, auditSecurity, auditPerformance, auditStyle, selectedModel, steps.length, stepDelay, isAuditingAll, selectedFilePath]);

  // Dynamic telemetry log streaming
  useEffect(() => {
    if (!isAnalyzing) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (selectedModel === 'gemini-pro') {
      const proLogs = [
        `[${timestamp}] [PARSER] Generating syntax mappings... Found ${code.split('\n').length} lines.`,
        `[${timestamp}] [SECURITY] Scanning variables against injection and memory vectors...`,
        `[${timestamp}] [COMPLEXITY] Evaluating loop depths... Calculating cyclomatic indices.`,
        `[${timestamp}] [OPTIMIZER] Synthesizing nodes... Matching structural templates.`,
        `[${timestamp}] [COMPILER] Validation complete. Suggestion payloads generated.`
      ];
      if (proLogs[analysisStep]) {
        setConsoleLogs(prev => [...prev, proLogs[analysisStep]]);
      }
    } else if (selectedModel === 'claude-sonnet') {
      const claudeLogs = [
        `[${timestamp}] [LOADER] Inspecting imports and scoping definitions...`,
        `[${timestamp}] [VULN] Checking sensitive API boundaries and memory allocators...`,
        `[${timestamp}] [LINT] Enforcing styling norms, spacing, and strict annotations...`,
        `[${timestamp}] [MODEL] Re-aligning AST parameters... Checking context bounds.`,
        `[${timestamp}] [SYSTEM] Complete. Finalizing differences.`
      ];
      if (claudeLogs[analysisStep]) {
        setConsoleLogs(prev => [...prev, claudeLogs[analysisStep]]);
      }
    } else { // gemini-flash
      const flashLogs = [
        `[${timestamp}] [FAST] Scanning source tokens...`,
        `[${timestamp}] [FAST] Auditing security counters and structure patterns...`,
        `[${timestamp}] [FAST] Completed review recommendations.`
      ];
      if (flashLogs[analysisStep]) {
        setConsoleLogs(prev => [...prev, flashLogs[analysisStep]]);
      }
    }
  }, [analysisStep, isAnalyzing, selectedModel]);

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

  // Submit Pull Request
  const handleSubmitPR = () => {
    if (!prTitle.trim() || !prDescription.trim()) return;

    const newPR: PullRequest = {
      id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: prTitle,
      description: prDescription,
      sourceBranch: 'feature/ai-reviewer',
      targetBranch: 'master',
      status: 'draft',
      modifiedFiles: [...modifiedFilesList],
      ciLogs: [
        `[SYSTEM] [${new Date().toLocaleTimeString()}] Pull Request session created.`,
        `[SYSTEM] [${new Date().toLocaleTimeString()}] Source: feature/ai-reviewer, Target: master`,
        `[SYSTEM] [${new Date().toLocaleTimeString()}] Files changed: ${modifiedFilesList.join(', ')}`,
        `[SYSTEM] [${new Date().toLocaleTimeString()}] Waiting for CI/CD checks execution.`
      ],
      ciChecks: {
        lint: 'pending',
        security: 'pending',
        tests: 'pending'
      }
    };

    setActivePR(newPR);
    setIsPRModalOpen(false);
    setActiveTab('pr');
  };

  // Run CI/CD Pipeline Suite
  const runCICDSuite = () => {
    if (!activePR) return;

    setActivePR(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'checking',
        ciChecks: {
          lint: 'running',
          security: 'running',
          tests: 'pending'
        },
        ciLogs: [
          ...prev.ciLogs,
          `[SYSTEM] [${new Date().toLocaleTimeString()}] Starting CI/CD automated runner suite...`,
          `[SYSTEM] [${new Date().toLocaleTimeString()}] [Stage 1/3] Security vulnerability auditor started.`
        ]
      };
    });

    const stepsList = [
      () => {
        // Stage 1 complete, start Stage 2
        setActivePR(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ciChecks: {
              ...prev.ciChecks,
              security: 'success',
              lint: 'running'
            },
            ciLogs: [
              ...prev.ciLogs,
              `[SUCCESS] [${new Date().toLocaleTimeString()}] Security scan clean. 0 vulnerabilities found.`,
              `[SYSTEM] [${new Date().toLocaleTimeString()}] [Stage 2/3] Code style linting analysis started.`
            ]
          };
        });
      },
      () => {
        // Stage 2 complete, start Stage 3
        setActivePR(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ciChecks: {
              ...prev.ciChecks,
              lint: 'success',
              tests: 'running'
            },
            ciLogs: [
              ...prev.ciLogs,
              `[SUCCESS] [${new Date().toLocaleTimeString()}] Linter checks passed. Spacing & annotations verified.`,
              `[SYSTEM] [${new Date().toLocaleTimeString()}] [Stage 3/3] Executing workspace unit tests...`
            ]
          };
        });
      },
      () => {
        // Stage 3 complete, PR Ready
        setActivePR(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'ready',
            ciChecks: {
              ...prev.ciChecks,
              tests: 'success'
            },
            ciLogs: [
              ...prev.ciLogs,
              `[SUCCESS] [${new Date().toLocaleTimeString()}] All 14 automated unit tests completed successfully.`,
              `[SYSTEM] [${new Date().toLocaleTimeString()}] Build verification successful. Pull Request status: READY FOR MERGE.`
            ]
          };
        });
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setActivePR(prev => {
        if (!prev) {
          clearInterval(interval);
          return null;
        }
        return prev;
      });
      if (currentStep < stepsList.length) {
        stepsList[currentStep]();
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
  };

  // Merge Pull Request
  const handleMergePR = () => {
    if (!activePR || activePR.status !== 'ready') return;

    setActivePR(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'merging',
        ciLogs: [...prev.ciLogs, `[SYSTEM] [${new Date().toLocaleTimeString()}] Merging pull request...`]
      };
    });

    setTimeout(() => {
      setWorkspaceFiles(prev => {
        const updated = { ...prev };
        activePR.modifiedFiles.forEach(path => {
          if (updated[path]) {
            updated[path].originalCode = updated[path].code;
          }
        });
        return updated;
      });
      setActivePR(prev => prev ? { ...prev, status: 'merged' } : null);
      setActiveTab('editor');
    }, 2500);
  };

  const currentIssue = analysisResult?.issues.find(i => i.id === selectedIssueId);

  const handleExportReport = () => {
    if (!analysisResult) return;

    const time = new Date().toLocaleString();
    const mdContent = `# AI Code Review Audit Report
Generated on: ${time}
AI Model: ${selectedModel === 'gemini-flash' ? 'Gemini 3.5 Flash' : selectedModel === 'gemini-pro' ? 'Gemini 3.5 Pro' : 'Claude 3.5 Sonnet'}
Language: ${language.toUpperCase()}
Quality Score: ${analysisResult.score}/100
Maintainability Index: ${analysisResult.maintainability}

## Summary
${analysisResult.summary}

## Issue Breakdown
- **Critical Issues:** ${analysisResult.criticalCount}
- **Warnings:** ${analysisResult.warningCount}
- **Optimization Suggestions:** ${analysisResult.infoCount}

## Detailed Findings
${analysisResult.issues.map((issue, index) => `
### ${index + 1}. [${issue.type.toUpperCase()}] ${issue.category} - ${issue.lineRange}
**Diagnosis:**
${issue.message}

**Code Diff:**
\`\`\`diff
- ${issue.before.split('\n').join('\n- ')}
+ ${issue.after.split('\n').join('\n+ ')}
\`\`\`
`).join('\n')}

---
*Report generated by Antigravity AI Code Reviewer.*`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Code_Review_Report_${language}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendChatMessage = (text: string) => {
    if (!text.trim() || isChatTyping || !currentIssue) return;

    const userMessage: ChatMessage = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatTyping(true);

    setTimeout(() => {
      const replyText = getSimulatedResponse(text, currentIssue);
      setChatMessages(prev => [...prev, { sender: 'ai', text: replyText }]);
      setIsChatTyping(false);
    }, 1200);
  };

  // Reset/Initialize Chat History when selected issue changes
  useEffect(() => {
    if (currentIssue) {
      setChatMessages([
        {
          sender: 'ai',
          text: `Hello! I've flagged this line range (${currentIssue.lineRange}) as a **${currentIssue.type}** severity issue in the **${currentIssue.category}** category. How can I help you understand this diagnosis or explore other ways to fix it?`
        }
      ]);
    } else {
      setChatMessages([]);
    }
  }, [selectedIssueId]);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Code Reviewer</h2>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous static analyzer audits code for security issues, complexity spikes, and best practices.
          </p>
        </div>

        {/* Tab Selection Switcher (Only visible if activePR is present) */}
        {activePR && (
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 Code Workspace
            </button>
            <button
              onClick={() => setActiveTab('pr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pr'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔀 Pull Request
              <span className={`inline-block w-2 h-2 rounded-full ${
                activePR.status === 'ready'
                  ? 'bg-emerald-400 animate-pulse'
                  : activePR.status === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-indigo-400'
              }`} />
            </button>
          </div>
        )}
      </div>

      {/* Preset Loader */}
      <div className="bg-slate-950/20 border border-slate-800/40 p-4 rounded-2xl flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Buggy Examples:</span>
        <button
          onClick={() => setSelectedFilePath('src/utils/db.js')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedFilePath === 'src/utils/db.js'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
            }`}
        >
          {examples.javascript.name}
        </button>
        <button
          onClick={() => setSelectedFilePath('src/routes/auth.ts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedFilePath === 'src/routes/auth.ts'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
            }`}
        >
          {examples.typescript.name}
        </button>
        <button
          onClick={() => setSelectedFilePath('src/helpers/utils.py')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedFilePath === 'src/helpers/utils.py'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
            }`}
        >
          {examples.python.name}
        </button>
        <button
          onClick={() => setSelectedFilePath('custom.txt')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${selectedFilePath === 'custom.txt'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow'
              : 'bg-slate-950/50 text-slate-400 border-slate-850 hover:text-slate-300'
            }`}
        >
          ⌨ Clear / Paste Custom Code
        </button>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Workspace Sidebar (File Tree) */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex flex-col space-y-4 h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Files</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">5 files</span>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {Object.entries(workspaceFiles).map(([path, file]) => {
              const isActive = selectedFilePath === path;
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => setSelectedFilePath(path)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group cursor-pointer ${isActive
                      ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-semibold shadow-sm'
                      : 'border border-transparent hover:bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2 text-xs truncate">
                    <span className="text-xs shrink-0 select-none">
                      {file.language === 'python' ? '🐍' : file.language === 'typescript' ? '🟦' : file.language === 'javascript' ? '🟨' : '📄'}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="truncate text-[10px] leading-tight font-medium">{file.name}</p>
                        {file.code.trim() !== file.originalCode.trim() && (
                          <span className="text-[8px] bg-amber-500/15 text-amber-400 px-1 rounded font-bold shrink-0">
                            M
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[8px] text-slate-500 font-mono mt-0.5">{file.path}</p>
                    </div>
                  </div>

                  {/* Audit status badge dots */}
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${file.status === 'clean'
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                      : file.status === 'warning'
                        ? 'bg-amber-500 shadow-sm shadow-amber-500/30'
                        : file.status === 'critical'
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/30'
                          : 'bg-slate-800'
                    }`} />
                </button>
              );
            })}
          </div>

          {/* Run Workspace Audit Button */}
          <button
            type="button"
            onClick={handleRunWorkspaceAudit}
            disabled={isAnalyzing}
            className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 disabled:bg-slate-950 disabled:border-slate-900 text-white font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Scan Workspace</span>
            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Conditional Git Simulator Buttons */}
          {activePR ? (
            <button
              type="button"
              onClick={() => setActiveTab('pr')}
              className="w-full bg-indigo-600/10 border border-indigo-500/35 hover:bg-indigo-600/20 text-indigo-300 font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/20"
            >
              <span>📂 View Active PR</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </button>
          ) : (
            hasModifiedFiles && (
              <button
                type="button"
                onClick={() => {
                  setPrTitle(`fix: resolve quality audits across ${modifiedFilesList.length} files`);
                  setIsPRModalOpen(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 animate-fade-in"
              >
                <span>🚀 Create Pull Request</span>
                <span className="bg-emerald-700/60 px-1.5 rounded text-[8px] font-bold">
                  {modifiedFilesList.length}
                </span>
              </button>
            )
          )}
        </div>

        {/* Middle Column: Code Input (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'pr' && activePR ? (
            /* PR SIMULATION VIEW */
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 h-[520px] overflow-y-auto custom-scrollbar flex flex-col space-y-6 animate-fade-in">
              {/* Header metadata */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-mono">
                    {activePR.id}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-850">{activePR.sourceBranch}</span>
                    <span>→</span>
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-850">{activePR.targetBranch}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider text-center min-w-[70px] ${
                  activePR.status === 'merged'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : activePR.status === 'ready'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse font-extrabold'
                      : activePR.status === 'checking'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse font-extrabold'
                        : activePR.status === 'merging'
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                }`}>
                  {activePR.status}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5 shrink-0">
                <h3 className="text-base font-bold text-slate-100">{activePR.title}</h3>
                <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 text-xs text-slate-400 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                  {activePR.description}
                </div>
              </div>

              {/* Modified Files list & diff previews */}
              <div className="flex-1 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Modified Files & Diff Previews</h4>
                <div className="space-y-3">
                  {activePR.modifiedFiles.map(path => {
                    const file = workspaceFiles[path];
                    if (!file) return null;
                    return (
                      <div key={path} className="border border-slate-900 bg-slate-950/20 rounded-xl overflow-hidden">
                        <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-900 flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-300 font-bold">{path}</span>
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">MODIFIED</span>
                        </div>
                        <div className="p-4 font-mono text-[10px] overflow-x-auto text-slate-400 leading-relaxed bg-slate-950/30 max-h-32 overflow-y-auto custom-scrollbar">
                          {/* simple diff comparison representation */}
                          <div className="text-rose-400/90 line-through opacity-60 truncate">
                            - {file.originalCode.split('\n')[0] || '// original file content...'}
                          </div>
                          <div className="text-emerald-400/95 font-semibold truncate">
                            + {file.code.split('\n')[0] || '// modified code block applied...'}
                          </div>
                          <div className="text-slate-600 text-[8px] mt-1.5 italic">
                            ... file contains {file.code.split('\n').length} lines total
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* NORMAL SOURCE EDITOR VIEW */}
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
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="// Paste target script here to evaluate compiler health..."
                    className="w-full h-full bg-slate-950/20 text-slate-300 p-5 focus:outline-none resize-none overflow-y-auto leading-relaxed custom-scrollbar selection:bg-indigo-500/20"
                    style={{ tabSize: 2 }}
                  />
                </div>

                {/* Audit Settings Panel */}
                <div className="p-4 bg-slate-950/70 border-t border-slate-850 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
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

                    <div className="h-4 w-px bg-slate-800/80 hidden sm:block" />

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Model:</span>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as any)}
                        className="bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="gemini-flash">Gemini 3.5 Flash</option>
                        <option value="gemini-pro">Gemini 3.5 Pro</option>
                        <option value="claude-sonnet">Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing || !code.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
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

              {/* Telemetry Log Terminal */}
              {(isAnalyzing || consoleLogs.length > 0) && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 font-mono text-[10px] leading-relaxed shadow-lg flex flex-col h-[200px] space-y-3">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5 text-slate-500 select-none">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Telemetry Log Terminal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConsoleLogs([])}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {/* Terminal Stream */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-emerald-400/90 font-mono pr-1 select-text">
                    {consoleLogs.map((log, i) => {
                      let colorClass = "text-emerald-400/90";
                      if (log.includes("[WARN]")) colorClass = "text-amber-400/90";
                      if (log.includes("[ERROR]") || log.includes("[VULN]") || log.includes("[SECURITY]")) colorClass = "text-rose-400/90";
                      if (log.includes("[SYSTEM]")) colorClass = "text-indigo-400/95 font-semibold";
                      return (
                        <div key={i} className={`whitespace-pre-wrap ${colorClass}`}>
                          {log}
                        </div>
                      );
                    })}
                    {isAnalyzing && (
                      <div className="text-slate-500 animate-pulse flex items-center gap-1.5">
                        <span>$ awaiting next packet</span>
                        <span className="w-1.5 h-3.5 bg-slate-500 inline-block" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Results & Diff viewer (2 cols if no issues, else 2 cols layout) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'pr' && activePR ? (
            /* CI/CD PIPELINE SUITE PANEL & TELEMETRY LOGS */
            <div className="space-y-6 animate-fade-in">
              {/* Pipeline Status Check Card */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CI/CD Pipeline Status</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">3 Stages</span>
                </div>

                {/* Pipeline Steps */}
                <div className="space-y-4">
                  {/* Step 1: Security Audit */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activePR.ciChecks.security === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : activePR.ciChecks.security === 'running'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-900 text-slate-500 border border-slate-850'
                      }`}>
                        {activePR.ciChecks.security === 'success' ? '✔' : '1'}
                      </div>
                      <span className={`text-xs font-semibold ${
                        activePR.ciChecks.security === 'success' ? 'text-slate-200' : 'text-slate-400'
                      }`}>
                        Security Audit (SQL Injection & Memory Leak Scan)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      {activePR.ciChecks.security}
                    </span>
                  </div>

                  {/* Step 2: Code Linting */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activePR.ciChecks.lint === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : activePR.ciChecks.lint === 'running'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-900 text-slate-500 border border-slate-850'
                      }`}>
                        {activePR.ciChecks.lint === 'success' ? '✔' : '2'}
                      </div>
                      <span className={`text-xs font-semibold ${
                        activePR.ciChecks.lint === 'success' ? 'text-slate-200' : 'text-slate-400'
                      }`}>
                        Code Linting & Syntax Checks
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      {activePR.ciChecks.lint}
                    </span>
                  </div>

                  {/* Step 3: Tests */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        activePR.ciChecks.tests === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : activePR.ciChecks.tests === 'running'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-900 text-slate-500 border border-slate-850'
                      }`}>
                        {activePR.ciChecks.tests === 'success' ? '✔' : '3'}
                      </div>
                      <span className={`text-xs font-semibold ${
                        activePR.ciChecks.tests === 'success' ? 'text-slate-200' : 'text-slate-400'
                      }`}>
                        Workspace Unit Integration Tests
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      {activePR.ciChecks.tests}
                    </span>
                  </div>
                </div>

                {/* Interactive Action Triggers */}
                <div className="pt-2 border-t border-slate-900">
                  {activePR.status === 'draft' && (
                    <button
                      type="button"
                      onClick={runCICDSuite}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
                    >
                      🚀 Run Automated CI/CD Pipeline
                    </button>
                  )}

                  {activePR.status === 'ready' && (
                    <button
                      type="button"
                      onClick={handleMergePR}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer text-center animate-pulse"
                    >
                      🤝 Merge Pull Request into Master
                    </button>
                  )}

                  {activePR.status === 'merging' && (
                    <div className="flex items-center justify-center gap-2 py-2.5 text-xs text-indigo-400 font-semibold">
                      <span className="animate-spin h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                      <span>Merging patch-files into Master...</span>
                    </div>
                  )}

                  {activePR.status === 'merged' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-center text-xs text-emerald-400 font-semibold">
                      ✔ PR Merged successfully! Changes are pushed.
                    </div>
                  )}

                  {activePR.status === 'checking' && (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-center text-xs text-amber-400 font-semibold animate-pulse">
                      ⏳ Executing pipeline tests... Please wait
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline Live Logs Console */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 font-mono text-[10px] leading-relaxed shadow-lg flex flex-col h-[280px] space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 text-slate-500 select-none">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">CI/CD Terminal Stream</span>
                  </div>
                </div>

                {/* Logs Stream */}
                <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-slate-300 font-mono pr-1 select-text">
                  {activePR.ciLogs.map((log, i) => {
                    let colorClass = "text-slate-300";
                    if (log.includes("[WARN]")) colorClass = "text-amber-400/90";
                    if (log.includes("[ERROR]") || log.includes("[FAILED]")) colorClass = "text-rose-400/90";
                    if (log.includes("[SUCCESS]")) colorClass = "text-emerald-400/95 font-semibold";
                    if (log.includes("[SYSTEM]")) colorClass = "text-indigo-400 font-semibold";
                    return (
                      <div key={i} className={`whitespace-pre-wrap ${colorClass}`}>
                        {log}
                      </div>
                    );
                  })}
                  {activePR.status === 'checking' && (
                    <div className="text-slate-500 animate-pulse flex items-center gap-1.5">
                      <span>$ running automated test runners</span>
                      <span className="w-1.5 h-3.5 bg-slate-500 inline-block" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
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
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-4">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Rating</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-white">{analysisResult.score}</span>
                          <span className="text-xs text-slate-500 font-bold">/ 100</span>
                        </div>
                      </div>

                      {/* Download Report Button */}
                      <button
                        type="button"
                        onClick={handleExportReport}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors focus:outline-none cursor-pointer"
                      >
                        <span>Download Report</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-6 border-t border-slate-900/60 pt-3 relative z-10">
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${analysisResult.score >= 80
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

                      {/* Score wheel circle */}
                      <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
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
                        <span className="absolute text-[10px] font-black text-slate-300">{analysisResult.score}%</span>
                      </div>
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
                            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 block ${selectedIssueId === issue.id
                                ? 'bg-slate-950/80 border-slate-700 shadow-md'
                                : 'bg-slate-950/20 border-slate-850 hover:bg-slate-950/40 hover:border-slate-800'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${issue.type === 'critical'
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

              {/* Recent Reviews History */}
              {!isAnalyzing && history.length > 0 && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Reviews</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCode(item.code);
                          setLanguage(item.language as any);
                          setAnalysisResult(item.result);
                          if (item.result.issues.length > 0) {
                            setSelectedIssueId(item.result.issues[0].id);
                          } else {
                            setSelectedIssueId(null);
                          }
                        }}
                        className="w-full text-left p-2.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[10px]">{item.timestamp}</span>
                          <span className="font-semibold text-slate-300 capitalize">{item.language}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.score >= 80
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : item.score >= 50
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}>
                            {item.score}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
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
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Optimized Suggestion</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentIssue.after, currentIssue.id)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-0.5 rounded hover:bg-indigo-500/5 transition-colors focus:outline-none"
                >
                  {copiedId === currentIssue.id ? '✓ Copied!' : '📋 Copy Suggestion'}
                </button>
              </div>
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

          {/* Explainer Chat */}
          <div className="border-t border-slate-850 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Ask AI Explainer Assistant
                </h4>
              </div>
              <span className="text-[10px] text-slate-500">Simulating interactive feedback loop</span>
            </div>

            {/* Chat Screen */}
            <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-4 flex flex-col h-[280px]">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                      }`}>
                      {msg.text.split('\n').map((line, j) => (
                        <p key={j} className={j > 0 ? 'mt-1.5' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {isChatTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  disabled={isChatTyping}
                  onClick={() => handleSendChatMessage('Why is this flagged as an issue?')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-50 text-[10px] font-semibold text-slate-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                >
                  ❓ Why is this flagged?
                </button>
                <button
                  type="button"
                  disabled={isChatTyping}
                  onClick={() => handleSendChatMessage('Are there alternative ways to write this?')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-50 text-[10px] font-semibold text-slate-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                >
                  ⚡ Alternative approaches?
                </button>
                <button
                  type="button"
                  disabled={isChatTyping}
                  onClick={() => handleSendChatMessage('How do I apply this fix?')}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 disabled:opacity-50 text-[10px] font-semibold text-slate-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                >
                  🔧 How to apply fix?
                </button>
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(chatInput);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isChatTyping}
                  placeholder="Ask AI about this suggestion..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isChatTyping || !chatInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* Create Pull Request Glassmorphic Modal */}
      {isPRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Create Pull Request</h3>
              <button
                type="button"
                onClick={() => setIsPRModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  PR Title
                </label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. fix: resolve SQL injection vulnerabilities"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    PR Description
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsGeneratingDesc(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      setPrDescription(`This pull request resolves various security warnings, memory leaks, and formatting issues identified by the AI Code Reviewer.

### Changes Applied:
- Swapped unsafe database string concatenation with parameterized MySQL queries.
- Cleaned up raw client socket connections by integrating clean disconnect event handlers.
- Refactored unannotated variable declarations across evaluated helper modules.

*Review verified by the AI Code Reviewer module.*`);
                      setIsGeneratingDesc(false);
                    }}
                    disabled={isGeneratingDesc}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {isGeneratingDesc ? (
                      <>
                        <span className="animate-spin h-2.5 w-2.5 border-2 border-indigo-400 border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      '✨ Generate description'
                    )}
                  </button>
                </div>
                <textarea
                  value={prDescription}
                  onChange={(e) => setPrDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed custom-scrollbar"
                  placeholder="Write a summary description of changes applied..."
                />
              </div>

              <div className="bg-slate-950/30 border border-slate-900 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                  Branch Information
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">feature/ai-reviewer</span>
                  <span>→</span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-850">master</span>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPRModalOpen(false)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPR}
                disabled={!prTitle.trim() || !prDescription.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                Submit PR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

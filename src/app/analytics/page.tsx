'use client';

import React, { useState } from 'react';

// Sample metrics
interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
}

const metrics: MetricCard[] = [
  { title: 'Server Request Traffic', value: '48.9k / min', change: '+12.4%', isPositive: true, timeframe: 'vs last week' },
  { title: 'API Response Time', value: '184 ms', change: '-8.1%', isPositive: true, timeframe: 'vs last hour' },
  { title: 'Active User Nodes', value: '3,842', change: '+22.1%', isPositive: true, timeframe: 'vs yesterday' },
  { title: 'CPU Core Load', value: '41.2 %', change: '+3.5%', isPositive: false, timeframe: 'vs last hour' },
];

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '24h'>('7d');

  // Simple SVG Line Chart Data points (Normalized 0 to 100)
  // We'll draw a smooth line path.
  // 7 Days coordinates: Day 1 to Day 7
  const linePoints7d = [
    { label: 'Mon', value: 20 },
    { label: 'Tue', value: 45 },
    { label: 'Wed', value: 30 },
    { label: 'Thu', value: 80 },
    { label: 'Fri', value: 65 },
    { label: 'Sat', value: 95 },
    { label: 'Sun', value: 85 },
  ];

  const linePoints30d = [
    { label: 'W1', value: 10 },
    { label: 'W2', value: 50 },
    { label: 'W3', value: 35 },
    { label: 'W4', value: 90 },
  ];

  const linePoints24h = [
    { label: '00:00', value: 15 },
    { label: '06:00', value: 25 },
    { label: '12:00', value: 75 },
    { label: '18:00', value: 60 },
    { label: '24:00', value: 90 },
  ];

  const getActivePoints = () => {
    if (selectedRange === '30d') return linePoints30d;
    if (selectedRange === '24h') return linePoints24h;
    return linePoints7d;
  };

  const points = getActivePoints();

  // Create SVG path string for the line chart
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = () => {
    const stepX = (width - paddingX * 2) / (points.length - 1);
    return points.map((p, index) => {
      const x = paddingX + index * stepX;
      // Invert Y because SVG coordinates start from top-left
      const y = height - paddingY - (p.value / 100) * (height - paddingY * 2);
      return { x, y, label: p.label, value: p.value };
    });
  };

  const coords = getCoordinates();
  
  // Construct path: M x0 y0 C x0_ctrl y0_ctrl, x1_ctrl y1_ctrl, x1 y1 ...
  // For simplicity and high visual quality, we can build a line path with points
  const linePath = coords.reduce((acc, c, i) => {
    if (i === 0) return `M ${c.x} ${c.y}`;
    // Draw curves
    const prev = coords[i - 1];
    const cpX1 = prev.x + (c.x - prev.x) / 3;
    const cpY1 = prev.y;
    const cpX2 = prev.x + 2 * (c.x - prev.x) / 3;
    const cpY2 = c.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${c.x} ${c.y}`;
  }, '');

  // Grid background lines
  const gridLinesY = [0, 25, 50, 75, 100];

  // Fill gradient path (close the shape to bottom-right and bottom-left)
  const fillPath = coords.length > 0 
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z` 
    : '';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Analytics</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time telemetries, computing traffic, and server node logs.</p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-slate-950/40 border border-slate-800/60 p-1 rounded-xl shrink-0">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedRange === range
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{metric.title}</p>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-2xl font-bold text-slate-100">{metric.value}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                metric.isPositive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">{metric.timeframe}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main interactive line chart */}
        <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Performance Index</h3>
              <p className="text-xs text-slate-500 mt-0.5">CPU execution spikes and latency distribution.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Primary Node</span>
              </div>
            </div>
          </div>

          {/* SVG line chart */}
          <div className="w-full overflow-x-auto custom-scrollbar pt-2">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full min-w-[500px] h-auto overflow-visible"
              fill="none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {gridLinesY.map((line, idx) => {
                const y = height - paddingY - (line / 100) * (height - paddingY * 2);
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={width - paddingX} 
                      y2={y} 
                      stroke="#1e293b" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x={paddingX - 10} 
                      y={y + 4} 
                      fill="#64748b" 
                      fontSize="9" 
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {line}%
                    </text>
                  </g>
                );
              })}

              {/* Gradient Fill Path */}
              {fillPath && <path d={fillPath} fill="url(#chartGradient)" />}

              {/* Smooth Path Line */}
              {linePath && (
                <path 
                  d={linePath} 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Data points markers */}
              {coords.map((c, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle 
                    cx={c.x} 
                    cy={c.y} 
                    r="5.5" 
                    fill="#0f172a" 
                    stroke="#818cf8" 
                    strokeWidth="3"
                  />
                  <circle 
                    cx={c.x} 
                    cy={c.y} 
                    r="9" 
                    fill="#818cf8" 
                    fillOpacity="0"
                    className="hover:fill-opacity-15 transition-all duration-200"
                  />
                  {/* Tooltip on hover */}
                  <text
                    x={c.x}
                    y={c.y - 12}
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="opacity-0 hover:opacity-100 transition-opacity bg-slate-950 p-1 text-[9px] rounded pointer-events-none"
                  >
                    {c.value}%
                  </text>
                </g>
              ))}

              {/* X axis labels */}
              {coords.map((c, idx) => (
                <text
                  key={idx}
                  x={c.x}
                  y={height - 2}
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {c.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Distribution / Task breakdown donut */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resource Allocation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Computational share across workspaces.</p>
          </div>

          <div className="flex justify-center items-center my-6">
            <div className="relative w-40 h-40">
              {/* Pure SVG donut */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                {/* Sector 1: AI (45%) -> Dasharray: 2 * PI * r = 251.2 -> 45% = 113 */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#6366f1" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray="113 251.2" 
                  strokeDashoffset="0"
                />
                {/* Sector 2: Backend (30%) -> 30% = 75.36 -> Offset by -113 */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#ec4899" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray="75 251.2" 
                  strokeDashoffset="-113"
                />
                {/* Sector 3: Frontend (25%) -> 25% = 62.8 -> Offset by -188 */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#14b8a6" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray="63 251.2" 
                  strokeDashoffset="-188"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-100">8 Nodes</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Allocated</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                <span className="text-slate-400">AI Pipelines</span>
              </div>
              <span className="text-slate-200 font-bold">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-pink-500" />
                <span className="text-slate-400">Backend Nodes</span>
              </div>
              <span className="text-slate-200 font-bold">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-teal-500" />
                <span className="text-slate-400">Frontend Repos</span>
              </div>
              <span className="text-slate-200 font-bold">25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Computing Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live events streaming from target servers.</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Stream
          </span>
        </div>

        <div className="space-y-4">
          {[
            { service: 'auth-server', message: 'JWT generation completed for workspace.admin_auth', status: 'SUCCESS', time: '12:02:44' },
            { service: 'database-node-1', message: 'SQL Transaction execution completed in 14ms', status: 'SUCCESS', time: '12:02:30' },
            { service: 'pipeline-worker-3', message: 'Model weights optimization complete for agentic-review', status: 'INFO', time: '12:02:18' },
            { service: 'gateway-ingress', message: 'Rate limiter activated for API node endpoint /v1/chat', status: 'WARNING', time: '12:01:59' },
            { service: 'webhook-dispatcher', message: 'Triggered PR review webhooks to github.com/test-repo', status: 'SUCCESS', time: '12:01:05' },
          ].map((log, idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-950/20 border border-slate-900 rounded-xl hover:border-slate-800 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-[10px]">{log.time}</span>
                <span className="text-indigo-400 font-semibold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-mono text-[10px]">
                  {log.service}
                </span>
                <span className="text-slate-300 font-medium">{log.message}</span>
              </div>
              <span className={`self-start sm:self-center font-bold font-mono text-[9px] px-2 py-0.5 rounded ${
                log.status === 'SUCCESS' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : log.status === 'WARNING' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/Button';

export default function Dashboard() {
  const user = { name: "Test User", role: "admin" };
  
  // Intentional issue: unused variable
  const unusedData = [1, 2, 3];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-xl font-semibold text-blue-800">Welcome back, {user.name}!</h2>
          <p className="text-blue-600 mt-2">Your current role is: {user.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-gray-50 border rounded-md">
            <h3 className="text-lg font-bold mb-2">Statistics</h3>
            <p className="text-gray-600 mb-4">View your recent activity and statistics here.</p>
            <Button variant="primary">View Stats</Button>
          </div>
          
          <div className="p-6 bg-gray-50 border rounded-md">
            <h3 className="text-lg font-bold mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">Manage your account preferences and settings.</p>
            <Button variant="secondary">Go to Settings</Button>
          </div>
        </div>

        {/* Intentional issue: using inline styles instead of Tailwind */}
        <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #ccc' }}>
          <p className="text-sm text-gray-500">Last updated: Just now</p>
        </div>
      </div>
    </div>
  );
}

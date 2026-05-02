'use client';

import React, { useState } from 'react';

export default function Profile() {
  // Intentional issue: any type
  const [profileData, setProfileData] = useState<any>({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer testing AI review'
  });

  // Intentional issue: unused function
  const unusedFunction = () => {
    console.log("This is never called");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">User Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 p-2 w-full border rounded-md bg-gray-50 text-gray-900">
              {profileData.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {/* Intentional issue: Hardcoded styles instead of tailwind */}
            <div style={{ marginTop: '4px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '0.375rem', backgroundColor: '#f9fafb', color: '#111827' }}>
              {profileData.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea 
              className="mt-1 p-2 w-full border rounded-md bg-gray-50 text-gray-900"
              rows={4}
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            />
          </div>
          
          <div className="pt-4">
            {/* Intentional issue: onClick handler with an empty anonymous function */}
            <button 
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
              onClick={() => {}}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

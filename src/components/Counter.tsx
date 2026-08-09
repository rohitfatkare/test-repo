'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

export const Counter = () => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<any>(null); // Intentional issue: using any

  useEffect(() => {
    console.log("Component mounted or count changed", count); // Intentional issue: console.log
    
    // Intentional issue: fetch without error handling or loading state
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => setData(json))
  }, []); // Intentional issue: missing dependency 'count'

  const unusedVariable = "I am never used"; // Intentional issue: unused variable

  return (
    <div className="p-4 border rounded-md mt-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Interactive Counter</h2>
      <p className="mb-4 text-gray-700">Current count: {count}</p>
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="secondary" onClick={() => setCount(count - 1)}>
          Decrement
        </Button>
        <Button variant="primary" onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <Button variant="danger" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
      {data && (
        <div className="mt-4 text-sm text-gray-500">
          Loaded dummy data: {data.title}
        </div>
      )}
    </div>
  );
};

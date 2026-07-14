'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';

type TodoPreview = {
  title: string;
};

export const Counter = () => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [data, setData] = useState<TodoPreview | null>(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then((response) => response.json())
      .then((json: TodoPreview) => setData(json))
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCount((prev) => prev + step);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, step]);

  return (
    <div className="p-4 border rounded-md mt-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">Interactive Counter</h2>
      <p className="mb-4 text-gray-700">Current count: {count}</p>
      
      <div className="mb-4 flex items-center justify-center gap-2 text-sm">
        <label htmlFor="step" className="text-gray-700">Step size:</label>
        <input 
          id="step" 
          type="number" 
          className="w-16 px-2 py-1 border rounded"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) || 1)}
          min="1"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="primary" onClick={() => setCount((prev) => prev + step)}>
          Increment
        </Button>
        <Button variant="secondary" onClick={() => setCount((prev) => prev - step)}>
          Decrement
        </Button>
        <Button variant="danger" onClick={() => { setCount(0); setIsAutoPlaying(false); }}>
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant={isAutoPlaying ? "danger" : "primary"} 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        >
          {isAutoPlaying ? "Stop Auto Play" : "Start Auto Play"}
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

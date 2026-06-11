'use client';

import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="p-4 border rounded-md mt-4 bg-gray-50 text-left">
      <h2 className="text-xl font-semibold mb-2">Todo List</h2>
      <p className="text-sm text-gray-500 mb-4">
        {completedCount} of {todos.length} completed
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add
        </button>
      </div>

      {todos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No tasks yet</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-2 bg-white rounded-md border"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4 accent-blue-500"
              />
              <span
                className={`flex-1 ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

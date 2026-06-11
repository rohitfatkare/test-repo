import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'; // Added danger but not implemented
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variants: any = { // Intentional issue: using any type
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    // danger is missing
  };

  console.log("Rendering button", variant); // Intentional issue: console.log in render

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};



const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variants: any = { // Intentional issue: using any type
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    // danger is missing
  };

  console.log("Rendering button", variant); // Intentional issue: console.log in render

  return (




    

  console.log("Rendering button", variant); // Intentional issue: console.log in render

  return (


    

import React from 'react';
import { LoadingSpinnerIcon } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, isLoading = false, disabled, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center bg-brand-primary text-brand-dark font-bold py-3 px-4 rounded-lg shadow-md hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-primary transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-500"
    >
      {isLoading ? (
        <>
          <LoadingSpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
      <strong className="font-bold mr-1">Error:</strong>
      <span className="block sm:inline">{message || 'Something went wrong.'}</span>
    </div>
  );
};

export default ErrorMessage;
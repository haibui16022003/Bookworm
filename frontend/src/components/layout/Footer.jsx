import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-400 w-16 h-16 flex items-center justify-center text-white text-xs">64X64</div>
          <div>
            <div className="font-bold text-sm uppercase">BOOKWORM</div>
            <div className="text-xs text-gray-600">Address</div>
            <div className="text-xs text-gray-600">Phone</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
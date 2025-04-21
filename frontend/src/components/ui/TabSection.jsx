import React, { useState } from 'react';

const TabSection = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div className="flex gap-4 mb-4 justify-center">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm rounded-lg ${
              activeTab === index 
                ? 'bg-gray-300 text-gray-800' 
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};

export default TabSection;
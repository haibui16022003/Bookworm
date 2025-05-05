import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderSuccessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    let timer;
    let countdownInterval;
    
    if (isOpen) {
      setCountdown(10);
      
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      timer = setTimeout(() => {
        onClose();
        navigate('/');
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isOpen, onClose, navigate]);
  
  if (!isOpen) return null;
  
  const handleContinueShopping = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
          <p className="text-gray-500 text-sm mb-4">
            You will be redirected to the homepage in <span className="font-semibold">{countdown}</span> seconds
          </p>
          
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
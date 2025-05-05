import React from 'react';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';

const CartItem = ({ 
  item, 
  updateQuantity, 
  onRemove
}) => {
  const getItemTotal = (price, quantity) => (price * quantity).toFixed(2);
  
  return (
    <div className="bg-white shadow-sm border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
      <img
        src={item.book_cover_photo}
        alt={item.book_title}
        className="w-24 h-36 object-cover rounded-md"
      />
      <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">{item.book_title}</h2>
          <p className="text-sm font-bold text-gray-800">${item.price.toFixed(2)}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center justify-end sm:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
              className="bg-gray-200 text-gray-700 rounded-full p-1 hover:bg-gray-300"
            >
              <MinusCircle className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              max="8"
              value={item.quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value, 10);
                if (!isNaN(newQty)) updateQuantity(item.book_id, newQty);
              }}
              className="w-16 text-center border border-gray-300 rounded-md py-1 px-2 bg-white"
            />
            <button
              onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
              className="bg-gray-200 text-gray-700 rounded-full p-1 hover:bg-gray-300"
              disabled={item.quantity >= 8}
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm font-semibold text-gray-800">
            Total: ${getItemTotal(item.price, item.quantity)}
            {item.quantity === 8 && (
              <p className="text-xs text-red-500">Max quantity reached</p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.book_id)}
            className="bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
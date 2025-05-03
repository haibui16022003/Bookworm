import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { ShoppingCart, MinusCircle, PlusCircle, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCreateOrder } from '../hooks/useOrder';
import AuthPopup from '../components/auth/AuthPopup';

const CartPage = () => {
  const [loading, setLoading] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [notification, setNotification] = useState(null);

  const { user } = useAuth();
  const { cartItems, updateCart, getTotalQuantity, removeItem } = useCart();
  const {
    createOrder,
    loading: orderLoading,
    error: orderError,
    success: orderSuccess
  } = useCreateOrder();

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (orderSuccess) {
      updateCart([]);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify([])
      }));
      showNotification('Order placed successfully!', 'success');
    }
  }, [orderSuccess]);

  useEffect(() => {
    if (orderError) {
      showNotification(orderError, 'error');
      if (orderError?.toString().includes('401')) {
        setShowAuthPopup(true);
      }
    }
  }, [orderError]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const updateQuantity = (id, newQuantity) => {
    const constrainedQuantity = Math.min(8, Math.max(1, newQuantity));
    const updatedItems = cartItems.map(item =>
      item.book_id === id ? { ...item, quantity: constrainedQuantity } : item
    );
    updateCart(updatedItems);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: JSON.stringify(updatedItems)
    }));
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cart',
      newValue: JSON.stringify(cartItems.filter(item => item.book_id !== itemId))
    }));
    showNotification('Item removed from cart', 'success');
  };

  const getItemTotal = (price, quantity) => (price * quantity).toFixed(2);
  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const getUserFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const handlePlaceOrder = () => {
    const storedUser = getUserFromLocalStorage();
    if (!storedUser?.id) {
      setShowAuthPopup(true);
    } else {
      submitOrder(storedUser.id);
    }
  };

  const submitOrder = (userId = null) => {
    const storedUser = getUserFromLocalStorage();
    const finalUserId = userId || user?.id || storedUser?.id;

    if (!finalUserId) {
      showNotification('User not authenticated. Please login again.', 'error');
      setShowAuthPopup(true);
      return;
    }

    if (cartItems.length === 0) {
      showNotification('Your cart is empty.', 'error');
      return;
    }

    const orderData = {
      user_id: finalUserId,
      order_amount: parseFloat(getCartTotal()),
      order_items: cartItems.map(item => ({
        book_id: item.book_id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    createOrder(orderData);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <p>Loading cart...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-10 min-h-screen">

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-md flex justify-between items-center ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <p className="text-sm md:text-base">{notification.message}</p>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Cart Header */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Your Cart ({getTotalQuantity()} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.book_id} className="bg-white shadow-sm border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
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
                          onChange={e => {
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
                        onClick={() => handleRemoveItem(item.book_id)}
                        className="bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Totals */}
            <div className="lg:col-span-1">
              <div className="bg-white border shadow-sm rounded-lg p-4 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Cart Totals</h3>
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-gray-900">${getCartTotal()}</span>
                </div>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || cartItems.length === 0}
                >
                  {orderLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        redirectAfterAuth={null}
        onAuthSuccess={() => {
          const userFromStorage = getUserFromLocalStorage();
          if (userFromStorage?.id) {
            submitOrder(userFromStorage.id);
          }
        }}
      />
    </Layout>
  );
};

export default CartPage;
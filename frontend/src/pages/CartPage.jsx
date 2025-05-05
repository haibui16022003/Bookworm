import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { ShoppingCart, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCreateOrder } from '../hooks/useOrder';
import AuthPopup from '../components/auth/AuthPopup';
import CartItem from '../components/cart/CartItem';
import OrderSuccessModal from '../components/modals/OrderSuccessModal';

const CartPage = () => {
  const [loading, setLoading] = useState(true);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      setShowSuccessModal(true);
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

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
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

        {/* Notification (now only for errors) */}
        {notification && (
          <div className="mb-4 p-4 rounded-md flex justify-between items-center bg-red-100 text-red-800">
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
            {/* Cart Items - Now using the CartItem component */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <CartItem 
                  key={item.book_id} 
                  item={item} 
                  updateQuantity={updateQuantity} 
                  onRemove={handleRemoveItem} 
                />
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

      {/* Auth Popup */}
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

      {/* Order Success Modal */}
      <OrderSuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseSuccessModal} 
      />
    </Layout>
  );
};

export default CartPage;
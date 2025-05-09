import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import NotFoundPage from './pages/NotFound';
import AuthProvider from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Hard-coded components to avoid errors
const ProfilePage = () => <div>Profile Page</div>;
const ChangePasswordPage = () => <div>Change Password Page</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/book/:id" element={<BookDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
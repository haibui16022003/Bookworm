import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SignInPage from './pages/SignInPage';

// Hard-coded components to avoid errors
const ShopPage = () => <div>Shop Page</div>;
const BookDetailPage = () => <div>Book Detail Page</div>;
const CartPage = () => <div>Cart Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const NotFoundPage = () => <div>404 - Not Found</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
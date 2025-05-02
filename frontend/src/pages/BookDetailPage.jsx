import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';

import Layout from '../components/layout/Layout';
import { useBookDetails } from '../hooks/useBooks';
import CustomerReviews from '../components/reviews/BookReview'; 
import WriteReview from '../components/reviews/WriteReview';    

const BookDetails = ({ book }) => {
  if (!book) return null;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="flex-shrink-0 w-full md:w-1/3 lg:w-2/5">
        <div className="bg-gray-200 w-full aspect-[3/4] rounded-lg shadow-md mb-3 overflow-hidden">
          <img
            src={book.book_cover_photo}
            alt={`Cover of ${book.book_title}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x500/e2e8f0/cbd5e0?text=Image+Not+Available';
            }}
          />
        </div>
        <p className="text-sm text-gray-600 italic text-center md:text-left">By {book.author_name}</p>
      </div>

      <div className="flex-grow">
        <h2 className="text-3xl font-bold mb-3 text-gray-800">{book.book_title}</h2>
        <p className="text-gray-600 mb-4 leading-relaxed">{book.book_summary}</p>
      </div>
    </div>
  );
};

const AddToCart = ({ book }) => {
  const [quantity, setQuantity] = useState(1);
  const [existingQuantity, setExistingQuantity] = useState(0);
  const [message, setMessage] = useState("");
  const MAX_QUANTITY = 8;

  useEffect(() => {
    // Check if the book is already in the cart when component mounts or book changes
    if (book) {
      const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
      const existingItem = cart.find(item => item.book_id === book.id);
      
      if (existingItem) {
        setExistingQuantity(existingItem.quantity);
      } else {
        setExistingQuantity(0);
      }
    }
  }, [book]);

  if (!book) return null;

  const incrementQuantity = () => {
    // Calculate the total quantity after increment
    const newQuantity = quantity + 1;
    const totalQuantity = newQuantity + existingQuantity;
    
    if (totalQuantity <= MAX_QUANTITY) {
      setQuantity(newQuantity);
      setMessage("");
    } else {
      setMessage(`You can only add up to ${MAX_QUANTITY} copies of this book`);
    }
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    setMessage("");
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      const totalQuantity = value + existingQuantity;
      
      if (totalQuantity <= MAX_QUANTITY) {
        setQuantity(value);
        setMessage("");
      } else {
        setQuantity(MAX_QUANTITY - existingQuantity > 0 ? MAX_QUANTITY - existingQuantity : 1);
        setMessage(`You can only add up to ${MAX_QUANTITY} copies of this book`);
      }
    } else if (e.target.value === '') {
      setQuantity('');
      setMessage("");
    }
  };

  const handleBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    }
  };

  const addToCart = () => {
    // Get current cart from session storage
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    
    // Check if book already exists in cart
    const existingItemIndex = cart.findIndex(item => item.book_id === book.id);
    
    // Calculate the new quantity
    const newQuantity = existingItemIndex >= 0 
      ? cart[existingItemIndex].quantity + quantity
      : quantity;
    
    // Make sure it doesn't exceed the maximum
    if (newQuantity > MAX_QUANTITY) {
      setMessage(`Cart already contains ${existingQuantity} of this book. Cannot add more than ${MAX_QUANTITY} in total.`);
      return;
    }
    
    // Prepare the order item
    const orderItem = {
      book_id: book.id,
      quantity: newQuantity,
      price: book.current_price
    };
    
    // Update or add the item
    if (existingItemIndex >= 0) {
      cart[existingItemIndex] = orderItem;
    } else {
      cart.push(orderItem);
    }
    
    // Save to session storage
    sessionStorage.setItem("cart", JSON.stringify(cart));
    
    // Update the existing quantity
    setExistingQuantity(newQuantity);
    setQuantity(1);
    setMessage("Added to cart successfully!");
  };

  const discountedPrice = book.current_price?.toFixed(2) || 'N/A';
  const originalPrice = book.original_price?.toFixed(2);
  const showOriginalPrice = originalPrice && book.current_price < book.original_price;

  const remainingQuantity = MAX_QUANTITY - existingQuantity;

  return (
    <div>
      <div className="flex items-baseline mb-4">
        <span className="text-2xl font-semibold text-black mr-3">${discountedPrice}</span>
        {showOriginalPrice && (
          <span className="text-lg text-gray-400 line-through">${originalPrice}</span>
        )}
      </div>

      {existingQuantity > 0 && (
        <div className="mb-3 text-sm text-blue-600">
          You already have {existingQuantity} of this book in your cart.
        </div>
      )}

      {remainingQuantity > 0 ? (
        <>
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity {remainingQuantity < MAX_QUANTITY && `(Max: ${remainingQuantity} more)`}
            </label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-full">
              <button
                onClick={decrementQuantity}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 focus:outline-none"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                onBlur={handleBlur}
                className="flex-1 text-center text-lg focus:outline-none h-10 border-l border-r border-gray-300"
                min="1"
                max={remainingQuantity}
              />
              <button
                onClick={incrementQuantity}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 focus:outline-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button 
            onClick={addToCart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200 focus:outline-none"
          >
            Add to cart
          </button>
        </>
      ) : (
        <div className="w-full bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-md border border-gray-300 text-center">
          Maximum quantity reached in cart
        </div>
      )}

      {message && (
        <div className={`mt-2 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

const BookInformation = ({ bookId }) => {
  const { book, loading, error } = useBookDetails(bookId);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading book information...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error loading book details: {error}</div>;
  if (!book) return <div className="text-center py-12 text-gray-500">No book information found.</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-sm text-gray-500 mb-4 uppercase tracking-wider">
        {book.category_name || 'Uncategorized'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* Left side: BookDetails */}
        <div className="lg:col-span-7">
          <BookDetails book={book} />
        </div>

        {/* Right side: AddToCart*/}
        <div className="lg:col-span-3 space-y-6">
          <AddToCart book={book} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 pt-8">
        {/* Left side: Customer Review */}
        <div className="lg:col-span-7">
          <CustomerReviews bookId={bookId} />
        </div>

        {/* Right side: WriteReview*/}
        <div className="lg:col-span-3 space-y-6">
          <WriteReview bookId={bookId}/>
        </div>
      </div>
    </div>
  );
};


const BookDetailPage = () => {
  const { id } = useParams();

  return (
    <Layout>
      <BookInformation bookId={id} />
    </Layout>
  );
};

export default BookDetailPage;
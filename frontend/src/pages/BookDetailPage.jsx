import React from 'react';
import Layout from '../components/layout/Layout';

const BookDetailPage = () => {
  return (
    <Layout>
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Book Details */}
        <div className="space-y-6">
            {/* Category Name */}
            <p className="text-sm text-gray-500 uppercase">Category Name</p>

            {/* Book Image and Title */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-48 h-64 bg-gray-200 rounded shadow-md">
                {/* Placeholder for Book Image */}
                <img
                src="https://via.placeholder.com/192x256"
                alt="Book Cover"
                className="w-full h-full object-cover rounded"
                />
            </div>
            <div>
                <h2 className="text-2xl font-semibold">Book Title</h2>
                <p className="text-gray-600 mt-2">
                Book description lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Excepteur sint occaecat.
                </p>
                <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p><span className="font-semibold">"The must-million-copy bestseller"</span> - Soon to be a major film</p>
                <p>A #1 National Bestseller and New York Times Bestseller</p>
                <p><span className="font-semibold">"Painfully beautiful"</span> - New York Times</p>
                <p><span className="font-semibold">"Unforgettable... as engrossing as it is moving"</span> - Daily Mail</p>
                <p><span className="font-semibold">"A triumph"</span> - The Spectator</p>
                <p><span className="font-semibold">"I can't even express how much I love this book"</span> - Reese Witherspoon</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">By (author) Anna Banks</p>
            </div>
            </div>
        </div>

        {/* Right Column: Pricing and Add to Cart */}
        <div className="space-y-6">
            <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-800">$29.99</span>
            <span className="text-sm text-gray-500 line-through">$40.00</span>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="text-gray-700">Quantity</label>
            <div className="relative">
                <button className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none">-</button>
                <input
                type="number"
                id="quantity"
                className="w-20 py-2 pl-8 pr-2 border border-gray-300 rounded text-center focus:outline-none focus:border-indigo-500"
                value="1" // Initial quantity
                min="1"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none">+</button>
            </div>
            <button className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                Add to cart
            </button>
            </div>

            {/* Write a Review Section */}
            <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
            <textarea
                className="w-full h-24 p-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                placeholder="Details please! Your review helps other shoppers."
            ></textarea>
            <div className="mt-3 flex items-center justify-between">
                <div>
                <label htmlFor="rating" className="text-gray-700 text-sm">Select a rating star</label>
                <select
                    id="rating"
                    className="ml-2 py-1 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500"
                >
                    <option>1 Star</option>
                    <option>2 Stars</option>
                    <option>3 Stars</option>
                    <option>4 Stars</option>
                    <option>5 Stars</option>
                </select>
                </div>
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                Submit Review
                </button>
            </div>
            </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="col-span-1 lg:col-span-2 border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Reviews <span className="text-sm text-gray-500">(Filtered by 5 star)</span></h2>
            <div className="flex items-center justify-between mb-4">
            <p className="text-gray-700">
                <span className="font-semibold">4.6 Star</span>
                <span className="text-sm text-gray-500"> (12,345)</span>
                <span className="text-xs text-gray-500"> | </span>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">5 star (10,000)</span>
                <span className="text-xs text-gray-500"> | </span>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">4 star (2,000)</span>
                <span className="text-xs text-gray-500"> | </span>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">3 star (300)</span>
                <span className="text-xs text-gray-500"> | </span>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">2 star (45)</span>
                <span className="text-xs text-gray-500"> | </span>
                <span className="text-xs text-indigo-600 cursor-pointer hover:underline">1 star (200)</span>
            </p>
            <p className="text-sm text-gray-500">Showing 1-12 of 3154 reviews</p>
            </div>

            <div className="flex items-center gap-4 mb-4">
            <div className="relative">
                <select className="py-2 px-4 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 text-sm appearance-none pr-8">
                <option>Sort by date: newest to oldest</option>
                <option>Sort by date: oldest to newest</option>
                <option>Sort by rating: highest to lowest</option>
                <option>Sort by rating: lowest to highest</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 pointer-events-none">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
            </div>
            <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm focus:outline-none">Show 20 <svg className="w-4 h-4 inline-block ml-1 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg></button>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
            <div className="border-b pb-4">
                <h4 className="font-semibold">Review Title | <span className="text-sm text-yellow-500">5 stars</span></h4>
                <p className="text-gray-700 text-sm">Review content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p className="text-gray-500 text-xs mt-1">Nom Doe, 12 April 2021</p>
            </div>
            <div className="border-b pb-4">
                <h4 className="font-semibold">Amazing Story! You will LOVE it | <span className="text-sm text-yellow-500">5 stars</span></h4>
                <p className="text-gray-700 text-sm">Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the library for this book. Thrilled that I made the purchase.</p>
                <p className="text-gray-500 text-xs mt-1">Jane Smith, 12 April 2021</p>
            </div>
            {/* Repeat review structure */}
            <div className="border-b pb-4">
                <h4 className="font-semibold">Amazing Story! You will LOVE it | <span className="text-sm text-yellow-500">5 stars</span></h4>
                <p className="text-gray-700 text-sm">Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the library for this book. Thrilled that I made the purchase.</p>
                <p className="text-gray-500 text-xs mt-1">Jane Smith, 12 April 2021</p>
            </div>
            <div className="border-b pb-4">
                <h4 className="font-semibold">Amazing Story! You will LOVE it | <span className="text-sm text-yellow-500">5 stars</span></h4>
                <p className="text-gray-700 text-sm">Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the library for this book. Thrilled that I made the purchase.</p>
                <p className="text-gray-500 text-xs mt-1">Jane Smith, 12 April 2021</p>
            </div>
            <div className="border-b pb-4">
                <h4 className="font-semibold">Amazing Story! You will LOVE it | <span className="text-sm text-yellow-500">5 stars</span></h4>
                <p className="text-gray-700 text-sm">Such an incredibly complex story! I had to buy it because there was a waiting list of 30+ at the library for this book. Thrilled that I made the purchase.</p>
                <p className="text-gray-500 text-xs mt-1">Jane Smith, 12 April 2021</p>
            </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
                </a>
                {/* Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" */}
                <a href="#" aria-current="page" className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none">
                1
                </a>
                <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none">
                2
                </a>
                <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium focus:outline-none">
                3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
                </span>
                <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none">
                Next
                </a>
            </nav>
            </div>
        </div>
        </div>
    </Layout>
  );
};

export default BookDetailPage;
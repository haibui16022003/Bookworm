import React from 'react';

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

export default BookDetails;

import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  const {
    id,
    book_title,
    author_name,
    original_price,
    current_price,
    book_cover_photo,
  } = book;

  const isOnSale = current_price < original_price;

  return (
    <Link to={`/book/${id}`} className="block hover:opacity-80 transition">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
        {/* Image section */}
        <div className="bg-gray-300 aspect-[3/4] flex items-center justify-center">
          {book_cover_photo ? (
            <img
              src={`/images/${book_cover_photo}`}
              alt={book_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/images/placeholder.png"
              alt={book_title || "Book Cover"}
              className="w-full h-full object-contain p-4"
            />
          )}
        </div>

        {/* Info section */}
        <div className="p-4 flex flex-col gap-1">
          <h3 className="text-base font-semibold text-gray-800 truncate leading-snug">
            {book_title}
          </h3>
          <p className="text-sm text-gray-500">{author_name || 'Author Name'}</p>

          <div className="flex items-center gap-2 mt-1">
            {isOnSale && (
              <span className="text-sm text-gray-400 line-through">
                ${original_price?.toFixed(2)}
              </span>
            )}
            <span className="text-base font-bold text-gray-800">
              ${current_price?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;

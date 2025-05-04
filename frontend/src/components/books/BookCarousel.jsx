import React, { useEffect, useState, useRef } from "react";
import BookCard from "./BookCard";

const BookCarousel = ({ books, title, cardsPerView = 4, viewAllLink = "/shop?sortBy=on-sale" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(cardsPerView);
  const carouselRef = useRef(null);
  const autoplayRef = useRef(null);

  // Handle responsiveness
  useEffect(() => {
    const updateCards = () => {
      const width = window.innerWidth;
      if (width >= 1200) setVisibleCards(4);
      else if (width >= 900) setVisibleCards(3);
      else if (width >= 600) setVisibleCards(2);
      else setVisibleCards(1);
    };

    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  const totalItems = books.length;

  // Autoplay every 10 seconds
  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 10000);

    return () => clearInterval(autoplayRef.current);
  }, [totalItems]);

  // Pause autoplay on hover
  const handleMouseEnter = () => clearInterval(autoplayRef.current);
  const handleMouseLeave = () => {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const visibleBooks = Array.from({ length: visibleCards }, (_, i) => {
    return books[(currentIndex + i) % totalItems];
  });

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 px-4 md:px-8 pt-8 pb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {viewAllLink && (
          <button
            onClick={() => window.location.href = viewAllLink}
            className="text-sm px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            View All &rarr;
          </button>
        )}
      </div>
      <div className="relative w-full flex justify-center items-center">
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 15l-5-5 5-5v10z" />
          </svg>
        </button>

        {/* Carousel */}
        <div
          className="w-[90%] flex gap-4 overflow-hidden transition-transform duration-500 ease-in-out"
          ref={carouselRef}
        >
          {visibleBooks.map((book, index) => (
            <div
              key={book.id}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleCards}% - ${(4 * (visibleCards - 2)) / visibleCards}px)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {/* Fixed height container for consistent card sizing */}
              <div className="h-full">
                <BookCard book={book} />
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 5l5 5-5 5V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BookCarousel;
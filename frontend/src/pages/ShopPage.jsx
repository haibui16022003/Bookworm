import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthors } from '../hooks/useAuthor';
import { useCategories } from '../hooks/useCategory';
import { useBooks, useOnSaleBooks } from '../hooks/useBooks';
import Layout from '../components/layout/Layout';
import BookCard from '../components/books/BookCard';
import Pagination from '../components/ui/Pagination'; 

const ITEMS_PER_PAGE = 12; // Define the number of items to display per page

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [selectedStarRating, setSelectedStarRating] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Track which accordions are open
  const [openAccordions, setOpenAccordions] = useState({
    category: true,
    author: true,
    rating: true
  });

  const initialSortBy = searchParams.get('sortBy') || '';
  const initialCategoryId = searchParams.get('category') || '';
  const initialAuthorId = searchParams.get('author') || '';
  const initialStarRating = searchParams.get('minStars') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setSortBy(initialSortBy);
    setSelectedCategoryId(initialCategoryId);
    setSelectedAuthorId(initialAuthorId);
    setSelectedStarRating(initialStarRating);
    setCurrentPage(initialPage);
  }, [initialSortBy, initialCategoryId, initialAuthorId, initialStarRating, initialPage]);

  const { authors: fetchedAuthors, loading: authorLoading, error: authorError } = useAuthors();
  const { categories: fetchedCategories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const saleBooksResult = useOnSaleBooks(
    (currentPage - 1) * ITEMS_PER_PAGE,
    ITEMS_PER_PAGE,
    selectedCategoryId || null,
    selectedAuthorId || null,
    selectedStarRating ? parseInt(selectedStarRating, 10) : null
  );
  
  const normalBooksResult = useBooks(
    (currentPage - 1) * ITEMS_PER_PAGE,
    ITEMS_PER_PAGE,
    selectedCategoryId || null,
    selectedAuthorId || null,
    sortBy === 'price-low-to-high' ? false : sortBy === 'price-high-to-low' ? true : null,
    selectedStarRating ? parseInt(selectedStarRating, 10) : null
  );
  
  const {
    books: fetchedBooks,
    loading: booksLoading,
    error: booksError,
    totalCount,
    currentPage: apiPage,
  } = sortBy === 'on-sale' ? saleBooksResult : normalBooksResult;

  // Set the current page from API page
  useEffect(() => {
    if (apiPage) {
      setCurrentPage(apiPage);
    }
  }, [apiPage]);

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to the first page
    updateQueryParams({ sortBy: newSortBy, category: selectedCategoryId, author: selectedAuthorId, minStars: selectedStarRating, page: 1 });
  };

  const handleCategoryChange = (event) => {
    const newCategoryId = event.target.value;
    setSelectedCategoryId(newCategoryId);
    setCurrentPage(1); // Reset to the first page on filter
    updateQueryParams({ sortBy, category: newCategoryId, author: selectedAuthorId, minStars: selectedStarRating, page: 1 });
  };

  const handleAuthorChange = (event) => {
    const newAuthorId = event.target.value;
    setSelectedAuthorId(newAuthorId);
    setCurrentPage(1); // Reset to the first page on filter
    updateQueryParams({ sortBy, category: selectedCategoryId, author: newAuthorId, minStars: selectedStarRating, page: 1 });
  };

  const handleStarRatingChange = (event) => {
    const newStarRating = event.target.value;
    setSelectedStarRating(newStarRating);
    setCurrentPage(1); // Reset to the first page on filter
    updateQueryParams({ sortBy, category: selectedCategoryId, author: selectedAuthorId, minStars: newStarRating, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams({ sortBy, category: selectedCategoryId, author: selectedAuthorId, minStars: selectedStarRating, page: newPage });
  };

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateQueryParams = (params) => {
    const newSearchParams = new URLSearchParams();
    for (const key in params) {
      if (params[key]) {
        newSearchParams.set(key, params[key]);
      }
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const displayedBooks = fetchedBooks;
  
  // Use the total from the API response for pagination
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
  // Calculate start and end indices for display purposes
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + displayedBooks.length, totalCount);

  const renderPagination = () => {
    if (totalCount <= ITEMS_PER_PAGE) return null;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    );
  };

  if (booksLoading || authorLoading || categoriesLoading) {
    return <div>Loading ...</div>;
  }

  if (booksError || authorError || categoriesError) {
    return <div>Error loading data: {booksError || authorError || categoriesError}</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Books</h1>
        <div className="flex flex-col md:flex-row gap-4">

          {/* Filter Section */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white rounded-md shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Filter By</h2>
              
              {/* Category Accordion */}
              <div className="mb-2 border rounded">
                <button 
                  onClick={() => toggleAccordion('category')} 
                  className="flex justify-between items-center w-full p-3 text-left font-medium"
                >
                  <span>Category</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${openAccordions.category ? 'transform rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {openAccordions.category && (
                  <div className="p-3 border-t">
                    <div className="space-y-2 max-h-60 overflow-auto">
                      <div className="flex items-center">
                        <input
                          id="category-all"
                          name="category"
                          type="radio"
                          value=""
                          checked={selectedCategoryId === ''}
                          onChange={handleCategoryChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="category-all" className="ml-2 block text-sm font-medium text-gray-700">
                          All Categories
                        </label>
                      </div>
                      
                      {fetchedCategories && fetchedCategories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <input
                            id={`category-${category.id}`}
                            name="category"
                            type="radio"
                            value={category.id}
                            checked={selectedCategoryId === category.id.toString()}
                            onChange={handleCategoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm font-medium text-gray-700">
                            {category.category_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Author Accordion */}
              <div className="mb-2 border rounded">
                <button 
                  onClick={() => toggleAccordion('author')} 
                  className="flex justify-between items-center w-full p-3 text-left font-medium"
                >
                  <span>Author</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${openAccordions.author ? 'transform rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {openAccordions.author && (
                  <div className="p-3 border-t">
                    <div className="space-y-2 max-h-60 overflow-auto">
                      <div className="flex items-center">
                        <input
                          id="author-all"
                          name="author"
                          type="radio"
                          value=""
                          checked={selectedAuthorId === ''}
                          onChange={handleAuthorChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="author-all" className="ml-2 block text-sm font-medium text-gray-700">
                          All Authors
                        </label>
                      </div>
                      
                      {fetchedAuthors && fetchedAuthors.map((author) => (
                        <div key={author.id} className="flex items-center">
                          <input
                            id={`author-${author.id}`}
                            name="author"
                            type="radio"
                            value={author.id}
                            checked={selectedAuthorId === author.id.toString()}
                            onChange={handleAuthorChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`author-${author.id}`} className="ml-2 block text-sm font-medium text-gray-700 truncate">
                            {author.author_name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Accordion */}
              <div className="mb-2 border rounded">
                <button 
                  onClick={() => toggleAccordion('rating')} 
                  className="flex justify-between items-center w-full p-3 text-left font-medium"
                >
                  <span>Rating</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${openAccordions.rating ? 'transform rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {openAccordions.rating && (
                  <div className="p-3 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="rating-all"
                          name="rating"
                          type="radio"
                          value=""
                          checked={selectedStarRating === ''}
                          onChange={handleStarRatingChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="rating-all" className="ml-2 block text-sm font-medium text-gray-700">
                          All Ratings
                        </label>
                      </div>
                      
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center">
                          <input
                            id={`rating-${stars}`}
                            name="rating"
                            type="radio"
                            value={stars}
                            checked={selectedStarRating === stars.toString()}
                            onChange={handleStarRatingChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`rating-${stars}`} className="ml-2 flex items-center text-sm font-medium text-gray-700">
                            {/* Display stars */}
                            {Array(stars).fill().map((_, i) => (
                              <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            {stars === 1 ? ' & up' : ' & up'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Book Grid Section */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-700">Showing {displayedBooks.length > 0 ? startIndex + 1 : 0}-{endIndex} of {totalCount} books</p>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Sort By</option>
                    <option value="on-sale">Sort by on sale</option>
                    <option value="price-low-to-high">Price: Low to High</option>
                    <option value="price-high-to-low">Price: High to Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
            {booksLoading ? (
              <div className="text-center py-8">Loading books...</div>
            ) : booksError ? (
              <div className="text-center py-8 text-red-500">Error loading books: {booksError}</div>
            ) : displayedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">No books found with the current filters.</div>
            )}
            {renderPagination()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
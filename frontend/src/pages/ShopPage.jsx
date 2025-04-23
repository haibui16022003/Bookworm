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
  const [currentPage, setCurrentPage] = useState(1);

  const initialSortBy = searchParams.get('sortBy') || '';
  const initialCategoryId = searchParams.get('category') || '';
  const initialAuthorId = searchParams.get('author') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    setSortBy(initialSortBy);
    setSelectedCategoryId(initialCategoryId);
    setSelectedAuthorId(initialAuthorId);
    setCurrentPage(initialPage);
  }, [initialSortBy, initialCategoryId, initialAuthorId, initialPage]);

  const { authors: fetchedAuthors, loading: authorLoading, error: authorError } = useAuthors();
  const { categories: fetchedCategories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Debugging logs
  // useEffect(() => {
  //   console.log('Fetched categories:', fetchedCategories);
  // }, [fetchedCategories]);

  // useEffect(() => {
  //   console.log('Fetched authors:', fetchedAuthors);
  // }, [fetchedAuthors]);

  const saleBooksResult = useOnSaleBooks(
    (currentPage - 1) * ITEMS_PER_PAGE,
    ITEMS_PER_PAGE,
    selectedCategoryId || null,
    selectedAuthorId || null
  );
  
  const normalBooksResult = useBooks(
    (currentPage - 1) * ITEMS_PER_PAGE,
    ITEMS_PER_PAGE,
    selectedCategoryId || null,
    selectedAuthorId || null,
    sortBy === 'price-low-to-high' ? true : sortBy === 'price-high-to-low' ? false : null
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

  // Debugging logs
  useEffect(() => {
    console.log(totalCount, 'Total count from API:', totalCount);
  });

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    console.log('Sort selected:', newSortBy);
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to the first page
    updateQueryParams({ sortBy: newSortBy, category: selectedCategoryId, author: selectedAuthorId, page: 1 });
  };

  const handleCategoryChange = (event) => {
    const newCategoryId = event.target.value;
    console.log('Category selected:', newCategoryId);
    setSelectedCategoryId(newCategoryId);
    setCurrentPage(1); // Reset to the first page on filter
    updateQueryParams({ sortBy, category: newCategoryId, author: selectedAuthorId, page: 1 });
  };

  const handleAuthorChange = (event) => {
    const newAuthorId = event.target.value;
    console.log('Author selected:', newAuthorId);
    setSelectedAuthorId(newAuthorId);
    setCurrentPage(1); // Reset to the first page on filter
    updateQueryParams({ sortBy, category: selectedCategoryId, author: newAuthorId, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateQueryParams({ sortBy, category: selectedCategoryId, author: selectedAuthorId, page: newPage });
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
  console.log('Total pages:', totalPages);
  
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
              <h2 className="text-lg font-semibold mb-2">Filter By</h2>
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-1">Category</h3>
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">All Categories</option>
                    {fetchedCategories && fetchedCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-1">Author</h3>
                <div className="relative">
                  <select
                    value={selectedAuthorId}
                    onChange={handleAuthorChange}
                    className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">All Authors</option>
                    {fetchedAuthors && fetchedAuthors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.author_name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
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
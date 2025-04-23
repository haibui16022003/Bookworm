import React from 'react';
import Layout from '../components/layout/Layout';
import BookCarousel from '../components/books/BookCarousel';
import FeaturedBooks from '../components/books/FeaturedBooks';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useOnSaleBooks, useFeaturedBooks } from '../hooks/useBooks';

const HomePage = () => {
  const {
    books: onSaleBooks,
    loading: loadingOnSale,
    error: errorOnSale,
  } = useOnSaleBooks();
  
  const {
    books: featuredBooks,
    loading: loadingFeatured,
    error: errorFeatured
  } = useFeaturedBooks();

  return (
    <Layout>
      <div className="py-4">
        {loadingOnSale ? (
          <Loading />
        ) : errorOnSale ? (
          <ErrorMessage message={errorOnSale} />
        ) : onSaleBooks.length > 0 ? (
          <BookCarousel
            title="On Sale"
            books={onSaleBooks}
            viewAllLink="/shop?sortBy=on-sale"
          />
        ) : null}
       
        <div className="border-t border-gray-200 mt-4"></div>
       
        {loadingFeatured ? (
          <Loading />
        ) : errorFeatured ? (
          <ErrorMessage message={errorFeatured} />
        ) : (
          <FeaturedBooks books={featuredBooks} />
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
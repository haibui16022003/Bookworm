import React from 'react';
import BookCard from './BookCard';
import TabSection from '../ui/TabSection';
import Loading from '../ui/Loading';
import ErrorMessage from '../ui/ErrorMessage';
import { useFeaturedBooks } from '../../hooks/useBooks';

const FeaturedBooks = () => {
  const { 
    recommendedBooks, 
    recommendedLoading, 
    recommendedError,
    popularBooks,
    popularLoading,
    popularError
  } = useFeaturedBooks();

  const tabs = ['Recommended', 'Popular'];
  
  const loading = recommendedLoading || popularLoading;
  const error = recommendedError || popularError;

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="py-6 flex justify-center">
      <div className="w-full max-w-7xl px-4">
        <h2 className="text-lg font-normal mb-4 text-center">Featured Books</h2>

        <TabSection tabs={tabs}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendedBooks.map((book) => (
              <div key={book.id}>
                <BookCard book={book} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularBooks.map((book) => (
              <div key={book.id}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </TabSection>
      </div>
    </div>
  );
};

export default FeaturedBooks;
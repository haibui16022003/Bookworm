import React, { useState } from 'react';
import BookCard from './BookCard';
import TabSection from '../ui/TabSection';
import { useBooks } from '../../hooks/useBooks';
import Loading from '../ui/Loading';
import ErrorMessage from '../ui/ErrorMessage';

const FeaturedBooks = ({ books: initialBooks }) => {
  // const [activeTab, setActiveTab] = useState('recommended');
  
  const { books: popularBooks, popularLoading, popularError } = useBooks(0, 8);
  const { books: recommendedBooks, recommendedLoading, recommendedError} = useBooks(8, 8);
  
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
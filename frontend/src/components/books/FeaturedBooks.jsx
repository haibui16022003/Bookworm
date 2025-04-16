import React, { useState } from 'react';
import BookCard from './BookCard';
import TabSection from '../ui/TabSection';
import { useBooks } from '../../hooks/useBooks';
import Loading from '../ui/Loading';
import ErrorMessage from '../ui/ErrorMessage';

const FeaturedBooks = ({ books: initialBooks }) => {
  const [activeTab, setActiveTab] = useState('recommended');
  
  // For popular books,fetch a different set or sort differently
  // This is just a placeholder
  const { books: popularBooks, loading, error } = useBooks(0, 8);
  
  const tabs = ['Recommended', 'Popular'];
  
  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="py-6">
      <h2 className="text-lg font-normal mb-4">Featured Books</h2>
      
      <TabSection tabs={tabs}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {initialBooks.slice(0, 8).map((book) => (
            <div key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularBooks.slice(0, 8).map((book) => (
            <div key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </TabSection>
    </div>
  );
};

export default FeaturedBooks;
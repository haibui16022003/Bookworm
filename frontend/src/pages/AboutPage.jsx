import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        
        <hr className="my-6 border-gray-200" />
        
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Welcome to Bookworm</h2>
          
          <p className="text-center max-w-3xl text-gray-700 mb-12">
            "Bookworm is an independent New York bookstore and language school with 
            locations in Manhattan and Brooklyn. We specialize in travel books and language 
            classes."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Story</h3>
              <p className="text-gray-700 mb-4">
                The name Bookworm was taken from the original name for New York International Airport, 
                which was renamed JFK in December 1963.
              </p>
              <p className="text-gray-700 mb-4">
                Our Manhattan store has just moved to the West Village. Our new location is 170 7th 
                Avenue South, at the corner of Perry Street.
              </p>
              <p className="text-gray-700">
                From March 2008 through May 2016, the store was located in the Flatiron District.
              </p>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700 mb-4">
                One of the last travel bookstores in the country, our Manhattan store carries a range of 
                guidebooks (all 10% off) to suit the needs and tastes of every traveler and budget.
              </p>
              <p className="text-gray-700">
                We believe that a novel or travelogue can be just as valuable a key to a place as any 
                guidebook, and our well-read, well-traveled staff is happy to make reading recommendations for 
                any traveler, book lover, or gift giver.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ stars }) => {
    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};


export default StarRating;

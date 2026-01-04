import React from 'react';

const SkeletonLoader = ({ className = "", type = "text" }) => {
    // Basic base classes for pulsing animation and background
    const baseClasses = "animate-pulse bg-gray-200 rounded";

    // Defaults based on type if no className provided, or just generic
    let defaultClasses = "";
    if (type === 'text') defaultClasses = "h-4 w-3/4";
    if (type === 'rect') defaultClasses = "h-32 w-full";
    if (type === 'circle') defaultClasses = "h-12 w-12 rounded-full";

    return (
        <div className={`${baseClasses} ${defaultClasses} ${className}`}></div>
    );
};

export default SkeletonLoader;

import React from "react";

interface BrowsePreloaderProps {
    rows?: number;
    columns?: number;
}

/**
 * Reusable skeleton loader for browse pages with card layout
 * Default: 4 cards per row
 */
const BrowsePreloader: React.FC<BrowsePreloaderProps> = ({
    rows = 2,
    columns = 4,
}) => {
    const totalCards = rows * columns;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: totalCards }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse bg-white rounded-2xl shadow-md p-4 space-y-4"
                >
                    {/* Image Placeholder */}
                    <div className="h-40 w-full bg-gray-200 rounded-xl" />

                    {/* Title Placeholder */}
                    <div className="h-4 bg-gray-200 rounded w-3/4" />

                    {/* Subtitle Placeholder */}
                    <div className="h-3 bg-gray-200 rounded w-1/2" />

                    {/* Button Placeholder */}
                    <div className="h-8 bg-gray-200 rounded w-full" />
                </div>
            ))}
        </div>
    );
};

export default BrowsePreloader;

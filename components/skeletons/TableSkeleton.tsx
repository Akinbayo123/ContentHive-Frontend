import React from "react";

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {Array.from({ length: cols }).map((_, c) => (
                            <th
                                key={c}
                                className="px-4 py-2 bg-gray-200 rounded animate-pulse mb-1"
                            >
                                &nbsp;
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r}>
                            {Array.from({ length: cols }).map((__, c) => (
                                <td
                                    key={c}
                                    className="px-4 py-2 border-t bg-gray-100 animate-pulse"
                                >
                                    &nbsp;
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;

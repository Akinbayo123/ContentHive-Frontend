export default function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="p-6 border border-border rounded-lg space-y-3"
                    >
                        <div className="w-6 h-6 bg-muted rounded"></div>
                        <div className="h-3 w-2/3 bg-muted rounded"></div>
                        <div className="h-6 w-1/2 bg-muted rounded"></div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Recent Content Skeleton */}
                <div className="p-6 border border-border rounded-lg lg:col-span-2 space-y-5">

                    <div className="flex justify-between items-center">
                        <div className="h-4 w-40 bg-muted rounded"></div>
                        <div className="h-8 w-24 bg-muted rounded"></div>
                    </div>

                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center py-3 border-b border-border last:border-0"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-muted rounded"></div>
                                <div className="flex gap-3">
                                    <div className="h-3 w-16 bg-muted rounded"></div>
                                    <div className="h-3 w-16 bg-muted rounded"></div>
                                    <div className="h-3 w-20 bg-muted rounded"></div>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4">
                                <div className="h-8 w-14 bg-muted rounded"></div>
                                <div className="h-8 w-14 bg-muted rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Skeleton */}
                <div className="p-6 border border-border rounded-lg space-y-4">
                    <div className="h-4 w-32 bg-muted rounded"></div>

                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-10 w-full bg-muted rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

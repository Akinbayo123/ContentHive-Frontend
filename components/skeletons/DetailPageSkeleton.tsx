export function DetailPageSkeleton() {
    return (
        <main className="min-h-screen bg-background animate-pulse">
            {/* Navbar Skeleton */}
            <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Preview Image */}
                        <div className="w-full h-96 rounded-xl bg-muted" />

                        {/* Title */}
                        <div className="space-y-3">
                            <div className="h-8 w-2/3 bg-muted rounded" />
                            <div className="h-4 w-1/3 bg-muted rounded" />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-20 bg-muted rounded" />
                                    <div className="h-4 w-28 bg-muted rounded" />
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <div className="h-6 w-48 bg-muted rounded" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-muted rounded" />
                                <div className="h-4 w-5/6 bg-muted rounded" />
                                <div className="h-4 w-4/6 bg-muted rounded" />
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="flex gap-3 mt-4">
                                <div className="h-10 w-32 bg-muted rounded-md" />
                                <div className="h-10 w-24 bg-muted rounded-md" />
                                <div className="h-10 w-28 bg-muted rounded-md" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}

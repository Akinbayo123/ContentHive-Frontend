export function EditContentSkeleton() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full animate-pulse">

            {/* Header */}
            <div className="mb-8 space-y-4">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-48 bg-muted rounded" />
            </div>

            {/* Card */}
            <div className="p-6 border border-border rounded-xl space-y-6">

                {/* Preview Image Skeleton */}
                <div>
                    <div className="h-4 w-32 bg-muted rounded mb-3" />
                    <div className="h-48 w-full bg-muted rounded-lg" />
                </div>

                {/* Content File Skeleton */}
                <div>
                    <div className="h-4 w-40 bg-muted rounded mb-3" />
                    <div className="h-32 w-full bg-muted rounded-lg" />
                </div>

                {/* Title */}
                <div>
                    <div className="h-4 w-20 bg-muted rounded mb-2" />
                    <div className="h-10 w-full bg-muted rounded-lg" />
                </div>

                {/* Description */}
                <div>
                    <div className="h-4 w-32 bg-muted rounded mb-2" />
                    <div className="h-24 w-full bg-muted rounded-lg" />
                </div>

                {/* Category */}
                <div>
                    <div className="h-4 w-28 bg-muted rounded mb-2" />
                    <div className="h-10 w-full bg-muted rounded-lg" />
                </div>

                {/* Price */}
                <div>
                    <div className="h-4 w-24 bg-muted rounded mb-2" />
                    <div className="flex gap-2">
                        <div className="h-10 w-12 bg-muted rounded-lg" />
                        <div className="h-10 flex-1 bg-muted rounded-lg" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                    <div className="h-10 flex-1 bg-muted rounded-lg" />
                    <div className="h-10 flex-1 bg-muted rounded-lg" />
                </div>

            </div>
        </div>
    )
}

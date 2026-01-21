import { Skeleton } from "@/components/ui/skeleton"

export function ServiceCardSkeleton() {
    return (
        <div className="bg-burgos-secondary/20 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
            <Skeleton className="h-48 w-full bg-white/5" /> {/* Image */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-6 w-16 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-2/3 bg-white/5" />
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <Skeleton className="h-4 w-20 bg-white/5" />
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                </div>
            </div>
        </div>
    )
}

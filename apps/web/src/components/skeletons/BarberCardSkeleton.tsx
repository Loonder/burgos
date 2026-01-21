import { Skeleton } from "@/components/ui/skeleton"

export function BarberCardSkeleton() {
    return (
        <div className="flex flex-col items-center space-y-3">
            <Skeleton className="w-24 h-24 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
        </div>
    )
}

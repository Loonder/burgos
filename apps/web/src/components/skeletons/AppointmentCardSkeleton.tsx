import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentCardSkeleton() {
    return (
        <div className="bg-burgos-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-white/10" /> {/* Service Name */}
                        <Skeleton className="h-4 w-48 bg-white/5" />  {/* Date/Time */}
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full bg-white/10" /> {/* Status Badge */}
                </div>

                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-white/10" /> {/* Avatar */}
                    <Skeleton className="h-4 w-32 bg-white/5" /> {/* Barber Name */}
                    <Skeleton className="w-1 h-1 rounded-full bg-white/5" /> {/* Dot */}
                    <Skeleton className="h-4 w-16 bg-white/5" /> {/* Price */}
                </div>
            </div>
        </div>
    )
}

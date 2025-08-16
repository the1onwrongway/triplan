
'use client';

import { TripsView } from '@/components/trips-view';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TripsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="rounded-lg border">
                <div className="flex h-12 items-center px-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto h-4 w-16" />
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center border-t p-4">
                        <div className="flex-1 space-y-1">
                           <Skeleton className="h-5 w-1/3" />
                           <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="w-24">
                            <Skeleton className="h-6 w-16" />
                        </div>
                         <div className="w-32 text-right">
                           <Skeleton className="h-8 w-24 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function TripsPage() {
  return (
    <Suspense fallback={<TripsSkeleton />}>
      <TripsView />
    </Suspense>
  );
}

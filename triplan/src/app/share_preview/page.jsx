"use client";

import { useSearchParams } from 'next/navigation';

export default function SharePreviewPage() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Itinerary Preview</h1>
      <p>This is a blank page for now.</p>
    </div>
  );
}
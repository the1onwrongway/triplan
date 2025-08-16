
'use client';

import type { PredefinedItinerary, ItineraryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ItinerarySelectorProps = {
  predefinedItineraries: PredefinedItinerary[];
  onSelect: (items: ItineraryItem[]) => void;
};

export function ItinerarySelector({ predefinedItineraries, onSelect }: ItinerarySelectorProps) {
  const { toast } = useToast();

  const handleSelect = (itinerary: PredefinedItinerary) => {
    // Assign days and unique IDs to the itinerary items
    const newItems: ItineraryItem[] = itinerary.items.map((item, index) => ({
      ...item,
      id: `itin_${Date.now()}_${index}`,
      day: Math.floor(index / 2) + 1, // Simple logic to distribute activities across days
    }));
    onSelect(newItems);
    toast({
      title: 'Itinerary Applied',
      description: `"${itinerary.name}" has been loaded.`
    });
  };

  if (predefinedItineraries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Apply a Predefined Itinerary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {predefinedItineraries.map((itinerary) => (
          <div key={itinerary.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <List className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{itinerary.name}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => handleSelect(itinerary)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

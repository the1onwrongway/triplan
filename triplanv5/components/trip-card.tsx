import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, User, Edit, Share2 } from 'lucide-react';
import type { Trip } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type TripCardProps = {
  trip: Trip;
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="text-xl">
              <Link href={`/trips/${trip.id}`} className="hover:text-primary transition-colors">
                {trip.title}
              </Link>
            </CardTitle>
            <Badge variant={trip.status === 'shared' ? 'default' : 'secondary'} className="capitalize">
              {trip.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>
            {format(trip.startDate, 'MMM d')} - {format(trip.endDate, 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-2 h-4 w-4" />
          <span>{trip.clientName}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/trips/${trip.id}`}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/share/${trip.id}`} target="_blank">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


'use client';

import { useState, useEffect, useTransition } from 'react';
import { getTrip, updateTrip } from '@/lib/trips-service';
import { notFound, useParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ItineraryBuilder } from '@/components/itinerary-builder';
import type { Trip, ItineraryDay } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { eachDayOfInterval, startOfDay, format, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { generatePdf } from '@/lib/pdf-generator';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';


function TripDetailsSkeleton() {
    return (
        <div>
            <PageHeader title={<Skeleton className='h-9 w-64' />} >
                 <div className="flex gap-2">
                    <Skeleton className='h-10 w-24' />
                    <Skeleton className='h-10 w-36' />
                    <Skeleton className='h-10 w-28' />
                 </div>
            </PageHeader>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                  <Card>
                      <CardContent className="p-6">
                          <Skeleton className="h-6 w-48 mb-4" />
                          <Skeleton className="h-24 w-full" />
                      </CardContent>
                  </Card>
                   <Card>
                      <CardContent className="p-6">
                          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
                             <Skeleton className="h-6 w-48" />
                             <Skeleton className="mt-2 h-4 w-64" />
                          </div>
                      </CardContent>
                  </Card>
              </div>
               <div className="space-y-6 lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>
                             <Skeleton className="h-6 w-32" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
               </div>
            </div>
        </div>
    )
}

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params.id as string;
  const { toast } = useToast();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      if (!tripId) return;
      try {
        setLoading(true);
        const tripData = await getTrip(tripId);
        if (!tripData) {
          notFound();
          return;
        }
        
        const tripDateRange = eachDayOfInterval({
            start: tripData.startDate,
            end: tripData.endDate,
        });

        const newDays: ItineraryDay[] = tripDateRange.map((date, index) => {
            const existingDay = tripData.days.find(d => isSameDay(startOfDay(d.date), startOfDay(date)));
            if (existingDay) return existingDay;
            return {
                id: `day_${date.getTime()}`,
                dayIndex: index + 1,
                date: date,
                title: `Day ${index + 1}`,
                activities: [],
            };
        });

        setTrip(tripData);
        setDays(newDays);

      } catch (err) {
        console.error("Failed to fetch trip data:", err);
        toast({ variant: 'destructive', title: "Error", description: "Could not load trip data."})
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tripId, toast]);

  const handleTripChange = (field: keyof Trip, value: any) => {
    if (trip) {
      setTrip(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleDateChange = (range: {from: Date, to: Date} | undefined) => {
      if (trip && range?.from && range?.to) {
        const updatedTrip = { ...trip, startDate: range.from, endDate: range.to };
        
        const tripDateRange = eachDayOfInterval({
            start: updatedTrip.startDate,
            end: updatedTrip.endDate,
        });

         const newDays: ItineraryDay[] = tripDateRange.map((date, index) => {
            const existingDay = trip.days.find(d => isSameDay(startOfDay(d.date), startOfDay(date)));
            if (existingDay) {
                return {...existingDay, date: startOfDay(date), dayIndex: index + 1};
            }
            return {
                id: `day_${date.getTime()}`,
                dayIndex: index + 1,
                date: startOfDay(date),
                title: `Day ${index + 1}`,
                activities: [],
            };
        });
        updatedTrip.days = newDays;
        setDays(newDays);
        setTrip(updatedTrip);
      }
  }

  const handleDaysChange = (newDays: ItineraryDay[]) => {
      setDays(newDays);
      if (trip) {
        setTrip({...trip, days: newDays});
      }
  }

  const handleSaveChanges = () => {
    if (!trip) return;
    startTransition(async () => {
        try {
            await updateTrip(tripId, trip);
            toast({ title: "Success!", description: "Your trip has been updated." });
        } catch (error: any) {
            console.error("Failed to update trip:", error);
            toast({ variant: 'destructive', title: "Error saving trip", description: error.message || "Could not save trip changes."})
        }
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({ title: "Link copied!", description: "Shareable link copied to clipboard." });
  }

  const handleDownloadPdf = async () => {
    if (!trip) return;
    setIsDownloading(true);
    try {
      await generatePdf(trip);
    } catch(e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error generating PDF",
        description: "There was a problem creating the PDF file."
      })
    } finally {
      setIsDownloading(false);
    }
  }

  if (loading) {
    return <TripDetailsSkeleton />;
  }

  if (!trip) {
    return notFound();
  }

  const shareableLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${trip.id}` 
    : '';

  return (
    <div>
      <PageHeader title={trip.title}>
        <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" /> 
            {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Share Itinerary</h4>
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can view the trip itinerary.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Input id="share-link" readOnly value={shareableLink} className="flex-1" />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
         <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2 lg:order-last">
            <ItineraryBuilder 
                days={days}
                onDaysChange={handleDaysChange} 
            />
        </div>
        <div className="space-y-6 lg:col-span-1 lg:order-first">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input 
                            id="clientName" 
                            value={trip.clientName || ''} 
                            onChange={(e) => handleTripChange('clientName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="clientEmail">Client Email</Label>
                         <Input 
                            id="clientEmail" 
                            type="email"
                            value={trip.clientEmail || ''} 
                            onChange={(e) => handleTripChange('clientEmail', e.target.value)}
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="clientPhone">Client Phone</Label>
                         <Input 
                            id="clientPhone" 
                            type="tel"
                            value={trip.clientPhone || ''} 
                            onChange={(e) => handleTripChange('clientPhone', e.target.value)}
                        />
                    </div>
                     <div className="space-y-1">
                        <Label>Trip Dates</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !trip.startDate && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {trip.startDate ? (
                                    trip.endDate ? (
                                      <>
                                        {format(trip.startDate, 'LLL dd, y')} -{' '}
                                        {format(trip.endDate, 'LLL dd, y')}
                                      </>
                                    ) : (
                                      format(trip.startDate, 'LLL dd, y')
                                    )
                                  ) : (
                                    <span>Pick a date range</span>
                                  )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={trip.startDate}
                                selected={{ from: trip.startDate, to: trip.endDate }}
                                onSelect={(range) => handleDateChange(range as { from: Date; to: Date; })}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle, Edit, Share2, Trash2 } from 'lucide-react';

import type { Trip } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createTrip, deleteTrip, getTrips } from '@/lib/trips-service';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from './ui/skeleton';

const tripFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  clientName: z.string().min(2, 'Client name is required.'),
  clientEmail: z.string().email('A valid email is required.'),
  clientPhone: z.string().min(10, 'A valid phone number is required.'),
  dates: z.object({
    from: z.date({ required_error: 'Start date is required.' }),
    to: z.date({ required_error: 'End date is required.' }),
  }),
});

function TripsSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
              <CardContent className="p-0">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Trip</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {[...Array(3)].map((_, i) => (
                              <TableRow key={i}>
                                  <TableCell>
                                      <Skeleton className="h-5 w-2/5" />
                                      <Skeleton className="mt-2 h-4 w-3/5" />
                                  </TableCell>
                                  <TableCell>
                                      <Skeleton className="h-6 w-16" />
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                          <Skeleton className="h-8 w-8 rounded-full" />
                                          <Skeleton className="h-8 w-8 rounded-full" />
                                          <Skeleton className="h-8 w-8 rounded-full" />
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
            </Card>
        </div>
    )
}


export function TripsView() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      if (user) {
        setDataLoading(true);
        const userTrips = await getTrips();
        setTrips(userTrips);
        setDataLoading(false);
      } else if (!authLoading) {
        // If auth is not loading and there is no user, stop data loading.
        setDataLoading(false);
      }
    }
    fetchTrips();
  }, [user, authLoading]);

  const form = useForm<z.infer<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      dates: {
        from: undefined,
        to: undefined,
      },
    },
  });

  async function onSubmit(values: z.infer<typeof tripFormSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a trip.",
        });
        return;
    }

    try {
       if (!values.dates.from || !values.dates.to) {
        toast({
          variant: 'destructive',
          title: 'Missing Dates',
          description: 'Please select a start and end date for the trip.',
        });
        return;
      }

      const newTripData = {
          title: values.title,
          clientName: values.clientName,
          clientEmail: values.clientEmail,
          clientPhone: values.clientPhone,
          startDate: values.dates.from,
          endDate: values.dates.to,
          status: 'draft' as const,
          days: [],
      };
      
      const newTripId = await createTrip(newTripData);
      
      toast({
          title: "Trip Created!",
          description: `"${values.title}" has been successfully created.`,
      })
      setSheetOpen(false);
      form.reset();
      router.push(`/trips/${newTripId}`);

    } catch (error) {
       console.error("Failed to create trip:", error);
       toast({
        variant: "destructive",
        title: "Failed to create trip",
        description: "An unexpected error occurred."
       })
    }
  }

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;

    try {
        await deleteTrip(tripToDelete.id);
        setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
        toast({
            title: "Trip Deleted",
            description: `"${tripToDelete.title}" has been removed.`,
        });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Error deleting trip",
            description: error.message || "Could not delete the trip."
        });
    } finally {
        setTripToDelete(null);
    }
  }
  
  if (authLoading || dataLoading) {
    return <TripsSkeleton />;
  }

  return (
    <>
      <PageHeader title="Trips">
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Trip
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create a new trip</SheetTitle>
              <SheetDescription>
                Fill in the details below to create a new trip plan.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer in Italy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Email</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Phone</FormLabel>

                      <FormControl>
                        <Input placeholder="(555) 555-5555" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Trip Dates</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value?.from && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, 'LLL dd, y')} -{' '}
                                    {format(field.value.to, 'LLL dd, y')}
                                  </>
                                ) : (
                                  format(field.value.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="pt-4">
                    <SheetClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </SheetClose>
                    <Button type="submit" disabled={authLoading}>
                      {authLoading ? 'Verifying...' : 'Create & Edit Trip'}
                    </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{trip.title}</div>
                    <div className="text-sm text-muted-foreground">{trip.clientName} &middot; {format(trip.startDate, 'MMM d')} - {format(trip.endDate, 'MMM d, yyyy')}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trip.status === 'shared' ? 'default' : 'secondary' } className="capitalize">
                      {trip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/share/${trip.id}`} target="_blank">
                            <Share2 className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/trips/${trip.id}`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => setTripToDelete(trip)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {trips.length === 0 && !dataLoading && (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <h2 className="text-2xl font-bold tracking-tight">No trips yet</h2>
            <p className="text-muted-foreground">Get started by creating a new trip.</p>
        </div>
      )}

      <AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the trip
                "{tripToDelete?.title}" and all of its data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTripToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrip}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </>
  );
}

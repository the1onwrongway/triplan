
import { getTrip } from '@/lib/trips-service';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { MapPin, Clock, FileText, Link2, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type SharePageProps = {
  params: { id: string };
};

export default async function SharePage({ params }: SharePageProps) {
  const trip = await getTrip(params.id);

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="container mx-auto max-w-4xl px-4 py-8">
         <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                 <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <Logo className="h-6 w-6 text-primary" />
                    <span>Your Itinerary by {trip.agencyId || 'Triplan Agency'}</span>
                 </div>
                <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
                {trip.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground md:text-xl">
                {format(trip.startDate, 'MMMM d, yyyy')} - {format(trip.endDate, 'MMMM d, yyyy')}
                </p>
                {trip.summary && <p className="mt-4 max-w-2xl text-muted-foreground">{trip.summary}</p>}
            </div>
            <Button variant="outline" className="w-full shrink-0 md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 pb-16">
        <div className="space-y-12">
          {trip.days.length > 0 ? (
            trip.days
             .sort((a, b) => a.dayIndex - b.dayIndex)
             .map((day) => (
                <div key={day.id} className="relative">
                  <div className="absolute -left-4 top-2 h-full w-0.5 bg-border md:-left-6"></div>
                  <div className="flex items-center gap-4">
                     <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground -translate-x-4 md:-translate-x-6">
                        <span className="font-bold">{day.dayIndex}</span>
                     </div>
                     <h2 className="text-3xl font-bold">{day.title}</h2>
                     <span className="text-lg text-muted-foreground">{format(day.date, 'EEEE, MMM d')}</span>
                  </div>
                  {day.summary && <p className="mt-2 pl-8 text-muted-foreground">{day.summary}</p>}

                  <div className="mt-6 space-y-6 pl-8">
                    {day.activities.map((item) => (
                      <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            {item.time && <span className="text-sm font-medium text-primary">{item.time}</span>}
                        </div>

                        {item.description && <p className="mt-1 text-muted-foreground">{item.description}</p>}

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {item.locationName && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>{item.locationName}</span>
                                </span>
                            )}
                             {item.googleMapsLink && (
                                <a href={item.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary transition-colors hover:underline">
                                    <Link2 className="h-4 w-4" />
                                    <span>View on map</span>
                                </a>
                            )}
                            {item.attachmentUrl && (
                                <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-primary">
                                    <FileText className="h-4 w-4" />
                                    <span>View Attachment</span>
                                </a>
                            )}
                            {item.pocName && (
                                <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    <span>{item.pocName}{item.pocContact && ` (${item.pocContact})`}</span>
                                </span>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <div className="py-16 text-center">
                <p className="text-muted-foreground">No itinerary details have been added yet.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2">
            Powered by <Logo className="h-5 w-5 text-primary" /> Triplan
        </p>
      </footer>
    </div>
  );
}

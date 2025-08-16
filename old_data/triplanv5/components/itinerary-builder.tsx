
'use client';

import type { ItineraryDay, Activity } from '@/lib/types';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MapPin, Trash2, GripVertical, Clock, FileText, Link2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type ItineraryBuilderProps = {
  days: ItineraryDay[];
  onDaysChange: (days: ItineraryDay[]) => void;
};

export function ItineraryBuilder({ days, onDaysChange }: ItineraryBuilderProps) {
  const { toast } = useToast();

  const addActivity = (dayId: string) => {
    const newDays = days.map(day => {
      if (day.id === dayId) {
        const newActivity: Activity = {
          id: `act_${Date.now()}`,
          title: 'New Activity',
        };
        return { ...day, activities: [...day.activities, newActivity] };
      }
      return day;
    });
    onDaysChange(newDays);
    toast({ title: `Activity added` });
  };
  
  const removeActivity = (dayId: string, activityId: string) => {
    const newDays = days.map(day => {
        if (day.id === dayId) {
            return {...day, activities: day.activities.filter(act => act.id !== activityId)}
        }
        return day;
    });
    onDaysChange(newDays);
    toast({ title: 'Activity removed', variant: 'destructive' });
  }

  const defaultAccordionValues = days.map(d => `day-${d.id}`);

  return (
    <Card>
       <CardHeader>
        <CardTitle className="text-xl">Trip Itinerary</CardTitle>
      </CardHeader>
      <CardContent>
        {days.length > 0 ? (
          <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
            {days.map((day) => (
              <AccordionItem value={`day-${day.id}`} key={day.id}>
                <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                  <div className="flex w-full items-center gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground">
                        <span className="text-sm font-bold uppercase">{format(day.date, 'MMM')}</span>
                        <span className="text-2xl font-bold">{format(day.date, 'd')}</span>
                    </div>
                    <div className="flex-1 text-left">
                        <Input defaultValue={day.title || ''} className="border-none text-xl font-semibold shadow-none focus-visible:ring-0" />
                        <p className="text-sm font-normal text-muted-foreground">{format(day.date, 'EEEE')}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pl-4">
                   <Textarea placeholder="Day summary..." defaultValue={day.summary || ''} className="mt-2" />
                  <div className="space-y-4 border-l-2 border-dashed border-primary pl-8">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="group relative rounded-md bg-card p-4 transition-colors hover:bg-secondary/50">
                       <GripVertical className="absolute -left-10 top-4 h-5 w-5 text-muted-foreground cursor-grab" />
                       <div className="flex-grow space-y-3">
                          <Input defaultValue={activity.title || ''} className="border-none text-base font-semibold shadow-none focus-visible:ring-0" placeholder="Activity Title" />
                          <Textarea placeholder="Description..." defaultValue={activity.description || ''} />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input type="time" defaultValue={activity.time || ''} className="text-muted-foreground" />
                            </div>
                             <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Location" defaultValue={activity.locationName || ''} />
                            </div>
                             <div className="col-span-2 flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Google Maps Link" defaultValue={activity.googleMapsLink || ''} />
                            </div>
                             <div className="col-span-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Point of Contact Name" defaultValue={activity.pocName || ''} />
                            </div>
                             <div className="col-span-2 flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Point of Contact Info" defaultValue={activity.pocContact || ''} />
                            </div>
                            <div className="col-span-2">
                                <Button variant="outline" size="sm" className="w-full">
                                    <FileText className="mr-2 h-4 w-4" /> Upload Attachment
                                </Button>
                            </div>
                          </div>
                      </div>
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => removeActivity(day.id, activity.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  </div>
                   <Button variant="outline" size="sm" onClick={() => addActivity(day.id)} className="ml-12 mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
            <h3 className="text-lg font-semibold">Your Itinerary is Empty</h3>
            <p className="text-sm text-muted-foreground">
              Add activities to the days to build your itinerary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

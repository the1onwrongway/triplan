export type Activity = {
  id: string;
  time?: string;
  title: string;
  description?: string;
  locationName?: string;
  googleMapsLink?: string;
  attachmentUrl?: string;
  pocName?: string;
  pocContact?: string;
};

export type ItineraryDay = {
  id: string;
  dayIndex: number;
  date: Date;
  title: string;
  summary?: string;
  activities: Activity[];
};

export type Trip = {
  id: string;
  agencyId: string; // UID of the user/agency who created it
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  summary?: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'shared';
  days: ItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
};


import type { Trip } from './types';
import { addDays, startOfDay } from 'date-fns';

const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip_1',
    title: 'Paris Getaway',
    clientName: 'Alice Johnson',
    clientEmail: 'alice@example.com',
    clientPhone: '555-123-4567',
    startDate: startOfDay(new Date()),
    endDate: startOfDay(addDays(new Date(), 4)),
    status: 'shared',
    summary: 'A romantic 5-day trip to the City of Lights, exploring iconic landmarks, enjoying gourmet food, and soaking in the artistic atmosphere.',
    days: [
      { 
        id: 'day_1_1',
        dayIndex: 1, 
        date: startOfDay(new Date()),
        title: 'Arrival and Eiffel Tower',
        summary: 'Welcome to Paris! Settle in and get ready for an unforgettable evening.',
        activities: [
          { id: 'act_1_1_1', time: '14:00', title: 'Check into Hotel Le Grand', description: 'Arrive at the hotel, check in, and relax after your journey.', locationName: 'Hotel Le Grand, 2 Rue Scribe', googleMapsLink: 'https://maps.app.goo.gl/kG1p3Z3yK2Y9bNf5A' },
          { id: 'act_1_1_2', time: '19:00', title: 'Welcome Dinner at Le Jules Verne', description: 'Gourmet dinner with breathtaking views from the Eiffel Tower.', locationName: 'Eiffel Tower, 2nd Floor', pocName: 'Restaurant Reservations', pocContact: '+33 1 45 55 61 44' },
        ]
      },
      { 
        id: 'day_1_2',
        dayIndex: 2, 
        date: startOfDay(addDays(new Date(), 1)),
        title: 'Art and History',
        summary: 'Immerse yourself in world-class art at the Louvre and explore the historic heart of Paris.',
        activities: [
          { id: 'act_1_2_1', time: '10:00', title: 'Guided Tour of the Louvre Museum', description: 'See masterpieces like the Mona Lisa and Venus de Milo. Pre-booked tickets.', attachmentUrl: '#' },
          { id: 'act_1_2_2', time: '13:00', title: 'Lunch in the Latin Quarter', description: 'Enjoy a classic French bistro lunch.', locationName: 'Latin Quarter' },
          { id: 'act_1_2_3', time: '15:00', title: 'Visit Notre-Dame Cathedral', description: 'View the exterior of the recovering cathedral and learn about its history.' },
        ]
      },
       { 
        id: 'day_1_3',
        dayIndex: 3, 
        date: startOfDay(addDays(new Date(), 2)),
        title: 'Montmartre & Sacré-Cœur',
        summary: 'Explore the charming, artistic neighborhood of Montmartre.',
        activities: [
          { id: 'act_1_3_1', time: '11:00', title: 'Walking tour of Montmartre', description: 'Discover the cobblestone streets and artist squares.'},
          { id: 'act_1_3_2', time: '13:00', title: 'Lunch at a local creperie', description: 'Taste some authentic Parisian crepes.' },
          { id: 'act_1_3_3', time: '15:00', title: 'Visit the Sacré-Cœur Basilica', description: 'Enjoy panoramic views of Paris from the steps of the basilica.' },
        ]
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'trip_2',
    title: 'Roman Holiday',
    clientName: 'Bob Williams',
    clientEmail: 'bob@example.com',
    clientPhone: '555-987-6543',
    startDate: startOfDay(addDays(new Date(), 14)),
    endDate: startOfDay(addDays(new Date(), 17)),
    status: 'draft',
    summary: 'A 4-day immersive experience in the Eternal City, covering ancient ruins, Renaissance art, and delicious Italian cuisine.',
    days: [
       { 
        id: 'day_2_1',
        dayIndex: 1, 
        date: startOfDay(addDays(new Date(), 14)),
        title: 'Ancient Rome',
        summary: 'Step back in time to the age of emperors and gladiators.',
        activities: [
          { id: 'act_2_1_1', time: '09:30', title: 'Colosseum Underground Tour', description: 'Exclusive access to the underground and arena floor. Ticket confirmation attached.', pocName: 'Tour Operator', pocContact: 'info@romantours.com', attachmentUrl: '#' },
          { id: 'act_2_1_2', time: '12:30', title: 'Explore the Roman Forum & Palatine Hill', description: 'Walk through the ruins of the ancient city center.' },
           { id: 'act_2_1_3', time: '19:30', title: 'Dinner in Trastevere', description: 'Experience the vibrant nightlife and authentic food in this charming neighborhood.', locationName: 'Trastevere' },
        ]
      },
      { 
        id: 'day_2_2',
        dayIndex: 2, 
        date: startOfDay(addDays(new Date(), 15)),
        title: 'Vatican City',
        summary: 'A day dedicated to the treasures of the world\'s smallest state.',
        activities: [
          { id: 'act_2_2_1', time: '10:00', title: 'Vatican Museums & Sistine Chapel', description: 'Skip-the-line tickets to see Michelangelo\'s masterpiece.' },
          { id: 'act_2_2_2', time: '14:00', title: 'St. Peter\'s Basilica', description: 'Explore the grandeur of the largest church in the world.' },
        ]
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// This is a temporary solution to keep the app working while transitioning to Firestore
// In a real app, you would remove this file and use trips-service.ts exclusively
if (typeof window !== 'undefined') {
  const localTrips = localStorage.getItem('trips');
  if (!localTrips) {
    localStorage.setItem('trips', JSON.stringify(MOCK_TRIPS));
  }
}

// Simulate API calls
export const getTrips = async (): Promise<Trip[]> => {
  console.log("Using MOCK getTrips");
  return new Promise(resolve => {
    setTimeout(() => {
      const localData = localStorage.getItem('trips');
      if (localData) {
        const trips = JSON.parse(localData).map((trip: any) => ({
          ...trip,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          createdAt: new Date(trip.createdAt),
          updatedAt: new Date(trip.updatedAt),
          days: trip.days.map((day: any) => ({
            ...day,
            date: new Date(day.date),
          }))
        }));
        resolve(trips);
      } else {
        resolve(MOCK_TRIPS);
      }
    }, 500)
  });
};

export const getTrip = async (id: string): Promise<Trip | undefined> => {
  console.log(`Using MOCK getTrip for id: ${id}`);
   return new Promise(resolve => {
    setTimeout(() => {
      const localData = localStorage.getItem('trips');
      const trips = localData ? JSON.parse(localData) : MOCK_TRIPS;
      const trip = trips.find((t: any) => t.id === id);
       if (trip) {
        resolve({
          ...trip,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          createdAt: new Date(trip.createdAt),
          updatedAt: new Date(trip.updatedAt),
           days: trip.days.map((day: any) => ({
            ...day,
            date: new Date(day.date),
          }))
        });
      } else {
        resolve(undefined);
      }
    }, 500)
  });
};

export const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    console.log("Using MOCK createTrip");
    return new Promise(resolve => {
        setTimeout(() => {
            const localData = localStorage.getItem('trips');
            let trips = localData ? JSON.parse(localData) : MOCK_TRIPS;
            const newTrip = {
                ...tripData,
                id: `trip_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            trips.push(newTrip);
            localStorage.setItem('trips', JSON.stringify(trips));
            resolve(newTrip.id);
        }, 500);
    });
}

export const updateTrip = async (id: string, updates: Partial<Trip>): Promise<void> => {
    console.log(`Using MOCK updateTrip for id: ${id}`);
     return new Promise(resolve => {
        setTimeout(() => {
            const localData = localStorage.getItem('trips');
            let trips = localData ? JSON.parse(localData) : MOCK_TRIPS;
            const tripIndex = trips.findIndex((t: any) => t.id === id);
            if (tripIndex !== -1) {
                trips[tripIndex] = { 
                    ...trips[tripIndex], 
                    ...updates, 
                    updatedAt: new Date().toISOString(),
                    // Ensure dates are stored as strings
                    startDate: updates.startDate ? updates.startDate.toISOString() : trips[tripIndex].startDate,
                    endDate: updates.endDate ? updates.endDate.toISOString() : trips[tripIndex].endDate,
                    days: updates.days ? updates.days.map(d => ({...d, date: d.date.toISOString()})) : trips[tripIndex].days,
                };
                localStorage.setItem('trips', JSON.stringify(trips));
            }
            resolve();
        }, 500);
    });
}

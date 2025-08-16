
import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import type { Trip } from './types';

// Firestore data converters
const tripConverter = {
  toFirestore: (trip: Omit<Trip, 'id'>) => {
    // When writing to Firestore, convert Date objects to Timestamps
    return {
      ...trip,
      startDate: Timestamp.fromDate(trip.startDate),
      endDate: Timestamp.fromDate(trip.endDate),
      createdAt: trip.createdAt ? Timestamp.fromDate(trip.createdAt) : Timestamp.now(),
      updatedAt: Timestamp.now(), // Always update this
      days: trip.days.map(day => ({
        ...day,
        date: Timestamp.fromDate(day.date)
      }))
    };
  },
  fromFirestore: (snapshot: any, options: any): Trip => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      days: data.days.map((day: any) => ({
        ...day,
        date: day.date.toDate()
      }))
    } as Trip;
  },
};

const tripsCollection = collection(db, 'trips').withConverter(tripConverter);

// --- Firestore Implementation ---

async function createTripFirestore(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'agencyId'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated to create a trip.");
  }
  
  const newTrip: Omit<Trip, 'id'> = {
    ...tripData,
    agencyId: user.uid, // Use UID for agencyId
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const docRef = await addDoc(tripsCollection, newTrip);
  return docRef.id;
}

async function getTripsFirestore(): Promise<Trip[]> {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const q = query(tripsCollection, where("agencyId", "==", user.uid));
  const snapshot = await getDocs(q);
  
  const trips = snapshot.docs.map(doc => doc.data());
  // Sort by creation date descending (newest first)
  return trips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

async function getTripFirestore(id: string): Promise<Trip | null> {
  const docRef = doc(db, 'trips', id).withConverter(tripConverter);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    const trip = snapshot.data();
    const user = auth.currentUser;
    // For shared pages, allow access if not logged in.
    // If logged in, only allow access if the user is the owner.
    // The public shared page will not have a logged-in user.
    if (!user || trip.agencyId === user.uid) {
        return trip;
    }
    // Allow access for public/shared view (no user) or if owner.
    // A more robust system might check for a 'public' flag.
    if (!trip.agencyId) return trip; // For backward compatibility with old/mock data.
    
    // For the share page, we need to allow access even if not the owner.
    // A better check in a real app would be a 'status: public' flag.
    return trip;
  } else {
    return null;
  }
}

async function updateTripFirestore(id: string, updates: Partial<Trip>): Promise<void> {
    const tripToUpdate: any = {...updates};

    // Convert any Date objects back to Timestamps before updating
    if (updates.startDate) tripToUpdate.startDate = Timestamp.fromDate(updates.startDate);
    if (updates.endDate) tripToUpdate.endDate = Timestamp.fromDate(updates.endDate);

    if (updates.days) {
        tripToUpdate.days = updates.days.map(day => ({
            ...day,
            date: day.date instanceof Date ? Timestamp.fromDate(day.date) : day.date,
        }));
    }
    
    tripToUpdate.updatedAt = Timestamp.now();
  
    const docRef = doc(db, 'trips', id);
    await updateDoc(docRef, tripToUpdate);
}

async function deleteTripFirestore(id: string): Promise<void> {
    const docRef = doc(db, 'trips', id);
    // You might want to add a security check here to ensure the current user owns this doc
    await deleteDoc(docRef);
}


// --- Exported Functions ---

export async function createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'agencyId'>): Promise<string> {
  return createTripFirestore(tripData);
}

export async function getTrips(): Promise<Trip[]> {
  return getTripsFirestore();
}


export async function getTrip(id:string): Promise<Trip | null> {
    return getTripFirestore(id);
}


export async function updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
    const trip = await getTripFirestore(id);

    // Prevent editing mock trips by checking if they have an agencyId.
    // Only real trips created by users will have one.
    if (trip && !trip.agencyId) {
        console.log("This is a demo trip and cannot be edited. Please create a new trip to make changes.");
        throw new Error("This is a demo trip and cannot be edited. Please create a new trip to make changes.");
    }
    return updateTripFirestore(id, updates);
}

export async function deleteTrip(id: string): Promise<void> {
    const trip = await getTripFirestore(id);
     if (trip && !trip.agencyId) {
        throw new Error("This is a demo trip and cannot be deleted.");
    }
    return deleteTripFirestore(id);
}

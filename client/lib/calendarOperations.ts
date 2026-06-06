import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'deadline';
  startDate: Timestamp;
  endDate?: Timestamp;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
  color: string;
  teacherId: string;
  teacherName: string;
  classroomId?: string;
  classroomName?: string;
  isImportant?: boolean;
  isCompleted?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get color based on event type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'class': return 'bg-blue-500';
    case 'assignment': return 'bg-orange-500';
    case 'exam': return 'bg-red-500';
    case 'meeting': return 'bg-green-500';
    case 'deadline': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

// Create a new calendar event
export const createCalendarEvent = async (
  teacherId: string,
  teacherName: string,
  eventData: Omit<CalendarEvent, 'id' | 'teacherId' | 'teacherName' | 'createdAt' | 'updatedAt' | 'color'>
): Promise<CalendarEvent> => {
  try {
    const now = Timestamp.now();
    const color = getEventColor(eventData.type);
    
    const newEvent = {
      ...eventData,
      teacherId,
      teacherName,
      color,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'calendar_events'), newEvent);
    
    return {
      id: docRef.id,
      ...newEvent,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error('Failed to create calendar event');
  }
};

// Get teacher's calendar events
export const getTeacherCalendarEvents = async (teacherId: string): Promise<CalendarEvent[]> => {
  try {
    let q = query(
      collection(db, 'calendar_events'),
      where('teacherId', '==', teacherId)
    );
    
    let querySnapshot;
    try {
      // Try with orderBy
      q = query(
        collection(db, 'calendar_events'),
        where('teacherId', '==', teacherId),
        orderBy('startDate', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.warn('Index not available for calendar events orderBy, fetching without sorting:', indexError);
      // Fallback without orderBy
      q = query(
        collection(db, 'calendar_events'),
        where('teacherId', '==', teacherId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const events: CalendarEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent);
    });
    
    // Sort in memory if we couldn't sort in the query
    events.sort((a, b) => {
      const aTime = a.startDate?.seconds || 0;
      const bTime = b.startDate?.seconds || 0;
      return bTime - aTime;
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching teacher calendar events:', error);
    return [];
  }
};

// Get student's calendar events (from enrolled classrooms)
export const getStudentCalendarEvents = async (studentId: string): Promise<CalendarEvent[]> => {
  try {
    // First, get all classrooms the student is enrolled in
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('status', '==', 'active')
    );
    
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    const classroomIds: string[] = [];
    
    enrollmentSnapshot.forEach((doc) => {
      const data = doc.data();
      classroomIds.push(data.classroomId);
    });
    
    if (classroomIds.length === 0) {
      return [];
    }
    
    // Get events for all enrolled classrooms
    // Note: Firestore 'in' queries support up to 10 items
    const events: CalendarEvent[] = [];
    
    // Process in batches of 10
    for (let i = 0; i < classroomIds.length; i += 10) {
      const batch = classroomIds.slice(i, i + 10);
      
      const eventsQuery = query(
        collection(db, 'calendar_events'),
        where('classroomId', 'in', batch)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      
      eventsSnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        } as CalendarEvent);
      });
    }
    
    // Sort by start date
    events.sort((a, b) => {
      const aTime = a.startDate?.seconds || 0;
      const bTime = b.startDate?.seconds || 0;
      return bTime - aTime;
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching student calendar events:', error);
    return [];
  }
};

// Get events for a specific date range
export const getEventsInRange = async (
  userId: string,
  isTeacher: boolean,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    let allEvents: CalendarEvent[] = [];
    
    if (isTeacher) {
      allEvents = await getTeacherCalendarEvents(userId);
    } else {
      allEvents = await getStudentCalendarEvents(userId);
    }
    
    // Filter events within the date range
    const filteredEvents = allEvents.filter(event => {
      const eventStart = event.startDate.seconds;
      const eventEnd = event.endDate?.seconds || eventStart;
      
      return (
        (eventStart >= startTimestamp.seconds && eventStart <= endTimestamp.seconds) ||
        (eventEnd >= startTimestamp.seconds && eventEnd <= endTimestamp.seconds) ||
        (eventStart <= startTimestamp.seconds && eventEnd >= endTimestamp.seconds)
      );
    });
    
    return filteredEvents;
  } catch (error) {
    console.error('Error fetching events in range:', error);
    return [];
  }
};

// Update calendar event
export const updateCalendarEvent = async (
  eventId: string,
  updateData: Partial<Omit<CalendarEvent, 'id' | 'teacherId' | 'createdAt'>>
): Promise<void> => {
  try {
    const eventRef = doc(db, 'calendar_events', eventId);
    
    await updateDoc(eventRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error('Failed to update calendar event');
  }
};

// Delete calendar event
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  try {
    const eventRef = doc(db, 'calendar_events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error('Failed to delete calendar event');
  }
};

// Mark event as completed
export const markEventAsCompleted = async (eventId: string, isCompleted: boolean): Promise<void> => {
  try {
    await updateCalendarEvent(eventId, { isCompleted });
  } catch (error) {
    console.error('Error marking event as completed:', error);
    throw new Error('Failed to update event status');
  }
};

// Get events for a specific classroom
export const getClassroomEvents = async (classroomId: string): Promise<CalendarEvent[]> => {
  try {
    const q = query(
      collection(db, 'calendar_events'),
      where('classroomId', '==', classroomId)
    );
    
    const querySnapshot = await getDocs(q);
    const events: CalendarEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent);
    });
    
    // Sort by start date
    events.sort((a, b) => {
      const aTime = a.startDate?.seconds || 0;
      const bTime = b.startDate?.seconds || 0;
      return aTime - bTime;
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching classroom events:', error);
    return [];
  }
};

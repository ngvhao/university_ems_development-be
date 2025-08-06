export interface IScheduleCalculationData {
  coursesToSchedule: Array<{
    courseId: number;
    credits: number;
    totalSemesterSessions: number;
    registeredStudents: number;
    potentialLecturerIds: number[];
  }>;
  semesterId: number;
  semesterStartDate: Date;
  semesterEndDate: Date;
  daysOfWeek: string[];
  timeSlots: Array<{
    id: number;
    startTime: string;
    endTime: string;
    shift: number;
  }>;
  lecturers: Array<{
    lecturerId: number;
  }>;
  rooms: Array<{
    id: number;
    roomNumber: string;
    buildingName: string;
    floor: string;
    roomType: string;
    capacity: number;
  }>;
  exceptionDates?: string[];
  occupiedSlots?: Array<{
    resourceType: 'room' | 'lecturer';
    resourceId: number | string;
    date: string;
    timeSlotId: number;
  }>;
  groupSizeTarget?: number;
  maxSessionsPerWeekAllowed?: number;
}

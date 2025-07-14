import { EExamType } from '../enums/exam.enum';

export interface ExamScheduleResponse {
  id: number;
  examType: EExamType;
  examDate: Date;
  startTime: string;
  endTime: string;
  notes: string | null;
  course: {
    id: number;
    courseCode: string;
    name: string;
    credit: number;
  };
  classGroup: {
    id: number;
    classGroupCode: string;
  };
  room: {
    id: number;
    roomCode: string;
    roomName: string;
    building: string;
    floor: number;
  };
  semester: {
    id: number;
    semesterCode: string;
    semesterName: string;
  };
}

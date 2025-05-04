export interface QueueMessage {
  type: 'student' | 'course-registration' | 'notification';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  status?: string;
}

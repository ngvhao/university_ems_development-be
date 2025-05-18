export interface QueueMessage {
  type: 'student-enrollment' | 'course-registration' | 'notification';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  status?: string;
}
export interface SendMessageOptions {
  isFifo?: boolean;
  groupId?: string;
}

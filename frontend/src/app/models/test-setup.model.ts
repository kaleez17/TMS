export interface TestSetupDTO {
  studentNo: number;
  studentId: string;
  studentName?: string;
  mobileNo?: string;
  testNo: number;
  testDate: string;
  courseId: string;
  courseNo: number;
  topicName?: string;
  lvl: number;
  testConductedBy: string;
  evaluatorName?: string;
  executedDate?: string;
  stat?: string;      // 0 = Scheduled, 1 = Completed, 2 = Locked
  lockRemainingSeconds?: number;  // only while stat = 2: seconds left (0..86400), calculated by the server
  entryBy?: string;
  entryDate?: string;
  delFlag: string;
  noOfQuestions?: number;
  timePerTest?: number;
}
export interface Evaluator {
  id: string;
  trxnName: string;
}
export interface TopicItem {
  courseDetId: number;
  topic: string;
}
export interface StudentSearchDTO {
  studentNo: number;
  studentId: string;
  studentName: string;
  mobileNo: string;
}

export interface CourseDetDTO {
  courseId: string;
  courseDetId: number;
  topic: string;
}

export interface Evaluator {
  id: string;
  trxnName: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
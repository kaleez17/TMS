export interface TestSetupItem {
  studentNo: number;
  studentId: string;
  studentName?: string;
  mobileNo?: number | string;
  testNo: number;
  testDate: string; // ISO yyyy-MM-dd
  courseId: string;
  courseNo: number;
  tech?: string;
  topic?: string;
  lvl?: number;
  testLevel: number;
  noOfQuestions: number;
  duration?: number;
  testConductedBy?: string;
  level?: number;
  executedDate?: string;
  timePerTest: number;
  timeTakenSeconds:number;
  stat?: number; // 0: Pending/Scheduled, 1: Attended/Completed
  score?: number;

  studyMode?: string;
  assignedStaff?: string;
  joiningDate?: string;
}

export interface TestQuestion {
  questionNo: number;
  courseId: string;
  courseNo: number;
  question: string;
  opt1: string;
  opt2: string;
  opt3: string;
  opt4: string;
  timeLimitSeconds: number;
}

export interface TestAnswerSubmitPayload {
  studentNo: number;
  studentId: string;
  testNo: number;
  testDate: string; // yyyy-MM-dd
  questionNo: number;
  courseId: string;
  courseNo: number;
  selectedAns: string;
  timeTakenSeconds: number;
}
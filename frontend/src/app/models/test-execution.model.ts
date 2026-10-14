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
  stat?: number | string; // 0: Scheduled, 1: Completed, 2: Locked
  lockRemainingSeconds?: number;  // only while stat = 2: seconds left (0..86400), calculated by the server
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
/** One attended question of a completed test ("View More") */
export interface TestQuestionResult {
  questionNo: number;   // Q.No: original number in the Question Bank
  question: string;
  optA?: string;
  optB?: string;
  optC?: string;
  optD?: string;
  studentAnswer: string;          // A / B / C / D (attended questions only)
  correctAnswer: string;
  score: number;                  // 1 = correct, 0 = wrong / not answered
}

export interface TestResultDetails {
  totalAssigned: number;    // questions assigned in the test setup
  totalAttended: number;    // questions the student answered
  totalScore: number;       // sum of per-question scores
  questions: TestQuestionResult[];   // attended questions only
}

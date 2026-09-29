export interface TmsQuestionBank {
  courseId: string;
  courseNo: number;
  questionNo: number;
  topic: string;
  levels: number;
  question: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  ans: string;
  scores: number;
  enteredBy?: string;
  enteredDate?: string;
  delFlg?: string;
}
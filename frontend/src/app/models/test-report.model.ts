/** Card counts returned by GET /api/test-report/summary */
export interface TestReportSummary {
  allocated: number;
  completed: number;
  scheduled: number;
  locked: number;
}

export type TestReportCategory = 'ALLOCATED' | 'COMPLETED' | 'SCHEDULED' | 'LOCKED';

export interface CourseMaster {
  id: string;
  tech: string;
  topic: string;
  durationWeek?: number;
  hours?: number;
  entryBy?: string;
  entryDate?: string;
  delFlg?: string;
}

export interface CourseDet {
  courseId: string;
  courseDetId: number;
  tech: string;
  topic: string;
  durationWeek?: number;
  hours?: number;
  entryBy?: string;
  entryDate?: string;
  delFlg?: string;
}
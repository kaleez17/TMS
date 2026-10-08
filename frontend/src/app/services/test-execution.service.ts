import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestSetupItem, TestQuestion, TestAnswerSubmitPayload } from '../models/test-execution.model';

@Injectable({
  providedIn: 'root'
})
export class TestExecutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/exam-execution'; 

  getMyTests(): Observable<TestSetupItem[]> {
    return this.http.get<TestSetupItem[]>(`${this.baseUrl}/my-tests`);
  }

getQuestions(courseId: any, courseNo: any, level: any, limit: any, duration: any): Observable<any> {
  const params = new HttpParams()
    .set('courseId', String(courseId))
    .set('courseNo', String(courseNo))
    .set('level', String(level))
    .set('limit', String(limit))
    .set('timePerTestMinutes', String(duration));

  return this.http.get(`${this.baseUrl}/questions`, { params });
}

submitAnswer(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/submit-answer`, payload);
}

resetAttempt(studentNo: any, studentId: any, testNo: any, testDate: any): Observable<any> {
  const params = new HttpParams()
    .set('studentNo', String(studentNo))
    .set('studentId', String(studentId))
    .set('testNo', String(testNo))
    .set('testDate', String(testDate));

  return this.http.delete(`${this.baseUrl}/reset-attempt`, { params });
}

completeTest(studentNo: any, studentId: any, testNo: any, testDate: any): Observable<any> {
  const params = new HttpParams()
    .set('studentNo', String(studentNo))
    .set('studentId', String(studentId))
    .set('testNo', String(testNo))
    .set('testDate', String(testDate));

  return this.http.post(`${this.baseUrl}/complete-test`, null, { params });
}
getTestSummary(studentNo: number, studentId: string, testNo: number, testDate: string): Observable<any> {
  const params = new HttpParams()
    .set('studentNo', studentNo.toString())
    .set('studentId', studentId)
    .set('testNo', testNo.toString())
    .set('testDate', testDate);

  return this.http.get<any>(`${this.baseUrl}/test-summary`, { params });
}
}
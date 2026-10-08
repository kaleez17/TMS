import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestSetupDTO, StudentSearchDTO, CourseDetDTO, Evaluator, PageResponse } from '../models/test-setup.model';

@Injectable({ providedIn: 'root' })
export class TestSetupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/test-setup';

  getGridData(studentNo?: number | null, status: string = 'ALL', page: number = 0, size: number = 10): Observable<PageResponse<TestSetupDTO>> {
    let params = new HttpParams().set('status', status).set('page', page).set('size', size);
    if (studentNo) params = params.set('studentNo', studentNo);
    return this.http.get<PageResponse<TestSetupDTO>>(this.baseUrl, { params });
  }

  getNextTestNo(studentNo: number, testDate: string): Observable<number> {
    const params = new HttpParams().set('studentNo', studentNo).set('testDate', testDate);
    return this.http.get<number>(`${this.baseUrl}/next-test-no`, { params });
  }

  getCourses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/courses`);
  }

  getCourseDetails(courseId: string): Observable<CourseDetDTO[]> {
    return this.http.get<CourseDetDTO[]>(`${this.baseUrl}/course-details`, { params: { courseId } });
  }

  getEvaluators(): Observable<Evaluator[]> {
    return this.http.get<Evaluator[]>(`${this.baseUrl}/evaluators`);
  }

  searchStudents(query: string): Observable<StudentSearchDTO[]> {
    return this.http.get<StudentSearchDTO[]>(`${this.baseUrl}/students`, { params: { query } });
  }

  create(dto: TestSetupDTO): Observable<any> {
    return this.http.post(this.baseUrl, dto);
  }

  update(dto: TestSetupDTO): Observable<any> {
    return this.http.put(this.baseUrl, dto);
  }
}
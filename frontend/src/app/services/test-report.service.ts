import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TestSetupDTO } from '../models/test-setup.model';
import { TestReportCategory, TestReportSummary } from '../models/test-report.model';

@Injectable({ providedIn: 'root' })
export class TestReportService {

  private readonly baseUrl = `${environment.apiUrl}/test-report`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<TestReportSummary> {
    return this.http.get<TestReportSummary>(`${this.baseUrl}/summary`);
  }

  /** Locked (2) -> Scheduled (0) */
  unlock(studentNo: number, studentId: string, testNo: number, testDate: string): Observable<void> {
    const params = new HttpParams()
      .set('studentNo', String(studentNo))
      .set('studentId', studentId)
      .set('testNo', String(testNo))
      .set('testDate', testDate);
    return this.http.post<void>(`${this.baseUrl}/unlock`, null, { params });
  }

  // Reuses the existing TestSetupDTO - same fields as the Test Setup grid.
  getDetails(category: TestReportCategory, name: string, studentNo: number | null): Observable<TestSetupDTO[]> {
    let params = new HttpParams().set('category', category);
    if (name?.trim()) params = params.set('name', name.trim());
    if (studentNo !== null && studentNo !== undefined) params = params.set('studentNo', studentNo);
    return this.http.get<TestSetupDTO[]>(`${this.baseUrl}/details`, { params });
  }
}

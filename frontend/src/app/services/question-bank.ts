import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseMaster, CourseDet } from '../models/course';
import { TmsQuestionBank } from '../models/question';
import { environment } from '../../environments/environment'; 


@Injectable({
  providedIn: 'root'
})
export class QuestionBankService {
  getQuestions(params: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/questions`, { params });
  }

 
  private baseUrl = environment.questionBankApiUrl;

  constructor(private http: HttpClient) {}

  
  getCourses(): Observable<CourseMaster[]> {
    return this.http.get<CourseMaster[]>(`${this.baseUrl}/courses`);
  }

  
  getCourseDetails(courseId: string): Observable<CourseDet[]> {
    return this.http.get<CourseDet[]>(`${this.baseUrl}/courses/${courseId}/details`);
  }

  
  getQuestionNumbers(courseId: string, courseNo: number): Observable<number[]> {
    const params = new HttpParams()
      .set('courseId', courseId)
      .set('courseNo', courseNo.toString());
    return this.http.get<number[]>(`${this.baseUrl}/questions/numbers`, { params });
  }

  
  getAllQuestions(courseId?: string, courseNo?: number, questionNo?: number): Observable<TmsQuestionBank[]> {
    let params = new HttpParams();
    if (courseId) params = params.set('courseId', courseId);
    if (courseNo) params = params.set('courseNo', courseNo.toString());
    if (questionNo) params = params.set('questionNo', questionNo.toString());

    return this.http.get<TmsQuestionBank[]>(`${this.baseUrl}/questions`, { params });
  }

  
  addQuestion(question: TmsQuestionBank): Observable<TmsQuestionBank> {
    return this.http.post<TmsQuestionBank>(`${this.baseUrl}/questions`, question);
  }

 
  updateQuestion(question: TmsQuestionBank): Observable<TmsQuestionBank> {
    return this.http.put<TmsQuestionBank>(
      `${this.baseUrl}/questions/${question.courseId}/${question.courseNo}/${question.questionNo}`,
      question
    );
  }
}
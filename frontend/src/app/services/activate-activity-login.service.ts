import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActivityLog {
  userName: string;
  role: string;
  loginDateTime: string | null;
  loginStatus: string;
  logoutDateTime: string | null;
  activityInfo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivateActivityLoginService {

  private apiUrl = 'http://localhost:8080/api/activity-logs';

  constructor(private http: HttpClient) {}

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(this.apiUrl);
  }
}

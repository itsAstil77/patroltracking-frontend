
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = 'http://172.16.100.68:5000';

  constructor(private http: HttpClient) {}

  private getTokenHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getReportByPatrolId(patrolId: string , type: string,startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/reports/${patrolId}?type=${type}&startDateTime=${startDate}&endDateTime=${endDate}`, {
      headers: this.getTokenHeaders()
    });
  }

  getFilteredReportByPatrolId(patrolId: string, startDate: string, endDate: string,type:string): Observable<any> {
    const url = `${this.baseUrl}/reports/${patrolId}?startDateTime=${startDate}&endDateTime=${endDate}&type=${type}`;
    return this.http.get<any>(url, { headers: this.getTokenHeaders() });
  }

   getConsolidatedReport(type: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.baseUrl}/reports/all?type=${type}&startDateTime=${startDate}&endDateTime=${endDate}`;
    return this.http.get<any>(url, { headers: this.getTokenHeaders() });
  }
}

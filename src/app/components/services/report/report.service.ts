
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class ReportService {



  private baseUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}

  private getTokenHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getReportByPatrolId(patrolId: string , type: string,startDate: string, endDate: string,  page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}reports/${patrolId}?type=${type}&startDateTime=${startDate}&endDateTime=${endDate}&page=${page}&limit=${limit}`, {
      headers: this.getTokenHeaders()
    });
  }

  getFilteredReportByPatrolId(patrolId: string, startDate: string, endDate: string,type:string, page: number, limit: number): Observable<any> {
    const url = `${this.baseUrl}reports/${patrolId}?startDateTime=${startDate}&endDateTime=${endDate}&type=${type}&page=${page}&limit=${limit}`;
    return this.http.get<any>(url, { headers: this.getTokenHeaders() });
  }

   getConsolidatedReport(type: string, startDate: string, endDate: string,page: number, limit: number): Observable<any> {
    const url = `${this.baseUrl}reports/all?type=${type}&startDateTime=${startDate}&endDateTime=${endDate}&page=${page}&limit=${limit}`;
    return this.http.get<any>(url, { headers: this.getTokenHeaders() });
  }
}

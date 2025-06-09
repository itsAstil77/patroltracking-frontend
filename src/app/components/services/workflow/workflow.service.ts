
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private baseUrl = 'http://172.19.9.152:5004';


  constructor(private http: HttpClient) { }


  getWorkflows(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


     return this.http.get(`${this.baseUrl}/workflow?page=${page}&limit=${limit}`, { headers });
  }

  getChecklistByWorkflowId(workflowId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/checklists/${workflowId}`, { headers });
  }

  createWorkflow(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post('http://172.19.9.152:5004/workflow/create', data, { headers });
  }

  private checklistUrl = 'http://172.19.9.152:5004/checklists';

  createChecklist(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(this.checklistUrl, data, { headers });
  }


  getPatrolUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get('http://172.19.9.152:5004/signup/non-admin', { headers });
  }
  
  updateWorkflow(workflowId: string, payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.put(`http://172.19.9.152:5004/workflow/update/${workflowId}`, payload, { headers });
  }


  private checkbaseUrl = 'http://172.19.9.152:5004/checklists';

  updateChecklist(checklistId: string, payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.checkbaseUrl}/update/${checklistId}`, payload, { headers });
  }

  getChecklistByWorkflowIds(workflowId: string): Observable<any> {
    const token = localStorage.getItem('token'); // or sessionStorage.getItem('token')
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    const url = `http://172.19.9.152:5004/workflow/${workflowId}/checklists`;
    return this.http.get<any>(url, { headers });
  }
  
  
  private apiUrl = 'http://172.19.9.152:5004/locationcode';
  getLocationSummary(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }


  private assignUrl = 'http://172.19.9.152:5004/checklists/assign';
  assignChecklist(checklistId: string, requestBody: any): Observable<any> {
    const token = localStorage.getItem('token'); // or sessionStorage.getItem('token') 
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.assignUrl}/${checklistId}`;
    return this.http.put<any>(url, requestBody, { headers });
  }
}



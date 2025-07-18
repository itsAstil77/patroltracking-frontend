
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  // private baseUrl = 'http://172.16.100.68:5000';
  

   private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getWorkflows(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    return this.http.get(`${this.baseUrl}workflow?page=${page}&limit=${limit}`, { headers });
  }

  getChecklistByWorkflowId(workflowId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}checklists/${workflowId}`, { headers });
  }

  createWorkflow(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}workflow/create`, data, { headers });
  }

  // private checklistUrl = 'http://172.16.100.68:5000/checklists';

  createChecklist(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.baseUrl}checklists`, data, { headers });
  }


  getPatrolUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}signup/non-admin`, { headers });
  }

  updateWorkflow(workflowId: string, payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.baseUrl}workflow/update/${workflowId}`, payload, { headers });
  }


  // private checkbaseUrl = 'http://172.16.100.68:5000/checklists';

  updateChecklist(checklistId: string, payload: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put(`${this.baseUrl}checklists/update/${checklistId}`, payload, { headers });
  }

  getChecklistByWorkflowIds(workflowId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // const url = `http://172.16.100.68:5000/workflow/${workflowId}/checklists`;
    return this.http.get<any>(`${this.baseUrl}workflow/${workflowId}/checklists`, { headers });
  }


  // private apiUrl = 'http://172.16.100.68:5000/locationcode';
  getLocationSummary(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.baseUrl}locationcode`, { headers });
  }


  // private assignUrl = 'http://172.16.100.68:5000/checklists/assign';
  assignChecklist(checklistId: string, requestBody: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    // const url = `${this.assignUrl}/${checklistId}`;
    return this.http.put<any>(`${this.baseUrl}checklists/assign/${checklistId}`, requestBody, { headers });
  }
}



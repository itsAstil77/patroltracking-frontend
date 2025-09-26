import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';




@Injectable({
  providedIn: 'root'
})
export class PatrolCreationService {

  constructor(private http: HttpClient) { }

  private baseUrl = environment.apiUrl;

  // private apiUrl = 'http://172.16.100.68:5000/signup/users';



  getUsers(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.baseUrl}signup/users?page=${page}&limit=${limit}`, { headers });
  }


  // private baseUrl = 'http://172.16.100.68:5000';

  createUser(userData: any): Observable<any> {
    const token = localStorage.getItem('token'); // adjust if you use sessionStorage or another key
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}signup`, userData, { headers });
  }


  updateUser(userId: string, userData: any): Observable<any> {
    const token = localStorage.getItem('token'); // or use sessionStorage if needed
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.baseUrl}signup/${userId}`, userData, { headers });
  }

  deleteUser(userId: string): Observable<any> {
    const token = localStorage.getItem('token');  // or sessionStorage if you use that
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}signup/${userId}`, { headers });
  }


  // private roleUrl = 'http://172.16.100.68:5000/roles';



  getRoles(): Observable<any> {
    const token = localStorage.getItem('token'); // or wherever your token is stored
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}roles`, { headers });
  }


  getTask() {
    const token = localStorage.getItem('token'); // or wherever your token is stored
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}checklists/wf-null`, { headers })
  }

  createTask(taskData: any) {
    const token = localStorage.getItem('token'); // or wherever your token is stored
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}checklists/chk/create`, taskData, { headers })

  }

  updateTask(taskId: string, updateData: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.baseUrl}checklists/chk/${taskId}`, updateData, { headers });
  }

  deleteTask(chkId:string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete(`${this.baseUrl}checklists/chk/${chkId}`, { headers })
  }
}

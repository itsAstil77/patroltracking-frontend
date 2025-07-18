import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // private baseUrl = 'http://172.16.100.68:5000/roles';

    private baseUrl = environment.apiUrl + 'roles';


  constructor(private http: HttpClient) {}

  getRoles(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}?page=${page}&limit=${limit}`, { headers });
  }

  createRole(roleData: { roleName: string; description: string }): Observable<any> {
    const token = localStorage.getItem('token'); 

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.baseUrl, roleData, { headers });
  }

  updateRole(roleId: string, roleData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.baseUrl}/${roleId}`, roleData, { headers });
  }

  deleteRole(roleId: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.delete(`${this.baseUrl}/${roleId}`, { headers });
}

  getRoleDrop(): Observable<any> {
    const token = localStorage.getItem('token'); // or wherever your token is stored
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/drop`, { headers });
  }

}

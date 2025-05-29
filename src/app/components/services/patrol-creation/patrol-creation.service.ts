import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// export interface User {
//   _id?: string;
//   username: string;
//   patrolGuardName: string;
//   patrolId: string | null;
//   adminId: string | null;
//   mobileNumber: string;
//   email: string;
//   companyCode: string;
//   imageUrl: string;
//   role: 'Admin' | 'Patrol';
//   isActive: boolean;
//   createdDate?: string;
//   modifiedDate?: string;
// }


@Injectable({
  providedIn: 'root'
})
export class PatrolCreationService {
  // private patrolApiUrl = 'http://172.16.100.68:5000/signup/users';  // Patrol summary (GET)
  // private userAddApiUrl = 'http://172.16.100.68:5000/signup'; // Replace with your actual POST URL

  constructor(private http: HttpClient) {}

  /** Get all users/patrols */
  // getAllUsers(): Observable<{ message: string; users: User[] }> {
  //   return this.http.get<{ message: string; users: User[] }>(this.patrolApiUrl);
  // }

  /** Add a new user (Admin or Patrol) */
  // addUser(user: Partial<User>): Observable<any> {
  //   return this.http.post(this.userAddApiUrl, user);
  // }

  // deletePatrolById(patrolId: string) {
  //   return this.http.delete<{ message: string }>(`${this.userAddApiUrl}/patrol/${patrolId}`);
  // }

  // updatePatrolUser(patrolId: string, userData: any): Observable<any> {
  //   return this.http.put(`http://172.16.100.68:5000/signup/patrol/${patrolId}`, userData);
  // }



  // updateAdminUser(adminId: string, userData: any): Observable<any> {
  //   return this.http.put(`http://172.16.100.68:5000/signup/admin/${adminId}`, userData);
  // }
  

  private apiUrl = 'http://172.16.100.68:5000/signup/users';

  getUsers(): Observable<any> {
    const token = localStorage.getItem('authToken'); // or get from auth service

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }

   private baseUrl = 'http://172.16.100.68:5000';

  createUser(userData: any): Observable<any> {
    const token = localStorage.getItem('token'); // adjust if you use sessionStorage or another key
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/signup`, userData, { headers });
  }


  updateUser(userId: string, userData: any): Observable<any> {
  const token = localStorage.getItem('token'); // or use sessionStorage if needed
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put(`${this.baseUrl}/signup/${userId}`, userData, { headers });
}

deleteUser(userId: string): Observable<any> {
    const token = localStorage.getItem('token');  // or sessionStorage if you use that
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}/signup/${userId}`, { headers });
  }

  
}

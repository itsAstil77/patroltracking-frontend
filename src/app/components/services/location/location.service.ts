import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://172.16.100.68:5000/locationcode';

  constructor(private http: HttpClient) {}

  createLocation(data: any) {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    return this.http.post(this.apiUrl, data, { headers });
  }


  updateLocation(locationId: string, data: any) {
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const url = `http://172.16.100.68:5000/locationcode/${locationId}`;

  return this.http.put(url, data, { headers });
}


  // You can fetch token from localStorage, sessionStorage, or a user service
  private getToken(): string {
    return localStorage.getItem('token') || ''; // Adjust if token stored differently
  }

deleteLocation(locationId: string, deletedBy: string): Observable<any> {
  const url = `http://172.16.100.68:5000/locationcode/${locationId}`;
  const token = this.getToken();

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const body = { deletedBy };

  return this.http.delete(url, { headers, body });
}

}



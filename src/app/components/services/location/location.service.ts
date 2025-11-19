import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  // private apiUrl = 'http://172.16.100.68:5000/locationcode';

   private apiUrl = environment.apiUrl + 'locationcode';

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

  // const url = `http://172.16.100.68:5000/locationcode/${locationId}`;

  return this.http.put(`${this.apiUrl}/${locationId}`, data, { headers });
}



  private getToken(): string {
    return localStorage.getItem('token') || ''; 
  }

deleteLocation(locationId: string, deletedBy: string): Observable<any> {
  // const url = `http://172.16.100.68:5000/locationcode/${locationId}`;
  const token = this.getToken();

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const body = { deletedBy };

  return this.http.delete(`${this.apiUrl}/${locationId}`, { headers, body });
}



  getLocationSummary(page: number, limit: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`, { headers });
  }



  getAllLocations(): Observable<any> {
     const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/drop`, { headers });
  }

}



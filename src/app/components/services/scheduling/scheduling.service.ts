import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBulkChecklistByWorkflowId(workflowId: string) {
    return this.http.get(`${this.baseUrl}checklists/is/${workflowId}`);
  }

}

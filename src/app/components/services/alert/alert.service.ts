

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<{ message: string, type: AlertType }>();
  alert$ = this.alertSubject.asObservable();

  showAlert(message: string, type: AlertType = 'success') {
    this.alertSubject.next({ message, type });
  }
}
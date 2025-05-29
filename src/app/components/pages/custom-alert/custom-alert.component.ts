import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert/alert.service';


@Component({
  selector: 'app-custom-alert',
  imports:[CommonModule],
  templateUrl: './custom-alert.component.html',
  styleUrls: ['./custom-alert.component.css']
})
export class CustomAlertComponent {

  show = false;
  message = '';
  alertType: 'success' | 'error' | 'warning' = 'success';

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe(({ message, type }) => {
      this.message = message;
      this.alertType = type;
      this.show = true;

        // Auto-close if type is success
        if (type === 'success') {
          setTimeout(() => {
            this.close();
          }, 2000); // 2 seconds
        }
    });
  }

  close() {
    this.show = false;
  }
}
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CustomAlertComponent } from './components/pages/custom-alert/custom-alert.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterModule,CustomAlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'patrol-tracking';
}

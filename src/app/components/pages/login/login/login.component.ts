import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';
import { environment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  loginObj: any = {

    "username": "",
    "password": ""
  };
  forgotPasswordForm: FormGroup;
  showForgotPassword: boolean = false;
  isSendingOTP: boolean = false;

  http = inject(HttpClient);
  router = inject(Router);

  constructor(private fb: FormBuilder, private alertService: AlertService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

 
  onLogin() {
     const loginUrl = environment.apiUrl + 'login';

    this.http.post(loginUrl, this.loginForm.value)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            localStorage.setItem("userEmail", this.loginForm.value.username);
            localStorage.setItem("authType", "login");
            this.alertService.showAlert(res.message);

            this.router.navigateByUrl("otp");


          } else {
            this.alertService.showAlert("Invalid login credentials!", "error");
          }
        },
         error: (err) => {
        if (err.status === 400 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("Login failed! Check your email & password.", "error");
        }
      }
      });
  }


//   onLogin() {
//   this.http.post("http://172.16.100.68:5000/login", this.loginForm.value)
//     .subscribe({
//       next: (res: any) => {
//         if (res.success) {
//           const username = this.loginForm.value.username;
//           localStorage.setItem("userEmail", username);
//           localStorage.setItem("authType", "login");

//           this.alertService.showAlert(res.message);
//            this.router.navigateByUrl("otp");

//           // ✅ Get location
//           if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//   (position) => {
//     console.log("Latitude:", position.coords.latitude);
//     console.log("Longitude:", position.coords.longitude);
//     console.log("Accuracy (meters):", position.coords.accuracy);
//   },
//   (err) => {
//     console.error("Location error:", err.message);
//   },
//   {
//     enableHighAccuracy: true,
//     timeout: 10000,
//     maximumAge: 0
//   }
// );

//           } else {
//             console.warn("Geolocation not supported by browser.");
//             localStorage.removeItem("userLocation");
//             this.router.navigateByUrl("otp");
//           }

//         } else {
//           this.alertService.showAlert("Invalid login credentials!", "error");
//         }
//       },
//       error: (err) => {
//         this.alertService.showAlert("Login failed! Check your email & password.", "error");
//         console.error(err);
//       }
//     });
// }




  navigateToForgotPassword() {
    this.router.navigateByUrl("forgot-password");
  }

  //  Reset OTP
  onSendResetOTP() {
    if (this.forgotPasswordForm.invalid) {
      this.alertService.showAlert("Please enter a valid email.");
      return;
    }

    this.isSendingOTP = true;

     const url = environment.apiUrl + 'api/auth/forgot-password';


    this.http.post(url, this.forgotPasswordForm.value)
      .subscribe({
        next: (res: any) => {
          this.alertService.showAlert(res.message);
          localStorage.setItem("resetEmail", this.forgotPasswordForm.value.email);
          this.router.navigateByUrl("reset-password");
          this.isSendingOTP = false;
        },
        error: (err) => {
          this.alertService.showAlert("Failed to send OTP. Try again.", "error");
          console.error(err);
          this.isSendingOTP = false;
        }
      });
  }

}

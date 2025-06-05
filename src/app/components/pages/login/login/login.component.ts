import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert/alert.service';

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

  // ✅ Handle Login
  onLogin() {
    this.http.post(" http://172.16.100.68:5000/login", this.loginForm.value,)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            localStorage.setItem("userEmail", this.loginForm.value.username);
            localStorage.setItem("authType", "login");
            this.alertService.showAlert(res.message);

            // if (res.token) {
            //   localStorage.setItem('token', res.token);
            //   localStorage.setItem('userId', res.user.userId);
            //   localStorage.setItem('userRole', res.user.role);
            // }
            // Now you can use the stored admin ID anywhere in your app
            // const loggedInAdminId = localStorage.getItem('userId');
            // console.log('Current admin ID:', loggedInAdminId); 


            this.router.navigateByUrl("otp");


          } else {
            this.alertService.showAlert("Invalid login credentials!", "error");
          }
        },
        error: (err) => {
          this.alertService.showAlert("Login failed! Check your email & password.", "error");
          console.error(err);
        }
      });
  }





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

    this.http.post("http://172.16.100.68:5000/api/auth/forgot-password", this.forgotPasswordForm.value)
      .subscribe({
        next: (res: any) => {
          this.alertService.showAlert("OTP sent! Please check your email.");
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

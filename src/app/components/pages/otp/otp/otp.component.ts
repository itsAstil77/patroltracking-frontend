
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert/alert.service';
import { environment } from '../../../../../environments/environment.prod';


@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule]
})
export class OtpComponent {
  otpForm: FormGroup;

  otpObj: any = {
    "username": "",
    "otp": ""
  };

  http = inject(HttpClient);
  router = inject(Router);
  authType: string = '';
  isResending: boolean = false;




  constructor(private fb: FormBuilder, private alertService: AlertService) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

    this.loadUserData();
  }





  loadUserData() {
    this.authType = localStorage.getItem('authType') || '';

    if (this.authType === "forgot-password") {
      this.otpObj.username = localStorage.getItem('resetEmail');
    } else {
      this.otpObj.username = localStorage.getItem('userEmail');
    }

  }



  // ✅ Verify OTP
  onSubmit() {
    if (!this.otpObj.username) {
      //alert("User email is missing!");
      return;
    }
    this.otpObj.otp = "9028";

    const otpInputs = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');

    if (otpValue.length < 4) {
      this.alertService.showAlert("OTP must be at least 4 digits.", "error");
      return;
    }

    this.otpObj.otp = otpValue;

    const otpUrl = environment.apiUrl + 'login/verify-otp';

    this.http.post(otpUrl, this.otpObj)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            if (res.user.role !== "Admin") {
              this.alertService.showAlert("Please Use Admin Credentials", "error");
              this.router.navigateByUrl("login");
              return;
            }
            this.alertService.showAlert(res.message);


            if (res.token) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('userId', res.user.userId);
              localStorage.setItem('userRole', res.user.role);
            }

            if (res.user?.userId) {
              localStorage.setItem('userId', res.user.userId);
              localStorage.setItem('userRole', res.user.role);
              console.log('Current user ID:', res.user.userId);
            }

            const loggedInAdminId = localStorage.getItem('userId');
            console.log('Current admin ID:', loggedInAdminId);

            if (this.authType === "signup") {
              localStorage.setItem("authType", "");
              this.router.navigateByUrl("login");
            } else if (this.authType === "login") {
              localStorage.setItem("authType", "");
              // this.router.navigateByUrl("dashboard"); 
              this.router.navigateByUrl("user-management");
            } else if (this.authType === "forgot-password") {
              localStorage.setItem("authType", "");
              this.router.navigateByUrl("update-password");
            } else {
              this.alertService.showAlert("Unknown authentication type. Redirecting to login.", "error");
              this.router.navigateByUrl("login");
            }


          } else {
            this.alertService.showAlert("Invalid OTP! Please try again.", "error");
          }
        },
        error: (err) => {
          if (err.status === 400 && err.error && err.error.message) {
            this.alertService.showAlert(err.error.message, "error");
          }
          else {
            this.alertService.showAlert("OTP verification failed! Please try again.", "error");
          }
        }
      });
  }


  moveFocus(event: any, index: number) {
    const inputElements = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;

    if (event.target.value && index < inputElements.length - 1) {
      inputElements[index + 1].focus();
    }
  }

  handleBackspace(event: any, index: number) {
    const inputElements = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;

    if (event.key === "Backspace" && !event.target.value && index > 0) {
      inputElements[index - 1].focus();
    }
  }



  onResendOTP() {
    if (!this.otpObj.email) {
      this.alertService.showAlert("User email is missing!", "error");
      return;
    }

    this.isResending = true;

    const resendUrl = environment.apiUrl + 'api/auth/resend-otp';

    this.http.post(resendUrl, { email: this.otpObj.email })
    
      .subscribe({
        next: (res: any) => {
          this.alertService.showAlert("OTP resent successfully! Please check your email.");
          this.isResending = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error("Resend OTP Error:", error);
          this.alertService.showAlert("Failed to resend OTP. Please try again.", "error");
          this.isResending = false;
        }
      });
  }
}

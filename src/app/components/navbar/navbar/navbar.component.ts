import { Component, ElementRef, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {


  constructor(private eRef: ElementRef, private router: Router, private alertService: AlertService,
    private http: HttpClient, private fb: FormBuilder) { }


  isReportsExpanded = false;


  passwordForm!: FormGroup;
  loggedInUsername: string = '';


  isSidebarCollapsed: boolean = true; // Default: Only icons are visible
  isAdminExpanded: boolean = false;
  isDropdownOpen = false;
  showUserDropdown: boolean = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click')

  closeDropdown() {
    this.isDropdownOpen = false;
  }



  ngOnInit(): void {


    this.loggedInUsername = localStorage.getItem('userEmail') || 'Guest';

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    });


    const userId = localStorage.getItem("userId");
    console.log("User ID from localStorage in update-password:", userId);

    if (!userId) {
      this.alertService.showAlert("User ID not found. Please log in again.", "error");
      this.router.navigateByUrl("login");
    }


    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.urlAfterRedirects.includes('/configuration') ||
          event.urlAfterRedirects.includes('/license-management') ||
          event.urlAfterRedirects.includes('/user-management')
        ) {
          this.activeMenuItem = 'administration';
        } else if (
          event.urlAfterRedirects.includes('/report') ||
          event.urlAfterRedirects.includes('/consolidated-report')
        ) {
          this.activeMenuItem = 'report';
        }
      }
    });


      this.setActiveByRoute(this.router.url);

  // Keep your existing route event logic
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      this.setActiveByRoute(event.urlAfterRedirects);
    }
  });

  }
    setActiveByRoute(url: string) {
  if (
    url.includes('/configuration') ||
    url.includes('/license-management') ||
    url.includes('/user-management')
  ) {
    this.activeMenuItem = 'administration';
  } else if (
    url.includes('/report') ||
    url.includes('/consolidated-report')
  ) {
    this.activeMenuItem = 'report';
  } else if (url.includes('/dashboard')) {
    this.activeMenuItem = 'dashboard';
  } else if (url.includes('/events')) {
    this.activeMenuItem = 'events';
  } else if (url.includes('/insights')) {
    this.activeMenuItem = 'insights';
  } else if (url.includes('/process-and-automation')) {
    this.activeMenuItem = 'process-and-automation';
  } else if (url.includes('/patrol-tracking')) {
    this.activeMenuItem = 'patrol-tracking';
  }

  }

  activeMenuItem: string = '';

  

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  hideUserDropdown(): void {
    // small delay to let click handlers run before closing
    setTimeout(() => this.showUserDropdown = false, 200);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  goToProfile(): void {
    this.router.navigateByUrl('/my-profile');
  }



  support(): void {
    this.router.navigateByUrl('/support');
  }


  isUpdate: boolean = false;

  changePassword() {
    this.isUpdate = true;

  }
  closePopup() {
    this.isUpdate = false;
  }
 

  updatePassword() {
    const username = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token"); 

    if (!username || !token) {
      alert("Missing username or token. Please log in again.");
      this.router.navigateByUrl("login");
      return;
    }

    const formValues = this.passwordForm.value;

    if (formValues.newPassword !== formValues.confirmNewPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    const payload = {
      username: username,
      oldPassword: formValues.currentPassword,
      password: formValues.newPassword,
      confirmPassword: formValues.confirmNewPassword
    };

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    this.http.post("http://172.16.100.68:5000/signup/change-password", payload, headers)
      .subscribe({
        next: (res: any) => {
          console.log("Password change response:", res);
          alert(res.message || "Password changed successfully.");
          this.router.navigateByUrl("login");
        },
        error: (err) => {
          console.error("Password change error:", err);
          alert(err.error?.message || "Failed to change password.");
        }
      });
  }


    // toggleReports() {
  //   this.isReportsExpanded = !this.isReportsExpanded;
  //   this.setActive('report');
  // }

  // closeReportsPanel() {
  //   this.isReportsExpanded = false;
  // }


    // toggleAdministration() {
  //   this.isAdminExpanded = !this.isAdminExpanded;
  //   this.setActive('administration');
  // }

  // closeAdminPanel() {
  //   this.isAdminExpanded = false;
  // }

  // activeMenuItem: string = 'administration'; // default active is dashboard

  // setActive(menuItem: string): void {
  //   this.activeMenuItem = menuItem; // only one active at a time


  // }

  // Keep your existing toggle methods
  // toggleAdministration() {
  //   this.isAdminExpanded = !this.isAdminExpanded;
  //   if (this.isAdminExpanded) {
  //     this.activeMenuItem = 'administration';
  //   }
  // }

  // toggleReports() {
  //   this.isReportsExpanded = !this.isReportsExpanded;
  //   if (this.isReportsExpanded) {
  //     this.activeMenuItem = 'report';
  //   }
  // }










  // activeMenuItem: string | null = 'administration';

  // setActive(menuItem: string) {
  //   this.activeMenuItem = menuItem;
  //   this.isAdminExpanded = false;
  //   this.isReportsExpanded = false;
  // }



  // toggleAdministration() {
  //   if (this.isReportsExpanded) {
  //     this.isReportsExpanded = false;
  //   }
  //   this.isAdminExpanded = !this.isAdminExpanded;
  //   this.activeMenuItem = this.isAdminExpanded ? 'administration' : null;
  // }

  // toggleReports() {
  //   if (this.isAdminExpanded) {
  //     this.isAdminExpanded = false;
  //   }
  //   this.isReportsExpanded = !this.isReportsExpanded;
  //   this.activeMenuItem = this.isReportsExpanded ? 'report' : null;
  // }


  // closeAdminPanel() {
  //   this.isAdminExpanded = false;
  //   if (this.activeMenuItem === 'administration') {
  //     this.activeMenuItem = null;
  //   }
  // }

  // closeReportsPanel() {
  //   this.isReportsExpanded = false;
  //   if (this.activeMenuItem === 'report') {
  //     this.activeMenuItem = null;
  //   }
  // }






// activeMenuItem: string = 'administration'; 

setActive(menuItem: string) {
  this.activeMenuItem = menuItem;
  this.isAdminExpanded = false;
  this.isReportsExpanded = false;
}

toggleAdministration() {
  if (this.isReportsExpanded) {
    this.isReportsExpanded = false;
  }
  this.isAdminExpanded = !this.isAdminExpanded;
  this.activeMenuItem = this.isAdminExpanded ? 'administration' : '';
}

toggleReports() {
  if (this.isAdminExpanded) {
    this.isAdminExpanded = false;
  }
  this.isReportsExpanded = !this.isReportsExpanded;
  this.activeMenuItem = this.isReportsExpanded ? 'report' : '';
}

closeAdminPanel() {
  this.isAdminExpanded = false;
}

closeReportsPanel() {
  this.isReportsExpanded = false;
}






}

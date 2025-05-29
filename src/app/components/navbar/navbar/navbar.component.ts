import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {


  constructor(private eRef: ElementRef,private router: Router,   private alertService: AlertService,private http:HttpClient,private fb: FormBuilder) {}


  isReportsExpanded = false;

  toggleReports() {
    this.isReportsExpanded = !this.isReportsExpanded;
    this.setActive('report');
  }
  
  closeReportsPanel() {
    this.isReportsExpanded = false;
  }
  
  passwordForm!: FormGroup;

  isSidebarCollapsed: boolean = true; // Default: Only icons are visible
  isAdminExpanded: boolean = false;
  isDropdownOpen = false;
  showUserDropdown: boolean = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleAdministration() {
    this.isAdminExpanded = !this.isAdminExpanded;
    this.setActive('administration');
  }

  toggleDropdown(event: Event) {
    event.stopPropagation(); // Prevent immediate closing
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click')

  closeDropdown() {
    this.isDropdownOpen = false;
  }

    loggedInUsername: string = '';
  
    ngOnInit(): void {
      // this.loggedInUsername = localStorage.getItem('userEmail') || 'Guest';

      // this.passwordForm = this.fb.group({
      //   currentPassword: ['', Validators.required],
      //   newPassword: ['', [Validators.required, Validators.minLength(6)]],
      //   confirmNewPassword: ['', Validators.required]
    //   }
    // );


    //   const userId = localStorage.getItem("userId");
    //   console.log("User ID from localStorage in update-password:", userId);
    
    //   if (!userId) {
    //     this.alertService.showAlert("User ID not found. Please log in again.", "error");
    //     this.router.navigateByUrl("login");
    //   }
    }



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


    isUpdate:boolean=false;

    changePassword(){
      this.isUpdate=true;

    }
    closePopup(){
      this.isUpdate=false;
    }
    // updatePassword() {
    //   const userId = localStorage.getItem("userId");
    //   console.log("User ID from localStorage:", userId); // ✅ This confirms user ID is retrieved
    
    //   if (!userId) {
    //     alert("User ID not found. Please log in again.");
    //     return;
    //   }
    
    //   const payload = {
    //     userId: userId, // This is the correct value
    //     currentPassword: this.passwordForm.value.currentPassword,
    //     newPassword: this.passwordForm.value.newPassword,
    //     confirmNewPassword: this.passwordForm.value.confirmNewPassword
    //   };
    
    //   console.log("Password update payload:", payload); // ✅ Log the payload
    
      
    //   this.http.put("http://172.16.100.66:5221/api/user/change-password", payload)
    //     .subscribe({
    //       next: (res: any) => {
    //         console.log("Password change response:", res); // ✅ Log the response
    //         alert(res.message || "Password changed successfully.");
    //         this.router.navigateByUrl("login");
    //       },
    //       error: (err) => {
    //         console.error("Password change error:", err); // ✅ Log the error
    //         alert("Failed to change password.");
    //       }
    //     });
    // }
    

    closeAdminPanel() {
      this.isAdminExpanded = false;
    }

    activeMenuItem: string = 'administration'; // default active is dashboard

setActive(menuItem: string): void {
  this.activeMenuItem = menuItem; // only one active at a time
}
    
    

}

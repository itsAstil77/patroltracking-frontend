import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlertService } from '../../../services/alert/alert.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PatrolCreationService } from '../../../services/patrol-creation/patrol-creation.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { LocationService } from '../../../services/location/location.service';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../services/role/role.service';



@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})

export class UserManagementComponent {


  constructor(private http: HttpClient, private alertService: AlertService, private patrolService: PatrolCreationService,
    private workflowService: WorkflowService, private locationService: LocationService, private roleService: RoleService) { }

  selectedRole: string = 'User';


  isPasswordVisible: boolean = false;


  ngOnInit(): void {
    this.fetchUsers();
    this.loadLocation();

    const currentAdminId = localStorage.getItem('userId');

    // Assign to variables (fallback to empty string if not found)
    this.deletedBy = currentAdminId || '';

  }



  isAddUserPopupOpen: boolean = false

  openAddUserPopup(): void {
    // this.loadLocations();
    this.loadRoles();
    this.isAddUserPopupOpen = true;
    this.user.username = "";
    this.user.password = "";
    this.user.patrolGuardName = "";
    this.user.mobileNumber = "";
    this.user.email = "";
    this.user.locationIds = [];
    this.user.roleId = '';
    this.user.designation = "";
    this.user.department = "";
  }




  closeAddUserPopup(): void {
    this.isAddUserPopupOpen = false;
  }


  users: any[] = [];


  fetchUsers(): void {
    this.patrolService.getUsers(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalItems = response.pagination?.totalRecords ?? 0;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }


  user = {
    username: '',
    password: '',
    email: '',
    patrolGuardName: '',
    mobileNumber: '',
    locationIds:  [] as string[],
    roleId: '',       // must be a valid roleId from your DB
    department: '',
    designation: ''
  };

  createUser() {
    this.patrolService.createUser(this.user).subscribe({
      next: (res) => {
        this.closeAddUserPopup();
        this.alertService.showAlert(res.message);
        this.fetchUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        const errorMsg = err?.error?.message || 'User creation failed';
        this.alertService.showAlert(errorMsg, 'error');
      }
    });
  }



  isUpdateUserPopupOpen: boolean = false;
  userIdToUpdate: string = '';
  updateUserData: any = {
    username: '',
    password: '',
    email: '',
    patrolGuardName: '',
    mobileNumber: '',
    locationId: "",
    roleId: '',
    department: '',
    designation: '',

  };

  openUpdateUserPopup(userData: any): void {
    this.loadLocations();
    this.isUpdateUserPopupOpen = true;
    this.userIdToUpdate = userData.userId;

    this.updateUserData = {
      username: userData.username || '',
      password: '', // new password only if changed
      email: userData.email || '',
      patrolGuardName: userData.patrolGuardName || '',
      mobileNumber: userData.mobileNumber || '',
      locationId: userData.locationId || '',
      roleId: userData.roleId || '',
      department: userData.department || '',
      designation: userData.designation || '',

    };
  }


  closeUpdateUserPopup() {
    this.isUpdateUserPopupOpen = false;

  }

  updateUser(): void {
    this.patrolService.updateUser(this.userIdToUpdate, this.updateUserData).subscribe({
      next: (res) => {
        this.closeUpdateUserPopup();
        this.alertService.showAlert(res.message || 'User updated successfully');
        this.fetchUsers();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.alertService.showAlert('User update failed', 'error');
      }
    });
  }

  isDeletePopupOpen = false;
  userIdToDelete: string | null = null;


  openDeletePopup(userId: string): void {
    this.isDeletePopupOpen = true;
    this.userIdToDelete = userId;
  }

  closeDeletePopup(): void {
    this.isDeletePopupOpen = false;
    this.userIdToDelete = null;
  }



  confirmDelete(): void {
    if (this.userIdToDelete) {
      this.patrolService.deleteUser(this.userIdToDelete).subscribe({
        next: (res) => {
          this.alertService.showAlert(res.message);
          this.fetchUsers(); // reload user list
          this.closeDeletePopup();
        },
        error: (err) => {
          this.alertService.showAlert('Admin user cannot be deleted', "error");
        }
      });
    }
  }

isDropdownOpen = false;

toggleLocationDropdown(): void {
  if (!this.isDropdownOpen) {
    this.loadLocations();  // 👈 Always reload
  }
  this.isDropdownOpen = !this.isDropdownOpen;
}


removeLocation(locationId: string): void {
  this.user.locationIds = this.user.locationIds.filter(id => id !== locationId);
}

getLocationDescription(locationId: string): string {
  const location = this.locationList.find(loc => loc.locationId === locationId);
  return location ? `${location.locationId} - ${location.description}` : locationId;
}



onLocationCheckboxChange(event: any): void {
  const locationId = event.target.value;
  const isChecked = event.target.checked;

  if (isChecked) {
    if (!this.user.locationIds.includes(locationId)) {
      this.user.locationIds.push(locationId);
    }

  } else {
    this.user.locationIds = this.user.locationIds.filter(id => id !== locationId);
  }

  this.isDropdownOpen = false;
}






  locationList: any[] = []


  loadLocation(): void {
    this.locationService.getLocationSummary(this.locationCurrentPage, this.locationItemsPerPage).subscribe({
      next: (res) => {
        if (res.success) {
          this.locationList = res.locations || res.data || [];
          // this.locationTotalItems = res.pagination?.totalRecords || this.locationList.length;
          // ✅ NEW — correct based on your API
          this.locationTotalItems = res.totalLocations || 0;
        }
      },
      error: (err) => {
        console.error('Error fetching location summary:', err);
      }
    });
  }




  loadLocations() {
    this.locationService.getAllLocations().subscribe({
      next: (res: any) => {
        this.locationList = res.locations;
      },
      error: (err) => {
        console.error('Failed to fetch locations:', err);
      }
    });
  }



  isAddLoc = false;

  location: any = {

    locationCode: '',
    latitude: '',
    longitude: '',
    description: '',
    createdBy: '',
    modifiedBy: ''
  };




  openAddLocPopup() {

    this.location = {
      locationCode: '',
      latitude: '',
      longitude: '',
      description: '',
      createdBy: ''
    };

    this.isAddLoc = true;
  }

  cancelLoc() {
    this.isAddLoc = false;
  }

  addLoc() {

    const currentAdminId = localStorage.getItem('userId');

    this.location.createdBy = currentAdminId;


    this.locationService.createLocation(this.location).subscribe({
      next: (res: any) => {
        this.alertService.showAlert(res.message);
        this.isAddLoc = false;
        this.loadLocation();
      },
 error: (err) => {
        if (err.status === 400 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("Latitude and longitude are required and must be valid numbers.", "error");
        }
      }
    });
  }

  isUpdateLoc = false;

  openUpdateLocPopup(location: any) {
    this.location = { ...location }; // Clone to avoid direct binding
    this.isUpdateLoc = true;
  }


  cancelUpdateLoc() {
    this.isUpdateLoc = false;
  }

  updateLoc() {
    const locationId = this.location.locationId;
    const currentAdminId = localStorage.getItem('userId');


    const updatedData = {

      locationCode: this.location.locationCode,
      latitude: this.location.latitude,
      longitude: this.location.longitude,
      description: this.location.description,
      modifiedBy: currentAdminId // Or pull from logged-in user
    };

    this.locationService.updateLocation(locationId, updatedData).subscribe({
      next: (res: any) => {
        this.alertService.showAlert(res.message || 'Location updated successfully');
        this.isUpdateLoc = false;
        this.loadLocation();
        // Optionally refresh list here
      },
      error: (err) => {
        if (err.status === 400 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("latitude and longitude are required and must be valid numbers.", "error");
        }
      }
    });
  }


  isDeleteLoc: boolean = false; // Controls the modal visibility
  locationIdToDelete: string = ''; // Or set dynamically
  deletedBy: string = '';
  // deletedBy: string = localStorage.getItem('userId') || '';

  openDeleteModal(locationId: string) {
    console.log('Opening delete modal for:', locationId);
    this.locationIdToDelete = locationId;
    this.isDeleteLoc = true;
  }

  deleteLoc() {
    this.locationService.deleteLocation(this.locationIdToDelete, this.deletedBy).subscribe({
      next: (response) => {
        this.alertService.showAlert(response.message); // "Location deleted successfully"
        this.isDeleteLoc = false;
        this.loadLocation();
        // Optionally refresh your list of locations here
      },
      error: (error) => {
        console.error('Delete failed', error);
        alert('Failed to delete location');
        this.isDeleteLoc = false;
      }
    });
  }

  CloseLocDel() {
    this.isDeleteLoc = false;
  }


  // column picker for label 

  showColumnPicker = false;

  columns = [
    { label: 'Location ID', key: 'locationId', visible: true },
    { label: 'Location Code', key: 'locationCode', visible: true },
    { label: 'Location Name', key: 'description', visible: true },
    { label: 'Latitude', key: 'latitude', visible: true },
    { label: 'Longitude', key: 'longitude', visible: true },
    { label: 'Created By', key: 'createdBy', visible: true }
  ];

  toggleColumnPickerModal() {
    this.showColumnPicker = !this.showColumnPicker;
  }

  reloadPage() {
    window.location.reload();
  }





  roles: any[] = [];

  getRoles(): void {
    this.patrolService.getRoles().subscribe({
      next: (res) => {
        this.roles = res.roles;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }



  loadRoles() {
    this.roleService.getRoleDrop().subscribe({
      next: (res: any) => {
        this.roles = res.roles;
      },
      error: (err) => {
        console.error('Failed to fetch roles:', err);
      }
    });
  }






  adminColumns = [
    { label: 'User ID', key: 'userId', visible: true },
    { label: 'Name', key: 'patrolGuardName', visible: true },
    { label: 'Username', key: 'username', visible: true },
    { label: 'Mobile', key: 'mobileNumber', visible: true },
    { label: 'Email', key: 'email', visible: true },
    { label: 'Department', key: 'department', visible: true },
    { label: 'Designation', key: 'designation', visible: true },
    { label: 'Location', key: 'locationNames', visible: true },
    { label: 'Role', key: 'role', visible: true }
  ];

  showAdminColumnPicker = false;
  toggleAdminColumnPicker() {
    this.showAdminColumnPicker = !this.showAdminColumnPicker;
  }




  itemsPerPage = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20, 50, 100];
  totalItems: number = 0;


  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }
  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.fetchUsers();

  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUsers();

    }
  }

  nextPage(): void {
    if (this.endItem < this.totalItems) {
      this.currentPage++;
      this.fetchUsers();

    }
  }

  locationItemsPerPage = 10;
  locationCurrentPage = 1;
  locationPageSizeOptions = [5, 10, 20, 50, 100];
  locationTotalItems: number = 0;

  get locationStartItem(): number {
    return (this.locationCurrentPage - 1) * this.locationItemsPerPage + 1;
  }

  get locationEndItem(): number {
    const end = this.locationCurrentPage * this.locationItemsPerPage;
    return end > this.locationTotalItems ? this.locationTotalItems : end;
  }


  onLocationItemsPerPageChange(): void {
    this.locationCurrentPage = 1;
    this.loadLocation();
  }

  prevLocationPage(): void {
    if (this.locationCurrentPage > 1) {
      this.locationCurrentPage--;
      this.loadLocation();
    }
  }

  nextLocationPage(): void {
    if (this.locationEndItem < this.locationTotalItems) {
      this.locationCurrentPage++;
      this.loadLocation();
    }
  }





}






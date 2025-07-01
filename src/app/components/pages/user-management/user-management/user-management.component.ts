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



// export interface User {
//   _id?: string;
//   username: string;
//   password: string;
//   patrolGuardName: string;
//   patrolId: string | null;
//   adminId: string | null;
//   mobileNumber: string;
//   email: string;
//   locationName:string;
//   companyCode: string;
//   designation:string;
//   department:string;
//   imageUrl: string;
//   role: 'Admin' | 'Patrol';
//   isActive: boolean;
//   createdDate?: string;
//   modifiedDate?: string;
// }




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


  // adminUsers: User[] = [];
  // patrolUsers: User[] = [];

  // fetchUsers(): void {
  //   this.patrolService.getAllUsers().subscribe((response: any) => {
  //     const allUsers: User[] = response.users;
  //     this.adminUsers = allUsers.filter((user: User) => user.role === 'Admin');
  //     this.patrolUsers = allUsers.filter((user: User) => user.role === 'Patrol');
  //   });
  // }


  // newUser: Partial<User> = {
  //   username: '',
  //   password: '',
  //   patrolGuardName: '',
  //   patrolId: '',
  //   adminId: '',
  //   mobileNumber: '',
  //   email: '',
  //   locationName:'',
  //   companyCode: '',
  //   imageUrl: '',
  //   designation:'',
  //   department:'',
  //   role: 'Patrol',
  //   isActive: true
  // };



  // saveUser(): void {
  //   this.patrolService.addUser(this.newUser).subscribe({
  //     next: (res) => {
  //       console.log('User added:', res);
  //       this.closeAddUserPopup();
  //       this.alertService.showAlert(res.message);
  //       this.fetchUsers();
  //     },
  //     error: (err) => {
  //       console.error('Error response', err);

  //       const message = err.error?.message || 'An unexpected error occurred.';
  //       this.alertService.showAlert(message,"error"); // Assuming alertService is already used
  //     }

  //   });
  // }



  isAddUserPopupOpen: boolean = false

  openAddUserPopup(): void {
   // this.getRoles();
    this.isAddUserPopupOpen = true;
    this.user.username = "";
    this.user.password = "";
    this.user.patrolGuardName = "";
    this.user.mobileNumber = "";
    this.user.email = "";
    this.user.locationName = "";
    this.user.roleId = '';
    this.user.designation = "";
    this.user.department = "";
  }




  closeAddUserPopup(): void {
    this.isAddUserPopupOpen = false;
  }


  users: any[] = [];

  // fetchUsers(): void {
  //   this.patrolService.getUsers().subscribe({
  //     next: (response) => {
  //       this.users = response.users;

  //     },
  //     error: (err) => {
  //       console.error('Error fetching users:', err);
  //     }
  //   });
  // }

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
    locationName: '',
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
        this.alertService.showAlert(errorMsg, 'error');  // Show API error message if present
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
    locationName: '',
    roleId: '',
    department: '',
    designation: '',

  };

  openUpdateUserPopup(userData: any): void {
    this.getRoles();
    this.isUpdateUserPopupOpen = true;
    this.userIdToUpdate = userData.userId;

    this.updateUserData = {
      username: userData.username || '',
      password: '', // new password only if changed
      email: userData.email || '',
      patrolGuardName: userData.patrolGuardName || '',
      mobileNumber: userData.mobileNumber || '',
      locationName: userData.locationName || '',
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
        alert('User update failed');
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
          alert('Failed to delete user');
        }
      });
    }
  }




  // selectedPatrolId: string | null = null;
  // isDeletePopupOpen = false;
  // patrolId: string | null | undefined = null;

  // openDeletePopup(patrolId: string | null): void {
  //   if (patrolId) {
  //     this.selectedPatrolId = patrolId;
  //     this.isDeletePopupOpen = true;
  //   }
  // }


  // closeDeletePopup() {
  //   this.isDeletePopupOpen = false;
  //   this.selectedPatrolId = null;
  // }


  // deleteUser() {
  //   if (this.selectedPatrolId) {
  //     this.patrolService.deletePatrolById(this.selectedPatrolId).subscribe({
  //       next: (response) => {
  //         console.log(response.message);
  //         this.closeDeletePopup();
  //         this.alertService.showAlert(response.message);
  //         this.fetchUsers(); 
  //       },
  //       error: (error) => {
  //         console.error('Error deleting patrol:', error);
  //       }
  //     });
  //   }
  // }


  //     isEditUserPopupOpen = false;
  //     currentUserId: string = '';


  //     openEditUserPopup(user: any) {
  //       this.user = { ...user };   
  //       this.isEditUserPopupOpen = true;
  //        this.isPasswordVisible = false;
  //        this.loadLocation();
  //        this.getRoles();

  //     }




  //     closeEditUserPopup() {
  //       this.isEditUserPopupOpen = false;

  //     }

  // // Update user API call
  // updateUser(): void {
  //   // this.patrolService.updatePatrol(this.currentUserId, this.user).subscribe({
  //   //   next: (res) => {
  //   //     this.closeUpdateUserPopup();
  //   //     this.alertService.showAlert(res.message); // assuming alertService available
  //   //     this.fetchUsers(); // reload user list
  //   //   },
  //   //   error: (err) => {
  //   //     console.error('Error updating user:', err);
  //   //     alert('User update failed');
  //   //   }
  //   // });
  // }


  // isEditAdminPopupOpen = false;
  // adminUser: any = {};

  // openEditAdminPopup(user: any) {
  //   this.adminUser = { ...user };

  //   this.isEditAdminPopupOpen = true;
  // }

  // closeEditAdminPopup() {
  //   this.isEditAdminPopupOpen = false;
  // }

  // updateAdminUser() {
  //   if (this.adminUser.adminId) {
  //     this.patrolService.updateAdminUser(this.adminUser.adminId, this.adminUser).subscribe(
  //       response => {
  //         console.log('Admin updated successfully', response);
  //         this.closeEditAdminPopup();
  //         this.alertService.showAlert(response.message);
  //         this.fetchUsers();
  //       },
  //       error => {
  //         console.error('Error updating admin:', error);
  //       }
  //     );
  //   } else {
  //     console.error('Admin ID is required');
  //   }
  // }






  locationList: any[] = []

  // loadLocation() {
  //   this.locationService.getLocationSummary(this.currentPage, this.itemsPerPage).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         this.locationList = res.locations;

  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching location summary:', err);
  //     }
  //   });
  // }

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

  // loadLocation(): void {
  //   this.locationService.getLocationSummary(this.locationCurrentPage, this.locationItemsPerPage).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         this.locationList = res.locations || res.data || [];
  //         this.locationTotalItems = res.pagination?.totalRecords || 0;


  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching location summary:', err);
  //     }
  //   });
  // }



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
        console.error('Error adding location:', err);
        alert('Failed to add location.');
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
        console.error(err);
        alert('Update failed');
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
        this.roles= res.roles;
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
    { label: 'Location', key: 'locationName', visible: true },
    { label: 'Role', key: 'role', visible: true }
  ];

  showAdminColumnPicker = false;
  toggleAdminColumnPicker() {
    this.showAdminColumnPicker = !this.showAdminColumnPicker;
  }




  itemsPerPage = 10;
  currentPage = 1;
  pageSizeOptions = [5, 10, 20];
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
  locationPageSizeOptions = [5, 10, 20];
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






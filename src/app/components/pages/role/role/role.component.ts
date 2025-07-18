import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../services/role/role.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-role',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent implements OnInit {


  ngOnInit(): void {
    this.getRoles(); // Auto-load on component load
  }

  constructor(private roleService: RoleService, private alertService: AlertService) { }
  roles: any[] = [];

  getRoles(): void {
    this.roleService.getRoles(this.roleCurrentPage, this.roleItemsPerPage).subscribe({
      next: (res) => {
        this.roles = res.roles;
        this.allRoles = res.roles; // Store all roles for search
        this.applyRoleSearch();
        this.roleTotalItems = res.totalCount ?? 0;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }


  roleSearchText: string = '';
  allRoles: any[] = []; // Full list for search
  
  applyRoleSearch(): void {
  const search = this.roleSearchText.toLowerCase();
  this.roles = this.allRoles.filter(role =>
    Object.values(role).some(val =>
      String(val).toLowerCase().includes(search)
    )
  );
}




  roleName: string = '';
  description: string = '';
  showRolePopup: boolean = false;


  createRole() {
    const payload = {
      roleName: this.roleName,
      description: this.description,

    };

    this.roleService.createRole(payload).subscribe({
      next: (res) => {
        this.alertService.showAlert(res.message);
        this.closeRolePopup();
        this.getRoles();
      },
      error: (err) => {
        if (err.status === 409 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, 'error');
        } else {
          this.alertService.showAlert('Failed to create role', 'error');
        }
        console.error('Error creating role:', err);
      }
    });
  }


  closeRolePopup() {
    this.showRolePopup = false;
    this.roleName = '';
    this.description = '';

  }
  openRolePopup() {
    this.showRolePopup = true;
    this.roleName = '';
    this.description = '';
  }


  showUpdateRolePopup: boolean = false;
  roleIdToUpdate = '';

  openUpdateRolePopup(roleData: any) {
    this.showUpdateRolePopup = true;
    this.roleName = roleData.roleName || '';
    this.description = roleData.description || '';
    this.roleIdToUpdate = roleData.roleId;
  }


  closeUpdateRolePopup() {
    this.showUpdateRolePopup = false;
    this.roleName = '';
    this.description = '';

  }

  confirmUpdateRole() {
    const roleData = {
      roleName: this.roleName,
      description: this.description
    };

    this.roleService.updateRole(this.roleIdToUpdate, roleData).subscribe({
      next: (res) => {
        console.log('Role updated:', res);
        this.showUpdateRolePopup = false;
        this.alertService.showAlert(res.message);
        this.getRoles();

        // optionally refresh role list here
      },
      error: (err) => {
        console.error('Update failed:', err);
      }
    });
  }



  selectedRoleToDelete: any = null;
  showDeletePopup: boolean = false;
  deleteErrorMessage: string = '';

  openDeletePopup(role: any): void {
    this.selectedRoleToDelete = role;
    this.showDeletePopup = true;
  }

  CloseDeletePopup() {
    this.showDeletePopup = false;
    this.selectedRoleToDelete = null;


  }

  confirmDelete(): void {
    if (this.selectedRoleToDelete) {
      this.roleService.deleteRole(this.selectedRoleToDelete.roleId).subscribe({
        next: (res) => {
          this.alertService.showAlert(res.message);
          this.getRoles(); // refresh role list
          this.CloseDeletePopup(); // close modal
        },
        error: (err) => {
          console.error('Delete failed:', err);
          if (err?.error?.message) {
            this.deleteErrorMessage = err.error.message;
            this.alertService.showAlert(this.deleteErrorMessage, 'error');
            this.showDeletePopup = false;
          } else {
            this.deleteErrorMessage = 'An unexpected error occurred.';
          }
        }
      });
    }
  }

  reloadPage() {
    window.location.reload();
  }


  showRoleColumnPicker = false;

  roleColumns = [

    { label: 'Role ID', key: 'roleId', visible: true },
    { label: 'Role Name', key: 'roleName', visible: true },
    { label: 'Description', key: 'description', visible: true }
  ];

  toggleRoleColumnPicker() {
    this.showRoleColumnPicker = !this.showRoleColumnPicker;
    console.log('toggleRoleColumnPicker triggered:', this.showRoleColumnPicker);
  }
  testClick() {
    console.log('Test Click works');
  }


  roleItemsPerPage = 10;
  roleCurrentPage = 1;
  rolePageSizeOptions = [5, 10, 20, 50, 100];
  roleTotalItems: number = 0;

  get roleStartItem(): number {
    return (this.roleCurrentPage - 1) * this.roleItemsPerPage + 1;
  }

  get roleEndItem(): number {
    const end = this.roleCurrentPage * this.roleItemsPerPage;
    return end > this.roleTotalItems ? this.roleTotalItems : end;
  }

  onRoleItemsPerPageChange(): void {
    this.roleCurrentPage = 1;
    this.getRoles();
  }

  prevRolePage(): void {
    if (this.roleCurrentPage > 1) {
      this.roleCurrentPage--;
      this.getRoles();
    }
  }

  nextRolePage(): void {
    if (this.roleEndItem < this.roleTotalItems) {
      this.roleCurrentPage++;
      this.getRoles();
    }
  }

}

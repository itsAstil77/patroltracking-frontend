import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CalendarModule } from 'primeng/calendar';
import { PatrolCreationService } from '../../../services/patrol-creation/patrol-creation.service';
import { LocationService } from '../../../services/location/location.service';
import { UserFilterPipe } from '../../../../pipes/user-filter.pipe';
import { TaskFilterPipe } from '../../../../pipes/task-filter.pipe';
import { LocationFilterPipe } from '../../../../pipes/location-filter.pipe';


@Component({
  selector: 'app-patrol-tracking',
  imports: [CommonModule, FormsModule, RouterModule, MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    CalendarModule,
    UserFilterPipe,
    TaskFilterPipe,
    LocationFilterPipe

  ],
  templateUrl: './patrol-tracking.component.html',
  styleUrl: './patrol-tracking.component.css',
  encapsulation: ViewEncapsulation.None
})
export class PatrolTrackingComponent implements OnInit {



  showPopupAssign = false;


  ngOnInit() {
    this.getWorkflowSummary();
    const currentAdminId = localStorage.getItem('userId');
    console.log('Logged-in User ID:', currentAdminId);

    // Assign to variables (fallback to empty string if not found)
    this.assignedBy = currentAdminId || '';
    this.createdBy = currentAdminId || '';
    this.modifiedBy = currentAdminId || '';

    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      this.selectedRole = savedTab;   // ✅ restore saved tab
    }
  }




  selectTab(tab: string) {
    this.selectedRole = tab;
    localStorage.setItem('activeTab', tab); // ✅ persist tab
  }

  assignTaskOpen() {
    this.loadPatrolUsers();
    this.showPopupAssign = true;
    this.selectedWorkflowId = '';
    this.selectedChecklistId = '';
    // this.assignedTo = '';
    this.selectedUserIds = [];
    this.selectedChecklistIds = [];  // <-- clear selected tasks

  }
  closeTask() {
    this.showPopupAssign = false;
  }


  assignTask(): void {
    const requestBody = {
      checklistIds: this.selectedChecklistIds,
      assignedTo: this.selectedUserIds,
      assignedBy: this.assignedBy
    };

    this.workflowService.assignChecklist(this.selectedChecklistId, requestBody).subscribe({
      next: (response) => {
        this.alertService.showAlert(response.message);
        this.closeTask();
        this.refreshChecklist(this.selectedWorkflowId);
      },
      error: (err) => {
        console.error('Error assigning checklist:', err);

        if (err.status === 400 && err.error && err.error.message) {
          // Display specific error message from response
          this.alertService.showAlert(err.error.message, "error"); // or use your own modal/popup method
        } else {
          // Generic error fallback
          alert('Error assigning task.');
        }
      }
    });
  }



  // checklists:any[]=[];
  workflows: any[] = [];
  expandedRows: { [workflowId: string]: boolean } = {};
  checklistData: { [workflowId: string]: any[] } = {};
  currentDate: string = '';



  // Separate states
  expandedRowsAssignment: { [workflowId: string]: boolean } = {};
  expandedRowsSchedule: { [workflowId: string]: boolean } = {};

  checklistDataAssignment: { [workflowId: string]: any[] } = {};
  checklistDataSchedule: { [workflowId: string]: any[] } = {};


  constructor(private workflowService: WorkflowService, private alertService: AlertService, private cdRef: ChangeDetectorRef,
    private patrolService: PatrolCreationService) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }




  getWorkflowSummary(): void {
    this.workflowService.getWorkflows(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        if (res.success) {
          this.allWorkflows = res.workflows || [];
          this.totalItems = res.pagination?.totalRecords ?? 0;
          this.applyWorkflowSearch(); // show filtered list
        }
      },
      error: (err) => {
        console.error('Error fetching workflows:', err);
      }
    });
  }

  workflowSearchText: string = '';
  allWorkflows: any[] = []; // holds current page data for local filtering


  applyWorkflowSearch(): void {
    const search = this.workflowSearchText.toLowerCase();
    this.workflows = this.allWorkflows.filter(workflow =>
      Object.values(workflow).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }


  // toggleChecklist(workflowId: string): void {

    
  //   this.expandedRowsAssignment[workflowId] = !this.expandedRowsAssignment[workflowId];

  //   if (this.expandedRowsAssignment[workflowId] && !this.checklistDataAssignment[workflowId]) {
  //     this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
  //       if (res.success) {
  //         this.checklistDataAssignment[workflowId] = res.checklists.map((checklist: any) => ({
  //           ...checklist,
  //           hasLocation: !!checklist.geoCoordinates
  //         }));
  //       }
  //     });
  //   }
  // }

  toggleChecklist(workflowId: string): void {
  this.expandedRowsAssignment[workflowId] = !this.expandedRowsAssignment[workflowId];

  if (this.expandedRowsAssignment[workflowId] && !this.checklistDataAssignment[workflowId]) {
    this.workflowService
      .getChecklistByWorkflowId(workflowId, this.checklistCurrentPage, this.checklistItemsPerPage) // 👈 pass page & limit
      .subscribe((res) => {
        if (res.success) {
          this.checklistDataAssignment[workflowId] = res.checklists.map((checklist: any) => ({
            ...checklist,
            hasLocation: !!checklist.geoCoordinates,
          }));
          this.checklistTotalItems = res.totalCount ?? 0; // keep total count for pagination
          this.checklistCurrentPage = 1; // reset page to 1 when first opening
        }
      });
  }
}


  // toggleBulkChecklist(workflowId: string): void {
  //   this.expandedRowsSchedule[workflowId] = !this.expandedRowsSchedule[workflowId];

  //   if (this.expandedRowsSchedule[workflowId] && !this.checklistDataSchedule[workflowId]) {
  //     this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
  //       if (res.success) {
  //         this.checklistDataSchedule[workflowId] = res.checklists.map((checklist: any) => ({
  //           ...checklist,
  //           hasLocation: !!checklist.geoCoordinates
  //         }));
  //       }
  //     });
  //   }
  // }

toggleBulkChecklist(workflowId: string): void {
  this.expandedRowsSchedule[workflowId] = !this.expandedRowsSchedule[workflowId];

  if (this.expandedRowsSchedule[workflowId] && !this.checklistDataSchedule[workflowId]) {
    this.workflowService
      .getBulkChecklistByWorkflowId(
        workflowId,
        this.scheduleChecklistCurrentPage,
        this.scheduleChecklistItemsPerPage
      )
      .subscribe(res => {
        if (res.success) {
          this.checklistDataSchedule[workflowId] = res.today.tasks.map((checklist: any) => ({
            ...checklist,
            hasLocation: !!checklist.coordinates
          }));
        }
      });
  }
}






  showPopup = false;
  workflowTitle = '';
  description = '';
  assignedStart = '';
  assignedEnd = '';
  checklistIds = '';



  openPopup() {
    this.showPopup = true;
    this.workflowTitle = '';
    this.description = '';
    this.assignedStart = '';
    this.assignedEnd = '';
    this.isActive = true;

  }

  closePopup() {
    this.showPopup = false;
    this.workflowTitle = '';
    this.description = '';
    this.assignedStart = '';
    this.assignedEnd = '';
  }




  workflowStartDate!: Date;
  workflowEndDate!: Date;

  createWorkflow() {
    if (!this.workflowTitle.trim() || !this.description.trim()) {
      this.alertService.showAlert('Please enter title and description', 'error');
      return;
    }

    const startDateTime = this.assignedStart ? new Date(this.assignedStart) : null;
    const endDateTime = this.assignedEnd ? new Date(this.assignedEnd) : null;

    // store start and end dates for later validation
    this.workflowStartDate = startDateTime!;
    this.workflowEndDate = endDateTime!;

    const payload = {
      workflowTitle: this.workflowTitle,
      description: this.description,
      createdBy: this.createdBy,
      assignedStart: startDateTime?.toISOString(),
      assignedEnd: endDateTime?.toISOString(),
      isActive: this.isActive,
    };

    this.workflowService.createWorkflow(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.closePopup();
          this.alertService.showAlert(res.message);
          this.getWorkflowSummary();
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error while creating workflow');
      }
    });
  }




  checklistPopupVisible = false;


  workflowId = '';
  locationCode = '';
  title = '';
  remarks = '';
  assignedTo = '';
  isActive = true;
  assignedBy = "";
  createdBy = '';
  modifiedBy = '';


  createChecklist() {
    const payload = {
      workflowId: this.workflowId,
      checklist: this.selectedTaskIds,        // <-- selected tasks
      users: this.selectedUserIds,            // <-- selected users
      locationIds: this.selectedLocationIds,  // <-- selected locations
      createdBy: this.createdBy               // <-- logged-in user
    };

    this.workflowService.createChecklist(payload).subscribe(
      res => {
        console.log('Checklist Created:', res);
        this.hideChecklistPopup();
        this.alertService.showAlert(res.message);
        this.refreshChecklist(this.workflowId);
      },
      (err: any) => {
        if ((err.status === 400 || err.status === 500) && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("Checklist creation failed.", "error");
        }
      }
    );
  }

  hideChecklistPopup() {
    this.checklistPopupVisible = false;
    this.selectedUserIds = [];
    this.selectedTaskIds = [];
    this.selectedLocationIds = [];
  }

  showChecklistPopup(workflow: any) {
    this.loadPatrolUsers();
    this.loadTask();
    this.loadLocation();
    this.workflowId = workflow.workflowId;
    this.checklistPopupVisible = true;
    this.selectedUserIds = [];
    this.selectedTaskIds = [];
    this.selectedLocationIds = [];
  }

  patrolUsers: any[] = [];

  loadPatrolUsers() {
    this.workflowService.getPatrolUsers().subscribe({
      next: (response) => {
        this.patrolUsers = response.users || [];
      },
      error: (error) => {
        console.error('Error loading patrol users:', error);
      }
    });
  }

  selectedWorkflowId: string = '';
  selectedChecklistId: string = '';

  loadChecklist(workflowId: string): void {
    if (!workflowId || this.checklistData[workflowId]) return;

    this.workflowService.getChecklistByWorkflowIds(workflowId).subscribe(res => {
      if (res.success) {
        this.checklistData[workflowId] = res.checklists;
      }
    });
  }


  showEditPopup = false;

  openEditWorkflowPopup(workflow: any) {
    this.workflowId = workflow.workflowId;
    this.workflowTitle = workflow.workflowTitle;
    this.description = workflow.description;
    this.assignedStart = this.formatDateForInput(workflow.assignedStart);
    this.assignedEnd = this.formatDateForInput(workflow.assignedEnd);
    this.showEditPopup = true;
  }



  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = this.pad(date.getMonth() + 1);
    const day = this.pad(date.getDate());
    return `${year}-${month}-${day}`;
  }


  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }


  updateWorkflow() {
    const payload = {
      workflowId: this.workflowId,
      workflowTitle: this.workflowTitle,
      description: this.description,
      assignedStart: this.assignedStart,
      assignedEnd: this.assignedEnd,

    };

    this.workflowService.updateWorkflow(this.workflowId, payload).subscribe(res => {
      if (res.success) {
        this.closeEditWorkflowPopup();
        this.alertService.showAlert(res.message);
        this.getWorkflowSummary();

      }
    });
  }

  closeEditWorkflowPopup() {
    this.showEditPopup = false;
    this.workflowId = '';
    this.workflowTitle = '';
    this.description = '';
    this.assignedStart = '';
    this.assignedEnd = '';

  }

  updatechecklistPopupVisible = false;
  checklistId: string = '';


  openUpdateChecklistPopup(checklist: any) {
    this.loadPatrolUsers();
    this.loadLocation();
    this.updatechecklistPopupVisible = true;


    this.checklistId = checklist.checklistId;
    this.workflowId = checklist.workflowId;
    this.locationCode = checklist.locationCode;
    this.title = checklist.title;
    this.remarks = checklist.remarks;
    this.assignedTo = checklist.assignedTo;
  }

  hideUpdateChecklistPopup() {
    this.updatechecklistPopupVisible = false;
  }

  updateChecklist() {
    const body = {
      workflowId: this.workflowId,
      locationCode: this.locationCode,
      title: this.title,
      remarks: this.remarks,
      assignedTo: this.assignedTo,
      modifiedBy: this.modifiedBy
    };

    this.workflowService.updateChecklist(this.checklistId, body).subscribe(
      (res) => {
        console.log('Checklist updated', res);
        this.hideUpdateChecklistPopup();
        this.alertService.showAlert(res.message);
        this.refreshChecklist(this.workflowId);


      },
      (error) => {
        if (error.status === 403 && error.error?.message) {
          this.alertService.showAlert(error.error.message, "error");
        }
      }
    );
  }

  // refreshChecklist(workflowId: string): void {
  //   this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
  //     if (res.success) {
  //       this.checklistData[workflowId] = res.checklists;
  //       this.expandedRows[workflowId] = true; // Keep it expanded
  //     }
  //   });
  // }

  refreshChecklist(workflowId: string): void {
  this.workflowService
    .getChecklistByWorkflowId(workflowId, this.checklistCurrentPage, this.checklistItemsPerPage)
    .subscribe((res) => {
      if (res.success) {
        this.checklistData[workflowId] = res.checklists;
        this.expandedRows[workflowId] = true;
        this.checklistTotalItems = res.totalCount ?? 0; // update total
      }
    });
}

  locationList: any[] = []
  loadLocation() {
    this.workflowService.getLocationSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.locationList = res.locations;
        }
      },
      error: (err) => {
        console.error('Error fetching location summary:', err);
      }
    });
  }





  taskDropdownOpen: boolean = false;
  selectedChecklistIds: number[] = [];

  toggleTaskDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.taskDropdownOpen = !this.taskDropdownOpen;
  }

  onTaskToggle(event: Event, checklistId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedChecklistIds.includes(checklistId)) {
        this.selectedChecklistIds.push(checklistId);
      }
    } else {
      this.selectedChecklistIds = this.selectedChecklistIds.filter(id => id !== checklistId);
    }
  }

  getSelectedTaskNames(): string {
    const selected = this.checklistData[this.selectedWorkflowId]?.filter(c =>
      this.selectedChecklistIds.includes(c.checklistId)
    ) || [];
    return selected.map(c => c.title).join(', ');
  }

  // Optional: Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  handleClickOutside() {
    this.taskDropdownOpen = false;
  }

  // Add this method to get checklist title
  getChecklistTitle(checklistId: number): string {
    const checklist = this.checklistData[this.selectedWorkflowId]?.find(c => c.checklistId === checklistId);
    return checklist ? `${checklist.checklistId} - ${checklist.title}` : '';
  }

  // Add this method to remove a selected checklist
  removeSelectedChecklist(event: MouseEvent, checklistId: number) {
    event.stopPropagation();
    this.selectedChecklistIds = this.selectedChecklistIds.filter(id => id !== checklistId);
  }

  // Keep all your existing methods as they are
  // (toggleTaskDropdown, onTaskToggle, getSelectedTaskNames, handleClickOutside)
  reloadPage() {
    window.location.reload();
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
    this.getWorkflowSummary(); // should fetch current page data

  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getWorkflowSummary();

    }
  }

  nextPage(): void {
    if (this.endItem < this.totalItems) {
      this.currentPage++;
      this.getWorkflowSummary();

    }
  }



  // Selected user IDs
  selectedUserIds: string[] = [];

  // Dropdown open state
  assignDropdownOpen: boolean = false;

  toggleAssignDropdown(event: Event) {
    event.stopPropagation();
    this.assignDropdownOpen = !this.assignDropdownOpen;
  }

  // Add/remove user when checkbox changes
  onUserToggle(event: Event, userId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedUserIds.includes(userId)) {
        this.selectedUserIds.push(userId);
      }
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
    }
  }

  // Show chip text
  getUserName(userId: string): string {
    const user = this.patrolUsers.find(u => u.userId === userId);
    return user ? `${user.userId} - ${user.patrolGuardName}` : userId;
  }

  // Remove chip by clicking ×
  removeSelectedUser(event: Event, userId: string) {
    event.stopPropagation();
    this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
  }

  // scheduling

  selectedRole: string = 'schedule';






  // refreshBulkChecklist(workflowId: string): void {
  //   this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
  //     if (res.success) {
  //       this.checklistData[workflowId] = res.checklists;
  //       this.expandedRows[workflowId] = true; // Keep it expanded
  //     }
  //   });
  // }


refreshBulkChecklist(workflowId: string): void {
  this.workflowService
    .getBulkChecklistByWorkflowId(
      workflowId,
      this.scheduleChecklistCurrentPage,
      this.scheduleChecklistItemsPerPage
    )
    .subscribe(res => {
      if (res.success) {
        this.checklistData[workflowId] = res.today.tasks;
        this.expandedRows[workflowId] = true; // Keep it expanded
      }
    });
}


  //   months = '';
  //   selectedDates: Date[] = [];
  //   scheduledDates: any[] = [];

  //   formatDate(d: Date): string {
  //     const year = d.getFullYear();
  //     const month = ('0' + (d.getMonth() + 1)).slice(-2);
  //     const day = ('0' + d.getDate()).slice(-2);
  //     return `${year}-${month}-${day}`;
  //   }
  //   expandDatesToMonths(dates: Date[], months: string[]): string[] {
  //   const expandedDates: string[] = [];

  //   dates.forEach(date => {
  //     // Always include the original selected date
  //     expandedDates.push(this.formatDate(date));

  //     months.forEach(month => {
  //       const [monthName, year] = month.split(' '); // e.g., "Feb 2026"
  //       const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  //       const day = date.getDate();

  //       // ✅ Find last valid day of this month
  //       const lastDayOfMonth = new Date(+year, monthIndex + 1, 0).getDate();

  //       if (day <= lastDayOfMonth) {
  //         // Only create if valid in this month
  //         const newDate = new Date(+year, monthIndex, day);
  //         const formatted = this.formatDate(newDate);

  //         if (!expandedDates.includes(formatted)) {
  //           expandedDates.push(formatted);
  //         }
  //       }
  //     });
  //   });

  //   return expandedDates;
  // }

  scheduleStart = '';
  scheduleEnd = '';


  // createChecklistBulk() {
  //   const start = new Date(this.scheduleStart);
  //   const end = new Date(this.scheduleEnd);

  //   if (!this.workflowStartDate || !this.workflowEndDate) {
  //     this.alertService.showAlert("Workflow date range not found.", "error");
  //     return;
  //   }

  //   if (start < this.workflowStartDate || end > this.workflowEndDate) {
  //     this.alertService.showAlert(
  //       `Allowed schedule range is ${this.workflowStartDate.toISOString().split('T')[0]} to ${this.workflowEndDate.toISOString().split('T')[0]}`,
  //       "error"
  //     );
  //     return;
  //   }

  //   const payload = {
  //     workflowId: this.workflowId,
  //     title: this.title,
  //     description: this.description,
  //     scheduleStart: this.scheduleStart,
  //     scheduleEnd: this.scheduleEnd,
  //     createdBy: this.createdBy
  //   };

  //   this.workflowService.createBulkChecklist(payload).subscribe({
  //     next: (res) => {
  //       console.log('Bulk Checklist Created:', res);
  //       this.hideBulkChecklistPopup();
  //       this.alertService.showAlert(res.message);
  //       this.refreshBulkChecklist(this.workflowId);
  //     },
  //     error: (err: any) => {
  //       if ((err.status === 400 || err.status === 500) && err.error && err.error.message) {
  //         this.alertService.showAlert(err.error.message, "error");
  //       } else {
  //         this.alertService.showAlert("Bulk checklist creation failed.", "error");
  //       }
  //     }
  //   });
  // }


  createChecklistBulk() {
    const start = new Date(this.scheduleStart);
    const end = new Date(this.scheduleEnd);

    if (!this.workflowStartDate || !this.workflowEndDate) {
      this.alertService.showAlert("Workflow date range not found.", "error");
      return;
    }

    if (start < this.workflowStartDate || end > this.workflowEndDate) {
      this.alertService.showAlert(
        `Allowed schedule range is ${this.workflowStartDate.toISOString().split('T')[0]} to ${this.workflowEndDate.toISOString().split('T')[0]}`,
        "error"
      );
      return;
    }

    const payload = {
      workflowId: this.workflowId,
      checklist: this.selectedTaskIds,        // <-- selected tasks
      users: this.selectedUserIds,            // <-- selected users
      locationIds: this.selectedLocationIds,  // <-- selected locations
      scheduleStart: this.scheduleStart,
      scheduleEnd: this.scheduleEnd,
      createdBy: this.createdBy
    };

    this.workflowService.createBulkChecklist(payload).subscribe({
      next: (res) => {
        console.log('Bulk Checklist Created:', res);
        this.hideBulkChecklistPopup();
        this.alertService.showAlert(res.message);
       this.refreshBulkChecklist(this.workflowId);
      },
      error: (err: any) => {
        if ((err.status === 400 || err.status === 500) && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("Bulk checklist creation failed.", "error");
        }
      }
    });
  }





  checklistBulkPopupVisible: boolean = false;




  hideBulkChecklistPopup() {
    this.checklistBulkPopupVisible = false;
  }

  showBulkChecklistPopup(workflow: any) {
    this.loadPatrolUsers();
    this.loadTask();
    this.loadLocation();
    this.workflowId = workflow.workflowId;
    this.checklistBulkPopupVisible = true;

    this.selectedUserIds = [];
    this.selectedTaskIds = [];
    this.selectedLocationIds = [];
    this.scheduleStart = '',
      this.scheduleEnd = '',

      this.workflowStartDate = new Date(workflow.assignedStart);
    this.workflowEndDate = new Date(workflow.assignedEnd);

  }







  //   daysSelected: string[] = [];
  //   event: any;

  //   isSelected = (date: Date): string => {
  //     const formatted =
  //       date.getFullYear() +
  //       "-" +
  //       ("00" + (date.getMonth() + 1)).slice(-2) +
  //       "-" +
  //       ("00" + date.getDate()).slice(-2);

  //     return this.daysSelected.includes(formatted) ? "selected" : "";
  //   };

  //   select(event: Date | null, calendar: any) {
  //     if (!event) return;  // guard clause for null

  //     const formatted =
  //       event.getFullYear() +
  //       "-" +
  //       ("00" + (event.getMonth() + 1)).slice(-2) +
  //       "-" +
  //       ("00" + event.getDate()).slice(-2);

  //     const index = this.daysSelected.indexOf(formatted);
  //     if (index === -1) {
  //       this.daysSelected.push(formatted);
  //     } else {
  //       this.daysSelected.splice(index, 1);
  //     }

  //     calendar.updateTodaysDate();
  //   }




  //   monthA: string[] = [];



  // Toggle Select All
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedChecklistIds = this.checklistData[this.selectedWorkflowId].map(c => c.checklistId);
    } else {
      this.selectedChecklistIds = [];
    }
  }

  // Check if all are selected
  isAllSelected(): boolean {
    return this.checklistData[this.selectedWorkflowId] &&
      this.selectedChecklistIds.length === this.checklistData[this.selectedWorkflowId].length;
  }


  // Toggle Select All Users
  toggleSelectAllUsers(event: any) {
    if (event.target.checked) {
      this.selectedUserIds = this.patrolUsers.map(u => u.userId);
    } else {
      this.selectedUserIds = [];
    }
     this.assignDropdownOpen = false;

  }

  // Check if all users are selected
  isAllUsersSelected(): boolean {
    return this.patrolUsers &&
      this.selectedUserIds.length === this.patrolUsers.length;
  }


  //   selectedMonths: string[] = [];     // selected months
  //   monthDropdownOpen = false;         // toggle state

  //   normalizeDate(d: Date): Date {
  //     return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // strip time
  //   }

  //   selectDate(event: any) {
  //     const date: Date = event.value;
  //     if (!date) return;

  //     if (!this.workflowStartDate || !this.workflowEndDate) {
  //       this.alertService.showAlert("Please select workflow start and end date first", "error");
  //       return;
  //     }

  //     // ✅ Normalize all dates
  //     const selected = this.normalizeDate(date);
  //     const start = this.normalizeDate(this.workflowStartDate);
  //     const end = this.normalizeDate(this.workflowEndDate);

  //     // 🔒 Validate
  //     if (selected < start || selected > end) {
  //       const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  //       const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  //       this.alertService.showAlert(`Only date range ${startStr} to ${endStr} is allowed`, "error");
  //       return;
  //     }

  //     // ✅ Toggle selection (add/remove)
  //     const exists = this.selectedDates.some(d => d.getTime() === selected.getTime());
  //     if (!exists) {
  //       this.selectedDates.push(selected);
  //     } else {
  //       this.selectedDates = this.selectedDates.filter(d => d.getTime() !== selected.getTime());
  //     }

  //     // Generate next 6 months only on first valid selection
  //     if (this.selectedDates.length === 1) {
  //       this.monthA = this.getNextSixMonths(selected);
  //       this.selectedMonths = [];
  //     }
  //   }



  //   getNextSixMonths(startDate: Date): string[] {
  //     const months: string[] = [];
  //     const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

  //     for (let i = 1; i < 7; i++) {
  //       const d = new Date(startDate);
  //       d.setMonth(startDate.getMonth() + i);
  //       months.push(d.toLocaleDateString('en-US', options));
  //     }
  //     return months;
  //   }


  //   onCalendarBlur() {
  //     // Triggered when clicking outside the calendar
  //   }


  //   removeDate(index: number) {
  //     this.selectedDates.splice(index, 1);
  //   }


  //   toggleMonthDropdown(event: Event) {
  //     event.stopPropagation();
  //     this.monthDropdownOpen = !this.monthDropdownOpen;
  //   }


  //  onMonthToggle(event: any, month: string) {
  //   if (!this.workflowStartDate || !this.workflowEndDate) {
  //     this.alertService.showAlert("Please select workflow start and end date first", "error");
  //     event.target.checked = false;
  //     return;
  //   }

  //   // Parse workflow range → convert to [month, year]
  //   const start = new Date(this.workflowStartDate);
  //   const end = new Date(this.workflowEndDate);

  //   const startMonth = start.getMonth();
  //   const startYear = start.getFullYear();
  //   const endMonth = end.getMonth();
  //   const endYear = end.getFullYear();

  //   // Parse selected month string → convert to [month, year]
  //   const [selMonthStr, selYearStr] = month.split(" "); // e.g. "Oct 2025"
  //   const selDate = new Date(`${selMonthStr} 1, ${selYearStr}`);
  //   const selMonth = selDate.getMonth();
  //   const selYear = selDate.getFullYear();

  //   // Check if in range
  //   const inRange =
  //     (selYear > startYear || (selYear === startYear && selMonth >= startMonth)) &&
  //     (selYear < endYear || (selYear === endYear && selMonth <= endMonth));

  //   if (!inRange) {
  //     const startStr = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  //     const endStr = end.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  //     this.alertService.showAlert(`Only months between ${startStr} and ${endStr} are allowed`, "error");
  //     event.target.checked = false;
  //     return;
  //   }

  //   // ✅ Add/remove if valid
  //   if (event.target.checked) {
  //     if (!this.selectedMonths.includes(month)) {
  //       this.selectedMonths.push(month);
  //     }
  //   } else {
  //     this.selectedMonths = this.selectedMonths.filter(m => m !== month);
  //   }
  // }


  //   removeSelectedMonth(event: Event, month: string) {
  //     event.stopPropagation();
  //     this.selectedMonths = this.selectedMonths.filter(m => m !== month);
  //   }



  // toggleSelectAllMonths(event: any) {
  //   if (!this.workflowStartDate || !this.workflowEndDate) {
  //     this.alertService.showAlert("Please select workflow start and end date first", "error");
  //     event.target.checked = false;
  //     return;
  //   }

  //   const start = new Date(this.workflowStartDate);
  //   const end = new Date(this.workflowEndDate);

  //   if (event.target.checked) {
  //     // Get only valid months in range
  //     const validMonths = this.monthA.filter(month => {
  //       const [selMonthStr, selYearStr] = month.split(" ");
  //       const selDate = new Date(`${selMonthStr} 1, ${selYearStr}`);
  //       return selDate >= new Date(start.getFullYear(), start.getMonth(), 1) &&
  //              selDate <= new Date(end.getFullYear(), end.getMonth(), 1);
  //     });

  //     if (validMonths.length === 0) {
  //       // 🚨 No valid months
  //       this.alertService.showAlert("No valid months available in workflow date range", "error");
  //       this.selectedMonths = [];
  //       event.target.checked = false;
  //       return;
  //     }

  //     if (validMonths.length !== this.monthA.length) {
  //       // 🚨 Some months are out of range
  //       const startStr = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  //       const endStr = end.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  //       this.alertService.showAlert(`Only months between ${startStr} to ${endStr} are allowed`, "error");
  //       this.selectedMonths = []; // ⬅️ Don’t auto-select anything
  //       event.target.checked = false;
  //       return;
  //     }

  //     // ✅ All months valid → allow selection
  //     this.selectedMonths = validMonths;
  //   } else {
  //     this.selectedMonths = [];
  //   }
  // }



  //   isAllMonthsSelected(): boolean {
  //     return this.monthA.length > 0 && this.selectedMonths.length === this.monthA.length; // ✅ FIX
  //   }




  tasks: any[] = [];

  loadTask() {
    this.patrolService.getTask().subscribe({
      next: (res: any) => {
        this.tasks = res.checklists;
      },
      error: () => {
        console.log("error loading task")
      }
    })

  }


  selectedTaskIds: string[] = [];  // store selected tasks

  taskUsers: any[] = []; // list of users that can be assigned



  // Toggle dropdown
  toggleNewTaskDropdown(event: Event) {
    event.stopPropagation();
    this.taskDropdownOpen = !this.taskDropdownOpen;
  }

  // Handle checkbox toggle
  onNewTaskToggle(event: Event, taskId: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedTaskIds.includes(taskId)) {
        this.selectedTaskIds.push(taskId);
      }
    } else {
      this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId);
    }
  }

  // Show chip text
  getTaskTitle(taskId: string): string {
    const task = this.tasks.find(t => t.checklistId === taskId);
    return task ? task.title : taskId;
  }

  // Remove chip
  removeSelectedTask(event: Event, taskId: string) {
    event.stopPropagation();
    this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId);
  }

  // Select All / Deselect All
  isAllTasksSelected(): boolean {
    return this.selectedTaskIds.length === this.tasks.length;
  }

  toggleSelectAllTasks(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedTaskIds = this.tasks.map(t => t.checklistId);
    } else {
      this.selectedTaskIds = [];
    }
    this.taskDropdownOpen=false;
  }


  selectedLocationIds: string[] = [];  // selected locations
  isLocationDropdownOpen: boolean = false;

  // Toggle dropdown
  toggleLocationDropdown() {
    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
  }

  // Handle individual checkbox toggle
  onLocationToggle(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const locId = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedLocationIds.includes(locId)) {
        this.selectedLocationIds.push(locId);
      }
    } else {
      this.selectedLocationIds = this.selectedLocationIds.filter(id => id !== locId);
    }
  }

  // Remove a selected location
  removeLocation(locId: string, event?: Event) {
    if (event) event.stopPropagation();
    this.selectedLocationIds = this.selectedLocationIds.filter(id => id !== locId);
  }

  // Get location display name
  getLocationName(locId: string): string {
    const loc = this.locationList.find(l => l.locationId === locId);
    return loc ? `${loc.locationId} - ${loc.description}` : locId;
  }

  // Select/Deselect all locations
  isAllLocationsSelected(): boolean {
    return this.selectedLocationIds.length === this.locationList.length;
  }

  toggleSelectAllLocations(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedLocationIds = this.locationList.map(l => l.locationId);
    } else {
      this.selectedLocationIds = [];
    }
    this.isLocationDropdownOpen=false;
  }


showChecklistModal = false;
selectedChecklistData: any[] = [];



// openChecklistPopup(workflowId: string): void {

//   if (!this.checklistDataAssignment[workflowId]) {
//     this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
//       if (res.success) {
//         this.checklistDataAssignment[workflowId] = res.checklists.map((checklist: any) => ({
//           ...checklist,
//           hasLocation: !!checklist.geoCoordinates
//         }));
//         this.selectedChecklistData = this.checklistDataAssignment[workflowId];
//         this.showChecklistModal = true;
//       }
//     });
//   } else {

//     this.selectedChecklistData = this.checklistDataAssignment[workflowId];
//     this.showChecklistModal = true;
//   }
// }

closeChecklistPopup(): void {
  this.showChecklistModal = false;
  this.selectedChecklistData = [];
}


downloadTask() {
  if (!this.selectedChecklistData || this.selectedChecklistData.length === 0) {
    alert('No tasks available to download.');
    return;
  }

  const headers = ['Checklist ID', 'Title', 'Remarks', 'Assigned To', 'Created By', 'Status', 'Active'];
  const rows = this.selectedChecklistData.map(item => [
    item.checklistId,
    item.title,
    item.remarks,
    item.assignedTo?.join(', '),
    item.createdBy,
    item.status,
    item.isActive ? 'Yes' : 'No'
  ]);

  let csvContent = '';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'checklist_tasks.csv');
  link.click();
  URL.revokeObjectURL(url);
}



showScheduleChecklistModal = false;
selectedScheduleChecklistData: any[] = [];

// openScheduleChecklistPopup(workflowId: string): void {
//   if (!workflowId) {
//     console.error('Invalid workflowId for schedule:', workflowId);
//     return;
//   }

//   if (!this.checklistDataSchedule[workflowId]) {
//     this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
//       if (res.success) {
//         this.checklistDataSchedule[workflowId] = res.checklists.map((checklist: any) => ({
//           ...checklist,
//           hasLocation: !!checklist.geoCoordinates
//         }));
//         this.selectedScheduleChecklistData = this.checklistDataSchedule[workflowId];
//         this.showScheduleChecklistModal = true;
//       }
//     });
//   } else {
//     this.selectedScheduleChecklistData = this.checklistDataSchedule[workflowId];
//     this.showScheduleChecklistModal = true;
//   }
// }

closeScheduleChecklistPopup(): void {
  this.showScheduleChecklistModal = false;
  this.selectedScheduleChecklistData = [];
}

downloadScheduleTask() {
  if (!this.selectedScheduleChecklistData || this.selectedScheduleChecklistData.length === 0) {
    alert('No schedule tasks available to download.');
    return;
  }

  const headers = ['Task ID','Title','Description','Assigned To','Assigned By','Start','End','Scheduled Date','Expiry Date','Status','Active'];
  const rows = this.selectedScheduleChecklistData.map(item => [
    item.checklistId,
    item.title,
    item.remarks,
    item.assignedTo,
    item.createdBy,
    item.scanStartDate ? new Date(item.scanStartDate).toLocaleString() : '-',
    item.scanEndDate ? new Date(item.scanEndDate).toLocaleString() : '-',
    item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-',
    item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-',
    item.status,
    item.isActive ? 'Yes' : 'No'
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'schedule_tasks.csv');
  link.click();
  URL.revokeObjectURL(url);
}



// Checklist pagination state
checklistItemsPerPage = 10;
checklistCurrentPage = 1;
checklistPageSizeOptions = [5, 10, 20, 50];
checklistTotalItems = 0;


get checklistStartItem(): number {
  return (this.checklistCurrentPage - 1) * this.checklistItemsPerPage + 1;
}

get checklistEndItem(): number {
  const end = this.checklistCurrentPage * this.checklistItemsPerPage;
  return end > this.checklistTotalItems ? this.checklistTotalItems : end;
}

// 🔹 Open popup & fetch first page
openChecklistPopup(workflowId: string): void {
  this.selectedWorkflowId = workflowId;
  this.checklistCurrentPage = 1;
  this.fetchChecklistData();
  this.showChecklistModal = true;
}

fetchChecklistData(): void {
  if (!this.selectedWorkflowId) return;

  this.workflowService
    .getChecklistByWorkflowId(
      this.selectedWorkflowId,
      this.checklistCurrentPage,
      this.checklistItemsPerPage
    )
    .subscribe((res) => {
      if (res.success) {
        this.selectedChecklistData = res.checklists.map((c: any) => ({
          ...c,
          hasLocation: !!c.geoCoordinates
        }));
        this.checklistTotalItems = res.totalCount ?? 0;
      }

    });
}




// 🔹 Pagination actions
onChecklistItemsPerPageChange(): void {
  this.checklistCurrentPage = 1;
  this.fetchChecklistData();
}

checklistPrevPage(): void {
  if (this.checklistCurrentPage > 1) {
    this.checklistCurrentPage--;
    this.fetchChecklistData();
  }
}

checklistNextPage(): void {
  if (this.checklistEndItem < this.checklistTotalItems) {
    this.checklistCurrentPage++;
    this.fetchChecklistData();
  }
}



// Pagination config for schedule checklist popup
scheduleChecklistItemsPerPage = 10;
scheduleChecklistCurrentPage = 1;
scheduleChecklistTotalItems = 0;
scheduleChecklistPageSizeOptions = [5, 10, 20, 50];
selectedWorkflowScheduleId: string | null = null;


// Open popup
openScheduleChecklistPopup(workflowId: string): void {
  if (!workflowId) return;

  this.selectedWorkflowScheduleId = workflowId;
  this.scheduleChecklistCurrentPage = 1; // reset page
  this.fetchScheduleChecklistData();
  this.showScheduleChecklistModal = true;
}

// Fetch paginated data
// fetchScheduleChecklistData(): void {
//   if (!this.selectedWorkflowScheduleId) return;

//   this.workflowService
//     .getBulkChecklistByWorkflowId(
//       this.selectedWorkflowScheduleId,
//       this.scheduleChecklistCurrentPage,
//       this.scheduleChecklistItemsPerPage
//     )
//     .subscribe(res => {
//       if (res.success) {
//         const data = res.today; // your API returns `today` object
//         this.selectedScheduleChecklistData = data.tasks.map((checklist: any) => ({
//           ...checklist,
//           hasLocation: !!checklist.coordinates
//         }));
//         this.scheduleChecklistTotalItems = data.totalCount;
//       }
//     });
// }
fetchScheduleChecklistData(): void {
  if (!this.selectedWorkflowScheduleId) return;

  this.workflowService
    .getBulkChecklistByWorkflowId(
      this.selectedWorkflowScheduleId,
      this.scheduleChecklistCurrentPage,
      this.scheduleChecklistItemsPerPage
    )
    .subscribe(res => {
      if (res.success && Array.isArray(res.tasks)) {
        this.selectedScheduleChecklistData = res.tasks.map((checklist: any) => ({
          ...checklist,
          hasLocation: !!checklist.coordinates,
          // handle array fields gracefully
          locationName: Array.isArray(checklist.locationName)
            ? checklist.locationName.join(', ')
            : checklist.locationName || '-',
          assignedTo: Array.isArray(checklist.assignedTo)
            ? checklist.assignedTo.join(', ')
            : checklist.assignedTo || '-',
          scheduledDate: Array.isArray(checklist.scheduledDate)
            ? checklist.scheduledDate[0]
            : checklist.scheduledDate || null,
        }));

        this.scheduleChecklistTotalItems = res.totalCount || res.tasks.length;
      } else {
        this.selectedScheduleChecklistData = [];
        this.scheduleChecklistTotalItems = 0;
      }
    });
}

// Pagination actions
onScheduleChecklistItemsPerPageChange(): void {
  this.scheduleChecklistCurrentPage = 1;
  this.fetchScheduleChecklistData();
}

scheduleChecklistPrevPage(): void {
  if (this.scheduleChecklistCurrentPage > 1) {
    this.scheduleChecklistCurrentPage--;
    this.fetchScheduleChecklistData();
  }
}

scheduleChecklistNextPage(): void {
  if (this.scheduleChecklistEndItem < this.scheduleChecklistTotalItems) {
    this.scheduleChecklistCurrentPage++;
    this.fetchScheduleChecklistData();
  }
}

get scheduleChecklistStartItem(): number {
  return (this.scheduleChecklistCurrentPage - 1) * this.scheduleChecklistItemsPerPage + 1;
}

get scheduleChecklistEndItem(): number {
  const end = this.scheduleChecklistCurrentPage * this.scheduleChecklistItemsPerPage;
  return end > this.scheduleChecklistTotalItems ? this.scheduleChecklistTotalItems : end;
}

userSearchTerm: string = '';
taskSearchTerm: string = '';
locationSearchTerm: string = '';


reloadSchedulePage(){
   this.fetchScheduleChecklistData();

   const popup = document.querySelector('.popup-content');
  if (popup) {
    popup.classList.add('shake');
    setTimeout(() => popup.classList.remove('shake'), 400); // remove after animation
  }
}

reloadAssPage(){
this.fetchChecklistData();

   const popup = document.querySelector('.popup-content');
  if (popup) {
    popup.classList.add('shake');
    setTimeout(() => popup.classList.remove('shake'), 400); // remove after animation
  }
}
}


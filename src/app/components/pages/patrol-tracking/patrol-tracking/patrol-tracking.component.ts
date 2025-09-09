import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { RouterModule } from '@angular/router';
import { MatDatepicker, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-patrol-tracking',
  imports: [CommonModule, FormsModule, RouterModule, MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerToggle,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDatepickerModule,

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



  // Separate states
  expandedRowsAssignment: { [workflowId: string]: boolean } = {};
  expandedRowsSchedule: { [workflowId: string]: boolean } = {};

  checklistDataAssignment: { [workflowId: string]: any[] } = {};
  checklistDataSchedule: { [workflowId: string]: any[] } = {};


  constructor(private workflowService: WorkflowService, private alertService: AlertService) { }





  getWorkflowSummary(): void {
    this.workflowService.getWorkflows(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        if (res.success) {
          // this.workflows = res.workflows;
          // this.totalItems = res.pagination?.totalRecords ?? 0;
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
  //   this.expandedRows[workflowId] = !this.expandedRows[workflowId];

  //   if (this.expandedRows[workflowId] && !this.checklistData[workflowId]) {
  //     this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
  //       if (res.success) {
  //         // ✅ Add a flag for red marker icon
  //         this.checklistData[workflowId] = res.checklists.map((checklist: any) => ({
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
      this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
        if (res.success) {
          this.checklistDataAssignment[workflowId] = res.checklists.map((checklist: any) => ({
            ...checklist,
            hasLocation: !!checklist.geoCoordinates
          }));
        }
      });
    }
  }

  toggleBulkChecklist(workflowId: string): void {
    this.expandedRowsSchedule[workflowId] = !this.expandedRowsSchedule[workflowId];

    if (this.expandedRowsSchedule[workflowId] && !this.checklistDataSchedule[workflowId]) {
      this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
        if (res.success) {
          this.checklistDataSchedule[workflowId] = res.checklists.map((checklist: any) => ({
            ...checklist,
            hasLocation: !!checklist.geoCoordinates
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



  // createWorkflow() {
  //   if (!this.workflowTitle.trim() || !this.description.trim()) {
  //     this.alertService.showAlert('Please enter title and description', 'error');
  //     return;
  //   }

  //   const startDateTime = this.assignedStart ? new Date(this.assignedStart).toISOString() : null;
  //   const endDateTime = this.assignedEnd ? new Date(this.assignedEnd).toISOString() : null;



  //   const payload = {
  //     workflowTitle: this.workflowTitle,
  //     description: this.description,
  //     createdBy: this.createdBy,
  //     assignedStart: startDateTime,
  //     assignedEnd: endDateTime,
  //     isActive: this.isActive,


  //   };

  //   this.workflowService.createWorkflow(payload).subscribe({
  //     next: (res) => {
  //       if (res.success) {
  //         this.closePopup();
  //         this.alertService.showAlert(res.message);
  //         this.getWorkflowSummary();
  //       } else {
  //         alert('Failed to create workflow');
  //       }
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       alert('Error while creating workflow');
  //     }
  //   });
  // }


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
      locationCode: this.locationCode,
      title: this.title,
      remarks: this.remarks,
      assignedTo: this.assignedTo,
      assignedBy: this.assignedBy,
      isActive: this.isActive,
      createdBy: this.createdBy,
      modifiedBy: this.modifiedBy,
    };

    this.workflowService.createChecklist(payload).subscribe(
      res => {
        console.log('Checklist Created:', res);
        this.hideChecklistPopup();
        this.alertService.showAlert(res.message);
        this.refreshChecklist(this.workflowId);

      },
      (err: any) => {
        if (err.status === 500 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message + " please enter title", "error");
        } else {
          this.alertService.showAlert("Checklist creation failed.", "error");
        }
      }
    );
  }

  hideChecklistPopup() {
    this.checklistPopupVisible = false;

    this.locationCode = '';
    this.title = '';
    this.remarks = '';
    this.assignedTo = '';
  }

  showChecklistPopup(workflow: any) {
    this.workflowId = workflow.workflowId;
    this.checklistPopupVisible = true;

    this.locationCode = '';
    this.title = '';
    this.remarks = '';
    this.assignedTo = '';
    // this.locationName = '';
    // this.latitude="";
    // this.longitude='';
    // this.ETA='';

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
    const hours = this.pad(date.getHours());
    const minutes = this.pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  refreshChecklist(workflowId: string): void {
    this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
      if (res.success) {
        this.checklistData[workflowId] = res.checklists;
        this.expandedRows[workflowId] = true; // Keep it expanded
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

  selectedRole: string = 'Assignment';




  loadBulkChecklist(workflowId: string): void {
    if (!workflowId || this.checklistData[workflowId]) return;

    this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
      if (res.success) {
        this.checklistData[workflowId] = res.checklists;
      }
    });
  }


  refreshBulkChecklist(workflowId: string): void {
    this.workflowService.getBulkChecklistByWorkflowId(workflowId).subscribe(res => {
      if (res.success) {
        this.checklistData[workflowId] = res.checklists;
        this.expandedRows[workflowId] = true; // Keep it expanded
      }
    });
  }



  months = '';
  selectedDates: Date[] = [];
  scheduledDates: any[] = [];

formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}
// Expand selected dates to include selected months
expandDatesToMonths(dates: Date[], months: string[]): string[] {
  const expandedDates: string[] = [];

  dates.forEach(date => {
    // Add the original date
    expandedDates.push(this.formatDate(date));

    // Add dates in selected months
    months.forEach(month => {
      const [monthName, year] = month.split(' '); // e.g., "Oct 2025"
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // 0-11

      const newDate = new Date(date);
      newDate.setMonth(monthIndex);

      const formatted = this.formatDate(newDate);
      if (!expandedDates.includes(formatted)) {
        expandedDates.push(formatted);
      }
    });
  });

  return expandedDates;
}

  createChecklistBulk() {

    const expandedDates = this.expandDatesToMonths(this.selectedDates, this.selectedMonths);

    const payload = {
      workflowId: this.workflowId,
      title: this.title,
      description: this.description,
      months: this.selectedMonths,
    //  scheduledDates: this.selectedDates.map(d => new Date(d).toISOString().split('T')[0] ),// convert to YYYY-MM-DD ),
     scheduledDates:expandedDates, 
      createdBy: this.createdBy
    };

    this.workflowService.createBulkChecklist(payload).subscribe(
      res => {
        console.log('Bulk Checklist Created:', res);
        this.hideBulkChecklistPopup();
        this.alertService.showAlert(res.message);
        this.refreshBulkChecklist(this.workflowId);
      },
      (err: any) => {
        if (err.status === 500 && err.error && err.error.message) {
          this.alertService.showAlert(err.error.message, "error");
        } else {
          this.alertService.showAlert("Bulk checklist creation failed.", "error");
        }
      }
    );
  }



  checklistBulkPopupVisible: boolean = false;




  hideBulkChecklistPopup() {

    this.checklistBulkPopupVisible = false;
    this.locationCode = '';
    this.title = '';
    this.remarks = '';
    this.assignedTo = '';
    // Reset date fields
    this.scheduledDates = [];
    this.selectedDates = [];
    this.selectedMonths = [];
    this.monthA = [];

  }

  showBulkChecklistPopup(workflow: any) {
    this.workflowId = workflow.workflowId;
    this.checklistBulkPopupVisible = true;
    this.locationCode = '';
    this.title = '';
    this.remarks = '';
    this.assignedTo = '';
    this.months = '';
    this.scheduledDates = [];

    if (workflow.assignedStart && workflow.assignedEnd) {
      this.workflowStartDate = new Date(workflow.assignedStart);
      this.workflowEndDate = new Date(workflow.assignedEnd);
    }

  }







  daysSelected: string[] = [];
  event: any;

  isSelected = (date: Date): string => {
    const formatted =
      date.getFullYear() +
      "-" +
      ("00" + (date.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + date.getDate()).slice(-2);

    return this.daysSelected.includes(formatted) ? "selected" : "";
  };

  select(event: Date | null, calendar: any) {
    if (!event) return;  // guard clause for null

    const formatted =
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2);

    const index = this.daysSelected.indexOf(formatted);
    if (index === -1) {
      this.daysSelected.push(formatted);
    } else {
      this.daysSelected.splice(index, 1);
    }

    calendar.updateTodaysDate();
  }

 


  monthA: string[] = [];
  currentDate: string = '';


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
  }

  // Check if all users are selected
  isAllUsersSelected(): boolean {
    return this.patrolUsers &&
      this.selectedUserIds.length === this.patrolUsers.length;
  }


  selectedMonths: string[] = [];     // selected months
  monthDropdownOpen = false;         // toggle state

  // selectDate(event: any) {
  //   const date: Date = event.value;
  //   if (!date) return;

  //   if (date < this.workflowStartDate || date > this.workflowEndDate) {
  //     return;
  //   }

  //   if (!this.selectedDates.some(d => d.getTime() === date.getTime())) {
  //     this.selectedDates.push(date);
  //   }

  //   // 🔹 Generate next 6 months for dropdown
  //   this.monthA = this.getNextSixMonths(date);
  //   this.selectedMonths = []; // reset when new months generated
  // }

normalizeDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // strip time
}

selectDate(event: any) {
  const date: Date = event.value;
  if (!date) return;

  if (!this.workflowStartDate || !this.workflowEndDate) {
    this.alertService.showAlert("Please select workflow start and end date first", "error");
    return;
  }

  // ✅ Normalize all dates
  const selected = this.normalizeDate(date);
  const start = this.normalizeDate(this.workflowStartDate);
  const end = this.normalizeDate(this.workflowEndDate);

  // 🔒 Validate
  if (selected < start || selected > end) {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    this.alertService.showAlert(`Only date range ${startStr} to ${endStr} is allowed`, "error");
    return;
  }

  // ✅ Toggle selection (add/remove)
  const exists = this.selectedDates.some(d => d.getTime() === selected.getTime());
  if (!exists) {
    this.selectedDates.push(selected);
  } else {
    this.selectedDates = this.selectedDates.filter(d => d.getTime() !== selected.getTime());
  }

  // Generate next 6 months only on first valid selection
  if (this.selectedDates.length === 1) {
    this.monthA = this.getNextSixMonths(selected);
    this.selectedMonths = [];
  }
}




  getNextSixMonths(startDate: Date): string[] {
    const months: string[] = [];
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

    for (let i = 1; i < 7; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      months.push(d.toLocaleDateString('en-US', options));
    }
    return months;
  }




removeDate(index: number) {
  this.selectedDates.splice(index, 1);
}


  toggleMonthDropdown(event: Event) {
    event.stopPropagation();
    this.monthDropdownOpen = !this.monthDropdownOpen;
  }

  onMonthToggle(event: any, month: string) {
    if (event.target.checked) {
      if (!this.selectedMonths.includes(month)) {
        this.selectedMonths.push(month);
      }
    } else {
      this.selectedMonths = this.selectedMonths.filter(m => m !== month);
    }
  }

  removeSelectedMonth(event: Event, month: string) {
    event.stopPropagation();
    this.selectedMonths = this.selectedMonths.filter(m => m !== month);
  }

  toggleSelectAllMonths(event: any) {
    if (event.target.checked) {
      this.selectedMonths = [...this.monthA];  // ✅ FIX: use monthA
    } else {
      this.selectedMonths = [];
    }
  }

  isAllMonthsSelected(): boolean {
    return this.monthA.length > 0 && this.selectedMonths.length === this.monthA.length; // ✅ FIX
  }




}


import { Component, HostListener, OnInit } from '@angular/core';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-patrol-tracking',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patrol-tracking.component.html',
  styleUrl: './patrol-tracking.component.css'
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
    this.assignedTo = '';
    this.selectedChecklistIds = [];  // <-- clear selected tasks

  }
  closeTask() {
    this.showPopupAssign = false;
  }


  assignTask(): void {
    const requestBody = {
      checklistIds: this.selectedChecklistIds,
      assignedTo: this.assignedTo,
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






  toggleChecklist(workflowId: string): void {
    this.expandedRows[workflowId] = !this.expandedRows[workflowId];

    if (this.expandedRows[workflowId] && !this.checklistData[workflowId]) {
      this.workflowService.getChecklistByWorkflowId(workflowId).subscribe(res => {
        if (res.success) {
          // ✅ Add a flag for red marker icon
          this.checklistData[workflowId] = res.checklists.map((checklist: any) => ({
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

  createWorkflow() {
    if (!this.workflowTitle.trim() || !this.description.trim()) {
      this.alertService.showAlert('Please enter title and description', 'error');
      return;
    }

    const startDateTime = this.assignedStart ? new Date(this.assignedStart).toISOString() : null;
    const endDateTime = this.assignedEnd ? new Date(this.assignedEnd).toISOString() : null;



    const payload = {
      workflowTitle: this.workflowTitle,
      description: this.description,
      createdBy: this.createdBy,
      assignedStart: startDateTime,
      assignedEnd: endDateTime,
      isActive: this.isActive,


    };

    this.workflowService.createWorkflow(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.closePopup();
          this.alertService.showAlert(res.message);
          this.getWorkflowSummary();
        } else {
          alert('Failed to create workflow');
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

}


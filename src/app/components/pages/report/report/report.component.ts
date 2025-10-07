import { Component, OnInit } from '@angular/core';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report/report.service';


@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {

  ngOnInit(): void {
    this. loadPatrolUsers() ;
  }

  constructor(private workflowService: WorkflowService, private alertService: AlertService, private reportService: ReportService) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }

  currentDate: string = '';
  assignedTo: string = '';
  type: string = '';
  startDate: string = '';
  endDate: string = '';
  patrolUsers: any[] = [];
  // reportData: any;

  mediaUrl: string = '';
  mediaType: string = '';
  showMediaPopup: boolean = false;

  openMediaPopup(url: string, type: string) {
    console.log('Media Type:', type); // check what mediaType you're getting
    console.log('Media URL:', url); // ✅ Log full URL
    this.mediaUrl = url;
    this.mediaType = type.toLowerCase();
    this.showMediaPopup = true;
  }

  closeMediaPopup() {
    this.showMediaPopup = false;
    this.mediaUrl = '';
    this.mediaType = '';
  }


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

  showTable: boolean = false;

  showTableMedia: boolean = false;


  clearReport() {

    this.showTable = false; // 👉 Hide table
    this.showTableMedia = false;
  }






  applyReport(event: Event) {
  event.preventDefault();

  if (!this.assignedTo) {
    this.alertService.showAlert('Please select a Patrol User.');
    return;
  }

  this.showTable = false;
  this.showTableMedia = false;

  const page = this.currentPage;
  const limit = this.itemsPerPage;

  const observable = this.startDate && this.endDate
    ? this.reportService.getFilteredReportByPatrolId(this.assignedTo, this.startDate, this.endDate, this.type, page, limit)
    : this.reportService.getReportByPatrolId(this.assignedTo, this.type, this.startDate, this.endDate, page, limit);

observable.subscribe({
  next: (res) => {
    console.log("API response:", res);

    if (this.type === 'media') {
      this.totalItems = res.pagination?.totalMedia ?? 0;
      if (res?.media?.length > 0) {
        this.reportData = res;
        this.alertService.showAlert('Media Report generated successfully!');
        this.showTableMedia = true;
        this.showTable = false;
      } else {
        this.alertService.showAlert('No media report data found.');
        this.showTableMedia = false;
      }
    } else {
      // regular report
      this.totalItems = res.pagination?.total ?? 0;
      if (res?.completedWorkflows?.length > 0) {
        this.reportData = res;
        this.alertService.showAlert('Report generated successfully!');
        this.showTable = true;
        this.showTableMedia = false;
      } else {
        this.alertService.showAlert('No regular report data found.');
        this.showTable = false;
      }
    }
  },
  error: (err) => {
    console.error('Error fetching report:', err);
    const message = err.error?.message || 'Error fetching report.';
    this.alertService.showAlert(message, "error");
  }
});
  }


  reportData: any = { completedWorkflows: [] };

  toggleWorkflow(workflow: any) {
    workflow.expanded = !workflow.expanded;
  }

  toggleChecklist(checklist: any, event: Event) {
    event.stopPropagation();
    checklist.expanded = !checklist.expanded;
  }

  toggleMedia(media: any, event: Event) {
    event.stopPropagation();
    media.expanded = !media.expanded;
  }


  expandedWorkflows: { [key: string]: boolean } = {};
  expandedChecklists: { [key: string]: boolean } = {};
  expandedMedia: { [key: string]: boolean } = {};



  downloadCSV(): void {
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Row 1: Workflow headers
    csvContent += 'Workflow Title,Status,Assigned Start,Assigned End,Start,End \n';

    for (const workflow of this.reportData.completedWorkflows) {
      const wf = workflow.workflow;

      // Row 2: Workflow data
      csvContent += `${wf.workflowTitle},${wf.status},${wf.assignedStart},${wf.assignedEnd},${wf.startDateTime},${wf.endDateTime}\n`;

      // Row 3: Blank row
      csvContent += '\n';

      // Row 4: Checklist + Media + Signature headers starting at column C
      csvContent += ',,Checklist Title,Remarks,Checklist Status,Start,End,Media Description,Media Type,Created By,Created Date,Media URL,Signature ID,Signature URL,Created Time,Created By\n';

      // Row 5+: Data rows
      for (const checklist of workflow.checklists) {
        const mediaList = checklist.media?.length ? checklist.media : [null];
        const sigList = checklist.signatures?.length ? checklist.signatures : [null];

        const maxLength = Math.max(mediaList.length, sigList.length);

        for (let i = 0; i < maxLength; i++) {
          const media = mediaList[i] || {};
          const sig = sigList[i] || {};

          const chkTitle = i === 0 ? checklist.title : '';
          const chkRemarks = i === 0 ? checklist.remarks : '';
          const chkStatus = i === 0 ? checklist.status : '';
          const chkscanStartDate = i === 0 ? checklist.scanStartDate : '';
          const chkscanEndDate = i === 0 ? checklist.scanEndDate : '';

          // Columns A and B left blank, data starts from column C
          csvContent += `,,${chkTitle},${chkRemarks},${chkStatus},${chkscanStartDate},${chkscanEndDate},${media.description || ''},${media.mediaType || ''},${media.createdBy || ''},${media.createdDate || ''},${media.mediaUrl || ''},${sig.signatureId || ''},${sig.signatureUrl || ''},${sig.createdDate || ''},${sig.patrolId || ''}\n`;
        }
      }
    }

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Patrol-Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  downloadMediaCSV(): void {
    const mediaData = this.reportData?.media;

    if (!mediaData || mediaData.length === 0) {
      alert('No media data available to download.');
      return;
    }

    const csvRows = [];

    // Header
    const headers = ['#', 'Type', 'Description', 'Created By', 'Media URL', 'Created Date'];
    csvRows.push(headers.join(','));

    // Data rows
    mediaData.forEach((item: any, index: number) => {
      const row = [
        index + 1,
        item.mediaType || '',
        item.description || '',
        item.createdBy || '',
        item.mediaUrl || '',
        item.createdDate ? new Date(item.createdDate).toLocaleString('en-GB') : ''
      ];
      csvRows.push(row.map(val => `"${val}"`).join(','));
    });

    // Generate Blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Patrol_Incident-report.csv';
    anchor.click();

    window.URL.revokeObjectURL(url);
  }


  reloadPage() {
    window.location.reload();
  }



currentPage: number = 1;
itemsPerPage: number = 10;
totalItems: number = 0;
pageSizeOptions: number[] = [5, 10, 20, 50, 100];

get startItem(): number {
  return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
}

get endItem(): number {
  const possibleEnd = this.currentPage * this.itemsPerPage;
  return possibleEnd > this.totalItems ? this.totalItems : possibleEnd;
}

get totalPages(): number {
  return Math.ceil(this.totalItems / this.itemsPerPage);
}

onItemsPerPageChange() {
  this.currentPage = 1;
  this.applyReport(new Event('submit'));
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.applyReport(new Event('submit'));
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.applyReport(new Event('submit'));
  }
}


isValidDate(value: any): boolean {
  return value && !isNaN(Date.parse(value));
}



}













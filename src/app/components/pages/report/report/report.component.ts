import { Component, OnInit } from '@angular/core';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report/report.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';



@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {

  ngOnInit(): void {
    this.loadPatrolUsers();
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




//   downloadCSV(): void {
//   let csvContent = 'data:text/csv;charset=utf-8,';

//   // Row 1: Workflow headers
//   csvContent += 'Assignment Title,Status,Assigned Start,Assigned End,Start,End\n';

//   const safe = (val: any) => `"${(val ?? '').toString().replace(/"/g, '""')}"`;

//   for (const workflow of this.reportData.completedWorkflows) {
//     const wf = workflow.workflow;

//     // Row 2: Workflow data
//     csvContent += `${safe(wf.workflowTitle)},${safe(wf.status)},${safe(wf.assignedStart)},${safe(wf.assignedEnd)},${safe(wf.startDateTime)},${safe(wf.endDateTime)}\n`;

//     // Blank row
//     csvContent += '\n';

//     // Checklist + Media + Signature headers
//     csvContent += ',,Task Title,Remarks,Task Status,Start,End,ScheduledDate,ExpiryDate,Location,ScannedBy,Media Description,Media Type,Created By,Created Date,Media URL,Signature ID,Signature URL,Created Time,Created By\n';

//     // Data rows
//     for (const checklist of workflow.checklists) {
//       const mediaList = checklist.media?.length ? checklist.media : [null];
//       const sigList = checklist.signatures?.length ? checklist.signatures : [null];
//       const maxLength = Math.max(mediaList.length, sigList.length);

//       for (let i = 0; i < maxLength; i++) {
//         const media = mediaList[i] || {};
//         const sig = sigList[i] || {};

//         const chkTitle = i === 0 ? checklist.title : '';
//         const chkRemarks = i === 0 ? checklist.remarks : '';
//         const chkStatus = i === 0 ? checklist.status : '';
//         const chkscanStartDate = i === 0 ? checklist.scanStartDate : '';
//         const chkscanEndDate = i === 0 ? checklist.scanEndDate : '';
//         const chkscheduledDate = i === 0 ? checklist.scheduledDate : '';
//         const chkexpiryDate = i === 0 ? checklist.expiryDate : '';
//         const chklocationName = i === 0 ? checklist.locationName : '';
//         const chkscannedBy = i === 0 ? checklist.scannedBy : '';

//         csvContent += `,,${safe(chkTitle)},${safe(chkRemarks)},${safe(chkStatus)},${safe(chkscanStartDate)},${safe(chkscanEndDate)},${safe(chkscheduledDate)},${safe(chkexpiryDate)},${safe(chklocationName)},${safe(chkscannedBy)},${safe(media.description)},${safe(media.mediaType)},${safe(media.createdBy)},${safe(media.createdDate)},${safe(media.mediaUrl)},${safe(sig.signatureId)},${safe(sig.signatureUrl)},${safe(sig.createdDate)},${safe(sig.userId)}\n`;
//       }
//     }
//   }

//   // Trigger download
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement('a');
//   link.setAttribute('href', encodedUri);
//   link.setAttribute('download', 'Patrol-Report.csv');
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

downloadXLSX(): void {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Patrol Report');

  // === Row 1: Workflow headers ===
  const headerRow1 = ['Assignment Title', 'Status', 'Assigned Start', 'Assigned End', 'Start', 'End'];
  const row1 = worksheet.addRow(headerRow1);
  row1.font = { bold: true, color: { argb: '000000' } };
  row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } };
  row1.alignment = { vertical: 'middle', horizontal: 'center' };

  // === Add workflow + checklist data ===
  this.reportData.completedWorkflows.forEach((workflow: any) => {
    const wf = workflow.workflow;

    // Workflow data
    worksheet.addRow([
      wf.workflowTitle,
      wf.status,
      wf.assignedStart || '',
      wf.assignedEnd || '',
      wf.startDateTime || '',
      wf.endDateTime || '',
    ]);

    worksheet.addRow([]); // Blank row for spacing

    // === Checklist headers ===
    const headerRow2 = [
      '', '', 'Task Title', 'Remarks', 'Task Status', 'Start', 'End',
      'Scheduled Date', 'Expiry Date', 'Location', 'Scanned By',
      'Media Description', 'Media Type', 'Created By', 'Created Date',
      'Media URL', 'Signature ID', 'Signature URL', 'Created Time', 'Created By'
    ];
    const row2 = worksheet.addRow(headerRow2);
    row2.font = { bold: true, color: { argb: '000000' } };
    row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } };
    row2.alignment = { vertical: 'middle', horizontal: 'center' };

    // === Checklist data ===
    for (const checklist of workflow.checklists || []) {
      const mediaList = checklist.media?.length ? checklist.media : [null];
      const sigList = checklist.signatures?.length ? checklist.signatures : [null];
      const maxLength = Math.max(mediaList.length, sigList.length);

      for (let i = 0; i < maxLength; i++) {
        const media = mediaList[i] || {};
        const sig = sigList[i] || {};

        // ✅ Convert array fields to plain text (remove square brackets)
        const cleanValue = (val: any) => {
          if (Array.isArray(val)) return val.join(', '); // flatten arrays
          return val || ''; // return value or empty string
        };

        worksheet.addRow([
          '', '',
          i === 0 ? checklist.title : '',
          i === 0 ? checklist.remarks : '',
          i === 0 ? checklist.status : '',
          i === 0 ? checklist.scanStartDate : '',
          i === 0 ? checklist.scanEndDate : '',
          i === 0 ? cleanValue(checklist.scheduledDate) : '',
          i === 0 ? cleanValue(checklist.expiryDate) : '',
          i === 0 ? cleanValue(checklist.locationName) : '',
          i === 0 ? cleanValue(checklist.scannedBy) : '',
          media.description || '',
          media.mediaType || '',
          media.createdBy || '',
          media.createdDate || '',
          media.mediaUrl || '',
          sig.signatureId || '',
          sig.signatureUrl || '',
          sig.createdDate || '',
          sig.userId || ''
        ]);
      }
    }

    worksheet.addRow([]); // spacing between workflows
  });

  // === Borders + alignment ===
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  // === Auto-adjust column widths ===
  worksheet.columns.forEach((column: any) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const length = cell.value ? cell.value.toString().length : 0;
      if (length > maxLength) maxLength = length;
    });
    column.width = maxLength + 5;
  });

  // === Save Excel file ===
  workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, 'Patrol-Report.xlsx');
  });
}




  // downloadMediaCSV(): void {
  //   const mediaData = this.reportData?.media;

  //   if (!mediaData || mediaData.length === 0) {
  //     alert('No media data available to download.');
  //     return;
  //   }

  //   const csvRows = [];

  //   // Header
  //   const headers = ['#', 'Type', 'Description', 'Created By', 'Media URL', 'Created Date'];
  //   csvRows.push(headers.join(','));

  //   // Data rows
  //   mediaData.forEach((item: any, index: number) => {
  //     const row = [
  //       index + 1,
  //       item.mediaType || '',
  //       item.description || '',
  //       item.createdBy || '',
  //       item.mediaUrl || '',
  //       item.createdDate ? new Date(item.createdDate).toLocaleString('en-GB') : ''
  //     ];
  //     csvRows.push(row.map(val => `"${val}"`).join(','));
  //   });

  //   // Generate Blob and download
  //   const csvContent = csvRows.join('\n');
  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   const url = window.URL.createObjectURL(blob);

  //   const anchor = document.createElement('a');
  //   anchor.href = url;
  //   anchor.download = 'Patrol_Incident-report.csv';
  //   anchor.click();

  //   window.URL.revokeObjectURL(url);
  // }
downloadMediaXLSX(): void {
  const mediaData = this.reportData?.media;

  if (!mediaData || mediaData.length === 0) {
    alert('No media data available to download.');
    return;
  }

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Media Report');

  // Define headers
  const headers = ['#', 'Type', 'Description', 'Created By', 'Media URL', 'Created Date'];

  // Add header row
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true }; // ✅ Make headers bold

  // Optional: Adjust column widths for better visibility
  const columnWidths = [6, 15, 30, 20, 40, 25];
  columnWidths.forEach((width, i) => (worksheet.getColumn(i + 1).width = width));

  // Add data rows
  mediaData.forEach((item: any, index: number) => {
    worksheet.addRow([
      index + 1,
      item.mediaType || '',
      item.description || '',
      item.createdBy || '',
      item.mediaUrl || '',
      item.createdDate ? new Date(item.createdDate).toLocaleString('en-GB') : ''
    ]);
  });

  // Optional: Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Save Excel file
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, 'Patrol_Incident-Report.xlsx');
  });
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













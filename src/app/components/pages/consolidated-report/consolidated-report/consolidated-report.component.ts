import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { ReportService } from '../../../services/report/report.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-consolidated-report',
  imports: [FormsModule, CommonModule],
  templateUrl: './consolidated-report.component.html',
  styleUrl: './consolidated-report.component.css'
})
export class ConsolidatedReportComponent {

  constructor(private alertService: AlertService, private reportService: ReportService) {

    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
  }
  loading: boolean = false;
  startDate: string = '';
  endDate: string = '';
  type: string = '';

  currentDate: string = "";



  onClear() {

    this.showTable = false; // 👉 Hide table
    this.showTableMedia = false;
  }


  showTable: boolean = false;
  reportData: any = { completedWorkflows: [] };
  patrolIds: string[] = [];

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



  mediaUrl: string = '';
  mediaType: string = '';
  showMediaPopup: boolean = false;
  showTableMedia: boolean = false;



  openMediaPopup(url: string, type: string) {
    this.mediaUrl = url;
    this.mediaType = type.toLowerCase();
    this.showMediaPopup = true;
  }

  closeMediaPopup() {
    this.showMediaPopup = false;
    this.mediaUrl = '';
    this.mediaType = '';
  }

  // downloadMediaCSV(): void {
  //   const mediaData = this.mediaList;

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
  //   anchor.download = 'Consolidated_Incident-report.csv';
  //   anchor.click();

  //   window.URL.revokeObjectURL(url);
  // }


  downloadMediaXLSX(): void {
    const mediaData = this.mediaList;

    if (!mediaData || mediaData.length === 0) {
      alert('No media data available to download.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Media Report');

    // Header row
    const headers = ['#', 'Type', 'Description', 'Created By', 'Media URL', 'Created Date'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true }; // ✅ Bold header

    // Set column widths
    const widths = [6, 15, 40, 20, 45, 25];
    widths.forEach((w, i) => (worksheet.getColumn(i + 1).width = w));

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

    // Add borders
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

    // Download Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'Consolidated_Incident-Report.xlsx');
    });
  }


  // downloadCSV(): void {
  //   let csvContent = 'data:text/csv;charset=utf-8,';

  //   // Row 1: Workflow headers
  //   csvContent += 'Assignment Title,Status,Assigned Start,Assigned End,Start,End\n';

  //   for (const patrol of this.reportData.report) {
  //     for (const workflowItem of patrol.workflows) {
  //       const wf = workflowItem.workflow;

  //       // Row 2: Workflow data
  //       csvContent += `${wf.workflowTitle},${wf.status},${wf.assignedStart || ''},${wf.assignedEnd || ''},${wf.startDateTime || ''},${wf.endDateTime || ''}\n`;

  //       // Row 3: Blank row
  //       csvContent += '\n';

  //       // Row 4: Checklist + Media + Signature headers (starts at column C)
  //       csvContent += ',,Task Title,Remarks,Task Status,Task Start,Task End,ScheduledDate,ExpiryDate,Location,ScannedBy,' +
  //         'Media Description,Media Type,Media Created By,Media Created Date,Media URL,' +
  //         'Signature ID,Signature URL,Signature Created Time,Signature Created By\n';

  //       // Row 5+: Data rows
  //       for (const checklist of workflowItem.checklists || []) {
  //         const mediaList = checklist.media?.length ? checklist.media : [null];
  //         const sigList = checklist.signatures?.length ? checklist.signatures : [null];
  //         const maxLength = Math.max(mediaList.length, sigList.length);

  //         for (let i = 0; i < maxLength; i++) {
  //           const media = mediaList[i] || {};
  //           const sig = sigList[i] || {};

  //           const chkTitle = i === 0 ? checklist.title : '';
  //           const chkRemarks = i === 0 ? checklist.remarks : '';
  //           const chkStatus = i === 0 ? checklist.status : '';
  //           const chkStart = i === 0 ? checklist.scanStartDate : '';
  //           const chkEnd = i === 0 ? checklist.scanEndDate : '';
  //           const chkScheduledDate = i === 0 ? checklist.scheduledDate : '';
  //           const chkExpiryDate = i === 0 ? checklist.expiryDate : '';
  //           const chkLocation = i === 0 ? checklist.locationName : '';
  //           const chkScannedBy = i === 0 ? checklist.scannedBy : '';

  //           const mediaDesc = media?.description || '';
  //           const mediaType = media?.mediaType || '';
  //           const mediaBy = media?.createdBy || '';
  //           const mediaDate = media?.createdDate || '';
  //           const mediaUrl = media?.mediaUrl || '';

  //           const sigId = sig?.signatureId || '';
  //           const sigUrl = sig?.signatureUrl || '';
  //           const sigCreated = sig?.createdDate || '';
  //           const sigBy = sig?.userId || '';

  //           // Columns A and B are blank, data starts from column C
  //           csvContent += `,,${chkTitle},${chkRemarks},${chkStatus},${chkStart},${chkEnd},${chkScheduledDate},${chkExpiryDate},${chkLocation},${chkScannedBy},` +
  //             `${mediaDesc},${mediaType},${mediaBy},${mediaDate},${mediaUrl},` +
  //             `${sigId},${sigUrl},${sigCreated},${sigBy}\n`;
  //         }
  //       }
  //     }
  //   }

  //   // Trigger download
  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', encodedUri);
  //   link.setAttribute('download', 'Consolidated_report.csv');
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }


  downloadXLSX(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consolidated Report');

    // === Row 1: Workflow headers ===
    const workflowHeaders = ['Assignment Title', 'Status', 'Assigned Start', 'Assigned End', 'Start', 'End'];
    const row1 = worksheet.addRow(workflowHeaders);
    row1.font = { bold: true, color: { argb: '000000' } };
    row1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'D9D9D9' }
    };
    row1.alignment = { vertical: 'middle', horizontal: 'center' };

    // Helper function to clean array-like values
    const cleanValue = (val: any): string => {
      if (Array.isArray(val)) return val.join(', ');
      return val ?? ''; // Return empty string if null or undefined
    };

    // === Add workflow data ===
    for (const patrol of this.reportData.report) {
      for (const workflowItem of patrol.workflows) {
        const wf = workflowItem.workflow;

        // Workflow data row
        worksheet.addRow([
          wf.workflowTitle,
          wf.status,
          wf.assignedStart || '',
          wf.assignedEnd || '',
          wf.startDateTime || '',
          wf.endDateTime || ''
        ]);

        worksheet.addRow([]); // blank row

        // === Checklist + Media + Signature headers ===
        const checklistHeaders = [
          '', '', 'Task Title', 'Remarks', 'Task Status', 'Task Start', 'Task End',
          'Scheduled Date', 'Expiry Date', 'Location', 'Scanned By',
          'Media Description', 'Media Type', 'Media Created By', 'Media Created Date',
          'Media URL', 'Signature ID', 'Signature URL', 'Signature Created Time', 'Signature Created By'
        ];
        const headerRow = worksheet.addRow(checklistHeaders);
        headerRow.font = { bold: true, color: { argb: '000000' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9D9D9' }
        };

        // === Checklist Data ===
        for (const checklist of workflowItem.checklists || []) {
          const mediaList = checklist.media?.length ? checklist.media : [null];
          const sigList = checklist.signatures?.length ? checklist.signatures : [null];
          const maxLength = Math.max(mediaList.length, sigList.length);

          for (let i = 0; i < maxLength; i++) {
            const media = mediaList[i] || {};
            const sig = sigList[i] || {};

            worksheet.addRow([
              '', '',
              i === 0 ? checklist.title : '',
              i === 0 ? checklist.remarks : '',
              i === 0 ? checklist.status : '',
              i === 0 ? checklist.scanStartDate : '',
              i === 0 ? checklist.scanEndDate : '',
              // ✅ Cleaned array-like fields here
              i === 0 ? cleanValue(checklist.scheduledDate) : '',
              i === 0 ? cleanValue(checklist.expiryDate) : '',
              i === 0 ? cleanValue(checklist.locationName) : '',
              i === 0 ? cleanValue(checklist.scannedBy) : '',
              // === Media & Signature data ===
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

        worksheet.addRow([]); // space between workflows
      }
    }

    // === Add borders & text alignment ===
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // === Auto-fit column widths ===
    worksheet.columns.forEach((column: any) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      column.width = maxLength + 5;
    });

    // === Save Excel ===
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, 'Consolidated_Report.xlsx');
    });
  }



  mediaList: any[] = [];

  fullMediaList: any[] = [];


  // applyReport(event: Event) {
  //   event.preventDefault();

  //   this.showTable = false;
  //   this.showTableMedia = false;

  //   const page = this.currentPage;
  //   const limit = this.itemsPerPage;

  //   if (!this.startDate || !this.endDate || !this.type) {
  //     this.alertService.showAlert('Please fill all required fields.', 'error');
  //     return;
  //   }

  //   this.reportService.getConsolidatedReport(this.type, this.startDate, this.endDate, page, limit).subscribe({
  //     next: (res: any) => {
  //       if (this.type === 'media') {
  //         const patrolMedia = res.mediaByUser || {};
  //         const allMedia = Object.values(patrolMedia).flat();

  //         if (allMedia.length > 0) {
  //           this.fullMediaList = allMedia;
  //           this.totalItems = allMedia.length;
  //           this.updatePagination();
  //           this.alertService.showAlert('Consolidated Report generated successfully!')
  //           this.showTableMedia = true;
  //         } else {
  //           this.alertService.showAlert('No media report data found.', 'error');
  //         }
  //       } else {
  //         if (res.report && res.report.length > 0) {
  //           this.reportData = res;
  //           this.fullReportList = res.report;
  //           this.totalItems = this.fullReportList.length;
  //           this.currentPage = 1;              // reset page
  //           this.updatePagination();
  //           this.alertService.showAlert('Consolidated Report generated successfully!')
  //           this.showTable = true;
  //         } else {
  //           this.alertService.showAlert('No report data found.', 'error');
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       const errorMsg = err?.error?.message ;
  //       this.alertService.showAlert(errorMsg, 'error');
  //     }
  //   });
  // }


  applyReport(event: Event) {
    event.preventDefault();

    this.showTable = false;
    this.showTableMedia = false;
    this.loading = true; // <-- show loader


    if (!this.startDate || !this.endDate || !this.type) {
      this.alertService.showAlert('Please fill all required fields.', 'error');
      return;
    }

    this.reportService.getConsolidatedReport(this.type, this.startDate, this.endDate, this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {

        if (this.type === 'media') {
          const patrolMedia = res.mediaByUser || {};
          const allMedia = Object.values(patrolMedia).flat();

          if (allMedia.length > 0) {
            this.fullMediaList = allMedia;
            this.totalItems = res.pagination.totalMedia; // use API total
            this.updatePagination();
            this.alertService.showAlert('Consolidated Media Report generated successfully!');
            this.showTableMedia = true;
          } else {
            this.alertService.showAlert('No media report data found.', 'error');
          }

        } else { // regular
          if (res.report && res.report.length > 0) {
            this.reportData = res;
            this.paginatedReportList = res.report; // use API page directly
            this.totalItems = res.pagination.totalWorkflows; // total workflows from API
            this.alertService.showAlert('Consolidated Regular Report generated successfully!');
            this.showTable = true;
          } else {
            this.alertService.showAlert('No report data found.', 'error');
          }
        }
        this.loading = false;

      },
      error: (err) => {
        const errorMsg = err?.error?.message;
        this.alertService.showAlert(errorMsg, 'error');
        this.loading = false;
      }
    });
  }




  fullReportList: any[] = [];
  paginatedReportList: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100]; // customize as needed



  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    const possibleEnd = this.currentPage * this.itemsPerPage;
    return possibleEnd > this.totalItems ? this.totalItems : possibleEnd;
  }


  onItemsPerPageChange() {
    this.currentPage = 1;
    this.updatePagination();
    this.applyReport(new Event('submit'));
  }


  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();

    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updatePagination();

    }
  }


  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;

    if (this.type === 'media') {
      this.mediaList = this.fullMediaList.slice(startIndex, endIndex);
    } else {
      this.paginatedReportList = this.fullReportList.slice(startIndex, endIndex);
    }
  }








}




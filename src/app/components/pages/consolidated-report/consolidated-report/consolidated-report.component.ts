import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert/alert.service';
import { ReportService } from '../../../services/report/report.service';

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

  downloadMediaCSV(): void {
    const mediaData = this.mediaList;

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
    anchor.download = 'media-report.csv';
    anchor.click();

    window.URL.revokeObjectURL(url);
  }
  downloadCSV(): void {
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Row 1: Workflow headers
    csvContent += 'Workflow Title,Status,Assigned Start,Assigned End,Start,End\n';

    for (const patrol of this.reportData.report) {
      for (const workflowItem of patrol.workflows) {
        const wf = workflowItem.workflow;

        // Row 2: Workflow data
        csvContent += `${wf.workflowTitle},${wf.status},${wf.assignedStart || ''},${wf.assignedEnd || ''},${wf.startDateTime || ''},${wf.endDateTime || ''}\n`;

        // Row 3: Blank row
        csvContent += '\n';

        // Row 4: Checklist + Media + Signature headers (starts at column C)
        csvContent += ',,Checklist Title,Remarks,Checklist Status,Checklist Start,Checklist End,' +
          'Media Description,Media Type,Media Created By,Media Created Date,Media URL,' +
          'Signature ID,Signature URL,Signature Created Time,Signature Created By\n';

        // Row 5+: Data rows
        for (const checklist of workflowItem.checklists || []) {
          const mediaList = checklist.media?.length ? checklist.media : [null];
          const sigList = checklist.signatures?.length ? checklist.signatures : [null];
          const maxLength = Math.max(mediaList.length, sigList.length);

          for (let i = 0; i < maxLength; i++) {
            const media = mediaList[i] || {};
            const sig = sigList[i] || {};

            const chkTitle = i === 0 ? checklist.title : '';
            const chkRemarks = i === 0 ? checklist.remarks : '';
            const chkStatus = i === 0 ? checklist.status : '';
            const chkStart = i === 0 ? checklist.scanStartDate : '';
            const chkEnd = i === 0 ? checklist.scanEndDate : '';

            const mediaDesc = media?.description || '';
            const mediaType = media?.mediaType || '';
            const mediaBy = media?.createdBy || '';
            const mediaDate = media?.createdDate || '';
            const mediaUrl = media?.mediaUrl || '';

            const sigId = sig?.signatureId || '';
            const sigUrl = sig?.signatureUrl || '';
            const sigCreated = sig?.createdDate || '';
            const sigBy = sig?.patrolId || '';

            // Columns A and B are blank, data starts from column C
            csvContent += `,,${chkTitle},${chkRemarks},${chkStatus},${chkStart},${chkEnd},` +
              `${mediaDesc},${mediaType},${mediaBy},${mediaDate},${mediaUrl},` +
              `${sigId},${sigUrl},${sigCreated},${sigBy}\n`;
          }
        }
      }
    }

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'workflow_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  mediaList: any[] = [];


  applyReport(event: Event) {
    event.preventDefault();

    this.showTable = false;
    this.showTableMedia = false;

    if (!this.startDate || !this.endDate || !this.type) {
      this.alertService.showAlert('Please fill all required fields.', 'error');
      return;
    }

    this.reportService.getConsolidatedReport(this.type, this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        if (this.type === 'media') {
          const patrolMedia = res.mediaByUser || {};
          const allMedia = Object.values(patrolMedia).flat();

          if (allMedia.length > 0) {
            this.mediaList = allMedia;
            this.alertService.showAlert('Consolidated Report generated successfully!')
            this.showTableMedia = true;
          } else {
            this.alertService.showAlert('No media report data found.', 'error');
          }
        } else {
          if (res.report && res.report.length > 0) {
            this.reportData = res;
            this.alertService.showAlert('Consolidated Report generated successfully!')
            this.showTable = true;
          } else {
            this.alertService.showAlert('No report data found.', 'error');
          }
        }
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.alertService.showAlert('Error loading report.', 'error');
      }
    });
  }


}

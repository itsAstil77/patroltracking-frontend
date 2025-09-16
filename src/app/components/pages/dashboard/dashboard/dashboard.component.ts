import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,CalendarModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

//  selectedDates: Date[] = [];
//   showCalendar = false;

//   @ViewChild('calendarWrapper') calendarWrapper!: ElementRef;

//   get selectedDatesText(): string {
//     return this.selectedDates.map(d => d.toDateString()).join(', ');
//   }

//   toggleDate(date: Date) {
//     const index = this.selectedDates.findIndex(d => d.toDateString() === date.toDateString());
//     if (index > -1) this.selectedDates.splice(index, 1);
//     else this.selectedDates.push(date);
//   }

//   openCalendar(event: Event) {
//     event.stopPropagation();
//     this.showCalendar = true;
//   }

//   @HostListener('document:click', ['$event'])
//   clickOutside(event: MouseEvent) {
//     if (this.calendarWrapper && !this.calendarWrapper.nativeElement.contains(event.target)) {
//       this.showCalendar = false;
//     }
//   }

//   isSelected(date: Date): boolean {
//     return this.selectedDates.some(d => d.toDateString() === date.toDateString());
//   }
}
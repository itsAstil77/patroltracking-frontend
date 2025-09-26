import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskFilter'
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: any[], searchTerm: string): any[] {
    if (!tasks) return [];
    if (!searchTerm) return tasks;
    searchTerm = searchTerm.toLowerCase();
    return tasks.filter(t =>
      (t.checklistId + ' ' + t.title).toLowerCase().includes(searchTerm)
    );
  }
}

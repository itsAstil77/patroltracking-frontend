import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userFilter'
})
export class UserFilterPipe implements PipeTransform {
  transform(users: any[], searchTerm: string): any[] {
    if (!users) return [];
    if (!searchTerm) return users;
    searchTerm = searchTerm.toLowerCase();
    return users.filter(u =>
      (u.userId + ' ' + u.patrolGuardName).toLowerCase().includes(searchTerm)
    );
  }
}



import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'locationFilter'
})
export class LocationFilterPipe implements PipeTransform {
  transform(locations: any[], searchTerm: string): any[] {
    if (!locations) return [];
    if (!searchTerm) return locations;
    searchTerm = searchTerm.toLowerCase();
    return locations.filter(loc =>
      (loc.locationId + ' ' + loc.description).toLowerCase().includes(searchTerm)
    );
  }
}

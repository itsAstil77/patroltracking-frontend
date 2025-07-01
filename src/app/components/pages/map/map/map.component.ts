
// import {
//   Component,
//   Inject,
//   PLATFORM_ID,
//   OnInit,
//   AfterViewInit
// } from '@angular/core';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-map',
//   imports: [RouterLink,CommonModule],
//   templateUrl: './map.component.html',
//   styleUrls: ['./map.component.css']
// })
// export class MapComponent implements OnInit, AfterViewInit {
//   isBrowser: boolean = false;
//   userLocationAvailable: boolean = false;
//   userLocation: { lat: number; lng: number; username: string } | null = null;

//   constructor(@Inject(PLATFORM_ID) private platformId: Object,private http: HttpClient) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//   }


//   ngOnInit(): void {
//     if (this.isBrowser) {
//       const stored = localStorage.getItem('userLocation');
//       if (stored) {
//         this.userLocation = JSON.parse(stored);
//         this.userLocationAvailable = true;
//       }
//     }
//   }

//   async ngAfterViewInit(): Promise<void> {
//     if (this.isBrowser && this.userLocationAvailable && this.userLocation) {
//       const L = await import('leaflet');

//       const map = L.map('map').setView(
//         [this.userLocation.lat, this.userLocation.lng],
//         13
//       );

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//       }).addTo(map);

//       L.marker([this.userLocation.lat, this.userLocation.lng])
//         .addTo(map)
//         .bindPopup(`📍 ${this.userLocation.username}'s Location`)
//         .openPopup();
//     }
//   }




// }




import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../../services/alert/alert.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  isBrowser: boolean = false;
  userLocationAvailable: boolean = false;
  userLocation: { lat: number; lng: number; username: string } | null = null;
  locationName: string = 'Loading...';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,private route: ActivatedRoute,private router: Router, private alertService: AlertService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
checklistId: string = '';
  ngOnInit(): void {
    if (this.isBrowser) {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        this.userLocation = JSON.parse(stored);
        this.userLocationAvailable = true;
      }
    }



     if (this.isBrowser) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log("🧭 checklistId from route:", id);
      if (id) {
        this.checklistId = id;
      }
    });

    const stored = localStorage.getItem('userLocation');
    if (stored) {
      this.userLocation = JSON.parse(stored);
      this.userLocationAvailable = true;
    }
  }


  }

  async ngAfterViewInit(): Promise<void> {
    if (this.isBrowser && this.userLocationAvailable && this.userLocation) {
      const L = await import('leaflet');
      const { lat, lng, username } = this.userLocation;

      const map = L.map('map').setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      let marker = L.marker([lat, lng]).addTo(map);
      this.reverseGeocode(lat, lng, marker);

      map.on('click', (e: any) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;

        marker.setLatLng([newLat, newLng]);
        this.reverseGeocode(newLat, newLng, marker);

        localStorage.setItem(
          'userLocation',
          JSON.stringify({
            lat: newLat,
            lng: newLng,
            username: this.userLocation?.username || 'admin'
          })
        );
      });
    }
  }

  reverseGeocode(lat: number, lng: number, marker: any) {
    this.http
      .get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: lat.toString(),
          lon: lng.toString(),
          format: 'json'
        }
      })
      .subscribe(
        (res: any) => {
          const name =
            res.address.city ||
            res.address.town ||
            res.address.village ||
            res.display_name;

          this.locationName = name;
          marker.bindPopup(`📍 Selected Location:<br>${name}`).openPopup();
        },
        (err) => {
          console.error('Reverse geocoding failed:', err);
          this.locationName = 'Unknown location';
        }
      );
  }


onSaveLocation(): void {
  if (!this.userLocation) {
    alert('⚠️ No location selected!');
    return;
  }

  const apiUrl = `http://172.19.9.152.31:5000/maps/${this.checklistId}`;

const payload = {
  latitude: this.userLocation.lat,
  longitude: this.userLocation.lng
};

this.http.post(apiUrl, payload).subscribe({
  next: (res: any) => {
    this.alertService.showAlert('Location saved successfully!\n' + res.message);
      this.router.navigate(['/patrol-tracking']);
  },
  error: (err) => {
    console.error('❌ API error:', err);
    this.alertService.showAlert('❌ Failed to save location','error');
  }
});
}


}

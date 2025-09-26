import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { CalendarModule } from 'primeng/calendar';
import { UserFilterPipe } from './pipes/user-filter.pipe';
import { TaskFilterPipe } from './pipes/task-filter.pipe';
import { LocationFilterPipe } from './pipes/location-filter.pipe';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideHttpClient(),
     provideClientHydration(withEventReplay()),
    importProvidersFrom(ReactiveFormsModule,
      BrowserAnimationsModule,
      MatDatepickerModule,
      MatInputModule,
      MatFormFieldModule,
      MatNativeDateModule,
      CalendarModule,
      BrowserModule,
      UserFilterPipe,
      TaskFilterPipe,
      LocationFilterPipe
    ) // ✅ <-- This is what you need
  ]
};


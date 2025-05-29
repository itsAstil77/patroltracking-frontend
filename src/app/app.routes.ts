import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login/login.component';
import { OtpComponent } from './components/pages/otp/otp/otp.component';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard/dashboard.component';
import { PatrolTrackingComponent } from './components/pages/patrol-tracking/patrol-tracking/patrol-tracking.component';
import { ReportComponent } from './components/pages/report/report/report.component';
import { UserManagementComponent } from './components/pages/user-management/user-management/user-management.component';
import { ProcessAndAutomationComponent } from './components/pages/process-and-automation/process-and-automation/process-and-automation.component';
import { EventsComponent } from './components/pages/events/events/events.component';
import { InsightsComponent } from './components/pages/insights/insights/insights.component';
import { ConfigurationComponent } from './components/pages/configuration/configuration/configuration.component';
import { LicenseManagementComponent } from './components/pages/license-management/license-management/license-management.component';
import { SchedulesComponent } from './components/pages/schedules/schedules/schedules.component';
import { ConsolidatedReportComponent } from './components/pages/consolidated-report/consolidated-report/consolidated-report.component';
import { RoleComponent } from './components/pages/role/role/role.component';

export const routes: Routes = [

  { path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
     path: 'login', 
     component: LoginComponent
  },
  
  { 
    path: 'otp', 
    component: OtpComponent
  },

  {
    path: '',
    component: NavbarComponent,
    children: [
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'user-management', pathMatch: 'full' },
      { path: 'user-management', component:UserManagementComponent},
      { path: 'patrol-tracking', component: PatrolTrackingComponent},
      { path: 'report', component:ReportComponent},
      { path: 'user-management', component:UserManagementComponent},
      { path: 'process-and-automation', component:ProcessAndAutomationComponent},
      { path: 'events', component:EventsComponent},
      { path: 'insights', component:InsightsComponent},
      { path:'configuration',component:ConfigurationComponent},
      { path:'license-management',component:LicenseManagementComponent},
      { path:'schedules',component:SchedulesComponent},
      {path:'consolidated-report',component:ConsolidatedReportComponent},
      {path:'role',component:RoleComponent}
      

]}
];

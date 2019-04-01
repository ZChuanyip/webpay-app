import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//components
import { HomeComponent } from './home/home.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentGuestComponent } from './payment-guest/payment-guest.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

//router setting
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component : RegisterPageComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'payment', component: PaymentGuestComponent},
  { path: 'admin/:validator', component: AdminDashboardComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes) 
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
 }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//components
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';

//router setting
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginPageComponent },
];

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

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule, AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './/app-routing.module';
import { NgxLoadingModule } from 'ngx-loading';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatDialogModule, MatFormFieldModule} from '@angular/material';
import { ChartsModule } from 'ng2-charts';

//componets imports
import { AppComponent } from './app.component';
import { HomeComponent, Reset_passwordComponent } from './home/home.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { DashboardComponent,ReceiptDialogUserComponent, TopupDialogUserComponent } from './dashboard/dashboard.component';
import { PaymentGuestComponent,ReciptDialogComponent } from './payment-guest/payment-guest.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterPageComponent,
    DashboardComponent,
    PaymentGuestComponent,
    ReciptDialogComponent,
    ReceiptDialogUserComponent,
    TopupDialogUserComponent,
    AdminDashboardComponent,
    Reset_passwordComponent
  ],
  entryComponents: [
    ReciptDialogComponent, 
    ReceiptDialogUserComponent,
    TopupDialogUserComponent,
    Reset_passwordComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    NgxLoadingModule.forRoot({}),
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

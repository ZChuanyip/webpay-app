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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogModule, MatFormFieldModule} from '@angular/material';

//componets imports
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentGuestComponent,ReciptDialogComponent } from './payment-guest/payment-guest.component';
// import { ReciptDialogComponent } from './recipt-dialog/recipt-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterPageComponent,
    DashboardComponent,
    PaymentGuestComponent,
    ReciptDialogComponent
  ],
  entryComponents: [ReciptDialogComponent],
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
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

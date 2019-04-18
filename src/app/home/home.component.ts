import { Component, OnInit ,Inject} from '@angular/core';
import {FirebaseService} from '../Services/firebase.service'
import { Observable } from 'rxjs';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { database } from 'firebase';
//import { FormGroup, FormBuilder, Validators, EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  item:Observable<any>;
  itemRef;
  error_message;
  loading = false;
  no_data = true;
  hide_paid_message = true;
  exit_time;

  email='';
  password='';
  carplate = "";

  constructor(private firebase: FirebaseService, private route:Router,  public dialog: MatDialog) { }

  ngOnInit() {
    //this.firebase.login('chuancane@yahoo.com.my','qwert123');

    // this.itemRef = this.firebase.db.object('access_log');
    // this.itemRef.snapshotChanges().subscribe(action => {
    //   console.log(action.type);
    //   console.log(action.key)
    //   console.log(action.payload.val())
    // });
    this.firebase.subscribe_parking_rate();
    //loged in user will not requrie re login
    this.firebase.get_user().subscribe(res => {
      console.log(res,res.uid != "")
      if(res.uid != "" ){
        this.route.navigateByUrl("dashboard");
      } 
    })
  }

   payment_as_guest(){
    this.loading= true;
    this.carplate= this.carplate.toUpperCase();
    this.firebase.search_active_parking(this.carplate).then(
      res=>{ console.log(res)
        console.log(res["carplate"])
        if(res!= {} && res["carplate"] == this.carplate && res["payment_status"] == false){
          this.loading = false;
          this.hide_paid_message = true;
          this.no_data = true;
          this.route.navigateByUrl('/payment');
        } else if (res["payment_status"] == true) {
          this.loading = false;
          this.no_data = true;
          this.exit_time = new Date(res['exit_before']);
          console.log()
          this.hide_paid_message = false;
         } else {
          this.loading = false;
          this.hide_paid_message = true;
          this.no_data = false;
        }

      }

    );
  }

  user_login(){
    this.loading = true;
    if(this.email =='' || !this.email.includes("@")){
      this.error_message = "invalid email";
      this.loading= false;
      return;
    }else if (this.password == "" || this.password.length<6){
      this.error_message = "Invalid password"
      this.loading= false;
      return
    }
    this.firebase.login(this.email, this.password).then( res=>{
      console.log(res)
      if (res == "login success" || res == "ad login"){
          this.loading= false;
          this.email = "";
          this.password = "";
          console.log("logged in!");
          this.error_message = "";
          if(res == "login success"){
            this.route.navigateByUrl("/dashboard")
          } else if (res == "ad login"){
            this.route.navigateByUrl("/admin/")
          }
          
        } 
        else {
          this.loading= false;
          this.error_message = "Wrong email or password!";
        }
      }
    )

  }

  openDialog(): void {
    this.dialog.open(Reset_passwordComponent, {
      width: '800px',
      data: {
        user_email: this.email
      }
    });
  }

reset_password(){
  console.log(this.email);
  this.firebase.reset_password(this.email);
}
  
}


@Component({
  selector: 'app-reset_password',
  templateUrl: 'reset_password.component.html',
})
export class Reset_passwordComponent {

  constructor(
    private firebase: FirebaseService,
    public dialogRef: MatDialogRef<Reset_passwordComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {}
  
  email = this.data.email;

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  print(): void {
    console.log(this.email)
    this.firebase.reset_password(this.email);
  }
}
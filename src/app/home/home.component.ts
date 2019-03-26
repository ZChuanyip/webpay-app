import { Component, OnInit } from '@angular/core';
import {FirebaseService} from '../Services/firebase.service'
import { Observable } from 'rxjs';
import { visitRootRenderNodes } from '@angular/core/src/view/util';
import {Router} from '@angular/router';
//import { FormGroup, FormBuilder, Validators, EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  item:Observable<any>;
  itemRef;
  auth_user;
  error_message;

  private email='';
  private password='';
  private wrong_credential = false;
  constructor(private firebase: FirebaseService, private route:Router) { }

  ngOnInit() {
    //this.firebase.login('chuancane@yahoo.com.my','qwert123');

    this.itemRef = this.firebase.db.object('access_log/2019_3_24');
    this.itemRef.snapshotChanges().subscribe(action => {
      console.log(action.type);
      console.log(action.key)
      console.log(action.payload.val())
    });
  }

  user_login(){
    if(this.email =='' || !this.email.includes("@")){
      this.error_message = "invalid email";
      return;
    }else if (this.password == "" || this.password.length<6){
      this.error_message = "Invalid password"
      return
    }
    this.firebase.login(this.email, this.password).then( res=>{
      if (res == "login success"){
          this.email = "";
          this.password = "";
          console.log("logged in!");
          this.error_message = "";
          this.route.navigateByUrl("/dashboard")
        } 
        else {
          this.email = "";
          this.password = "";
          this.error_message = "Wrong email or password!";
        }
      }
    )
   
     
        
    
   
  }

  
}

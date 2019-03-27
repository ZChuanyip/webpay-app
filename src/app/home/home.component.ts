import { Component, OnInit } from '@angular/core';
import {FirebaseService} from '../Services/firebase.service'
import { Observable } from 'rxjs';
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
  error_message;
  loading = false;
  no_data = true;

  private email='';
  private password='';
  private carplate = "";

  constructor(private firebase: FirebaseService, private route:Router) { }

  ngOnInit() {
    //this.firebase.login('chuancane@yahoo.com.my','qwert123');

    this.itemRef = this.firebase.db.object('access_log');
    this.itemRef.snapshotChanges().subscribe(action => {
      console.log(action.type);
      console.log(action.key)
      console.log(action.payload.val())
    });
 
  }

   payment_as_guest(){
    this.loading= true;
    this.firebase.search_active_parking(this.carplate).then(
      res=>{ console.log(res)
        console.log(res["carplate"])
        if(res!= {} && res["carplate"] == this.carplate){
          this.loading = false;
          this.no_data = true;
          this.route.navigateByUrl('/payment');
        } else{
          this.loading = false;
          this.no_data = false;
        }
       
      }

    );
  }

  user_login(){
    this.loading = true;
    if(this.email =='' || !this.email.includes("@")){
      this.error_message = "invalid email";
      return;
    }else if (this.password == "" || this.password.length<6){
      this.error_message = "Invalid password"
      return
    }
    this.firebase.login(this.email, this.password).then( res=>{
      if (res == "login success"){
          this.loading= false;
          this.email = "";
          this.password = "";
          console.log("logged in!");
          this.error_message = "";
          this.route.navigateByUrl("/dashboard")
        } 
        else {
          this.loading= false;
          this.error_message = "Wrong email or password!";
        }
      }
    )
   
     
        
    
   
  }

  
}

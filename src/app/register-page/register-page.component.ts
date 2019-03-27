import { Component, OnInit } from '@angular/core';
import {FirebaseService} from '../Services/firebase.service'
import { Observable } from 'rxjs';
import {Router} from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit {

  constructor(private firebase: FirebaseService, private route:Router) { }

  valid_email = true;
  valid_password = true;
  valid_confirm_password = true;
  valid_car_plate = true;
  valid_name = true;
  error_message = false;

  email:string;
  password:string;
  password2:string;
  name:string;
  car_pate:string;
  car_make = '';
  car_color= '';
  ngOnInit() {
  }

  Register_user(){
    this.firebase.create_account(this.email, this.password, this.name, this.car_pate,this.car_make, this.car_color).then(
      res=>{
        if (res == "register successful!"){
            this.email = "";
            this.password = "";
            console.log("logged in!");
            this.error_message = false;
            alert("account created successful!")
            this.route.navigateByUrl("/dashboard")
          } 
          else {
            this.error_message = true;
          }
        }
    )
  }
  email_validator(){
    if(this.email =='' || !this.email.includes("@")){
      this.valid_email = false;
    }else{
      this.valid_email =true;
    }
  }

  password_validator(){
    if (this.password == "" || this.password.length<6){
     this.valid_password = false;
    }else{
      this.valid_password =true;
    }
  }

  password2_validator(){
    if (this.password2 != this.password ){
      this.valid_confirm_password = false;
    }else{
      this.valid_confirm_password =true;
    }
  }

  name_validator(){
    if(this.name == ""){
      this.valid_name = false;
    }else{
      this.valid_name = true;
    }
  }

  carplate_validator(){
    if(this.car_pate == "" || this.car_pate.length>10){
      this.valid_car_plate = false;
    }else{
      this.valid_car_plate =true;
    }
  }

}

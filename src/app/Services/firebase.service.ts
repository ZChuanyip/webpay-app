import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';
import { promise } from 'protractor';
import { resolve } from 'q';


@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  user_data:object = {
    uid : '',
    email:'',
    name:'',
    car_plate:[''],
    car_color:['']
   };

  private login_status = new BehaviorSubject<string>("Not yet login");

  constructor(public db: AngularFireDatabase, private user_auth: AngularFireAuth) {}

  set_loginstatus(value:string){
    this.login_status.next(value);
  }

  get_loginstatus():Observable<any>{
    return this.login_status.asObservable();
  }
 
  create_account(email:string, password:string, name, car_plate, car_color){
    this.user_auth.auth.createUserWithEmailAndPassword(email,password)
    .then(
      user=> {
        this.user_data['uid'] = user.user.uid;
        this.user_data['email'] = email;
        this.user_data['name'] = name;
        this.user_data['car_plate']= [car_plate];
        this.user_data['car_color'] = [car_color];
        this.db.object('users/'+user.user.uid).set(this.user_data);
      }
    )
    .catch( 
      error => this.error_handler(error)
    )

  }

  async login(email, password):Promise<string>{

    var response 
    this.user_auth.auth.signInWithEmailAndPassword(email, password)
      .then(
        user=>{ 
          this.db.object('users/'+user.user.uid).valueChanges().subscribe(data=>{
            this.user_data['uid'] = user.user.uid;
            this.user_data['email'] = data['email'];
            this.user_data['name'] = data['name'];
            this.user_data['car_plate']= data['car_plate'];
            this.user_data['car_color'] = data['car_color'];
            console.log('user lo',this.user_data)
           });
          
          //var a = this.db.list('active_parking', ref => ref.orderByChild('carplate').equalTo('ABC1255')).valueChanges().subscribe(data => 
          // console.log('ww',data))
          response = "login success";
        }
      )
      .catch( 
        error => {
          this.error_handler(error);
          response = "login failed"
        }
      )
      return new Promise<string>(resolve=>setTimeout(resolve, 2000)).then( ()=>{ return response})
    }
  
  logout() {
    this.user_auth.auth.signOut();
  }

  error_handler(err):string{
    if(err.code == 'auth/email-already-in-use'){
      return 'email has been used';
    }
    else{
     return "login fail";
    }
  }

  get_user_info(){
    return this.user_data;
  }
}


import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';


export interface active_parking{
  carplate:string
  car_color:string
  car_make:string
  payment_status:string
  timestamp:string
}

export interface userdata{
    uid : string
    email: string
    name:string
    car_plate:[string]
    car_make:[string]
    car_color:[string]
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  user_data:userdata;

  private user = new BehaviorSubject<object>(this.user_data);

  constructor(public db: AngularFireDatabase, private user_auth: AngularFireAuth) {}

  set_user(value:object){
    this.user.next(value);
  }

  get_user():Observable<any>{
    return this.user.asObservable();
  }
 
  //======================================User account functions================================================
  async create_account(email:string, password:string, name, car_plate, car_make,car_color):Promise<string>{

    var response =  <string> await this.user_auth.auth.createUserWithEmailAndPassword(email,password)
    .then(
      user=> {
        this.user_data['uid'] = user.user.uid;
        this.user_data['email'] = email;
        this.user_data['name'] = name;
        this.user_data['car_plate']= [car_plate];
        this.user_data['car_make']=[car_make]
        this.user_data['car_color'] = [car_color];
        this.db.object('users/'+user.user.uid).set(this.user_data);
        this.set_user(this.user_data); 
        return"register successful!";
      }
      
    )
    .catch( 
      error =>{ 
        console.log(error)
        return this.error_handler(error);
      }
    )
    return new Promise<string>(resolve=>setTimeout(resolve, 5000)).then( ()=>{ return response })
  }

  async login(email, password):Promise<string>{

   
     var response =  <string> await this.user_auth.auth.signInWithEmailAndPassword(email, password)
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
                      this.set_user(this.user_data);
                      console.log('here')
                      return "login success";
                    }
              )
        .catch( 
                error => {
                           this.error_handler(error);
                            return "login failed"
                          }
              )
    console.log(response)
    return response;
     //return new Promise<string>(resolve=>setTimeout(resolve, 1000)).then( ()=>{ return response })
     //return new Promise<string>(resolve=>setTimeout(resolve, 5000)).then( ()=>{ return response})
  }
  
  logout() {
    this.user_auth.auth.signOut();
    this.user_data= {
                      uid : '',
                      email:'',
                      name:'',
                      car_plate:[''],
                      car_make:[''],
                      car_color:['']
     };
  }

  error_handler(err):string{
    if(err.code == 'auth/email-already-in-use'){
      return 'email has been used';
    }
    else{
     return err;
    }
  }

//=========================================User account functions END==================================================

//========================================= Payment related funtions ===================================================
   search_active_parking(carplate:string):Promise<object>{
    var response:object ;
    this.db.list('active_parking', ref => ref.orderByChild('carplate').equalTo(carplate)).valueChanges().subscribe(  data => {
                            if(data.length != 0){
                               console.log('ww',data)
                              console.log(data[0]["carplate"])
                              response =  this.active_parking_data_formater(data);
                            }else{
                              response = {}
                            }
                          }
                ) 
    return new Promise<string>(resolve=>setTimeout(resolve, 2500)).then( ()=>{ return response})       
  }

  active_parking_data_formater(data):active_parking{
    return { carplate: data[0]["carplate"],
            car_color: data[0]["car_color"],
            car_make: data[0]["car_make"],
            payment_status: data[0]["payment_status"],
            timestamp: data[0]["timestamp"]
            };
  }
  
  pay_parking_fee(carplate:string, user:string, method:string){

  }
}


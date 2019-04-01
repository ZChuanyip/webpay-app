import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage'
import { BehaviorSubject, Observable } from 'rxjs';
import { receipt_data } from '../payment-guest/payment-guest.component';

export interface active_parking{
  carplate:string
  car_color:string
  car_make:string
  payment_status:string
  timestamp:string
  exit_before
}

export interface userdata{
    uid : string
    email: string
    name:string
    car_plate:string[]
    car_make:string[]
    car_color:string[]
    balance:number
}

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  user_data: userdata ={
    name: "",
    uid: "",
    email: "",
    car_plate:[""],
    car_color:[""],
    car_make:[""],
    balance:0,
  };
  private active_parking_data:active_parking;
  private parking_rate;
  private admin = new BehaviorSubject<string>("");
  private user = new BehaviorSubject<object>(this.user_data);

  constructor(public db: AngularFireDatabase, private user_auth: AngularFireAuth, private storage: AngularFireStorage) {}

  set_user(value:object){
    this.user.next(value);
  }

  get_user():Observable<any>{
    return this.user.asObservable();
  }

  set_admin(value:string){
    this.admin.next(value);
  }

  get_admin(){
    return this.admin.asObservable();
  }

  get_active_parking(){
    console.log(this.active_parking_data)
    return this.active_parking_data;
  }

  get_parking_rate(){
    return this.parking_rate;
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
        this.user_data['balance'] = 0;
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
    return new Promise<string>(resolve=>setTimeout(resolve, 2000)).then( ()=>{ return response })
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
                        this.user_data['car_make'] = data['car_make'];
                        this.user_data['balance'] = data['balance'];
                        console.log('user lo',this.user_data);
                        this.set_user(this.user_data);
                        if(data["Admin_hash"]){
                          this.set_admin(data["Admin_hash"]);
                        } 
                      });  
                      return "login success"
                    }
              )
        .catch( 
                error => {
                           this.error_handler(error);
                            return "login failed"
                          }
              )
    console.log(response)
    //return response;
    return new Promise<string>(resolve=>setTimeout(resolve, 3000)).then( ()=>{ return response })
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
                      car_color:[''],
                      balance: 0
     };
     this.set_user(this.user_data);
  }

  error_handler(err):string{
    if(err.code == 'auth/email-already-in-use'){
      return 'email has been used';
    }
    else{
     return err;
    }
  }

  update_car_datail(car_plate:string[], car_color:string[], car_make:string[], uid:string){
    this.db.object('users/' + uid+"/car_plate").set(car_plate);
    this.db.object('users/' + uid+"/car_color").set(car_color);
    this.db.object('users/' + uid+"/car_make").set(car_make);
  }

  reset_password(email){
    this.user_auth.auth.sendPasswordResetEmail(email);
  }
//=========================================User account functions END==================================================

//========================================= Payment related funtions ===================================================
  search_active_parking(carplate: string): Promise<object> {
    var response: object;
    this.db.object('active_parking/' + carplate).valueChanges().subscribe(data => {
       console.log('ww', data)
      if (data != undefined || data != null) {

        response = this.active_parking_data_formater(data);
        this.active_parking_data = this.active_parking_data_formater(data);;
        // console.log(this.active_parking_data)
      } else {
        response = {}
      }
    }
    )
    return new Promise<string>(resolve => setTimeout(resolve, 2000)).then(() => { return response })
  }

  active_parking_data_formater(data): active_parking {
    // console.log(data)
    return {
      carplate: data["carplate"],
      car_color: data["car_color"],
      car_make: data["car_make"],
      payment_status: data["payment_status"],
      timestamp: data["timestamp"],
      exit_before: data["exit_before"]
    };
  }

  subscribe_parking_rate() {
    this.db.object('parking_rate').snapshotChanges().subscribe(data => {
      console.log(data.payload.val())
      this.parking_rate = data.payload.val();
    })

  }

  pay_parking_fee(receipt_data: receipt_data, uuid: string, guest: boolean) {
    //update active parking
    console.log(receipt_data)
    this.db.object('active_parking/' + receipt_data.carplate).update({ payment_status: true, exit_before: receipt_data.exit_time });
    //update user data if pay via prepaid
    if (guest == false) {
      this.db.object('users/' + uuid).update({ balance: receipt_data.balance });
    }
    //insert new transactino record
    var date = new Date();
    this.db.object("transaction_log/"+ (date.getMonth() + 1) + "_" + date.getFullYear()+"/" + receipt_data.receipt_number).set(receipt_data);

  }

 topup_balance(balance:number, uid:string){
    this.db.object('users/' + uid+"/balance").set(balance);
  }
  //===========================Function for admin dashboard ----------------------------
  get_alert_image(path){
    const ref = this.storage.ref(path);
    return ref.getDownloadURL();
  }

}


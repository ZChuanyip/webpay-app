import { Component, OnInit } from '@angular/core';
import { FirebaseService, userdata } from '../Services/firebase.service'
import { Router } from '@angular/router';
import { ParkingFeeCalculationService } from '../Services/parking-fee-calculation.service'
import { receipt_data } from '../payment-guest/payment-guest.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user_data: userdata = {
    name: "",
    uid: "",
    email: "",
    car_plate: [],
    car_color: [],
    car_make: [],
    balance: 0
  };

  receipt_detail:receipt_data={
    payment_status:"",
    receipt_number: "",
    carplate: "",
    fee:"",
    exit_time:"",
    balance:0
  };
  user_active_parking = [];
  parking_rate;
  loading = false;

  constructor(private firebase: FirebaseService, private route: Router , private feeCalc:ParkingFeeCalculationService) { }

  ngOnInit() {
    this.loading = true;
    this.parking_rate = this.firebase.get_parking_rate();

    this.firebase.get_user().subscribe(res => {
      console.log("new update", this.user_data.uid, this.user_data.uid != "");
      this.user_data = res;

      if (this.user_data.uid != "") {

        this.firebase.db.object('active_parking/').valueChanges().subscribe(data => {
          console.log('ww', data)
          this.user_active_parking = []
          for (var i = 0; i < this.user_data.car_plate.length; i++) {
            if (data[this.user_data.car_plate[i]] != undefined || data[this.user_data.car_plate[i]] != null) {
              //real time update on parking status
              //new record found
              this.user_active_parking.push(this.firebase.active_parking_data_formater(data[this.user_data.car_plate[i]]));

              var date = new Date(this.user_active_parking[this.user_active_parking.length-1]["timestamp"]*1000);
              var current_date = new Date();
              this.user_active_parking[this.user_active_parking.length-1].entry_time = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours()>12?date.getHours()-12:date.getHours()) + ":" + date.getMinutes()+" "+(date.getHours()>12?"PM":"AM");
              var fee_duratiopn = this.feeCalc.calculate_parking_fee(date, current_date, this.parking_rate);
              this.user_active_parking[this.user_active_parking.length-1].fee = fee_duratiopn[0]+" ("+ fee_duratiopn[1]+")"; 
              // if (this.user_active_parking.find(obj => { return obj.carplate == data[this.user_data.car_plate[i]]["carplate"] }) == undefined) {
              //   this.user_active_parking.push(this.firebase.active_parking_data_formater(data[this.user_data.car_plate[i]]));
              //   this.index = this.user_active_parking.length - 1;
              // } else {
              //   //update on old record
              //   this.index = this.user_active_parking.findIndex(obj => { return obj.carplate == data[this.user_data.car_plate[i]]["carplate"] });
              //   console.log(this.index);
              //   this.user_active_parking[this.index] = this.firebase.active_parking_data_formater(data[this.user_data.car_plate[i]]);
              // }
              //console.log("new:", res)
            }
          }
          this.loading = false;
        })

      }
    })
    
    setTimeout(() => {
      for (var i = 0; i < this.user_data.car_plate.length; i++) {
        var date = new Date(this.user_active_parking[this.user_active_parking.length-1]["timestamp"]*1000);
        var current_date = new Date();
        var fee_duratiopn = this.feeCalc.calculate_parking_fee(date, current_date, this.parking_rate);
        this.user_active_parking[this.user_active_parking.length-1].fee = fee_duratiopn[0]+" ("+ fee_duratiopn[1]+")"; 
      }
    }, 18000000);
  
  }

  logout(){
    this.firebase.logout();
    this.route.navigateByUrl("home");
  }
  
  pay_user(index){
  
    var date = new Date();
    var entry_time = new Date(this.user_active_parking[this.user_active_parking.length-1]["timestamp"]*1000);
    var fee = this.feeCalc.return_fee(entry_time, date, this.parking_rate);
    console.log(fee, fee > this.receipt_detail.balance,this.receipt_detail.balance)
    if(fee > this.user_data.balance){
      alert("Insufficient balance, please top up!");
      return;
    }
    this.receipt_detail.balance = this.user_data.balance - fee;

    this.receipt_detail.carplate = this.user_active_parking[index].carplate;
    this.receipt_detail.receipt_number= date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds()+ this.receipt_detail.carplate ;
    date.setMinutes( date.getMinutes() + 30 );
    this.receipt_detail.exit_time = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours()>12?date.getHours()-12:date.getHours()) + ":" + date.getMinutes()+" "+(date.getHours()>12?"PM":"AM");
    this.receipt_detail.fee = this.user_active_parking[index].fee;
    this.receipt_detail.payment_status = "successful";

    this.firebase.pay_parking_fee(this.receipt_detail, this.user_data.uid, false);

  }

  //oninit 
  //   for (var i = 0; i < this.user_data.car_plate.length; i++) {
        //     console.log(this.user_data.car_plate[i]);

        //     this.firebase.db.object('active_parking/' + this.user_data.car_plate[i]).valueChanges().subscribe(data => {
        //       console.log('ww', data)

        //      if (data != undefined || data!= null) {
        //         //real time update on parking status
        //         //new record found
        //        if(this.user_active_parking.find(obj =>{return obj.carplate == data["carplate"]}) == undefined){
        //           this.user_active_parking.push( this.firebase.active_parking_data_formater(data));
        //           this.index = this.user_active_parking.length-1;
        //        } else {
        //          //update on old record
        //           this.index = this.user_active_parking.findIndex(obj =>{return obj.carplate == data["carplate"]});
        //           console.log(this.index);
        //           this.user_active_parking[ this.index ] = this.firebase.active_parking_data_formater(data);
        //        }

        //         var date = new Date(this.user_active_parking[this.index]["timestamp"]*1000);
        //         this.user_active_parking[this.index]["timestamp"] = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours()>12?date.getHours()-12:date.getHours()) + ":" + date.getMinutes()+" "+(date.getHours()>12?"PM":"AM");
        //         console.log(this.user_active_parking,this.user_data.car_plate[1], i)
        //      }
        //     // this.firebase.search_active_parking(this.user_data.car_plate[i]).then(
        //     //   res => {console.log(res)
        //     //     if (res != {} && res["carplate"] != undefined) {

        //     //       this.user_active_parking.push(res);
        //     //       console.log(this.user_active_parking)
        //     //     }
        //     //   }

        //     // );
        //   })
        // }
}

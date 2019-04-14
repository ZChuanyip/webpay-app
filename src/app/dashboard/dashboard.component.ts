import { Component, OnInit,Inject } from '@angular/core';
import { FirebaseService, userdata } from '../Services/firebase.service'
import { Router } from '@angular/router';
import { ParkingFeeCalculationService } from '../Services/parking-fee-calculation.service'
import { receipt_data } from '../payment-guest/payment-guest.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


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
    balance:0,
  };
  user_active_parking = [];
  parking_rate;
  car_detail:object[] = [];
  loading = false;
  default_tab = true;

  //form binding
  new_carplate = "";
  new_carcolor = "";
  new_carmake = "";

  constructor(private firebase: FirebaseService, private route: Router , private feeCalc:ParkingFeeCalculationService, public dialog: MatDialog) { }

  ngOnInit() {
    this.loading = true;
    this.parking_rate = this.firebase.get_parking_rate();

    this.firebase.get_user().subscribe(res => {
      console.log("new update", this.user_data.uid, this.user_data.uid != "");
      this.user_data = res;
      console.log(this.user_data ,this.user_data.car_plate != undefined)
      if (res.car_plate != undefined || res.car_plate != "undefined") {
        this.car_detail = [];
        for (var i = 0; i < this.user_data.car_plate.length; i++) {
          this.car_detail.push({
            car_plate: this.user_data.car_plate[i],
            car_make: (this.user_data.car_make == undefined? "": this.user_data.car_make[i]),
            car_color: (this.user_data.car_color == undefined? "": this.user_data.car_color[i])
          })
        }
      }
     
      if (this.user_data.uid != "") {

        this.firebase.db.object('active_parking/').valueChanges().subscribe(data => {
          console.log('ww', data)
          this.user_active_parking = []
          if (this.user_data.car_plate != undefined || this.user_data.car_plate.length != undefined) {
            for (var i = 0; i < this.user_data.car_plate.length; i++) {
              if (data[this.user_data.car_plate[i]] != undefined || data[this.user_data.car_plate[i]] != null) {
                //real time update on parking status
                //new record found
                this.user_active_parking.push(this.firebase.active_parking_data_formater(data[this.user_data.car_plate[i]]));

                var date = new Date(this.user_active_parking[this.user_active_parking.length - 1]["timestamp"] * 1000);
                var current_date = new Date();
                this.user_active_parking[this.user_active_parking.length - 1].entry_time = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) + ":" + date.getMinutes() + " " + (date.getHours() > 12 ? "PM" : "AM");
                var fee_duratiopn = this.feeCalc.calculate_parking_fee(date, current_date, this.parking_rate);
                this.user_active_parking[this.user_active_parking.length - 1].fee = fee_duratiopn[0] + " (" + fee_duratiopn[1] + ")";
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
          }
          this.loading = false;
        })

        this.firebase.get_admin().subscribe( admin =>{
          if(btoa(this.user_data.uid) == admin){
            this.route.navigateByUrl("admin/"+ this.user_data.uid);
          }
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
    this.receipt_detail.payment_status = "Payment successful";

    this.firebase.pay_parking_fee(this.receipt_detail, this.user_data.uid, false);
    this.openDialog(this.receipt_detail, 0 ,false);

  }

   // receipt_dialog
  openDialog(receipt_detail: receipt_data, topup_amount:number, Istopup:boolean): void {
    this.dialog.open(ReceiptDialogUserComponent, {
      width: '800px',
      data: {
        payment_status: receipt_detail.payment_status,
        receipt_number: receipt_detail.receipt_number,
        car_plate: receipt_detail.carplate,
        fee: receipt_detail.fee,
        exit_time: receipt_detail.exit_time,
        balance: "RM " + receipt_detail.balance.toFixed(2),
        topup_amount: topup_amount,
        IsTopup: Istopup
      }
    });
  }

  topup(){
    const dialogRef = this.dialog.open(TopupDialogUserComponent, {
      width: '800px',
      data: {
        uid: this.user_data.uid,
        balance: this.user_data.balance
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("topup:",result);
      this.loading= true;
      this.user_data.balance = this.user_data.balance+ Number(result);
      this.firebase.topup_balance(this.user_data.balance, this.user_data.uid);
      var date = new Date();

      this.receipt_detail={
        payment_status:"Top Up successful",
        receipt_number: date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "" + date.getHours() + "" + date.getMinutes() + "" + date.getSeconds()+ this.user_data.uid ,
        carplate: "",
        fee:"",
        exit_time:"",
        balance: this.user_data.balance,
        fee_number: 0
      };
      this.loading= false;
      this.openDialog(this.receipt_detail, result, true);
      
    });
  }


  switch_tab(default_view:boolean){
      this.default_tab = default_view;
  }

  delete_car(index){
    ( this.user_data.car_plate == undefined? null:  this.user_data.car_plate.splice(index, 1));
    ( this.user_data.car_color == undefined? null:  this.user_data.car_color.splice(index, 1));
    ( this.user_data.car_make == undefined? null:  this.user_data.car_make.splice(index, 1));
    // this.user_data.car_plate.splice(index, 1);
    // this.user_data.car_color.splice(index, 1);
    // this.user_data.car_make.splice(index, 1);
    console.log(this.user_data.car_plate, this.user_data.car_color,this.user_data.car_make)
    this.firebase.update_car_datail(  this.user_data.car_plate, this.user_data.car_color, this.user_data.car_make, this.user_data.uid);
  }

  add_car(){
    if(this.new_carplate != "" || this.new_carplate != null){
      ( this.user_data.car_plate == undefined? [this.new_carplate  ]: this.user_data.car_plate.push(this.new_carplate.toUpperCase()));
      ( this.user_data.car_color == undefined? [this.new_carcolor]: this.user_data.car_color.push(this.new_carcolor));
      ( this.user_data.car_make == undefined? [this.new_carmake]: this.user_data.car_make.push(this.new_carmake));
      this.firebase.update_car_datail(  this.user_data.car_plate, this.user_data.car_color, this.user_data.car_make, this.user_data.uid);
      this.new_carplate = "";
      this.new_carcolor ="";
      this.new_carmake ="";
    }
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

@Component({
  selector: 'app-receipt-dialog-user',
  templateUrl: 'receipt-dialog-user.component.html',
})
export class ReceiptDialogUserComponent {

  constructor(
    public dialogRef: MatDialogRef<ReceiptDialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  print(): void {
    window.print();
  }
}

@Component({
  selector: 'app-topup-dialog-user',
  templateUrl: 'topup-dialog-user.component.html',
})
export class TopupDialogUserComponent {

  constructor(
    public dialogRef: MatDialogRef<TopupDialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data:userdata) {}
  
  topup_amount=10;
  card ="";
  exp_date="";
  cvv="";

  valid_amount = true;
  valid_card = true;
  valid_date = true;
  valid_cvv = true;

  onNoClick(): void {
    this.dialogRef.close();
  }
  validate_amount(){
    if(this.topup_amount<10){
      this.valid_amount = false;
    } else{
      this.valid_amount = true;
    }
  }

  validate_card() {
    console.log(this.card);
    if (this.card == null || this.card.toString().length < 15) {
      this.valid_card = false;
    } else {
      this.valid_card = true;
    }
  }

  validate_date() {
    if (this.exp_date ==null || this.exp_date.toString().length < 5) {
      this.valid_date = false;
    } else {
      this.valid_date = true;
    }
  }

  validate_cvv() {
    if (this.cvv ==null || this.cvv.toString().length < 3) {
      this.valid_cvv = false;
    } else {
      this.valid_cvv = true;
    }
  }
}
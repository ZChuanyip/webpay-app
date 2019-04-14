import { Component, OnInit,Inject } from '@angular/core';
import {FirebaseService, active_parking} from '../Services/firebase.service'
import { ParkingFeeCalculationService } from '../Services/parking-fee-calculation.service'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Router} from '@angular/router';


export interface receipt_data {
  payment_status:string;
  receipt_number: string;
  carplate: string;
  fee:string;
  exit_time:string;
  balance:number
}


@Component({
  selector: 'app-payment-guest',
  templateUrl: './payment-guest.component.html',
  styleUrls: ['./payment-guest.component.css']
})
export class PaymentGuestComponent implements OnInit {

  payment_detail: active_parking;
  protected receipt_detail: receipt_data = {
    payment_status: "",
    receipt_number: "",
    carplate: "",
    fee: "",
    exit_time: "",
    balance: 0
  };
  entry_time;
  parking_fee;
  parking_duration;

  card_number;
  exp_date;
  cvv;

  //calculation var
  parking_rate;
  entry_date;
  current_time;

  ///error_flag
  valid_card = true;
  valid_date = true;
  valid_cvv = true;
  loading = false;
  fees_duration=[];

  constructor(private firebase: FirebaseService, private fee_calculate: ParkingFeeCalculationService, public dialog: MatDialog, private route:Router) { }

  ngOnInit() {
    this.loading = true;
    this.payment_detail = this.firebase.get_active_parking();
    this.parking_rate = this.firebase.get_parking_rate();

    this.entry_date = new Date(Number(this.payment_detail.timestamp) * 1000);
    this.entry_time = this.entry_date.getDate() + "/" + this.entry_date.getMonth() + 1 + "/" + this.entry_date.getFullYear() + "  " + this.entry_date.getHours() + ":" + this.entry_date.getMinutes() + ":" + this.entry_date.getSeconds();
    this.current_time = new Date()
    console.log(this.current_time)
    this.fees_duration = this.fee_calculate.calculate_parking_fee(this.entry_date, this.current_time, this.parking_rate);
    this.parking_fee = this.fees_duration[0];
    this.parking_duration = this.fees_duration[1];
    this.loading = false;
    setTimeout(() => {
      this.current_time = new Date()
      console.log(this.current_time);
      this.fees_duration = this.fee_calculate.calculate_parking_fee(this.entry_date, this.current_time, this.parking_rate);
      this.parking_fee = this.fees_duration[0];
      this.parking_duration = this.fees_duration[1];
    }, 18000000);

  }

  pay() {
    this.loading = true;
    //validate all field before submit
    this.validate_card();
    this.validate_cvv();
    this.validate_date();
    if(this.valid_card == false || this.valid_cvv == false || this.valid_date == false){
      this.loading = false;
      return;
    }
    console.log(this.current_time,this.current_time.getDate())
    this.receipt_detail.receipt_number= this.current_time.getFullYear() + "" + (this.current_time.getMonth() + 1) + "" + this.current_time.getDate() + "" + this.current_time.getHours() + "" + this.current_time.getMinutes() + "" + this.current_time.getSeconds()+ this.payment_detail.carplate;
    var date = new Date();
    date.setMinutes( date.getMinutes() + 30 );
    this.receipt_detail.exit_time = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours()>12?date.getHours()-12:date.getHours()) + ":" + date.getMinutes()+" "+(date.getHours()>12?"PM":"AM");
    this.receipt_detail.carplate = this.payment_detail.carplate;
    this.receipt_detail.fee = this.parking_fee;
    this.receipt_detail.payment_status = " successful";
    //push data to transaction and update active parking
    this.firebase.pay_parking_fee(this.receipt_detail, "", true);

    this.loading = false;
    this.openDialog("Payment"+this.receipt_detail.payment_status+"!",  this.receipt_detail.receipt_number, this.receipt_detail.carplate, this.receipt_detail.fee, this.receipt_detail.exit_time );
   }

  // receipt_dialog
  openDialog(status,receipt_no, carplate, parkingfee, exitTime): void {
    const dialogRef = this.dialog.open(ReciptDialogComponent, {
      width: '500px',
      data: {
        payment_status: status ,
        receipt_number: receipt_no ,
        car_plate: carplate ,
        fee: parkingfee,
        exit_time: exitTime,
      }
    });

     dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       this.route.navigateByUrl("/home");
     });
  }
  

  validate_card() {
    console.log(this.card_number)
    if (this.card_number == null || this.card_number.toString().length < 15) {
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

  back(){
    this.route.navigateByUrl("/home");
  }

}



@Component({
  selector: 'app-recipt-dialog',
  templateUrl: 'recipt-dialog.component.html'
})

export class ReciptDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ReciptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  print(): void {
    window.print();
  }
}

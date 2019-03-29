import { Component, OnInit,Inject } from '@angular/core';
import {FirebaseService, active_parking} from '../Services/firebase.service'
import { ParkingFeeCalculationService } from '../Services/parking-fee-calculation.service'
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Router} from '@angular/router';


export interface receipt_data {
  payment_status:string;
  receipt_number: string;
  car_plate: string;
  fee:string;
  exit_time:string;
}


@Component({
  selector: 'app-payment-guest',
  templateUrl: './payment-guest.component.html',
  styleUrls: ['./payment-guest.component.css']
})
export class PaymentGuestComponent implements OnInit {

  private payment_detail: active_parking;
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

  constructor(private firebase: FirebaseService, private fee_calculate: ParkingFeeCalculationService, public dialog: MatDialog, private route:Router) { }

  ngOnInit() {
    this.payment_detail = this.firebase.get_active_parking();
    this.parking_rate = this.firebase.get_parking_rate();

    this.entry_date = new Date(Number(this.payment_detail.timestamp) * 1000);
    this.entry_time = this.entry_date.getDate() + "/" + this.entry_date.getMonth() + 1 + "/" + this.entry_date.getFullYear() + "  " + this.entry_date.getHours() + ":" + this.entry_date.getMinutes() + ":" + this.entry_date.getSeconds();
    this.current_time = new Date()
    console.log(this.current_time)
    var fees_duration = this.fee_calculate.calculate_parking_fee(this.entry_date, this.current_time, this.parking_rate);
    this.parking_fee = fees_duration[0];
    this.parking_duration = fees_duration[1];

    setTimeout(() => {
      this.current_time = new Date()
      console.log(this.current_time);
      fees_duration = this.fee_calculate.calculate_parking_fee(this.entry_date, this.current_time, this.parking_rate);
      this.parking_fee = fees_duration[0];
      this.parking_duration = fees_duration[1];
    }, 18000000);

  }

  pay() {
    var transaction_number = this.current_time.getDate() + "" + this.current_time.getMonth() + 1 + "" + this.current_time.getFullYear() + "" + this.current_time.getHours() + "" + this.current_time.getMinutes() + "" + this.current_time.getSeconds();
    var exit_before = new Date();
    exit_before.setMinutes( exit_before.getMinutes() + 30 );
    //push data to transaction and update active parking
     this.openDialog("Payment Successful!", transaction_number, this.payment_detail.carplate, this.parking_fee, exit_before );
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
        exit_time: exitTime}
    });

     dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       this.route.navigateByUrl("/home");
     });
  }
  

  validate_card() {
    if (this.card_number.toString().length < 15) {
      this.valid_card = false;
    } else {
      this.valid_card = true;
    }
  }

  validate_date() {
    if (this.exp_date.toString().length < 5) {
      this.valid_date = false;
    } else {
      this.valid_date = true;
    }
  }

  validate_cvv() {
    if (this.cvv.toString().length < 3) {
      this.valid_cvv = false;
    } else {
      this.valid_cvv = true;
    }
  }

}



@Component({
  selector: 'app-recipt-dialog',
  templateUrl: 'recipt-dialog.component.html'
})

export class ReciptDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ReciptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: receipt_data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

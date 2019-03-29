import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface receipt_data {
  payment_status:string;
  receipt_number: string;
  car_plate: string;
  fee:string;
  exit_time:string;
}

@Component({
  selector: 'app-recipt-dialog',
  templateUrl: './recipt-dialog.component.html'
})

export class ReciptDialogComponent {

  
  constructor(
    public dialogRef: MatDialogRef<ReciptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: receipt_data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

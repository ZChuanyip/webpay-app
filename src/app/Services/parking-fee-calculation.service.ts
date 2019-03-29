import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParkingFeeCalculationService {

  constructor() { }

  calculate_parking_fee(entry_time, current_time, parking_rate){
    var diff = (current_time.getTime())-(entry_time.getTime());
 
    var hoursDifference = Math.floor(diff/1000/60/60);
    diff -= hoursDifference*1000*60*60

    var minutesDifference = Math.floor(diff/1000/60);
    
    var parking_fee ="RM "+(hoursDifference*parking_rate).toFixed(2);
    var parking_duration = hoursDifference+" hours " + minutesDifference + " minutes" ;
    return [parking_fee, parking_duration]
  }
}

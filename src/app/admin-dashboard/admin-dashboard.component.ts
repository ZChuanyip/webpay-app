import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { FirebaseService, userdata } from '../Services/firebase.service'


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  user_data: userdata = {
    name: "",
    uid: "",
    email: "",
    car_plate: [],
    car_color: [],
    car_make: [],
    balance: 0
  };

  admin;
  alerturl;
  alert=[];
  log=[];
  today:string;
  carplate = [];
  valid_carplate=[];
  no_alert= true;
  loading = false;
  @ViewChild('audioOption') audioPlayerRef: ElementRef;

  constructor(private route:Router, private router: ActivatedRoute, private firebase:FirebaseService) { 
    this.router.params.subscribe( params => this.admin = params.validator );
  }

  async ngOnInit() {
    
    await this.firebase.get_user().subscribe(res => {
      this.user_data = res;
      if(this.user_data.uid == undefined || this.user_data.uid ==""){
        this.route.navigateByUrl("home");
      }
      this.firebase.get_admin().subscribe(admin => {
        if (this.user_data.uid != atob(admin )) {
          console.log("not admin")
          this.loading = true;
          // (async () => {

          //   await this.delay(3000);
          //   this.loading = false;

          // })();
          this.route.navigateByUrl("home");
        }
      })
    })

    this.firebase.db.list('alert').valueChanges().subscribe( alert_data =>{
      this.alert = [];
      this.carplate =[];
      this.alert = alert_data;
      console.log(alert_data)
      for(var i = 0; i< this.alert.length; i++){
        this.alert[i].alertURL = this.firebase.get_alert_image(this.alert[i].image_path);
        this.carplate.push("");
        this.valid_carplate.push(true);
      }
      //no alert
      if(this.alert.length == 0){
        this.no_alert = false;
      }else{
        this.no_alert = true;
        this.audioPlayerRef.nativeElement.play();
      }
    })
    
    var date = new Date();
    this.today = date.getFullYear()+"_"+(date.getMonth()+1)+"_"+date.getDate();
    console.log(this.today)
    this.firebase.db.list('access_log/'+this.today).valueChanges().subscribe(log =>{
      this.log= log;
    })
  }

  resolve_alert(index){
    if(this.carplate[index] == "" || this.carplate[index] == undefined || this.carplate[index].length<2 ){
      this.valid_carplate[index] = false;
      return;
    }else{
      this.valid_carplate[index] = true;
    }
    this.firebase.db.list('alert').remove(this.alert[index].time+"_"+this.alert[index].gate);
    this.firebase.db.object('gate_access/'+this.alert[index].gate).set(true);
    var date = new Date();
    if(this.alert[index].access_type == "Entry"){
      this.firebase.db.object('active_parking/'+this.carplate[index]).set({
        carplate: this.carplate[index],
        car_color:"",
        car_make: "",
        exit_before:"",
        payment_status:false,
        timestamp: date.getTime()/1000
      });
    }
  }

  logout(){
    this.firebase.logout();
    this.route.navigateByUrl("home");
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}

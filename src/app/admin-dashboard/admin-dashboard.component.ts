import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import { FirebaseService, userdata } from '../Services/firebase.service'
import * as moment from 'moment';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

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
  users_list=[];
  users_search_result=[];
  useremail="";
  user_carplate="";
  transaction_logs={};
  today:string;
  carplate = [];
  valid_carplate=[];
  daily_report =""
  daily_report_chart_data = [];
  //charts
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' }
  ];

  //flags
  no_alert= true;
  no_result = true;
  loading = false;
  not_homepage = false;
  not_search_userPage = true;
  not_search_access_logPage = true;
  not_summaryPage = true;


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
    this.firebase.db.list('access_log/'+this.today,  ref => ref.orderByChild("time").limitToFirst(10)).valueChanges().subscribe(log =>{
      if(log != undefined){
        this.log= log;
        this.bubbleSort(this.log);
        this.log.reverse();
        //this.log = this.bubble_sort(this.log);
      }
      // console.log(moment("11:11:11","HHmmSS").isAfter(moment("11:11:05","HHmmSS")))
    })

    //subscribe user list
    this.firebase.db.list('users').valueChanges().subscribe(users =>{
      this.users_list=[]
      this.users_list = users;
      this.users_search_result = users;
    })

    // this.firebase.db.object('transaction_log').valueChanges().subscribe(transaction =>{
    //   console.log("trans",transaction)
    //   this.transaction_logs={}
    //   this.transaction_logs = transaction;
    // })

    console.log(moment("31/3/2019 9:6 PM","DDMMYYYYHHmmA"))
    this.daily_report = moment(new Date()).format('YYYY-MM-DD');
  }

//view fuction
change_view(button_string){
  if(button_string == "homepage"){
    this.not_homepage = false;
    this.not_search_userPage = true;
    this.not_search_access_logPage = true;
    this.not_summaryPage = true;
  } else if (button_string == "users"){
    this.not_homepage = true;
    this.not_search_userPage = false;
    this.not_search_access_logPage = true;
    this.not_summaryPage = true;
  } else if (button_string == "logs"){
    this.not_homepage = true;
    this.not_search_userPage = true;
    this.not_search_access_logPage = false;
    this.not_summaryPage = true;
  }  else if (button_string == "summary"){
    this.not_homepage = true;
    this.not_search_userPage = true;
    this.not_search_access_logPage = true;
    this.not_summaryPage = false;
  }
}
//==========================homepage functions=====================
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

  image_reload(index){
    this.delay(1000);
    this.alert[index].alertURL = this.alert[index].alertURL+"#";
  }

  bubbleSort(a) {
    var swapped;
    do {
      swapped = false;
      for (var i = 0; i < a.length - 1; i++) {
        if (moment(a[i]['time'], 'HHmmSS').isAfter(moment(a[i + 1]['time'], 'HHmmSS'))) {
          var temp = a[i];
          a[i] = a[i + 1];
          a[i + 1] = temp;
          swapped = true;
        }
      }
    } while (swapped);
  }


  //================================Search user section code logic===================================
  search_user_by_email(){
    this.user_carplate = "";
    for(var i =0; i< this.users_list.length; i++){
      if(this.users_list[i]['email'] == this.useremail){
        this.users_search_result= [this.users_list[i]];
        this.no_result = true;
        break;
      } else {
        this.users_search_result=[];
        this.no_result = false;
      }
    }
    
    
  }

  search_user_by_carplate() {
    this.useremail="";
    var return_users = []
    for (var i = 0; i < this.users_list.length; i++) {
      for (var j = 0; j < this.users_list[i].car_plate.length; j++) {
        if (this.users_list[i].car_plate[j] == this.user_carplate) {
          return_users.push(this.users_list[i]);
        }
      }
    }
    if (return_users != []) {
      this.users_search_result= return_users;
      this.no_result = true;
    } else {
     this.users_search_result= [];
     this.no_result = false;
    }
  }

  reset_user_filter(){
    this.users_search_result = this.users_list;
    this.no_result = true;
    this.useremail="";
    this.user_carplate = "";
  }

  generate_daily_report(date){
    this.daily_report_chart_data = [0,0,0]
    var moment_date = moment(date,"YYYYMMDD");
    var daily_report_subc = this.firebase.db.list("transaction_log/"+moment_date.format('M')+"_"+moment_date.format('YYYY')).valueChanges().subscribe( res=>{
      if(res != []){
        for(var i =0; i< res.length; i++){
          if(moment(res[i]['exit_time'],"DDMMYYYYHHmmA").format("D") == moment_date.format('D')){
            var hour = Number(moment(res[i]['exit_time'],"DDMMYYYYHHmmA").format("H"))
            console.log(res[i]['exit_time'])
            if( Number(hour) >= 4 && Number(hour) < 12 ){
              this.daily_report_chart_data[0]+= Number((res[i]['fee']).substr(3, res[i]['fee'].indexOf('0')))
            } else if( Number(hour) >= 12 && Number(hour) < 20 ){
              this.daily_report_chart_data[1]+= Number((res[i]['fee']).substr(3, res[i]['fee'].indexOf('0')))
            } else if( Number(hour) >= 20 && Number(hour) < 4 ){
              this.daily_report_chart_data[2]+= Number((res[i]['fee']).substr(3, res[i]['fee'].indexOf('0')))
            }
          }
        }
        this.barChartData= [
          { data: this.daily_report_chart_data }
        ];
        this.barChartLabels = ['4am- 12pm', '12pm-8pm', '8pm-4am']
        daily_report_subc.unsubscribe();
      }
      console.log(res)
    })
    console.log(moment(date,"YYYYMMDD").format('M')+"_"+moment(date,"YYYYMMDD").format('YYYY'))
    console.log(Number(("RM 660.00 (334 hours 23 minutes)").substr(3, ("RM 668.00 (334 hours 23 minutes)").indexOf('0'))))
    
  }

  generate_monthly_report(){

  }

  generate_yearly_report(){

  }
}

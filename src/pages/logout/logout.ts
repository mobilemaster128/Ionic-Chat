import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { LoginPage } from '../../pages/login/login';
/*
  Generated class for the Logout page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})
export class LogoutPage {

  currentUser:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public userData: UserData,public loadingCtrl:LoadingController) {}

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad LogoutPage');
    this.currentUser = this.userData.getUserData();
    console.log(this.currentUser.register_type);

    // if(this.currentUser.register_type=="facebook"){


    //     let loader = this.loadingCtrl.create({
    //         content: "Please wait...",
    //     });

    //     Facebook.logout().then((success) => {

    //           console.log(success);
    //           loader.dismiss();
    //           this.clearSession();

    //     },(err) => {
              
    //           console.log(JSON.stringify(err));
    //           loader.dismiss();
    //           this.clearSession();
              
    //     });

    // }else{

    //     this.clearSession();
    // }
    
    this.clearSession();

  }

  clearSession(){

    this.userData.logout();
    this.navCtrl.setRoot(LoginPage);
  }

}

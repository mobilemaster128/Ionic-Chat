import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
  NavController,
  NavParams,
  ModalController,
  LoadingController,
  ToastController
} from "ionic-angular";
import { UserData } from "../../providers/user-data";
import { SignupPage } from "../../pages/signup/signup";
import { ForgotPage } from "../../pages/forgot/forgot";
import { WebServices } from "../../providers/webservices";
import { serverDetails } from "../../providers/config";
import { MynetworkfeedPage } from "../../pages/mynetworkfeed/mynetworkfeed";
import { Helper } from "../../providers/helper";
import { FirebaseService } from "../../providers/firebase/firebase.service";

@Component({
  selector: "page-user",
  templateUrl: "login.html"
})
export class LoginPage {
  login: {
    username?: string;
    password?: string;
    grant_type?: string;
    scope?: string;
    client_id?: string;
    token?: string;
  } = {};
  sociallogin: {
    name?: string;
    email?: string;
    password?: string;
    register_type?: string;
  } = {};
  submitted = false;
  loader: any;
  time:any;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public userData: UserData,
    public toastCtrl: ToastController,
    public webServices: WebServices,
    public firebase: FirebaseService,
    public helper: Helper
  ) {}

  createClient() {
    console.log("create client");
    this.webServices.put("client/add/client/secret", "").subscribe(
      getData => {
        //this.loader.dismiss();

        console.log(getData);
      },
      err => {
        console.log(err.statusText);
      }
    );
  }

  onLogin(form: NgForm) {
    this.submitted = true;

    // this.createClient();

    if (form.valid) {
      (this.login.grant_type = "password"), (this.login.scope =
        "read write"), (this.login.client_id = serverDetails.clientId);

      let loader = this.loadingCtrl.create({
        content: "Please wait..."
      });

      loader.present();

      this.webServices.post(this.login, "oauth/token").subscribe(
        getData => {
          loader.dismiss();
          console.log(getData);
          serverDetails.time = "?time=" + new Date().getMilliseconds();
          this.time =serverDetails.time;
          this.userData.login(getData);
          this.getProfile();
        },
        err => {
          loader.dismiss();
          console.log(err.statusText);
          this.helper.presentToast(err, "error");
        }
      );
    }
  }

  getProfile() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    loader.present();

    this.webServices.get("user/get/username/" + this.login.username).subscribe(
      profileData => {
        this.firebase.login(profileData.user.id).then(
          fbUser => {
            console.log(fbUser);
            console.log("Firebase login success");
            loader.dismiss();
            console.log(profileData.user);
            this.userData.profileUpdate(profileData.user);
            this.navCtrl.setRoot(MynetworkfeedPage);
          },
          err => {
            //console.log(err);
            console.log("Firebase login failed");
            loader.dismiss();
            console.log("Firebase login failed");
            this.helper.presentToast(err, "error");
          }
        );
      },
      err => {
        loader.dismiss();
        console.log(err.statusText);
        this.helper.presentToast(err, "error");
      }
    );
  }

  opensignup() {
    this.navCtrl.push(SignupPage);
  }

  openforgotpassword() {
    this.navCtrl.push(ForgotPage);
  }

  presentToast(msg, classname) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: "top",
      cssClass: classname
    });

    toast.present();
  }
}

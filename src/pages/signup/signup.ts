import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from "ionic-angular";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { WebServices } from "../../providers/webservices";
import { UserData } from "../../providers/user-data";
import { LoginPage } from "../../pages/login/login";
import { Helper } from "../../providers/helper";
import { serverDetails } from "../../providers/config";
import { MynetworkfeedPage } from "../../pages/mynetworkfeed/mynetworkfeed";
import { DatePicker } from "@ionic-native/date-picker";

/*
  Generated class for the Signup page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: "page-signup",
  templateUrl: "signup.html"
})
export class SignupPage {
  title: string = "Register";
  submitted = false;
  countryList: any;
  myDate: any;
  minyear:any;
  loader: any;
  login: {
    username?: string;
    password?: string;
    grant_type?: string;
    scope?: string;
    client_id?: string;
    token?: string;
  } = {};
  register: {
    maxbirth?: any;
    username?: string;
    dob?: any;
    dateofbirth?: any;
    email?: string;
    password?: string;
    repeatPassword?: string;
    lat?:any,
    lon?:any
  } = {};
  registerForm: FormGroup;

  constructor(
    public userData: UserData,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public helper: Helper,
    public datePicker: DatePicker,
    public formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group({
      username: [
        "",
        Validators.compose([Validators.required, Validators.maxLength(30)])
      ],
      email: [""],
      dob: [""],
      password: ["", Validators.required],
      repeatPassword: [""]
    });
    this.minyear = new Date().getFullYear() - 13;
    console.log(this.minyear);
  }

  ionViewDidLoad() {
    this.register.dateofbirth = "Date Of Birth";
  }

  selectDob() {
    console.log(this.register.maxbirth);

    this.datePicker
      .show({
        date: new Date(new Date().setFullYear(new Date().getFullYear() - 13)),
        mode: "date"
      })
      .then(
        date => this.startProcess(date),
        err => console.log("Error occurred while getting date: ", err)
      );
  }

  startProcess(dateObj) {
    let month = dateObj.getMonth() + 1; //months from 1-12
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();

    year = year;
    month = month < 10 ? "0" + month : "" + month;
    day = day < 10 ? "0" + day : "" + day;

    this.register.dateofbirth = month + "/" + day + "/" + year;
    console.log(this.register.dateofbirth);
  }

  onRegister() {
    this.submitted = true;

    console.log(this.registerForm.value);

    if (this.registerForm.valid) {
      if (this.register.password != this.register.repeatPassword) {
        this.helper.presentToast(
          "Repeated password does not match the password.",
          "error"
        );
      } else {
      
        this.loader = this.loadingCtrl.create({
          content: "Please wait..."
        });

        this.loader.present();

        if (this.registerForm.value.dob) {

          this.register.dateofbirth = this.registerForm.value.dob.split('-')[1]+"/"+this.registerForm.value.dob.split('-')[2]+'/'+this.registerForm.value.dob.split('-')[0]
          this.register.dob = new Date(this.register.dateofbirth);

        } else {
          this.register.dob = "";
        }

        this.register.username = this.registerForm.value.username;
        this.register.password = this.registerForm.value.password;
        this.register.repeatPassword = this.registerForm.value.repeatPassword;
        this.register.email = this.registerForm.value.email;

        this.register.lat = serverDetails.lat;
        this.register.lon = serverDetails.lon;


        console.log(this.register);

        this.webServices.post(this.register, "user/create").subscribe(
          getData => {
            this.loader.dismiss();

            console.log(getData);

            if (getData.status == "ERR" && getData.errorCode == "user-exists") {
              let msg =
                "The user name " +
                this.register.username +
                " is already registered. Please try another user name.";
              this.helper.presentToast(msg, "error");
            } else {
              console.log("login====");
              this.loginDo();
            }
          },
          err => {
            this.loader.dismiss();
            console.log(err.statusText);
            this.helper.presentToast(err, "error");
          }
        );
      }
    } else {
      console.log(this.registerForm.controls["username"]);

      if (this.registerForm.controls["username"].hasError("required")) {
        this.helper.presentToast(" You must include a username.", "error");
      } else if (this.registerForm.controls["username"].hasError("maxlength")) {
        this.helper.presentToast(
          "Your last name cannot exceed 30 characters.",
          "error"
        );
      } else if (this.registerForm.controls["email"].errors) {
        this.helper.presentToast(" email.", "error");
      } else if (this.registerForm.controls["password"].hasError("required")) {
        this.helper.presentToast(" You must include a password.", "error");
      }

      // else if(this.registerForm.controls['password'].errors){

      //    console.log('password');

      // }else if(this.registerForm.controls['repeatPassword'].errors){

      //    console.log('repeatPassword');
      // }
    }
  }

  loginDo() {
    (this.login.grant_type = "password"), (this.login.scope =
      "read write"), (this.login.client_id = serverDetails.clientId);
    this.login.username = this.register.username;
    this.login.password = this.register.password;

    console.log(this.login);

    this.webServices.post(this.login, "oauth/token").subscribe(
      getData => {
        this.loader.dismiss();
        console.log(getData);
        this.userData.login(getData);
        this.getProfile();
        //this.navCtrl.setRoot(MynetworkfeedPage);
      },
      err => {
        this.loader.dismiss();
        console.log(err.statusText);
        this.helper.presentToast(err, "error");
      }
    );
  }

  getProfile() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });

    loader.present();

    this.webServices.get("user/get/username/" + this.login.username).subscribe(
      profileData => {
        loader.dismiss();
        console.log(profileData.user);
        this.userData.profileUpdate(profileData.user);
        this.navCtrl.setRoot(MynetworkfeedPage);
      },
      err => {
        loader.dismiss();
        console.log(err.statusText);
        this.helper.presentToast(err, "error");
      }
    );
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

  signin() {
    this.navCtrl.push(LoginPage);
  }
}

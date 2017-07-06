import { Component } from "@angular/core";
import { NavController, NavParams, LoadingController } from "ionic-angular";
import { Helper } from "../../providers/helper";
import { WebServices } from "../../providers/webservices";
/*
  Generated class for the Notification page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "page-notification",
  templateUrl: "notification.html"
})
export class NotificationPage {
  loader: any;
  isloading: boolean = true;
  hasMoreData: boolean = true;
  notificationList: any = [];
  infiniteScroll: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public helper: Helper,
    public loadingCtrl: LoadingController
  ) {}
  current: { page?: number; size?: number } = {};

  ionViewDidLoad() {
    console.log("ionViewDidLoad NotificationPage");

    this.current.page = 0;
    this.current.size = 15;

    this.getNotficationList();
  }

  getNotficationList() {
    this.isloading = true;
    this.webServices
      .get(
        "notification/all?page=" +
          this.current.page +
          "&size=" +
          this.current.size
      )
      .subscribe(
        getData => {
          this.isloading = false;

          if (getData.data) {
            this.notificationList = this.notificationList.concat(getData.data);
            console.log(this.notificationList);
          } else {
            this.hasMoreData = false;
            // this.readMessage();
          }

          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        },
        err => {
          this.isloading = false;
          this.helper.presentToast(err, "error");

          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        }
      );
  }

  ionViewCanLeave() {
    this.readMessage();
  }

  readMessage() {
    console.log("inininn");
    let data = {};
    this.webServices.post(data, "notification/all/read").subscribe(getData => {
      console.log(getData);
    });
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.current.page = this.current.page + 1;
    this.getNotficationList();
  }
}

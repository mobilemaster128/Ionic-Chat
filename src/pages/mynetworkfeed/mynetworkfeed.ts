import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  ActionSheetController,
  ModalController
} from "ionic-angular";
import { UserdayPage } from "../../pages/userday/userday";
import { Helper } from "../../providers/helper";
import { WebServices } from "../../providers/webservices";
import { UserData } from "../../providers/user-data";
import { serverDetails } from "../../providers/config";
import { ProfilePage } from "../../pages/profile/profile";
/*
  Generated class for the Mynetworkfeed page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "page-mynetworkfeed",
  templateUrl: "mynetworkfeed.html"
})
export class MynetworkfeedPage {
  activeTab: string = "listview";
  networkFeedList: any = [];
  isloading: boolean = false;
  tempnetworkFeedList: any = [];
  activeMenu: any;
  hasMoreData: boolean = true;
  infiniteScroll: any;
  selectedActivities: number;
  pushPage: any;
  time: any;
  notificationCount: number = 0;
  threadList: any = {};
  isFilter: boolean = false;
  type:string="mynetworkfeed";
  current: { page?: number; size?: number } = {};
  currentUser: {
    id?: any;
    username?: any;
    followers?: any;
    follows?: any;
  } = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetCtrl: ActionSheetController,
    public webServices: WebServices,
    public helper: Helper,
    public userData: UserData,
    public modalCtrl: ModalController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad MynetworkfeedPage");
    this.currentUser = this.userData.getUserProfileData();
    this.current.page = 0;
    this.current.size = 30;
    this.activeMenu = "ALL";
    this.pushPage = ProfilePage;
    this.selectedActivities = 0;
    this.getNetworkFeed(true);
    this.time = serverDetails.time;

    console.log('this.time==='+this.time);
  }
  
  getNetworkFeed(Isstatus) {
    if (Isstatus) {
      this.isloading = true;
    }
    if (this.infiniteScroll && Isstatus) {
      this.infiniteScroll.complete();
    }
    this.webServices
      .get(
        "user/networkfeed?page=" +
          this.current.page +
          "&size=" +
          this.current.size
      )
      .subscribe(
        getData => {
          this.isloading = false;
          if (getData.data) {
            if (Isstatus) {
              this.networkFeedList = [];
            }
            for (var activity of getData.data) {
              activity["selected"] = false;
              this.networkFeedList.push(activity);
            }
            this.setActive(this.activeMenu);
          } else {
            this.hasMoreData = false;
          }
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
          console.log(this.networkFeedList);
        },
        err => {
          console.log(err.statusText);
          this.helper.presentToast(err, "error");
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        }
      );
  }

  selectActivity(activity) {
    var index = this.networkFeedList.indexOf(activity);
    this.networkFeedList[index]["selected"] = true;
    this.selectedActivities++;
  }

  unSelectActivity(activity) {
    var index = this.networkFeedList.indexOf(activity);
    this.networkFeedList[index]["selected"] = false;
    if (this.selectedActivities > 0) {
      this.selectedActivities--;
    }
  }

  deleteFeed(value) {
    let activedata = value.data;
    for (let data in this.networkFeedList) {
      for (let subdata in this.networkFeedList[data].data) {
        if (this.networkFeedList[data].data[subdata].id == activedata.id) {
          this.networkFeedList[data].data.splice(subdata, 1);
        }
      }
      if (this.networkFeedList[data].data.length == 0) {
        this.networkFeedList.splice(data, 1);
        if (
          this.networkFeedList[data]["selected"] == true &&
          this.selectedActivities > 0
        ) {
          this.selectedActivities--;
        }
      }
    }
    this.setActive(this.activeMenu);
  }

  setActive(menu) {
    this.activeMenu = menu;
    this.tempnetworkFeedList = [];

    if (this.activeMenu != "ALL") {
      for (let data in this.networkFeedList) {
        if (this.isFilter == true) {
          if (this.networkFeedList[data]["selected"] == false) {
            continue;
          }
        }
        let count = 0;
        for (let subdata in this.networkFeedList[data].data) {
          if (
            this.networkFeedList[data].data[subdata].type == this.activeMenu
          ) {
            if (count == 0) {
              let pushdata = {
                data: [],
                userId: this.networkFeedList[data].userId,
                day: this.networkFeedList[data].day,
                username: this.networkFeedList[data].username
              };
              this.tempnetworkFeedList.push(pushdata);
            }
            count = count + 1;
            this.tempnetworkFeedList[
              this.tempnetworkFeedList.length - 1
            ].data.push(this.networkFeedList[data].data[subdata]);
          }
        }
      }
    } else if (this.isFilter == true) {
      for (let data in this.networkFeedList) {
        if (this.networkFeedList[data]["selected"] == true) {
          this.tempnetworkFeedList.push(this.networkFeedList[data]);
        }
      }
    } else {
      this.tempnetworkFeedList = this.networkFeedList;
    }
    console.log(this.tempnetworkFeedList);
  }

  listView() {
    console.log(this.networkFeedList);
    this.tempnetworkFeedList = this.networkFeedList;
  }

  feedView() {
    if (this.selectedActivities <= 0) {
      this.isFilter = false;
    }
    this.setActive(this.activeMenu);
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.current.page = this.current.page + 1;

    this.getNetworkFeed(false);
  }

  openuserday() {
    this.navCtrl.push(UserdayPage);
  }

  onHold(activity) {
    console.log(activity);
  }

  filterActivity() {
    this.isFilter = true;
    this.activeTab = "feedview";
    this.setActive(this.activeMenu);
  }
}

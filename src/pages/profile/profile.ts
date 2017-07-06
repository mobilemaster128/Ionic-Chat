import { Component, ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { NavController, NavParams, LoadingController, ActionSheetController, ModalController,Events } from 'ionic-angular';
import { SettingsPage } from '../../pages/settings/settings';
import { FollowComponent } from '../../components/follow/follow';
import { UnfollowComponent } from '../../components/unfollow/unfollow';
import { MessagePage } from '../../pages/message/message';
import { FirebaseChatPage } from '../../pages/firebasechat/firebasechat';
import { FirebaseService } from '../../providers/firebase/firebase.service';
import { Helper } from '../../providers/helper';
import { WebServices } from '../../providers/webservices';
import { UserData } from '../../providers/user-data';
import { serverDetails } from '../../providers/config';

/*
  Generated class for the Profile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  @ViewChild(Content) content: Content;
  activityFeedList: any = [];
  tempactivityFeedList: any = [];
  loader: any;
  currentId: any;
  IsMyprofile: boolean = false;
  activeMenu: any = [];
  isloading: boolean = true;
  hasMoreData: boolean = true;
  userFollow: number = 0;
  infiniteScroll: any;
  imageData: any;
  current: { page?: number, size?: number } = {};
  currentUser: { picture?: any, id?: any, username?: any, followers?: any, follows?: any } = {};
  activeTitle: String;
  myID: number;
  time:any;
  type:string = 'profile';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public firebase: FirebaseService,
    public helper: Helper,
    public userData: UserData,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public events:Events
  ) {
  }

  ionViewDidLoad() {

    this.activeMenu = 'ALL';
    this.currentId = this.navParams.get('id');
    this.current.page = 0;
    this.current.size = 10;
    this.time =serverDetails.time;
    this.myID = this.userData.getUserProfileData().id;
    
    if (this.currentId == this.myID) {

      this.IsMyprofile = true;
      this.currentUser = this.userData.getUserProfileData();
      this.getcurrentForUser();

    } else {
      //this.currentUser =null;
      this.IsMyprofile = false;
      this.getcurrentForUser();
    }

    this.content.ionScroll.subscribe(($event: any) => {
      //console.log($event);
      if ($event.scrollTop < 100) {
        //this.activeTitle = ''
      } else {
        //this.activeTitle = this.currentUser.username;
      }
    });
  }

  openChat() {
    console.log('currentuserid' + this.currentId)
    this.firebase.checkThread(this.myID, this.currentId).then(id => {
      //console.log(result);
      this.navCtrl.push(FirebaseChatPage, { threadID: id, fromProfile: true });
    }, err => {
      this.helper.presentToast('Thread Error', err);
    })
  }

  openMessage() {
    this.navCtrl.push(MessagePage);
  }

  deleteFeed(value) {
    let data;
    let subdata;
    let activedata;

    activedata = value.data;
    for (data in this.activityFeedList) {
      for (subdata in this.activityFeedList[data].data) {
        if (this.activityFeedList[data].data[subdata].id == activedata.id) {
          this.activityFeedList[data].data.splice(subdata, 1);
        }
      }

      if (this.activityFeedList[data].data.length == 0) {
        this.activityFeedList.splice(data, 1);
      }
    }
    this.setActive(this.activeMenu);
  }

  setActive(menu) {
    this.activeMenu = menu;
    this.tempactivityFeedList = [];

    if (this.activeMenu != 'ALL') {
      let data;
      let subdata;
      for (data in this.activityFeedList) {
        let count = 0;
        for (subdata in this.activityFeedList[data].data) {
          if (this.activityFeedList[data].data[subdata].type == this.activeMenu) {
            if (count == 0) {
              let pushdata = {
                data: [],
                day: this.activityFeedList[data].day
              }
              this.tempactivityFeedList.push(pushdata);
            }
            count = count + 1;
            this.tempactivityFeedList[this.tempactivityFeedList.length - 1].data.push(this.activityFeedList[data].data[subdata]);
          }
        }
      }
    } else {
      this.tempactivityFeedList = this.activityFeedList;
    }
  }

  opensettings() {
    this.navCtrl.push(SettingsPage);
  }

  doInfinite(infiniteScroll) {
    this.infiniteScroll = infiniteScroll;
    this.current.page = this.current.page + 1;

    if (this.IsMyprofile) {
      this.getActivityFeed(false);
    } else {
      this.getactivityFeedForUser(false);
    }
  }


  getActivityFeed(Isstatus) {
    if (Isstatus) {
      this.isloading = true;
    }
    if (this.infiniteScroll && Isstatus) {
      this.infiniteScroll.complete();
    }

    this.webServices.get('user/activityfeed?page=' + this.current.page + '&size=' + this.current.size).subscribe(getData => {
      this.isloading = false;
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }

      if (getData.data) {
        if (Isstatus) {
          this.activityFeedList = getData.data;
          this.tempactivityFeedList = getData.data;
        } else {
          this.activityFeedList = this.activityFeedList.concat(getData.data);
          this.tempactivityFeedList = this.tempactivityFeedList.concat(getData.data);
        }
        console.log(this.activityFeedList);
      } else {
        this.hasMoreData = false;
      }
    }, err => {
      console.log(err.statusText);
      this.helper.presentToast(err, 'error');
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
    })
  }

  getactivityFeedForUser(Isstatus) {
    this.isloading = true;
    this.webServices.get('user/activityfeed/userId/' + this.currentId + '?page=' + this.current.page + '&size=' + this.current.size).subscribe(getData => {

      console.log(getData);
      this.isloading = false;
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      if (getData.data) {
        if (Isstatus) {
          this.activityFeedList = getData.data;
          this.tempactivityFeedList = getData.data;
        } else {
          this.activityFeedList = this.activityFeedList.concat(getData.data);
          this.tempactivityFeedList = this.tempactivityFeedList.concat(getData.data);
        }
      } else {
        this.hasMoreData = false;
      }
    }, err => {
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
      console.log(err.statusText);
      this.helper.presentToast(err, 'error');
    })
  }

  getcurrentForUser() {
    this.isloading = true;
    this.webServices.get('user/get/id/' + this.currentId).subscribe(getData => {
      this.currentUser = getData.user;
      console.log(getData.user);
      if (this.IsMyprofile) {

        this.userData.profileUpdate(getData.user);
        this.getActivityFeed(true);
        
      } else {
        this.getactivityFeedForUser(true);
        this.getFollowingUser();
      }
    }, err => {
      this.isloading = false;
      console.log(err.statusText);
      this.helper.presentToast(err, 'error');
    })
  }

  getFollowingUser() {

    this.isloading = true;

    this.webServices.get('user/isFollowing/id/' + this.currentId).subscribe(getData => {

      this.isloading = false;

      if (getData.ok == true) {
        this.userFollow = 2;
      } else {
        this.userFollow = 1;
      }
    }, err => {
      console.log(err.statusText);
    })
  }

  openfollow(type) {
    let followModal = this.modalCtrl.create(FollowComponent, { type: type, id: this.currentId });

    followModal.onDidDismiss(data => {
      if (data) {
      }

      this.updateProfile();
    });
    followModal.present();
  }

  followingUser() {
    
    this.currentUser.followers = Number(this.currentUser.followers) + 1;
    this.userFollow = 2;

    let notificationMsg:any = {};
        notificationMsg.title =  "ionicchat";
        notificationMsg.msg = this.currentUser.username +' started following you';
        notificationMsg.type = 'START_FOLLOW';
        notificationMsg.userid = this.currentUser.id;
                              
    this.helper.sendNotification(this.currentId,notificationMsg);

    this.webServices.put('user/follow/id/' + this.currentId, '').subscribe(getData => {
      //this.loader.dismiss();
      this.updateProfile();
      console.log(getData);
    }, err => {
      console.log(err.statusText);
    })
  }

  unfollowingUser() {
    let unfollowModal = this.modalCtrl.create(UnfollowComponent, { data: this.currentUser });

    unfollowModal.onDidDismiss(data => {
      if (data) {
        console.log('unfollowseruser');
        console.log(data);
        this.userFollow = 1;
        this.currentUser.follows = Number(this.currentUser.follows) - 1;
        if (this.currentUser.follows < 0) {
          this.currentUser.follows = 0;
        }
        this.updateProfile();
      }
    });
    unfollowModal.present();
  }

  updateProfile() {
    this.webServices.get('user/get/id/' + this.currentId).subscribe(getData => {
      this.currentUser = getData.user;
    })
  }

  selectCameraType() {
    if (this.IsMyprofile) {
      this.helper.selectCameraType().then((imageURI) => {
        console.log('camera image=========');
        console.log(imageURI);
        this.imageData = imageURI;
        this.uploadPicture();
      })
    }
  }

  uploadPicture() {

    let loader = this.loadingCtrl.create({
      content: "Please wait...",
    });

    loader.present();

    let params = {};


    this.webServices.uploadImage(this.imageData, 'user/uploadPicture', 'picture', params).then((getData: any) => {
      // success
      console.log(getData);
      loader.dismiss();

      if (getData.response.status == 'ERR') {

      } else {
        let jsondata = JSON.parse(getData.response);
        serverDetails.time = "?time=" + new Date().getMilliseconds();
        this.time =serverDetails.time;
        this.currentUser.picture = jsondata.imageKey;
        this.events.publish('update:profileimage');

      }
    }, (err) => {
      // error
      loader.dismiss();
      this.helper.presentToast('please try again later','error');
      console.log('error');
      console.log(err);
    })
  }
}

import { Component } from '@angular/core';
import { ViewController, NavParams, NavController, ModalController } from 'ionic-angular';
import { Helper } from '../../providers/helper';
import { WebServices } from '../../providers/webservices';
import { UserData } from '../../providers/user-data';
import { ProfilePage } from '../../pages/profile/profile';
import { UnfollowComponent } from '../../components/unfollow/unfollow';
/*
  Generated class for the FollowComponent component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
    selector: 'follow',
    templateUrl: 'follow.html'
})
export class FollowComponent {

    text: string;
    title: string;
    id: any;
    currentUser: { id?: any, username?: any, followers?: any, follows?: any } = {};
    userList: any = [];
    pushPage: any;
    isloading: boolean = true;

    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public webServices: WebServices,
        public helper: Helper,
        public userData: UserData,
        public modalCtrl: ModalController, ) {

        this.id = this.navParams.get('id');
        this.title = this.navParams.get('type');
        this.currentUser = this.userData.getUserProfileData();
        this.pushPage = ProfilePage;
        if (this.title == 'FOLLOWING') {

            this.getFollowingUser();

        } else if (this.title == 'FOLLOWERS') {

            this.getFollowUser();
        }
    }

    closeModal() {
        console.log('close post modal');
        this.viewCtrl.dismiss();
    }


    followUser(data) {

        console.log(data);
        data.isFollowed = true;

  

        let notificationMsg:any = {};
        notificationMsg.title =  "ionicchat";
        notificationMsg.msg = this.currentUser.username +' started following you';
        notificationMsg.type = 'START_FOLLOW';
        notificationMsg.userid = this.currentUser.id;
                              
        this.helper.sendNotification(data.id,notificationMsg);

        this.webServices.put('user/follow/id/' + data.id, '').subscribe(getData => {

            //this.loader.dismiss();

            console.log(getData);

        }, err => {


            console.log(err.statusText);
        })
    }

    unfollowUser(userData) {


        let unfollowModal = this.modalCtrl.create(UnfollowComponent, { data: userData });

        unfollowModal.onDidDismiss(data => {

            if (data) {
                userData.isFollowed = false;
            }
        });

        unfollowModal.present();
    }

    getFollowingUser() {

        this.isloading = true;
        this.webServices.get('user/following/id/' + this.id).subscribe(getData => {

            //this.loader.dismiss();
            this.isloading = false;
            console.log(getData);
            if (getData.status == "OK" && getData.users) {

                this.userList = getData.users;
            }


        }, err => {


            console.log(err.statusText);
        })
    }

    getFollowUser() {

        this.isloading = true;
        this.webServices.get('user/followers/id/' + this.id).subscribe(getData => {

            //this.loader.dismiss();
            this.isloading = false;
            console.log(getData);
            if (getData.status == "OK" && getData.users) {

                this.userList = getData.users;
            }


        }, err => {


            console.log(err.statusText);
        })
    }


}

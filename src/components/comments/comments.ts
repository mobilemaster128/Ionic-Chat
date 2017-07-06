import { Component } from '@angular/core';
import { Helper } from '../../providers/helper';
import { WebServices } from '../../providers/webservices';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';

/*
  Generated class for the CommentsComponent component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/

@Component({
  selector: 'comments',
  templateUrl: 'comments.html'
})

export class CommentsComponent {

  id: number;
  isloading: boolean = true;
  commentList: any = [];
  message: any = [];
  currentUser: { id?: any, username?: any, followers?: any, follows?: any } = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public helper: Helper,
    public userData: UserData,
    public viewCtrl: ViewController, ) { }

  ionViewDidLoad() {

    this.currentUser = this.userData.getUserProfileData();
    this.id = this.navParams.get('id');
    this.getComments();
  }

  closeModal() {

    this.viewCtrl.dismiss({ totalcomments: this.commentList.length });
  }

  getComments() {

    this.isloading = true;
    this.webServices.get('/comments/get/' + this.id).subscribe(getData => {

      console.log(getData);
      this.isloading = false;

      if (getData.status == "OK") {

        this.commentList = getData.comments;
        console.log(this.commentList);
      }

    }, err => {

      this.isloading = false;
      console.log(err.statusText);
      this.helper.presentToast(err, 'error');
    })

  }

  onSendMsg(value) {

    console.log(this.message);

    if (this.message.length > 0) {


      let data = {
        activityId: this.id,
        comment: this.message
      }

      this.webServices.put('/comments/add/', data).subscribe(getData => {

        this.message = "";

        if (getData.comment) {

          this.commentList.push(getData.comment);
        }

        console.log(getData);

      }, err => {


        console.log(err.statusText);
      })
    }

  }

}

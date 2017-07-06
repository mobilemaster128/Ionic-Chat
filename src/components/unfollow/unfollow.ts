import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { WebServices } from '../../providers/webservices';
import { serverDetails } from '../../providers/config';
import { ProfilePage } from '../../pages/profile/profile';
/**
 * Generated class for the UnfollowComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'unfollow',
  templateUrl: 'unfollow.html'
})
export class UnfollowComponent {

  text: string;
  imageUrl: string;
  pushPage: any;
  currentUser: { id?: any, username?: any } = {};
  constructor(public navParams: NavParams, public viewCtrl: ViewController, public webServices: WebServices) {

    this.text = 'Hello World';
    this.currentUser = this.navParams.get('data');
    this.pushPage = ProfilePage;
    this.imageUrl = serverDetails.imageUrl;

    console.log(this.navParams.get('data'));

  }

  closeModal() {

    console.log('close post modal');
    this.viewCtrl.dismiss();
  }

  unfollowUser() {

    this.webServices.delete('user/unfollow/id/' + this.currentUser.id).subscribe(getData => {

      //this.loader.dismiss();
      console.log('unfollow==========');
      console.log(getData);

    }, err => {


      console.log(err.statusText);
    })

    let data = { id: this.currentUser.id }

    this.viewCtrl.dismiss({ data: data });
  }


}

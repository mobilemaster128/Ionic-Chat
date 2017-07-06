import { Component, Input } from '@angular/core';
import { serverDetails } from '../../providers/config';
import { ProfilePage } from '../../pages/profile/profile';

/**
 * Generated class for the ProfilePictureComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'profile-picture',
  templateUrl: 'profile-picture.html'
})
export class ProfilePictureComponent {

  imageUrl: string;
  pushPage: any;
  time:any;

  @Input() activity;
  @Input() currentUser;
  @Input() index;

  constructor() {
    console.log('Hello ProfilePictureComponent Component');
    this.pushPage = ProfilePage;
    this.imageUrl = serverDetails.imageUrl;
    this.time =serverDetails.time;
  }

}

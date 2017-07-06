import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

/**
 * Generated class for the LockComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'lock',
  templateUrl: 'lock.html'
})
export class LockComponent {

  text: string;

  constructor(public viewCtrl: ViewController) {
    console.log('Hello LockComponent Component');
    this.text = 'Hello World';
  }

  unlock() {
    this.viewCtrl.dismiss();
  }

}

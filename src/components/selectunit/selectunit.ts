import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

/*
  Generated class for the Selectunit component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'selectunit',
  templateUrl: 'selectunit.html'
})
export class SelectunitComponent {

  text: string;

  constructor(public viewCtrl: ViewController) {
    console.log('Hello Selectunit Component');
    this.text = 'Hello World';
  }

  closeselectunit() {
    console.log('close post modal');
    this.viewCtrl.dismiss();
  }

}

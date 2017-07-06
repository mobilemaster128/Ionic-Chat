import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the OptionalmodalComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'optionalmodal',
  templateUrl: 'optionalmodal.html'
})

export class OptionalmodalComponent {

  	data:any;
  	type:any;

  	constructor(public viewCtrl: ViewController,public navParams: NavParams) {

	    this.data = this.navParams.get('data');
	   
  	}

  	selectType(data) {

        this.viewCtrl.dismiss({ data: data });
    }

}

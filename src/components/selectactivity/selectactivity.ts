import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { AddcustomPage } from '../../pages/addcustom/addcustom';
import { WebServices } from '../../providers/webservices';
/*
  Generated class for the Selectactivity page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'selectactivity',
  templateUrl: 'selectactivity.html'
})
export class SelectactivityComponent {
  activeTab: string = 'custom';
  querySearchList: any = [];
  queryInput: string = '';
  isloading: boolean = false;
  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public webServices: WebServices) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectactivityPage');
  }



  onInput(event) {

    console.log(this.queryInput);

    if (this.queryInput.length > 1) {

      this.isloading = true;
      let filterQ = '{ "$or": [ { "Name": {"$regex":"(?i)^' + this.queryInput + '.*"} }, { "MainMuscleWorked": {"$regex":"(?i)^' + this.queryInput + '.*"} } ] }';
      console.log(filterQ);

      this.webServices.mongoGet('workoutsData', filterQ).subscribe(getData => {

        this.querySearchList = getData;
        this.isloading = false;
        console.log(getData);

      }, err => {


        console.log(err.statusText);
      })


    } else {

      this.querySearchList = [];
    }
  }

  selectActivityType(data) {

    console.log(data);
    this.viewCtrl.dismiss({ data: data });
  }

  closeModal() {

    this.viewCtrl.dismiss();
  }

  onCancel(event) {

    console.log('usersearchlist');
    this.querySearchList = [];
  }

  shouldShowCancel() {

    console.log('shouldShowCancel');
    this.querySearchList = [];
  }


  openaddcustom() {

    this.navCtrl.push(AddcustomPage);

  }

}

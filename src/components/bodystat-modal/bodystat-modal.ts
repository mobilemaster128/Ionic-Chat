import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/*
  Generated class for the BodystatModal component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
    selector: 'bodystat-modal',
    templateUrl: 'bodystat-modal.html'
})
export class BodystatModalComponent {

    text: string;
    type: string;
    title: string;
    servSizes: any = [];
    bodyStats: any = [];
    mTypes: any = [];
    selectModal: any = [];
    bodyTypes: any = [];
    targetMuscle: any = [];

    constructor(public viewCtrl: ViewController, public navParams: NavParams) {

        this.type = this.navParams.get('type');

        this.servSizes = [
            { name: "100 g", id: "1" },
            { name: "1 ounce (28g)", id: "2" },
            { name: "1 cup (159g)", id: "3" }
        ];

        this.bodyStats = [
            { name: "Shoulders", id: "1" },
            { name: "Chest", id: "2" },
            { name: "Biceps", id: "3" },
            { name: "Neck", id: "4" },
            { name: "Forearm", id: "5" },
            { name: "Waist", id: "6" },
            { name: "Quads", id: "7" },
            { name: "Calves", id: "8" },
            { name: "Glutes", id: "9" },
            { name: "Height", id: "10" }
        ];

        //Body stat measurement types
        this.mTypes = [
            { name: "Inches", id: "1" },
            { name: "Centimeters", id: "2" },
            { name: "Pounds", id: "3" },
            { name: "Kg", id: "4" },
            { name: "% - Body Fat ", id: "5" },
            { name: "Feet- Height", id: "6" },
        ];

        //Head, Neck, Back, Leg
        this.bodyTypes = [
            { name: "Head", id: "1" },
            { name: "Neck", id: "2" },
            { name: "Back", id: "3" },
            { name: "Leg", id: "4" }
        ];

        this.targetMuscle = [
            { name: "Neck", id: "1" },
            { name: "Traps", id: "1" },
            { name: "Shoulders", id: "1" },
            { name: "Chest", id: "1" },
            { name: "Biceps", id: "1" },
            { name: "Forearm", id: "1" },
            { name: "Abs", id: "1" },
            { name: "Quads", id: "1" },
            { name: "Calves", id: "1" },
            { name: "Traps", id: "1" },
            { name: "Lats", id: "1" },
            { name: "Triceps", id: "1" },
            { name: "Middle Back", id: "1" },
            { name: "Lower Back", id: "1" },
            { name: "Glutes", id: "1" },
            { name: "Quads", id: "1" },
            { name: "Hamstrings", id: "1" }
        ];


        if (this.type == 'bodystats') {

            this.title = 'Select Body Stat';
            this.selectModal = this.bodyStats;

        } else if (this.type == 'selectunit') {

            this.title = 'Select Units';
            this.selectModal = this.mTypes;

        } else if (this.type == 'loginjury') {

            this.title = 'Log Injury';
            this.selectModal = this.bodyTypes;

        } else if (this.type == 'targetmuscle') {

            this.title = 'Targeted Muscle';
            this.selectModal = this.targetMuscle;

        }

        console.log(this.selectModal);

    }

    closebodystat() {
        console.log('close post modal');
        this.viewCtrl.dismiss();


    }

    selectType(data) {


        this.viewCtrl.dismiss({ data: data });
    }



}

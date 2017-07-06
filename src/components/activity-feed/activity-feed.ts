import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActionSheetController, NavController, ModalController,Events } from 'ionic-angular';
import { Helper } from '../../providers/helper';
import { WebServices } from '../../providers/webservices';
import { UserData } from '../../providers/user-data';
import { ReportPage } from '../../pages/report/report';
import { CommentsComponent } from '../../components/comments/comments';
import { serverDetails } from '../../providers/config';
import { ProfilePage } from '../../pages/profile/profile';

/**
 * Generated class for the ActivityFeedComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'activity-feed',
  templateUrl: 'activity-feed.html'
})
export class ActivityFeedComponent {

  text: string;
  shownGroup: any;
  imageUrl: any;
  pushPage: any;
  time:any;
  traningVolume:number=0;

  workoutChart: any;
  workoutChartLabels: string[] = [];
  workoutChartData: number[] = [];
  workoutColors: Array<any> = [{ backgroundColor: ['#076429', '#0fe55f', '#098938', '#0ed257'] }]
  workoutChartType: string = 'doughnut';

  nutritionChart: any;
  nutritionChartLabels: string[] = [];
  nutritionChartData: number[] = [];
  nutritionColors: Array<any> = [{ backgroundColor: ['#076429', '#0fe55f', '#098938', '#0ed257'] }]
  nutritionChartType: string = 'doughnut';


  @Input() activity;
  @Input() currentUser;
  @Input() index;
  @Input() type;
  @Output() deleteEvent = new EventEmitter();

  constructor(
    public webServices: WebServices,
    public helper: Helper,
    public userData: UserData,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public events:Events) {

    this.pushPage = ProfilePage;
    this.imageUrl = serverDetails.imageUrl;
    this.time = serverDetails.time;

    //console.log("activity icon list==",this.activity)
    this.events.subscribe("update:profileimage", () => {

      console.log('activity event one');
      this.time = serverDetails.time;
    })
    
  }

  toggleGroup(group, activity) {

    if (this.isGroupShown(group)) {

      this.shownGroup = null;

    } else {

      this.workoutChartLabels = [];
      this.workoutChartData = [];
      
      this.nutritionChartLabels =[];
      this.nutritionChartData =[];
      this.traningVolume = 0;
      
      for (let data in activity.data) {

        if (activity.data[data].scope == 'WORKOUT') {


          let index = this.workoutChartLabels.indexOf(activity.data[data].muscleGroup);
          this.traningVolume = this.traningVolume+(Number(activity.data[data].reps)*Number(activity.data[data].sets)*Number(activity.data[data].weight));

          console.log('this.traningVolume'+this.traningVolume);
          if (index == -1) {


            this.workoutChartLabels.push(activity.data[data].muscleGroup);
            this.workoutChartData.push(1);

          } else {

            this.workoutChartData[index] = Number(this.workoutChartData[index]) + 1;
          }

        }

        if (activity.data[data].scope == 'NUTRITION') {

          console.log(activity.data[data]);
          let index = this.nutritionChartLabels.indexOf(activity.data[data].carbs.amount);

          if (index == -1) {

            this.nutritionChartLabels.push("Carbs");
            this.nutritionChartData.push(activity.data[data].carbs.amount);

          } else {

            this.nutritionChartData[index] = Number(this.nutritionChartData[index]) + 1;
          }

        }

      }

      if (this.workoutChartData.length > 0 || this.nutritionChartData.length > 0) {

        this.shownGroup = group;

      } else {

        this.shownGroup = null;
      }


    }
  }

  isGroupShown(group) {

    return this.shownGroup === group;
  }

  presentActionSheet(data) {

    console.log(data);

    if (data.userId == this.currentUser.id) {

      let actionSheet = this.actionSheetCtrl.create({
        title: '',
        buttons: [
          {
            icon: 'trash',
            text: 'Delete',
            role: 'destructive',
            handler: () => {
              console.log('Destructive clicked');
              this.deleteActivity(data);
            }
          },
          {
            icon: 'warning',
            text: 'Report',
            role: 'destructive',
            handler: () => {
              console.log('Destructive clicked');
              this.navCtrl.push(ReportPage, { id: data.id });
            }
          }
        ]
      });

      actionSheet.present();

    } else {

      let actionSheet = this.actionSheetCtrl.create({
        title: '',
        buttons: [
          {
            icon: 'warning',
            text: 'Report',
            role: 'destructive',
            handler: () => {
              this.navCtrl.push(ReportPage, { id: data.id });
            }
          }
        ]
      });

      actionSheet.present();
    }

  }


  deleteActivity(activedata) {

    console.log(activedata);

    this.webServices.delete('/deleteactivity/' + activedata.id).subscribe(getData => {

      console.log(getData);
    })

    this.deleteEvent.next({ data: activedata });
  }

  like(data) {

    console.log(data);

    if (data.isLiked) {

      data.likes = data.likes - 1;
      data.isLiked = false;

      this.webServices.delete('unlike/' + data.id).subscribe(getData => {

        console.log(getData);
      })


    } else {

      data.likes = data.likes + 1;
      data.isLiked = true;

      let notificationMsg:any = {};
      notificationMsg.title =  "ionicchat";
      notificationMsg.msg = this.currentUser.username +' liked your post';
      notificationMsg.type = 'LIKE';
      notificationMsg.userid = this.currentUser.id;
      notificationMsg.likeid = data.id;
                              
      this.helper.sendNotification(data.userId,notificationMsg);

      this.webServices.put('like/' + data.id, '').subscribe(getData => {

        console.log(getData);
      })
    }

    //data.likes = data.likes+1;
  }


  opencomments(data) {

    console.log(data);

    let selectComments = data;

    let modal = this.modalCtrl.create(CommentsComponent, { id: data.id });
    modal.onDidDismiss(data => {

      if (data) {
        console.log(data.totalcomments);
        selectComments.comments = data.totalcomments;
        console.log(selectComments);
      }

    });

    modal.present();


  }


  public chartClicked(e: any): void {
    //console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }



}

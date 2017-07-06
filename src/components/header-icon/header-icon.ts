import { Component ,Input ,Output,EventEmitter} from "@angular/core";
import { NavController } from "ionic-angular";
import { NotificationPage } from "../../pages/notification/notification";
import { MessagePage } from "../../pages/message/message";
import { WebServices } from "../../providers/webservices";
import { FirebaseService } from "../../providers/firebase/firebase.service";
import { UserData } from "../../providers/user-data";

/**
 * Generated class for the HeaderIconComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: "header-icon",
  templateUrl: "header-icon.html"
})
export class HeaderIconComponent {
  text: string;
  notificationCount: number = 0;
  messageCount: number = 0;

  @Input() activeTab;
  @Output() settingsEvent = new EventEmitter();

  constructor(
    public navCtrl: NavController,
    public webServices: WebServices,
    public firebase: FirebaseService,
    public userData: UserData
  ) {
    console.log("Hello HeaderIconComponent Component");

    this.userData.getNotificationCount().then(data => {
      if (data) {
        this.notificationCount = data;
      }
    });

    this.getNotificationCount();
  }

  getNotificationCount() {
    this.webServices.get("/notification/unread/count").subscribe(
      getData => {
        if (getData.status == "OK") {
          this.notificationCount = getData.count;
          this.userData.setNotificationCount(this.notificationCount);
        }
      },
      err => {}
    );
  }

  openNotification() {
    this.notificationCount = 0;
    this.userData.setNotificationCount(this.notificationCount);
    this.navCtrl.push(NotificationPage);
  }

  opendiscoverysettings(){

    this.settingsEvent.next();
  }

  openMessage() {
    this.navCtrl.push(MessagePage);
  }
}

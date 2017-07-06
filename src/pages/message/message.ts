import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { Events } from "ionic-angular";
import { AlertController } from "ionic-angular";
import { FirebaseChatPage } from "../../pages/firebasechat/firebasechat";
import { Helper } from "../../providers/helper";
import { serverDetails } from "../../providers/config";
import { FirebaseService } from "../../providers/firebase/firebase.service";
import { WebServices } from "../../providers/webservices";
import { UserData } from "../../providers/user-data";
import { ProfilePage } from "../../pages/profile/profile";

/*
  Generated class for the Message page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "page-message",
  templateUrl: "message.html"
})
export class MessagePage {
  userInput: string = "";
  userSearchList: any = [];
  isloading: boolean = true;
  selectedUsers: any = [];
  imageUrl: string;
  isCreating: boolean = false;
  title: string = "All Chats";
  messageList: any = [];
  pushPage: any;
  time: any;
  infiniteScroll: any;
  activeThread: string = "";
  hasMoreData: boolean = false;
  hasMoreUser: boolean = true;
  current: { page?: number; size?: number } = {};
  cursorUser: { page?: number; size?: number } = {};
  currentUser: {
    id?: any;
    username?: any;
    followers?: any;
    follows?: any;
  } = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public helper: Helper,
    public userData: UserData,
    public firebase: FirebaseService,
    public events: Events,
    public alertCtrl: AlertController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad MessagePage");
    this.current.page = 0;
    this.current.size = 8;
    this.cursorUser.page = 0;
    this.cursorUser.size = 15;
    this.imageUrl = serverDetails.imageUrl;
    console.log("serverDetails.imageUrl====" + this.imageUrl);
    this.pushPage = ProfilePage;
    this.currentUser = this.userData.getUserProfileData();
    this.getThreads();
    this.time = "?time=" + new Date().getMilliseconds();
    this.events.subscribe("chat:unloaded", deleted => {
      console.log("chat unload");
      console.log(this.activeThread);
      this.time = "?time=" + new Date().getMilliseconds();
      if (!deleted && this.activeThread) {
        for (let index in this.messageList) {
          //console.log(threads[index]);
          if (this.messageList[index].id == this.activeThread) {
            this.messageList[index].unread = 0;
            this.messageList[index].unreadMsg = null;
            this.watchUnread(this.activeThread);
            this.watchThread(this.activeThread);
            break;
          }
        }
        this.activeThread = null;
      }
    });
  }

  ionViewWillUnload() {
    console.log("ionViewDidUnload MessagePage");
    let threadsRef = this.firebase.database.ref("/threads");
    threadsRef.off();
    for (let thread of this.messageList) {
      threadsRef.child(thread.id).off();
      this.firebase.database.ref("/chats/" + thread.id).off();
    }
    this.firebase.getThreads();
    this.events.unsubscribe("chat:unloaded");
  }

  getThreads() {
    this.firebase.removeThreads();
    this.messageList = [];
    var threadsRef = this.firebase.database.ref("/threads");
    threadsRef.on("child_added", snapshot => {
      this.isloading = false;
      let thread = snapshot.val();
      console.log(thread);
      if (thread.participants.indexOf(this.currentUser.id) >= 0) {
        thread.unread = 0;
        this.messageList.push(thread);
        this.sortThreads();
        this.watchThread(thread.id);
        this.watchUnread(thread.id);
      }
    });
    setTimeout(() => {
      this.isloading = false;
    }, 2000);
  }

  watchThread(id) {
    let threadRef = this.firebase.database.ref("/threads");
    threadRef.child(id).once("child_removed", snapshot => {
      threadRef.child(id).off();
      for (let index in this.messageList) {
        if (this.messageList[index].id == id) {
          this.firebase.database.ref("/chats/" + id).off();
          this.messageList.splice(index, 1);
          break;
        }
      }
    });

    threadRef.child(id).on("child_changed", snapshot => {
      for (let index in this.messageList) {
        if (this.messageList[index].id == id) {
          switch (snapshot.key) {
            case "name":
              this.messageList[index].name = snapshot.val();
              break;
            case "lastmsg":
              this.messageList[index].lastmsg = snapshot.val();
              break;
            case "lastseen":
              this.messageList[index].lastseen = snapshot.val();
              this.sortThreads();
              break;
          }
          break;
        }
      }
    });
  }

  watchUnread(id) {
    var chatsRef = this.firebase.database.ref("/chats/" + id);
    chatsRef
      .orderByChild("read/" + this.currentUser.id)
      .equalTo(false)
      .on("child_added", snapshot => {
        //console.log("add" + snapshot.val());
        let message = snapshot.val();
        for (let index in this.messageList) {
          if (this.messageList[index].id == id) {
            this.messageList[index].unread++;
            if (this.messageList[index].unreadMsg == null) {
              this.messageList[index].unreadMsg = message.type == "text"
                ? message.message
                : "Sent Image";
            }
          }
        }
      });
  }

  sortThreads() {
    this.messageList.sort((a: any, b: any) => {
      return a.lastseen.toString().toLowerCase() >
        b.lastseen.toString().toLowerCase()
        ? -1
        : 1;
    });
  }

  clickUser(user) {
    //console.log(user);
    var index = this.userSearchList.indexOf(user);
    //console.log(index);
    if (index >= 0) {
      if (this.userSearchList[index]["selected"] == false) {
        this.userSearchList[index]["selected"] = true;
        this.selectedUsers.push(user.id);
      } else {
        this.userSearchList[index]["selected"] = false;
        index = this.selectedUsers.indexOf(user.id);
        if (index >= 0) {
          this.selectedUsers.splice(index, 1);
        }
      }
    }
  }

  findUser(id) {
    if (this.userSearchList.length > 0) {
      var index = 0;
      for (let user of this.userSearchList) {
        if (user.id == id) {
          return index;
        }
        index++;
      }
      if (index == this.userSearchList.length) {
        return -1;
      }
    } else {
      return -1;
    }
  }

  unSelectUser(user) {
    //console.log(user);
    var index = this.selectedUsers.indexOf(user);
    this.selectedUsers.splice(index, 1);
    index = this.findUser(user);
    if (index >= 0) {
      this.userSearchList[index]["selected"] = false;
    }
  }

  createNewChat() {
    this.userSearchList = [];
    this.selectedUsers = [];
    this.isCreating = true;
    this.title = "New Chat";
    this.userInput = "";
    this.onCancel("");
  }

  onInput(event) {
    this.cursorUser.page = 0;
    this.hasMoreUser = true;
    this.userSearchList = [];
    this.getUsers();
  }

  onCancel(event) {
    this.cursorUser.page = 0;
    this.hasMoreUser = true;
    this.userSearchList = [];
    this.getUsers();
  }

  getUsers() {
    this.isloading = true;
    var url: string;
    console.log("getuser");
    if (this.userInput != "") {
      url =
        "user/search/username?page=" +
        this.cursorUser.page +
        "&size=" +
        this.cursorUser.size +
        "&username=" +
        this.userInput;
    } else {
      url =
        "user/search/all?page=" +
        this.cursorUser.page +
        "&size=" +
        this.cursorUser.size;
    }
    this.webServices.get(url).subscribe(
      getData => {
        this.isloading = false;
        console.log(getData);
        if (getData.status == "OK") {
          if (getData.data && getData.data.length > 0) {
            for (var user of getData.data) {
              if (
                this.selectedUsers.length > 0 &&
                this.selectedUsers.indexOf(user.id) >= 0
              ) {
                user["selected"] = true;
              } else {
                user["selected"] = false;
              }
              if (user.id != this.currentUser.id) {
                this.userSearchList.push(user);
              }
            }
          } else {
            this.hasMoreUser = false;
          }
          if (this.infiniteScroll != null) {
            this.infiniteScroll.complete();
          }
        }
      },
      err => {
        this.isloading = false;
        console.log(err.statusText);
      }
    );
  }

  createChat() {
    if (this.selectedUsers.length == 1) {
      this.firebase
        .checkThread(this.currentUser.id, this.selectedUsers[0])
        .then(
          id => {
            //console.log(result);
            this.activeThread = id as string;
            this.navCtrl.push(FirebaseChatPage, {
              threadID: id,
              fromProfile: false
            });
            this.cancelCreate();
          },
          err => {
            this.helper.presentToast("Thread Error", err);
          }
        );
    } else {
      let prompt = this.alertCtrl.create({
        title: "New Group Chat",
        message: "Please Enter The Group Name for New Chat",
        inputs: [
          {
            name: "name",
            placeholder: "Group Name"
          }
        ],
        buttons: [
          {
            text: "Cancel",
            handler: data => {
              console.log("Cancel clicked");
            }
          },
          {
            text: "Create",
            handler: data => {
              console.log("Create clicked");
              if (data.name == "") {
                data.name = "New Group";
              }
              var receivers = this.selectedUsers;
              receivers.unshift(this.currentUser.id);
              this.firebase.createThread(receivers, data.name).then(
                id => {
                  //console.log(result);
                  this.activeThread = id as string;
                  this.navCtrl.push(FirebaseChatPage, {
                    threadID: id,
                    fromProfile: false
                  });
                  this.cancelCreate();
                },
                err => {
                  this.helper.presentToast("Thread Error", err);
                }
              );
            }
          }
        ]
      });
      prompt.present();
    }
  }

  cancelCreate() {
    this.isCreating = false;
    this.title = "All Chats";
  }

  openChat(data) {
    console.log(data);
    //this.messageList[this.messageList.indexOf(data)].unread = 0;
    this.activeThread = data.id;
    this.firebase.database.ref("/chats/" + data.id).off();
    this.navCtrl.push(FirebaseChatPage, {
      threadID: data.id,
      fromProfile: false
    });
  }

  leaveThread(data) {
    console.log(data);
    if (data.type == "direct" || data.participants[0] == this.currentUser.id) {
      this.firebase.deleteThread(data.id).then(
        result => {
          console.log("delete");
        },
        err => {
          console.log(err);
        }
      );
    } else {
      this.firebase.leaveThread(data, this.currentUser).then(
        result => {
          console.log("leave");
          this.messageList.splice(this.messageList.indexOf(data), 1);
          this.firebase.database.ref("/chats/" + data.id).off();
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  doInfinite(event) {
    this.infiniteScroll = event;
    if (this.isCreating == true) {
      this.cursorUser.page++;
      this.getUsers();
    } else {
      this.current.page++;
      this.getThreads();
    }
  }
}

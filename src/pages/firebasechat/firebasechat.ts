import { Component, ViewChild } from "@angular/core";
import { NavController, NavParams, ActionSheetController } from "ionic-angular";
import { Events } from "ionic-angular";
import { Content } from "ionic-angular";
import { AlertController } from "ionic-angular";
import { Platform } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Helper } from "../../providers/helper";
import { WebServices } from "../../providers/webservices";
import { UserData } from "../../providers/user-data";
import { serverDetails } from "../../providers/config";
import { ProfilePage } from "../../pages/profile/profile";
import {
  FirebaseService,
  Message
} from "../../providers/firebase/firebase.service";
/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: "page-firebasechat",
  templateUrl: "firebasechat.html"
})
export class FirebaseChatPage {
  @ViewChild(Content) content: Content;
  receiverID: number;
  isloading: boolean = true;
  chatList: any = [];
  message: any;
  imageUrl: any;
  isGroup: boolean;
  isAll: boolean = false;
  typings: any = [];
  thread: any;
  time: any;
  pushPage: any;
  threadID: string;
  title: string;
  size: number = 15;
  lastMessage: Message;
  fromProfile: boolean = false;
  currentUser: {
    id?: any;
    username?: any;
    followers?: any;
    follows?: any;
  } = {};
  users = {};
  isTyping: boolean = false;
  isDeleted: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public webServices: WebServices,
    public helper: Helper,
    public userData: UserData,
    public platform: Platform,
    public camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    public firebase: FirebaseService,
    public events: Events,
    public alertCtrl: AlertController
  ) {
    this.imageUrl = serverDetails.imageUrl;
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad FirebaseChatPage");
    this.currentUser = this.userData.getUserProfileData();
    this.threadID = this.navParams.get("threadID");
    this.fromProfile = this.navParams.get("fromProfile");
    this.pushPage = ProfilePage;
    this.time = "?time=" + new Date().getMilliseconds();
    if (this.threadID != null) {
      this.watchThread();
    } else {
      console.log("Thread Error");
      this.title = "Wrong Thread";
    }
    this.events.subscribe("chat:push", (msg, threadID) => {
      if (this.threadID != threadID) {
        this.helper.showMsg(msg, 'success');
      }
    });
  }

  ionViewWillUnload() {
    console.log("ionViewWillUnload FirebaseChatPage");
    this.updateState("");
    var typingRef = this.firebase.database.ref("/typing/" + this.threadID);
    typingRef.off();
    var chatRef = this.firebase.database.ref("/chats/" + this.threadID);
    chatRef.off();
    let threadRef = this.firebase.database.ref("/threads");
    threadRef.child(this.threadID).off();
    if (this.fromProfile == true) {
      this.firebase.getThreads();
    } else {
      this.events.publish("chat:unloaded", this.isDeleted);
    }
    this.events.unsubscribe("chat:push");
  }

  startChat() {
    this.getUsers();
    this.getMessage();
    this.watchTyping();
  }

  doRefresh(event) {
    console.log("more");
    if (this.chatList.length == 0 || this.isAll == true) {
      event.complete();
      return;
    }
    let firstTimestamp = this.chatList[0].timestamp - 1;
    this.firebase
      .moreMessage(this.threadID, firstTimestamp, this.size)
      .then(chats => {
        var moreChats: any = [];
        for (let index in chats) {
          if (chats[index].sender != this.currentUser.id) {
            if (chats[index].read[this.currentUser.id] == false) {
              this.firebase.setReadMessage(
                this.threadID,
                chats[index].timestamp,
                this.currentUser.id
              );
            }
          } else {
            if (
              this.isGroup == false &&
              chats[index].read[this.receiverID] == false
            ) {
              chats[index].read = false;
            } else {
              chats[index].read = true;
            }
          }
          moreChats.push(chats[index]);
          //console.log(index);
        }
        this.chatList = moreChats.concat(this.chatList);
        if (moreChats.length < this.size) {
          this.isAll = true;
        }
        event.complete();
      });
  }

  getUsers() {
    //console.log("users");
    for (let id of this.thread.participants) {
      this.webServices.get("user/get/id/" + id).subscribe(getData => {
        this.users[id] = getData.user.username;
        if (this.isGroup==false && id==this.receiverID) {
          this.title = this.users[this.receiverID];
        }
        //console.log(this.users[id]);
      });
    }
  }

  getMessage() {
    this.isloading = true;
    this.chatList = [];
    this.firebase
      .getMessage(this.threadID, this.size, this.currentUser.id)
      .then(chats => {
        for (let index in chats) {
          if (chats[index].sender != this.currentUser.id) {
            if (chats[index].read[this.currentUser.id] == false) {
              this.firebase.setReadMessage(
                this.threadID,
                chats[index].timestamp,
                this.currentUser.id
              );
            }
          } else {
            if (
              this.isGroup == false &&
              chats[index].read[this.receiverID] == false
            ) {
              chats[index].read = false;
            } else {
              chats[index].read = true;
            }
          }
          this.chatList.push(chats[index]);
          //console.log(index);
        }
        this.isloading = false;
        if (this.chatList < this.size) {
          this.isAll = true;
        }
        setTimeout(() => {
          if (this.content._scroll) this.content.scrollToBottom(200);
        }, 1500);
        this.watchMessageList();
      });
  }

  watchMessageList() {
    var lastTimestamp;
    if (this.chatList.length == 0) {
      lastTimestamp = 0;
    } else {
      lastTimestamp = this.chatList[this.chatList.length - 1].timestamp + 1;
    }
    //console.log(lastTimestamp);
    var chatRef = this.firebase.database.ref("/chats/" + this.threadID);
    chatRef
      .orderByChild("timestamp")
      .startAt(lastTimestamp)
      .on("child_added", snapshot => {
        var message: Message = snapshot.val();
        if (
          this.lastMessage == null ||
          this.lastMessage.isEqual(message) == false
        ) {
          if (message.sender != this.currentUser.id) {
            this.firebase.setReadMessage(
              this.threadID,
              message.timestamp,
              this.currentUser.id
            );
          } else {
            if (
              this.isGroup == false &&
              message.read[this.receiverID] == false
            ) {
              message.read = false;
            } else {
              message.read = true;
            }
          }
          this.chatList.push(message);
          setTimeout(() => {
            if (this.content._scroll) this.content.scrollToBottom(200);
          }, 1500);
        }
      });

    if (this.isGroup == false) {
      chatRef
        .orderByChild("read/" + this.receiverID)
        .equalTo(true)
        .on("child_added", snapshot => {
          var message: Message = snapshot.val();
          console.log(message);
          for (let index in this.chatList) {
            if (this.chatList[index].timestamp == message.timestamp) {
              this.chatList[index].read = true;
            }
          }
        });
    }
  }

  watchThread() {
    if (this.fromProfile == true) {
      this.firebase.removeThreads();
    }
    let threadRef = this.firebase.database.ref("/threads");
    threadRef.child(this.threadID).once("child_removed", snapshot => {
      threadRef.child(this.threadID).off();
      let alert = this.alertCtrl.create({
        title: "This Chat removed",
        subTitle: "App return Message Activity",
        buttons: [
          {
            text: "OK",
            role: "cancel",
            handler: () => {
              this.isDeleted = true;
              this.navCtrl.pop();
            }
          }
        ]
      });
      alert.present();
    });

    threadRef.child(this.threadID).once(
      "value",
      snapshot => {
        this.thread = snapshot.val();
        console.log(this.thread);
        this.isGroup = this.thread.type == "group" ? true : false;
        if (this.isGroup == false) {
          this.receiverID = this.currentUser.id == this.thread.participants[0]
            ? this.thread.participants[1]
            : this.thread.participants[0];
        }
        this.startChat();
        this.title = this.isGroup ? this.thread.name : '';
      },
      err => {
        console.log("Thread Error");
        this.title = "Wrong Thread";
      }
    );

    if (this.isGroup) {
      threadRef
        .child(this.threadID)
        .orderByKey()
        .equalTo("name")
        .on("child_changed", snapshot => {
          this.title = snapshot.val();
        });
      threadRef
        .child(this.threadID)
        .orderByKey()
        .equalTo("participants")
        .on("child_changed", snapshot => {
          this.thread.participants = snapshot.val();
        });
    }

    this.updateState("");
  }

  watchTyping() {
    var typingRef = this.firebase.database.ref("/typing/" + this.threadID);
    typingRef.on("child_changed", snapshot => {
      if (snapshot.key != this.currentUser.id) {
        let name = this.users[snapshot.key];
        if (snapshot.val() == true) {
          //console.log(name + "is typing");
          this.typings.push(name);
        } else {
          let position = this.typings.indexOf(name);
          if (position >= 0) {
            this.typings.splice(this.typings.indexOf(name), 1);
          }
        }
      }
    });

    typingRef.on("child_added", snapshot => {
      if (snapshot.key != this.currentUser.id) {
        let name = this.users[snapshot.key];
        if (snapshot.val() == true) {
          //console.log(name + "is typing");
          this.typings.push(name);
        } else {
          let position = this.typings.indexOf(name);
          if (position >= 0) {
            this.typings.splice(this.typings.indexOf(name), 1);
          }
        }
      }
    });
  }

  sendNotification(msg: string) {
    let notificationMsg: any = {};
    notificationMsg.title = "ionicchat";
    notificationMsg.msg = this.currentUser.username + ": " + msg;
    notificationMsg.type = "CHAT";
    notificationMsg.userid = this.currentUser.id;
    notificationMsg.threadID = this.threadID;
    for (let id of this.thread.participants) {
      if (id != this.currentUser.id) {
        this.helper.sendNotification(id, notificationMsg);
      }
    }
  }

  public send_Message(message: Message) {
    this.lastMessage = message;
    var updates = {};
    updates["/threads/" + this.threadID + "/lastmsg"] = message.type == "text"
      ? message.message
      : "Sent Image";
    updates["/threads/" + this.threadID + "/lastseen"] = message.timestamp;
    updates["/chats/" + this.threadID + "/" + message.timestamp] = message;

    this.firebase.database.ref().update(updates);
    this.sendNotification(
      message.type == "image" ? "Sent Image" : message.message
    );
    message.read = this.isGroup;
    this.chatList.push(message);
    setTimeout(() => {
      if (this.content._scroll) this.content.scrollToBottom(200);
    }, 1000);
  }

  onSendMsg(value) {
    //console.log(value);
    if (this.message.length > 0) {
      let message = new Message(
        this.currentUser.id,
        this.message,
        "text",
        this.thread.participants
      );
      this.send_Message(message);
      //console.log('Sent Message');
      this.message = "";
      this.updateState("");
    }
  }

  updateState(value) {
    //console.log(value);
    if (value == "") {
      this.isTyping = false;
      this.firebase.database
        .ref("typing/" + this.threadID + "/" + this.currentUser.id)
        .set(false);
    } else if (this.isTyping == false) {
      this.isTyping = true;
      this.firebase.database
        .ref("typing/" + this.threadID + "/" + this.currentUser.id)
        .set(true);
    }
  }

  onSendImage(url) {
    //console.log(url);
    let message = new Message(
      this.currentUser.id,
      url,
      "image",
      this.thread.participants
    );
    this.send_Message(message);
    //console.log('Sent Image');
  }

  selectCameraType() {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Choose Type",
      buttons: [
        {
          text: "Camera",
          role: "destructive",
          handler: () => {
            this.getImage("camera");
            console.log("Camera clicked");
          }
        },
        {
          text: "Gallery",
          handler: () => {
            this.getImage("gallery");
            console.log("Gallery clicked");
          }
        }
      ]
    });
    actionSheet.present();
  }

  getImage(type) {
    let options: CameraOptions = {};
    if (type == "camera") {
      options = {
        // Some common settings are 20, 50, and 100
        quality: 20,
        destinationType: this.camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: this.camera.PictureSourceType.CAMERA,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        cameraDirection: this.camera.Direction.FRONT,
        allowEdit: true,
        saveToPhotoAlbum: true,
        correctOrientation: true //Corrects Android orientation quirks
      };
    } else {
      options = {
        // Some common settings are 20, 50, and 100
        quality: 20,
        destinationType: this.camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        allowEdit: true,
        saveToPhotoAlbum: true,
        correctOrientation: true //Corrects Android orientation quirks
      };
    }

    this.camera.getPicture(options).then(
      imageURI => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        //let base64Image = 'data:image/jpeg;base64,' + imageData;
        //console.log('image' + imageURI);
        this.uploadPicture(imageURI);
      },
      err => {
        console.log("image error");
        console.log(err);
        // Handle error
      }
    );
  }

  uploadPicture(image) {
    console.log("uploadpicture");
    this.firebase.uploadImage(image).then(
      imageUrl => {
        //console.log('success:' + imageUrl);
        this.onSendImage(imageUrl);
      },
      err => {
        //console.log('error:' + err);
      }
    );
  }

  changeName() {
    if (this.currentUser.id != this.thread.participants[0]) {
      return;
    }
    if (this.isGroup == true) {
      let prompt = this.alertCtrl.create({
        title: "Change Group Name",
        message: "Please Enter New Name for this Group Chat",
        inputs: [
          {
            name: "name",
            placeholder: this.thread.groupName
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
            text: "Change",
            handler: data => {
              console.log("Change clicked");
              if (data.name != "") {
                this.firebase.setNameofThread(this.threadID, data.name).then(
                  result => {
                    this.title = data.name;
                    let message = new Message(
                      this.currentUser.id,
                      "Group Name changed to " + data.name,
                      "text",
                      this.thread.participants
                    );
                    this.send_Message(message);
                  },
                  err => {
                    console.log("Error, Thread");
                  }
                );
              }
            }
          }
        ]
      });
      prompt.present();
    }
  }
}

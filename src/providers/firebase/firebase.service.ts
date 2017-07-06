import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import "rxjs/add/operator/map";
import firebase from "firebase";

/*
  Generated class for the FireDataServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
export class Thread {
  public id: string;
  public name: string;
  public participants: [number];
  public lastseen: number;
  public lastmsg: string;
  public type: string;

  constructor(
    id: string,
    participants: [number],
    name = "Chat",
    lastmsg = "Created Chat",
    lastseen = new Date().getTime()
  ) {
    this.id = id;
    this.name = name;
    this.participants = participants;
    this.lastseen = lastseen;
    this.lastmsg = lastmsg;
    if (participants.length > 2) {
      this.type = "group";
    } else {
      this.type = "direct";
    }
  }
}

export class Message {
  public sender: number;
  public message: string;
  public timestamp: number;
  public read: any;
  public type: string;

  constructor(
    sender: number,
    message: string,
    type: string,
    receivers: [number]
  ) {
    this.sender = sender;
    this.message = message;
    this.timestamp = new Date().getTime();
    this.type = type;
    var read = {};
    for (let receiver of receivers) {
      if (receiver != sender) {
        read[receiver] = false;
      }
    }
    this.read = read;
  }

  public isEqual(message: Message) {
    if (this.timestamp == message.timestamp) {
      return true;
    } else {
      return false;
    }
  }
}

@Injectable()
export class FirebaseService {
  //private static initialized: boolean;
  public database: firebase.database.Database;
  public auth: firebase.auth.Auth;
  public storage: firebase.storage.Storage;
  public threadList: any = {};
  public unreadMsgCount = 0;
  public userID: number;

  constructor(public events: Events) {
    console.log("Hello FirebaseService Provider");
    this.init();
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
  }

  init() {
    //if (FirebaseService.initialized) { return; }
    console.log("Hello FirebaseService Init");
    const fbConf = {
      apiKey: "AIzaSyCx8qAHcDkQ6lyynDlhZsEu5JjKXAdcxE4",
      authDomain: "ionicchat-168206.firebaseapp.com",
      databaseURL: "https://ionicchat-168206.firebaseio.com/",
      storageBucket: "ionicchat-168206.appspot.com",
      messagingSenderId: "589242402988"
    };
    firebase.initializeApp(fbConf);
    //FirebaseService.initialized = true;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in
      } else {
        // User is signed out.
      }
    });
    
    let that = this;
    var connectedRef = firebase.database().ref(".info/connected");

    connectedRef.on("value", function(snap) {
      if (snap.val() === true) {
        that.events.publish('firebase:connected');
      } else {
        that.events.publish('firebase:disconnected');
      }
    });
  }

  public login(id) {
    console.log("firebase login");
    this.userID = id;
    return new Promise((resolve, reject) => {
      var user = firebase.auth().currentUser;
      if (user) {
        // User is signed in.
        this.getThreads();
        resolve(user);
      } else {
        // No user is signed in.
        this.auth.signInAnonymously().then(
          userData => {
            this.getThreads();
            resolve(userData);
          },
          err => reject(err)
        );
      }
    });
  }

  public logout() {
    console.log("firebase logout");
    this.removeThreads();
    this.userID = null;
    /*
    return firebase.auth.signOut().then(() => {
      this.removeThreads();
    });*/
  }

  public getThreads() {
    console.log(this.userID);
    this.threadList = {};
    this.unreadMsgCount = 0;
    var threadsRef = this.database.ref("/threads");
    threadsRef.on("child_added", snapshot => {
      let thread = snapshot.val();
      //console.log(thread);
      if (thread.participants.indexOf(this.userID) >= 0) {
        this.threadList[thread.id] = false;
        this.watchThread(thread.id);
        this.watchUnread(thread.id);
      }
    });
  }

  watchThread(id) {
    let threadRef = this.database.ref("/threads");
    threadRef.child(id).once("child_removed", snapshot => {
      console.log("remove");
      if (this.threadList[id] == true && this.unreadMsgCount > 0) {
        this.unreadMsgCount--;
      }
      threadRef.child(id).off();
    });
  }

  watchUnread(id) {
    var chatsRef = this.database.ref("/chats/" + id);
    chatsRef
      .orderByChild("read/" + this.userID)
      .equalTo(false)
      .limitToFirst(1)
      .on("child_added", snapshot => {
        console.log("add" + snapshot.val());
        if (this.threadList[id] == false) {
          this.unreadMsgCount++;
          this.threadList[id] = true;
          console.log(this.unreadMsgCount);
        }
      });
  }

  public removeThreads() {
    var threadsRef = this.database.ref("/threads");
    threadsRef.off();
    let keys = Object.keys(this.threadList);
    for (let id of keys) {
      threadsRef.child(id).off();
      this.database.ref("/chats/" + id).off();
    }
    this.threadList = {};
  }

  public getMessage(thread, limit, id) {
    return new Promise((resolve, reject) => {
      this.getUnRead(thread, id).then(unread => {
        var chatsRef = this.database.ref("/chats/" + thread);
        chatsRef
          .orderByChild("timestamp")
          .limitToLast(unread > limit ? unread : limit)
          .once("value")
          .then(snapshot => resolve(snapshot.val()), err => reject(err));
      });
    });
  }

  public moreMessage(thread, timeStamp, limit) {
    return new Promise((resolve, reject) => {
      var chatsRef = this.database.ref("/chats/" + thread);
      chatsRef
        .orderByChild("timestamp")
        .endAt(timeStamp)
        .limitToLast(limit)
        .once("value")
        .then(snapshot => resolve(snapshot.val()), err => reject(err));
    });
  }

  public createThread(participants, name = "Chat") {
    return new Promise((resolve, reject) => {
      var id: string;
      if (participants.length > 2) {
        let threadRef = this.database.ref("/threads/");
        let newRef = threadRef.push();
        id = newRef.key;
      } else {
        if (participants[0] > participants[1]) {
          id = participants[0] + "thread" + participants[1];
        } else {
          id = participants[1] + "thread" + participants[0];
        }
      }
      let thread = new Thread(id, participants, name);
      this.database
        .ref("/threads/" + id)
        .set(thread)
        .then(result => resolve(id), err => reject(err));
    });
  }

  public checkThread(me: number, he: number) {
    return new Promise((resolve, reject) => {
      var id: string;
      if (me > he) {
        id = me + "thread" + he;
      } else {
        id = he + "thread" + me;
      }
      this.database.ref("/threads/" + id).once("value").then(
        snapshot => {
          if (snapshot.exists()) {
            resolve(id);
          } else {
            this.createThread([me, he]).then(
              id => resolve(id),
              err => reject(err)
            );
          }
          resolve(id);
        },
        err => reject(err)
      );
    });
  }

  public getThread(id) {
    return new Promise((resolve, reject) => {
      this.database
        .ref("/threads/" + id)
        .once("value")
        .then(snapshot => resolve(snapshot.val()), err => reject(err));
    });
  }

  public leaveThread(thread, user) {
    console.log(user);
    return new Promise((resolve, reject) => {
      var updates = {};
      let index = thread.participants.indexOf(user.id);
      if (index > 0) {
        let msg = new Message(
          user.id,
          user.username + " Left Chat",
          "text",
          thread.participants
        );
        thread.participants.splice(index, 1);
        updates["/typing/" + thread.id + "/" + user.id] = null;
        updates["/threads/" + thread.id + "/participants"] =
          thread.participants;
        updates["/threads/" + thread.id + "/unread/" + user.id] = null;
        updates["/threads/" + thread.id + "/lastseen"] = msg.timestamp;
        updates["/threads/" + thread.id + "/lastmsg"] = msg.message;
        updates["/chats/" + thread.id + "/" + msg.timestamp] = msg;
      } else {
        return reject("No User");
      }
      this.database
        .ref()
        .update(updates)
        .then(result => resolve(result), err => reject(err));
    });
  }

  public setNameofThread(id, name) {
    return new Promise((resolve, reject) => {
      this.database
        .ref("/threads/" + id + "/name")
        .set(name)
        .then(result => resolve(result), err => reject(err));
    });
  }

  public deleteThread(id) {
    return new Promise((resolve, reject) => {
      var updates = {};
      updates["/threads/" + id] = null;
      updates["/typing/" + id] = null;

      this.database.ref().update(updates).then(
        result => {
          this.database
            .ref("/chats/" + id)
            .orderByChild("type")
            .equalTo("image")
            .once("value")
            .then(snapshots => {
              let imageRef = this.storage.ref().child("image");
              snapshots.forEach(function(childSnapshot) {
                var url = childSnapshot.val().message;
                let start = url.indexOf("%2F");
                let end = url.indexOf("?alt=media");
                imageRef.child(url.substring(start + 3, end)).delete();
                //console.log(url.substring(start + 3, end));
              });
              this.database.ref("/chats/" + id).remove();
              resolve(result);
            });
        },
        err => reject(err)
      );
    });
  }

  public setReadMessage(thread, timeStamp, id) {
    return new Promise((resolve, reject) => {
      var chatsRef = this.database.ref(
        "/chats/" + thread + "/" + timeStamp + "/read"
      );
      chatsRef
        .child(id)
        .set(true)
        .then(result => resolve(result), err => reject(err));
    });
  }

  public getUnRead(thread, id) {
    return new Promise((resolve, reject) => {
      var chatsRef = this.database.ref("/chats/" + thread);
      chatsRef.orderByChild("read/" + id).equalTo(false).once("value").then(
        snapshot => {
          if (snapshot.exists()) {
            resolve(snapshot.numChildren());
          } else {
            resolve(0);
          }
        },
        err => reject(err)
      );
    });
  }

  public getLastMessage(thread) {
    return new Promise((resolve, reject) => {
      var chatsRef = this.database.ref("/chats/" + thread);
      chatsRef.limitToLast(1).once("value").then(
        snapshot => {
          resolve(snapshot.val());
        },
        err => reject(err)
      );
    });
  }

  public uploadImage(image) {
    let metadata = {
      contentType: "image/jpeg"
    };
    let storageRef = this.storage.ref();
    let imageRef = storageRef.child("image");
    let fileName = new Date().getTime();

    var uploadTask = imageRef
      .child(fileName.toString())
      .putString(image, "base64", metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {},
        error => {
          reject(error);
        },
        () => {
          resolve(uploadTask.snapshot.downloadURL);
        }
      );
    });
  }
}

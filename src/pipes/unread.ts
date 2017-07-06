import { Pipe, PipeTransform } from '@angular/core';
import { FirebaseService } from '../providers/firebase/firebase.service';
import { UserData } from '../providers/user-data';

@Pipe({ name: 'unread', pure: false })

export class UnreadByPipe implements PipeTransform {
    prevalue: any = null;
    result: string = '';
    id: number;

    constructor(
        private userData: UserData,
        private firebase: FirebaseService) {
        this.id = this.userData.getUserProfileData().id;
    }

    transform(value: string) {
        if (value !== this.prevalue) {
            this.prevalue = value;
            this.result = '';
            this.firebase.getUnRead(value, this.id).then(unread => {
                this.result = unread as string;
                if (this.result == '0') {
                    this.result = '';
                }
                return this.result;
            })
        } else {
            return this.result;
        }
    }
}

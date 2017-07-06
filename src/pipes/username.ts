import { Pipe, PipeTransform } from '@angular/core';
import { WebServices } from '../providers/webservices';

@Pipe({ name: 'username', pure: false })

export class UsernameByPipe implements PipeTransform {
    prevalue: any = null;
    result: string = '';

    constructor(private webServices: WebServices) {
    }

    transform(value: number) {
        if (value !== this.prevalue) {
            this.prevalue = value;
            this.result = '';
            this.webServices.get('user/get/id/' + value).subscribe(getData => {
                this.result = getData.user.username;
            })
        }
        return this.result;
    }

}


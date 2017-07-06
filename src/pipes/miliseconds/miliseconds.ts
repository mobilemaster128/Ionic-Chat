import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the MilisecondsPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
    name: 'miliseconds',
})
export class MilisecondsPipe implements PipeTransform {
    /**
     * Takes a value and makes it lowercase.
     */
    transform(millisec: any) {

        //	duration =Number(duration);

        var seconds = (millisec / 1000).toFixed(1);

        var minutes = (millisec / (1000 * 60)).toFixed(1);

        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (Number(seconds) < 60) {
            return seconds + " Sec";
        } else if (Number(minutes) < 60) {
            return minutes + " Min";
        } else if (Number(hours) < 24) {
            return hours + " Hrs";
        } else {
            return days + " Days"
        }

    }
}

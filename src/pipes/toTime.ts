import { Pipe, PipeTransform } from "@angular/core";

/**
 * Generated class for the MilisecondsPipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: "toTime"
})
export class ToTimePipe implements PipeTransform {
  /**
     * Takes a value and makes it lowercase.
     */
  transform(millisec: any) {
    let date = new Date(millisec);
    var timeStr: string = "";

    var index = date.getMinutes();
    if (index >= 10) {
      timeStr = index.toString();
    } else {
      timeStr = "0" + index;
    }
    
    index = date.getHours();
    if (index >= 12) {
      index = index==12 ? index : index - 12;
      timeStr =(index>=10 ? index : '0'+index) + ':' + timeStr + " PM";
    } else {
      index = index ? index : 12;
      timeStr =(index>=10 ? index : '0'+index) + ':' + timeStr + " AM";
    }

    let today = new Date().setHours(0, 0, 0, 0);

    if (millisec >= today) {
      return timeStr;
    } else if (millisec >= today - 3600 * 24 * 1000) {
      return "yesterday\r\n" + timeStr;
    } else {
      index = date.getDate();
      if (index > 10) {
        timeStr = index + "\r\n" + timeStr;
      } else {
        timeStr = "0" + index + "\r\n" + timeStr;
      }
      index = date.getMonth() + 1;
      if (index > 10) {
        timeStr = index + "/" + timeStr;
      } else {
        timeStr = "0" + index + "/" + timeStr;
      }
      return timeStr;
    }
  }
}

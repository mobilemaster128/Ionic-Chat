import { Component, Output, EventEmitter } from '@angular/core';
import { Helper } from '../../providers/helper';
/**
 * Generated class for the ActivityImageUploadComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'activity-image-upload',
  templateUrl: 'activity-image-upload.html'
})
export class ActivityImageUploadComponent {

  text: string;
  imageData: string = '';

  @Output() uploadEvent = new EventEmitter();

  constructor(public helper: Helper) {
    console.log('Hello ActivityImageUploadComponent Component');
    this.text = 'Hello World';
  }

  selectCameraType() {


    this.helper.selectCameraType().then((imageURI) => {

      console.log('camera image=========');
      console.log(imageURI);
      this.imageData = imageURI;

      this.uploadEvent.next({ data: this.imageData });
    })
  }

  removeImage() {

    console.log('removeimage');
    this.imageData = '';
    this.uploadEvent.next({ data: this.imageData });
  }


}

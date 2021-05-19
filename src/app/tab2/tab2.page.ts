import { Component, OnInit} from '@angular/core';

import { VideoCapturePlus, VideoCapturePlusOptions, MediaFile } from '@ionic-native/video-capture-plus/ngx';
import { Platform } from '@ionic/angular'; 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  browser = false;
  
  constructor(
    private videoCapturePlus: VideoCapturePlus,
    public platform: Platform
  ) {}

  ngOnInit() {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.browser = false;
      this.doMediaCapture();
    } else {
      console.log("This function is not available in the browser. Please start the app on a mobile device.");
      this.browser = true;
    }
  }

  async doMediaCapture() {
    const options: VideoCapturePlusOptions = {
      limit: 1,
      highquality: true,
      frontcamera: true,
      portraitOverlay: "src/assets/icon/favicon.png"
    };
    let capture: any = await this.videoCapturePlus.captureVideo(options);
    console.log((capture[0] as MediaFile).fullPath);
  }
}

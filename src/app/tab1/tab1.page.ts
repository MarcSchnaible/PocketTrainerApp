import { Component, OnInit, ViewChild } from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';


import '@capacitor-community/camera-preview'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  model = null;
  //image = null;
  cameraActive = false;
  intervall: any;

  constructor() {}

  ngOnInit() {
    this.loadModel();
  }

  //load the TensorflowModel PoseNet
  async loadModel() {
    this.model = await posenet.load();
  }

  //detect the joints in image. Gives back a json with the coordinates 
  async detect(image) {
    const pose = await this.model.estimateSinglePose(image);
    console.log(pose);
  }

  //opens the front camera
  openCamera() {
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'front',
      parent: 'cameraPreview',
      className: 'cameraPreview'
    };
    CameraPreview.start(cameraPreviewOptions);
    this.cameraActive = true;

    //starts a interval every 100ms
    this.intervall = setInterval(() => {
      this.detect(this.takePicture());
    }, 100);
  }

  //stop the cameraPreview
  async stopCamera() {
    await CameraPreview.stop();
    clearInterval(this.intervall)
    this.cameraActive = false;
  }

  // take a picture
  async takePicture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 50
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    const base64PictureData = result.value;
    console.log(base64PictureData);
    return base64PictureData;
  }
}

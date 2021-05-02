import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import {drawKeypoints, drawSkeleton} from './drawing.service';


import '@capacitor-community/camera-preview'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  model = null;
  image = null;
  cameraActive = false;
  intervallRef: any;

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  constructor() {}

  ngOnInit() {
    this.loadModel();
  }

  //load the TensorflowModel PoseNet
  async loadModel() {

    // genaues Model aber sehr langsam
    this.model = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: window.innerWidth, height: (window.innerWidth/1.77682403)},
      quantBytes: 2
    });

    //ungenaues Model aber schnell...
    /*
    this.model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: window.innerWidth, height: (window.innerWidth/1.77682403)},
      multiplier: 0.75
    });
    */
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

    //starts a interval every 50ms after 3s
      setTimeout(()=> {this.intervall()},4000);
  }

  intervall(){
    this.intervallRef = setInterval(() => {
      this.takePicture();
    }, 250);
  }

  // take a picture
  async takePicture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    this.image = `data:image/jpeg;base64,${result.value}`;
    const base64PictureData = result.value;
    if (base64PictureData != 'data:,'){
      this.detect(base64PictureData);
    }
  }

  //detect the joints in image. Gives back a json with the coordinates 
  async detect(image) {
    const pose = await this.model.estimateSinglePose(document.getElementById('image'), {
      flipHorizontal: false
    });
    const imageWidth = document.getElementById('image').clientWidth;
    const imageHeight = document.getElementById('image').clientHeight;
    this.drawCanvas(pose, this.image, imageWidth, imageHeight);
  }

  //draw Canvas
  drawCanvas(pose, image, imageWidth, imageHeight) {
    //const ctx = this.canvas.nativeElement.getContext('2d');
    var canvas = <HTMLCanvasElement> document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    
    ctx.canvas.width = imageWidth;
    ctx.canvas.height = imageHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  }

  //stop the cameraPreview
  async stopCamera() {
    await CameraPreview.stop();
    clearInterval(this.intervallRef)
    this.cameraActive = false;
  }
}

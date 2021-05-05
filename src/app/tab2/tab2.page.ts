import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import {drawKeypoints, drawSkeleton} from '../tab1/drawing.service';
import { ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy{

  model = null;
  image = null;
  cameraActive = false;
  intervallRef: any;
  videoElement: HTMLVideoElement;
  

  constructor() {}

  ngOnInit() {
    this.loadModel();
  }

  //load the TensorflowModel PoseNet
  async loadModel() {

    // genaues Model aber sehr langsam
    /*
    this.model = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: window.innerWidth, height: (window.innerWidth/1.77682403)},
      quantBytes: 2
    });

    */

    //ungenaues Model aber schnell...
    this.model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: window.innerWidth, height: (window.innerWidth/1.77682403)},
      multiplier: 0.75
    });

    setTimeout(()=> {this.intervall()},4000);
  }

  intervall() {
    this.intervallRef = setInterval(() => {
      this.detect();
    }, 100);
  }

  //detect the joints in image. Gives back a json with the coordinates 
  async detect() {
    const pose = await this.model.estimateSinglePose(document.getElementById('myVideo'), {
      flipHorizontal: false
    });
    const imageWidth = document.getElementById('myVideo').clientWidth;
    const imageHeight = document.getElementById('myVideo').clientHeight;
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

  ngOnDestroy() {
    clearInterval(this.intervallRef);
  }
}

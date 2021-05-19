import { Component, OnInit} from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import {drawKeypoints, drawSkeleton, setColorFalse, setColorTrue} from '../tab1/drawing.service';
import { BodyAnatomie } from '../tab1/video/classes/BodyAnatomie';
import { ComparePoseService } from '../tab1/video/classes/comparePoseService';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  
  model = null;
  intervallRef: any;

  constructor(private comparePoseService: ComparePoseService) {}

  ngOnInit() {
    this.loadModel();
    this.intervall();
    setTimeout(()=> {
      clearInterval(this.intervallRef);
    }, 60000)
  }

  //load the TensorflowModel PoseNet
  async loadModel() {

    // genaues Model aber sehr langsam
    this.model = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: { width: 375, height: 750},
      quantBytes: 2
    });

    /*
    //ungenaues Model aber schnell...
    this.model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 257, height: 200},
      multiplier: 0.5
    });
    */
  }

  intervall(){
    this.intervallRef = setInterval(() => {
      this.detect();
    }, 3000);
  }

  async detect() {
    const pose = await this.model.estimateSinglePose(document.getElementById('imageUpload'), {
      flipHorizontal: false
    });

    this.comparePoseService.writePose(pose);
    
    const imageWidth = document.getElementById('imageUpload').clientWidth;
    const imageHeight = document.getElementById('imageUpload').clientHeight;

    /*
    const bodyAnatomie = new BodyAnatomie(pose);
    const rightArm = bodyAnatomie.getRightArmVector;
    const leftArm = bodyAnatomie.getLeftArmVector;
    console.log(bodyAnatomie.compareTwoPoses(rightArm,leftArm));
    */

    this.drawCanvas(pose, imageWidth, imageHeight);
  }

  //draw Canvas
  drawCanvas(pose, imageWidth, imageHeight) {
    //const ctx = this.canvas.nativeElement.getContext('2d');
    var canvas = <HTMLCanvasElement> document.getElementById("canvasUpload");
    var ctx = canvas.getContext("2d");
    
    ctx.canvas.width = imageWidth;
    ctx.canvas.height = imageHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  }
}

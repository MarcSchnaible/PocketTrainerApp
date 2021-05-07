import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import {drawKeypoints, drawSkeleton, setColorFalse, setColorTrue} from './drawing.service';
import similarity from 'calculate-cosine-similarity'
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
      className: 'cameraPreview',
      toBack: true
    };
    CameraPreview.start(cameraPreviewOptions);
    this.cameraActive = true;

    //starts a interval every 50ms after 3s
      setTimeout(()=> {this.intervall()},4000);
  }

  intervall(){
    this.intervallRef = setInterval(() => {
      this.takePicture();
    }, 100);
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
    
    const keypoints = pose["keypoints"];
  
    const rightShoulder = keypoints[6];
    const rightElbow = keypoints[8];
    const rightWrist = keypoints[10];
    const rightShoulderPosition = rightShoulder["position"];
    const yRightShoulder = rightShoulderPosition["y"];
    const xRightShoulder = rightShoulderPosition["x"];
    const rightElbowPosition = rightElbow["position"];
    const yRightElbow = rightElbowPosition["y"];
    const xRightElbow = rightElbowPosition["x"];
    const rightWristPosition = rightWrist["position"];
    const yRightWrist = rightWristPosition["y"];
    const xRightWrist = rightWristPosition["x"];

    const yUpperArm = yRightElbow - yRightShoulder;
    const xUpperArm = xRightElbow - xRightShoulder;
    //const UpperArm = {yUpperArm, xUpperArm};

    const lengthUpperArm = (Math.sqrt((yUpperArm * yUpperArm) + (xUpperArm * xUpperArm)));

    const yLowerArm = yRightWrist - yRightElbow;
    const xLowerArm = xRightWrist - xRightElbow;
    //const LowerArm = {yLowerArm, xLowerArm};

    const lengthLowerArm = (Math.sqrt((yLowerArm * yLowerArm) + (xLowerArm * xLowerArm)));

    const angle = (((yUpperArm * yLowerArm) + (xUpperArm * xLowerArm))/(lengthUpperArm * lengthLowerArm));
   
    
    if(angle < 0.08 && angle > -0.08) {
      setColorTrue();
    } else {
      setColorFalse();
    }

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
    clearInterval(this.intervallRef);
    this.cameraActive = false;
    this.image = null;
  }

  /**
   * Transform the pose into a vector of points from the keypoints
   * @param pose - the pose from posenet
   * @returns - vector of points
   */
  poseToVector(pose){
    const keypoints = pose["keypoints"];
    var vectorPose = []
    for(let key of keypoints){
      const position = key["position"]
      
      const x = position["x"]
      const y = position["y"]
      
      vectorPose.push(x)
      vectorPose.push(y)

    }
    return vectorPose
  }

  /**
   * Compare to poses using the similarity of the cosine and calculate the distance
   * @param pose1 - the pose from the user 
   * @param pose2 - the pose from the coach
   * @returns - distance between two poses using the cosine simularity
   */
  compareTwoPoses(pose1, pose2){

    const vectorPose_1 = this.poseToVector(pose1)
    const vectorPose_2 = this.poseToVector(pose2)
     
    let cosineSimilarity = similarity(vectorPose_1, vectorPose_2);
    
    let distance = 2 * (1 - cosineSimilarity);
    return Math.sqrt(Math.abs(distance));
  }
  
}


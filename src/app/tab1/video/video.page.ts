import { Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { Plugins } from "@capacitor/core"
const { CameraPreview } = Plugins;
import { CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import * as posenet from '@tensorflow-models/posenet';
import {drawKeypoints, drawSkeleton, setColorFalse, setColorTrue} from '../drawing.service';
import similarity from 'calculate-cosine-similarity';
import '@capacitor-community/camera-preview';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import {BodyAnatomie} from './classes/BodyAnatomie';
import { ComparePoseService } from './classes/comparePoseService';


@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit{

  model = null;
  image = null;
  cameraActive = false;
  intervallRef: any;
  cssProberty: any;
  cssProbertyCloseButton: any;
  videoSource: string;
  orientation: string;
  video: string;

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private router: Router,
    private activatedRout: ActivatedRoute,
    private screenOrientation: ScreenOrientation,
    private comparePoseService: ComparePoseService
  ) { }

  ngOnInit() {
    this.video = this.activatedRout.snapshot.params['video'];
    if(this.video == 'yoga') {
      this.videoSource = "../../assets/videos/Yoga.mp4"
    }
    if(this.video == 'squad') {
      this.videoSource = "../../assets/videos/Squad.mp4"
    }
    this.orientation = this.screenOrientation.type;
    this.screenOrientation.onChange().subscribe(
      () => {
          this.orientation = this.screenOrientation.type;
          this.setCssProberty();
      }
   );
    this.loadModel();
    this.setCssProberty();
    this.openCamera();
    setTimeout(() => {
      let vid = <HTMLVideoElement>document.getElementById("myVideo");
      vid.pause();
    }, 1500);
  }

  setCssProberty(){
    if(this.orientation == "portrait-primary"){
      this.cssProberty = 'max-height: ' + (window.innerHeight) + 'px; top: ' + (0) + 'px;'; //'max-height: ' + (window.innerWidth / 1.8962963) + 'px; top: ' + ((window.innerHeight / 2) - ((window.innerWidth / 1.8962963) / 2)) + 'px;
      this.cssProbertyCloseButton = 'left: 30px; top: 45px;'
    } else {
      this.cssProberty = 'max-height: ' + window.innerHeight + 'px; top: 0px';
      this.cssProbertyCloseButton = 'left: 75px; top: 20px;'
    }
    
  }

  //load the TensorflowModel PoseNet
  async loadModel() {

    // genaues Model aber sehr langsam
    /*
    this.model = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 16,
      inputResolution: { width: 257, height: 200},
      quantBytes: 2
    });
    */

    //ungenaues Model aber schnell...
    this.model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 257, height: 200},
      multiplier: 0.5
    });
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

    //starts a interval
    this.intervall()
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

    /*
    const bodyAnatomie = new BodyAnatomie(pose);
    const rightArm = bodyAnatomie.getRightArmVector;
    console.log(rightArm);
    */

    if (this.comparePoseService.compareTwoPoses(pose,this.comparePoseService.getPose())) {
      let vid = <HTMLVideoElement>document.getElementById("myVideo");
      vid.play();
    }

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
    clearInterval(this.intervallRef);
    this.cameraActive = false;
    this.image = null;
    this.router.navigate(['/']);
  }
}

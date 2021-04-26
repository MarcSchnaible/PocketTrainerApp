import { Component, OnInit } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

  model = null;

  constructor() {}

  ngOnInit() {
    this.loadModel();
  }

  async loadModel() {
    this.model = await posenet.load();
  }

  async detect() {
    const pose = await this.model.estimateSinglePose();
  }

  

}

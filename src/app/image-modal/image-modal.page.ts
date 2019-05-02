// import { Component, OnInit } from '@angular/core';
//
// @Component({
//   selector: 'app-image-modal',
//   templateUrl: './image-modal.page.html',
//   styleUrls: ['./image-modal.page.scss'],
// })
// export class ImageModalPage implements OnInit {
//
//   constructor() { }
//
//   ngOnInit() {
//   }
//
// }

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {

  @ViewChild('slider', { read: ElementRef })slider: ElementRef;
  img: any;
  note: any;
  date: any;

  sliderOpts = {
    zoom: {
      maxRatio: 5
    }
  };

  constructor(private navParams: NavParams, private modalController: ModalController) { }

  ngOnInit() {
    this.img = this.navParams.get('img');
    this.note = this.navParams.get('note');
    this.date = this.navParams.get('date');
  }

  zoom(zoomIn: boolean) {
    let zoom = this.slider.nativeElement.swiper.zoom;
    if (zoomIn) {
      zoom.in();
    } else {
      zoom.out();
    }
  }

  close() {
    this.modalController.dismiss();
  }

}

import { Component } from '@angular/core';
import {  NavController, App } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="close()">Animals</ion-button>
    </ion-list>
  `
})
export class AnimalsPopover {
  constructor(
    public navCtrl: NavController,
    
    public app: App,
  ) {}

  close() {
    // this.viewCtrl.dismiss();
  }

}

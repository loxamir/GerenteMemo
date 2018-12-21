import { Component } from '@angular/core';
import { PopoverController, NavController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="close()">Animals</button>
    </ion-list>
  `
})
export class AnimalsPopover {
  constructor(
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
  ) {}

  close() {
    this.popoverCtrl.dismiss();
  }

}

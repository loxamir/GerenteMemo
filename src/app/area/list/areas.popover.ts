import { Component } from '@angular/core';
import { PopoverController, NavController} from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="close()">Areas</button>
    </ion-list>
  `
})
export class AreasPopover {
  constructor(
    public navCtrl: NavController,
    public popoverController: PopoverController,
  ) {}

  close() {
    this.popoverController.dismiss();
  }

}

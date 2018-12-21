import { Component } from '@angular/core';
import { ViewController, NavController, App } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="close()">Crops</button>
    </ion-list>
  `
})
export class CropsPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public app: App,
  ) {}

  close() {
    this.viewCtrl.dismiss();
  }

}

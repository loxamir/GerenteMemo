import { Component } from '@angular/core';
import { ViewController, NavController, App } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="close()">Machines</button>
    </ion-list>
  `
})
export class MachinesPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public app: App,
  ) {}

  close() {
    this.viewCtrl.dismiss();
  }

}

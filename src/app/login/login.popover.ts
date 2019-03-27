import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="logout()">Salir</ion-item>
  </ion-list>
  `
})
export class LoginPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  logout() {
    this.navParams.data.doc.logout();
    this.pop.dismiss();
  }
}

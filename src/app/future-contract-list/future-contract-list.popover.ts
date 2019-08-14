import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item style="background-color: white;" ion-item (click)="sales()">{{'SALES'|translate}}</ion-item>
  </ion-list>
  `
})
export class FutureContractsPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  sales() {
    this.navCtrl.navigateForward(['/tabs/sale-list', {}]);
    this.pop.dismiss();
  }
}

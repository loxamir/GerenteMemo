import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item style="background-color: white;" ion-item (click)="receivable()">Cuentas A Cobrar</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="invoice()">Facturas</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="receipts()">Recibos</ion-item>
  </ion-list>
  `
})
export class ProductionListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  invoice() {
    this.navCtrl.navigateForward(['/invoice-list', {}]);
    this.pop.dismiss();
  }
  contact() {
    this.navCtrl.navigateForward(['/contact-list', {}]);
    this.pop.dismiss();
  }
  products() {
    this.navCtrl.navigateForward(['/product-list', {}]);
    this.pop.dismiss();
  }
  receivable() {
    this.navCtrl.navigateForward(['/planned-list', {}]);
    this.pop.dismiss();
  }
  receipts() {
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/receipt-list', {}]);
  }
}

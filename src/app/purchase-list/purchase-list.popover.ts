import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="payable()">Cuentas A Pagar</ion-item>
    <ion-item class="popover-item" (click)="invoice()">Facturas</ion-item>
    <ion-item class="popover-item" (click)="receipts()">Recibos</ion-item>
  </ion-list>
  `
})
export class PurchaseListPopover {
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
  receipts() {
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/receipt-list', {}]);
  }

  payable() {
    this.navCtrl.navigateForward(['/planned-list', {"signal": "-",}]);
    this.pop.dismiss();
  }





}

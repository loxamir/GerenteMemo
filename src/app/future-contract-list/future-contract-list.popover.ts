import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item style="background-color: white;" ion-item (click)="sales()">Ventas</ion-item>
    <!--ion-item style="background-color: white;" ion-item (click)="invoice()">Facturas</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="receipts()">Recibos</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="contracts()">Contractos</ion-item-->
    <!--ion-item ion-item (click)="importer()">Importador Ventas</ion-item>
    <ion-item (click)="importerLine()">Importador Lineas</ion-item-->
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

  close() {
    this.pop.dismiss();
  }

  importer(){
    this.navCtrl.navigateForward(['/importer', {'docType': 'future-contract'}]);
    this.pop.dismiss();
  }

  importerLine(){
    this.navCtrl.navigateForward(['/importer', {'docType': 'future-contract-line'}]);
    this.pop.dismiss();
  }
  invoice() {
    this.navCtrl.navigateForward(['/invoice-list', {}]);
    this.pop.dismiss();
  }
  contact() {
    this.navCtrl.navigateForward(['/contact-list', {}]);
    this.pop.dismiss();
  }
  contracts() {
    this.navCtrl.navigateForward(['/contract-list', {}]);
    this.pop.dismiss();
  }
  sales() {
    this.navCtrl.navigateForward(['/tabs/sale-list', {}]);
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

import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item style="background-color: white;" ion-item (click)="receivable()">{{'PAYABLE_ACCOUNTS'| translate}}</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="invoice()">{{'INVOICES'| translate}}</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="receipts()">{{'RECEIPTS'| translate}}</ion-item>
    <!--ion-item ion-item (click)="importer()">Importador Contratos</ion-item>
    <ion-item (click)="importerLine()">Importador Lineas</ion-item-->
  </ion-list>
  `
})
export class ContractsPopover {
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
    this.navCtrl.navigateForward(['/importer', {'docType': 'contract'}]);
    this.pop.dismiss();
  }

  importerLine(){
    this.navCtrl.navigateForward(['/importer', {'docType': 'contract-line'}]);
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
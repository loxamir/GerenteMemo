import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="chartOfAccount()">Plan de Cuentas</ion-item>
    <ion-item (click)="accounts()">Cuentas</ion-item>
    <ion-item (click)="Balancete()">Balancete</ion-item>
    <ion-item (click)="cashMoves()">Movimientos</ion-item>
    <ion-item (click)="checks()">Cheques</ion-item>
  </ion-list>
  `
})
export class CashListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  // close() {
  //   this.pop.dismiss();
  // }
  //
  // importer(){
  //   this.navCtrl.navigateForward(['/importer', {'docType': 'sale'}]);
  //   this.pop.dismiss();
  // }
  //
  // importerLine(){
  //   this.navCtrl.navigateForward(['/importer', {'docType': 'sale-line'}]);
  //   this.pop.dismiss();
  // }
  // invoice() {
  //   this.navCtrl.navigateForward(['/invoice-list', {}]);
  //   this.pop.dismiss();
  // }
  // contact() {
  //   this.navCtrl.navigateForward(['/contact-list', {}]);
  //   this.pop.dismiss();
  // }
  // products() {
  //   this.navCtrl.navigateForward(['/product-list', {}]);
  //   this.pop.dismiss();
  // }
  // receivable() {
  //   this.navCtrl.navigateForward(['/planned-list', {}]);
  //   this.pop.dismiss();
  // }
  // receipts() {
  //   this.pop.dismiss();
  //   this.navCtrl.navigateForward(['/receipt-list', {}]);
  // }


  accounts(){
    this.navCtrl.navigateForward(['/account-list', {}]);
    this.pop.dismiss();
  }

  Balancete(){
    this.navCtrl.navigateForward(['/view-report', {reportView: 'stock/Contas'}]);
    this.pop.dismiss();
  }

  chartOfAccount(){
    this.navCtrl.navigateForward(['/accounts-report', {}]);
    this.pop.dismiss();
  }

  cashMoves() {
    this.navCtrl.navigateForward(['/cash-move-list', {}]);
    this.pop.dismiss();
  }

  checks() {
    this.navCtrl.navigateForward(['/check-list', {}]);
    this.pop.dismiss();
  }
}

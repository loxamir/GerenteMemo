import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="editAnimal()">Editar Animal</ion-item>
    <!--<ion-item class="popover-item" (click)="invoice()">Facturas</ion-item>
    <ion-item class="popover-item" (click)="receipts()">Recibos</ion-item>
    <ion-item class="popover-item" (click)="importer()">Importador Ventas</ion-item>
    <ion-item class="popover-item" (click)="importerLine()">Importador Lineas</ion-item-->
  </ion-list>
  `
})
export class AnimalPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  close() {
    this.pop.dismiss();
  }

  editAnimal(){
    // this.navCtrl.navigateForward(['/importer', {'docType': 'sale'}]);
    this.navParams.data.doc.showEdit();
    this.pop.dismiss();
  }

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
}

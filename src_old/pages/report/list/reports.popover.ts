import { Component } from '@angular/core';
import {  NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';
import { ProductsPage } from '../../product/list/products';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</ion-button>
      <button ion-item (click)="products()">Productos</ion-button>
      <button ion-item (click)="contact()">Clientes</ion-button>
      <button ion-item (click)="invoice()">Facturas</ion-button>
    </ion-list>
  `
})
export class ReportsPopover {
  constructor(
    public navCtrl: NavController,
    
  ) {}

  close() {
    // this.viewCtrl.dismiss();
  }
  invoice() {
    this.navCtrl.navigateForward(InvoicesPage, {'select': true});
    // this.viewCtrl.dismiss();
  }
  contact() {
    this.navCtrl.navigateForward(ContactsPage, {'select': true});
    // this.viewCtrl.dismiss();
  }
  products() {
    this.navCtrl.navigateForward(ProductsPage);
    // this.viewCtrl.dismiss();
  }
}

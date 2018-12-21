import { Component } from '@angular/core';
import { ViewController, NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';
import { ProductsPage } from '../../product/list/products';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</button>
      <button ion-item (click)="products()">Productos</button>
      <button ion-item (click)="contact()">Clientes</button>
      <button ion-item (click)="invoice()">Facturas</button>
    </ion-list>
  `
})
export class ReportsPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
  ) {}

  close() {
    this.viewCtrl.dismiss();
  }
  invoice() {
    this.navCtrl.push(InvoicesPage, {'select': true});
    this.viewCtrl.dismiss();
  }
  contact() {
    this.navCtrl.push(ContactsPage, {'select': true});
    this.viewCtrl.dismiss();
  }
  products() {
    this.navCtrl.push(ProductsPage);
    this.viewCtrl.dismiss();
  }
}

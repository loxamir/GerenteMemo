import { Component } from '@angular/core';
import { ViewController, NavController, Events, App } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';
import { ProductsPage } from '../../product/list/products';
import { PlannedListPage } from '../../planned/list/planned-list';
import { ReceiptsPage } from '../../receipt/list/receipts';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="payable()">Cuentas A Pagar</button>
      <button style="background-color: white;" ion-item (click)="invoice()">Facturas</button>
      <button style="background-color: white;" ion-item (click)="receipts()">Recibos</button>
    </ion-list>
  `
})
export class PurchasesPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public events: Events,
    public app: App,
  ) {}

  invoice() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(InvoicesPage);
    this.viewCtrl.dismiss();
  }
  contact() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ContactsPage);
    this.viewCtrl.dismiss();
  }
  products() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ProductsPage);
    this.viewCtrl.dismiss();
  }
  payable() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PlannedListPage, {
      "signal": "-",
    });
    this.viewCtrl.dismiss();
  }
  receipts() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReceiptsPage);
    this.viewCtrl.dismiss();
  }
}

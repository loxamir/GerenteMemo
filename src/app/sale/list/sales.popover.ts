import { Component } from '@angular/core';
import { ViewController, NavController, Events, App } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';
import { ProductsPage } from '../../product/list/products';
import { PlannedListPage } from '../../planned/list/planned-list';
import { ReceiptsPage } from '../../receipt/list/receipts';
import { ImporterPage } from '../../importer/importer';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="receivable()">Cuentas A Cobrar</button>
      <button style="background-color: white;" ion-item (click)="invoice()">Facturas</button>
      <button style="background-color: white;" ion-item (click)="receipts()">Recibos</button>
      <!--button ion-item (click)="importer()">Importador Ventas</button>
      <button ion-item (click)="importerLine()">Importador Lineas</button-->
    </ion-list>
  `
})
export class SalesPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public events: Events,
    public app: App,
  ) {}

  importer(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ImporterPage, {'docType': 'sale'});
    this.viewCtrl.dismiss();
  }

  importerLine(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ImporterPage, {'docType': 'sale-line'});
    this.viewCtrl.dismiss();
  }
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
  receivable() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PlannedListPage);
    this.viewCtrl.dismiss();
  }
  receipts() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReceiptsPage);
    this.viewCtrl.dismiss();
  }
}

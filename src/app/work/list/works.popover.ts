import { Component } from '@angular/core';
import { ViewController, NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</button>
      <button ion-item (click)="invoice()">Facturas</button>
      <button ion-item (click)="contact()">Clientes</button>
    </ion-list>
  `
})
export class WorksPopover {
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
}

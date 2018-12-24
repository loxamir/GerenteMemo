import { Component } from '@angular/core';
import {  NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</ion-button>
      <button ion-item (click)="invoice()">Facturas</ion-button>
      <button ion-item (click)="contact()">Clientes</ion-button>
    </ion-list>
  `
})
export class WorksPopover {
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
}

import { Component } from '@angular/core';
import {  NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="invoice()">Facturas</ion-button>
    </ion-list>
  `
})
export class ServicesPopover {
  constructor(
    public navCtrl: NavController,
    
  ) {}
  invoice() {
    this.navCtrl.navigateForward(InvoicesPage, {'select': true});
    // this.viewCtrl.dismiss();
  }
}

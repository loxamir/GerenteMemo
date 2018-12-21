import { Component } from '@angular/core';
import { ViewController, NavController } from '@ionic/angular';
import { InvoicesPage } from '../../invoice/list/invoices';
import { ContactsPage } from '../../contact/list/contacts';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="invoice()">Facturas</button>
    </ion-list>
  `
})
export class ServicesPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
  ) {}
  invoice() {
    this.navCtrl.push(InvoicesPage, {'select': true});
    this.viewCtrl.dismiss();
  }
}

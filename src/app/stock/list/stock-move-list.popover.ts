import { Component } from '@angular/core';
import { ViewController, NavController } from '@ionic/angular';
import { ReceiptsPage } from '../../receipt/list/receipts';
import { CashListPage } from '../../cash/list/cash-list';
@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</button>
      <button ion-item (click)="receipt()">Cobranzas</button>
      <button ion-item (click)="cashList()">Caixas</button>
    </ion-list>
  `
})
export class StockMoveListPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
  ) {}

  close() {
    this.viewCtrl.dismiss();
  }
  invoice() {
    this.viewCtrl.dismiss();
  }
  receipt() {
    this.navCtrl.push(ReceiptsPage);
    this.viewCtrl.dismiss();
  }
  cashList() {
    this.navCtrl.push(CashListPage);
    this.viewCtrl.dismiss();
  }
}

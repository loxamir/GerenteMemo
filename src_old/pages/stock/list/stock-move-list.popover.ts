import { Component } from '@angular/core';
import {  NavController } from '@ionic/angular';
import { ReceiptsPage } from '../../receipt/list/receipts';
import { CashListPage } from '../../cash/list/cash-list';
@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="close()">Filtros</ion-button>
      <button ion-item (click)="receipt()">Cobranzas</ion-button>
      <button ion-item (click)="cashList()">Caixas</ion-button>
    </ion-list>
  `
})
export class StockMoveListPopover {
  constructor(
    public navCtrl: NavController,
    
  ) {}

  close() {
    // this.viewCtrl.dismiss();
  }
  invoice() {
    // this.viewCtrl.dismiss();
  }
  receipt() {
    this.navCtrl.navigateForward(ReceiptsPage);
    // this.viewCtrl.dismiss();
  }
  cashList() {
    this.navCtrl.navigateForward(CashListPage);
    // this.viewCtrl.dismiss();
  }
}

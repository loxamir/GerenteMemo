import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="showWarehouses()">Depositos</ion-item>
    <ion-item class="popover-item" (click)="importer()">Importar Productos</ion-item>
    <ion-item class="popover-item" (click)="stockMoves()">Movimientos</ion-item>
  </ion-list>
  `
})
export class ProductListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  showWarehouses(){
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/warehouse-list', {}]);
  }

  importer(){
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/importer', {'docType': 'product'}]);
  }

  stockMoves() {
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/stock-move-list', {}]);
  }
}

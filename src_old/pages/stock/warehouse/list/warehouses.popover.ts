import { Component } from '@angular/core';
import {  NavController, App } from '@ionic/angular';
import { ProductsPage } from '../../../product/list/products';
import { StockMoveListPage } from '../../list/stock-move-list';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="stockMoves()">Movimientos</ion-button>
      <button style="background-color: white;" ion-item (click)="products()">Productos</ion-button>
    </ion-list>
  `
})
export class WarehousesPopover {
  constructor(
    public navCtrl: NavController,
    
    public app: App,
  ) {}

  stockMoves() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(StockMoveListPage, {});
    // this.navCtrl.navigateForward(StockMoveListPage);
    // this.viewCtrl.dismiss();
  }
  products() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ProductsPage, {});
    // this.navCtrl.navigateForward(ProductsPage);
    // this.viewCtrl.dismiss();
  }
}

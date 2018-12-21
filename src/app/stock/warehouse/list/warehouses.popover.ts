import { Component } from '@angular/core';
import { ViewController, NavController, App } from '@ionic/angular';
import { ProductsPage } from '../../../product/list/products';
import { StockMoveListPage } from '../../list/stock-move-list';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="stockMoves()">Movimientos</button>
      <button style="background-color: white;" ion-item (click)="products()">Productos</button>
    </ion-list>
  `
})
export class WarehousesPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public app: App,
  ) {}

  stockMoves() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(StockMoveListPage, {});
    // this.navCtrl.push(StockMoveListPage);
    this.viewCtrl.dismiss();
  }
  products() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ProductsPage, {});
    // this.navCtrl.push(ProductsPage);
    this.viewCtrl.dismiss();
  }
}

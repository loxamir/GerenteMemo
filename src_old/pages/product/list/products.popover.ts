import { Component } from '@angular/core';
import {  NavController, App } from '@ionic/angular';
import { ImporterPage } from '../../importer/importer';
import { StockMoveListPage } from '../../stock/list/stock-move-list';
import { WarehousesPage } from '../../stock/warehouse/list/warehouses';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="showWarehouses()">Depositos</ion-button>
      <button style="background-color: white;" ion-item (click)="importer()">Importar Productos</ion-button>
      <button style="background-color: white;" ion-item id="stock-move-button" (click)="stockMoves()">Movimientos</ion-button>
    </ion-list>
  `
})
export class ProductsPopover {
  public csvItems : any;
  create: any = {};
  exists = {};
  createList: any = [];

  constructor(
    
    public navCtrl: NavController,
    public app: App,
  ) {}

  showWarehouses(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(WarehousesPage, {});
    // this.viewCtrl.dismiss();
  }

  importer(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ImporterPage, {'docType': 'product'});
    // this.navCtrl.navigateForward(ImporterPage, );
    // this.viewCtrl.dismiss();
  }

  stockMoves() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(StockMoveListPage, {});
    // this.viewCtrl.dismiss();
  }
}

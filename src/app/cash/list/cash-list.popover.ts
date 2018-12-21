import { Component } from '@angular/core';
import { ViewController, NavController, App } from '@ionic/angular';
// import { ReceiptsPage } from '../../receipt/list/receipts';
import { CashMoveListPage } from '../move/list/cash-move-list';
import { AccountsReportPage } from '../../report/accounts/accounts';
import { AccountsPage } from '../move/account/list/accounts';
import { ViewPage } from '../../report/view/view';
import { ChecksPage } from '../../check/list/checks';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="chartOfAccount()">Plan de Cuentas</button>
      <button style="background-color: white;" ion-item (click)="accounts()">Cuentas</button>
      <button style="background-color: white;" ion-item (click)="Balancete()">Balancete</button>
      <button style="background-color: white;" ion-item id="cash-move-button" (click)="cashMoves()">Movimientos</button>
      <button style="background-color: white;" ion-item (click)="checks()">Cheques</button>
    </ion-list>
  `
})
export class CashListPopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public app: App,
  ) {}

  accounts(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(AccountsPage, {});
    this.viewCtrl.dismiss();
  }

  Balancete(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ViewPage, {reportView: 'stock/Contas'});
    this.viewCtrl.dismiss();
  }

  chartOfAccount(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(AccountsReportPage, {
      // 'dateStart': this.reportsForm.value.dateStart,
      // 'dateEnd': this.reportsForm.value.dateEnd,
    });
    this.viewCtrl.dismiss();
  }

  cashMoves() {
    // this.navCtrl.push(CashMoveListPage, {});
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(CashMoveListPage, {});
    this.viewCtrl.dismiss();
  }




  checks() {
  // this.navCtrl.push(CashMoveListPage, {});
  let newRootNav = <NavController>this.app.getRootNavById('n4');
  newRootNav.push(ChecksPage, {});
  this.viewCtrl.dismiss();
  }
}

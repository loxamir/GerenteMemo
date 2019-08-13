import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="chartOfAccount()">{{'CHART_OF_ACCOUNT'|translate}}</ion-item>
    <ion-item (click)="accounts()">{{'ACCOUNTS'|translate}}</ion-item>
    <ion-item (click)="Balancete()">{{'TRIAL_BALANCE'|translate}}</ion-item>
    <ion-item (click)="cashMoves()">{{'MOVES'|translate}}</ion-item>
    <ion-item (click)="checks()">{{'CHECKS'|translate}}</ion-item>
  </ion-list>
  `
})
export class CashListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  accounts(){
    this.navCtrl.navigateForward(['/account-list', {}]);
    this.pop.dismiss();
  }

  Balancete(){
    this.navCtrl.navigateForward(['/view-report', {reportView: 'stock/Contas'}]);
    this.pop.dismiss();
  }

  chartOfAccount(){
    this.navCtrl.navigateForward(['/accounts-report', {}]);
    this.pop.dismiss();
  }

  cashMoves() {
    this.navCtrl.navigateForward(['/cash-move-list', {}]);
    this.pop.dismiss();
  }

  checks() {
    this.navCtrl.navigateForward(['/check-list', {}]);
    this.pop.dismiss();
  }
}

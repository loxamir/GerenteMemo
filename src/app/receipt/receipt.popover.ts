import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="cancel()">Cancelar</ion-item>
    <ion-item (click)="selectAccount()">Cuenta Diferencia</ion-item>
    <ion-item (click)="selectCheck()" *ngIf="this.navParams.data.doc.receiptForm.value.cash_paid.type=='check'">Selecionar Cheque</ion-item>
  </ion-list>
  `
})
export class ReceiptPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  cancel(){
    this.navParams.data.doc.receiptCancel();
    this.pop.dismiss();
  }

  selectAccount(){
    this.navParams.data.doc.selectAccount();
    this.pop.dismiss();
  }

  selectCheck(){
    this.navParams.data.doc.selectCheck();
    this.pop.dismiss();
  }
}

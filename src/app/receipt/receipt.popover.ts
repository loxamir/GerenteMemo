import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="cancel()">Cancelar</ion-item>
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
}

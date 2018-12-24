import { Component } from '@angular/core';
import {  NavController, Events, App,  ToastController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="duplicate()">Duplicar</ion-button>
    </ion-list>
  `
})
export class PurchasePopover {
  constructor(
    public navCtrl: NavController,
    
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
    public app: App,
  ) {}

  duplicate(){
    this.navParams.data.doc._id = '';
    this.navParams.data.doc.purchaseForm.patchValue({
      state: 'QUOTATION',
      _id: '',
      code: '',
      planned: [],
      payments: [],
      invoices: [],
    });
    this.navParams.data.doc.purchaseForm.markAsDirty();
    let toast = this.toastCtrl.create({
      message: "Compra Duplicada",
      duration: 2000
    });
    toast.present();
    // this.viewCtrl.dismiss();
  }
}
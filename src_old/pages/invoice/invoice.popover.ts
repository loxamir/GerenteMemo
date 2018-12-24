import { Component } from '@angular/core';
import {  NavController, NavParams, ToastController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="duplicate()">Duplicar</ion-button>
    </ion-list>
  `
})
export class InvoicePopover {
  constructor(
    public navCtrl: NavController,
    
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
  ) {}

  duplicate(){
    this.navParams.data.doc._id = '';
    this.navParams.data.doc.invoiceForm.patchValue({
      state: 'QUOTATION',
      _id: '',
      code: '',
      planned: [],
      payments: [],
      invoices: [],
    });
    this.navParams.data.doc.invoiceForm.markAsDirty();
    let toast = this.toastCtrl.create({
      message: "Factura Duplicada",
      duration: 2000
    });
    toast.present();
    // this.viewCtrl.dismiss();
  }
}

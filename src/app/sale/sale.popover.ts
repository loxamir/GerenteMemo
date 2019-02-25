import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">Duplicar</ion-item>
    <ion-item (click)="return()" *ngIf="navParams.data.doc.saleForm.value.state!='QUOTATION'">Devolver</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.saleForm.value.state=='CONFIRMED' && navParams.data.doc.saleForm.value.date.split('T')[0]==today.split('T')[0]">Desconfirmar</ion-item>
  </ion-list>
  `
})
export class SalePopover {
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
    async duplicate(){
      this.navParams.data.doc._id = '';
      this.navParams.data.doc.saleForm.patchValue({
        state: 'QUOTATION',
        _id: '',
        code: '',
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.saleForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Venta Duplicada",
        duration: 2000
      });
      toast.present();
      this.pop.dismiss();
      // this.viewCtrl.dismiss();
    }

    cancel(){
      this.navParams.data.doc.saleCancel();
      this.pop.dismiss();
    }

    return(){
      this.navParams.data.doc.saleReturn();
      this.pop.dismiss();
    }
}

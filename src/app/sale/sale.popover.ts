import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">Duplicar</ion-item>
    <ion-item (click)="share()">Compartir</ion-item>
    <ion-item (click)="cancel()">Cancelar</ion-item>
  </ion-list>
  `
})
export class SalePopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
  ) {
    this.pop = navParams.get('popoverController');
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

    share(){
      this.navParams.data.doc.share();
      this.pop.dismiss();
    }

    cancel(){
      this.navParams.data.doc.saleCancel();
      this.pop.dismiss();
    }
}

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
export class ProductionPopover {
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
      this.navParams.data.doc.productionForm.patchValue({
        state: 'DRAFT',
        _id: '',
        code: '',
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.productionForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Producción Duplicada",
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
      this.navParams.data.doc.productionCancel();
      this.pop.dismiss();
    }
}

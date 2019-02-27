import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">Duplicar</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='CONFIRMED' && navParams.data.doc.serviceForm.value.date.split('T')[0]==today.split('T')[0]">Desconfirmar</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='SCHEDULED' || navParams.data.doc.serviceForm.value.state=='STARTED'">Volver a Borrador</ion-item>
  </ion-list>
  `
})
export class ServicePopover {
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
      this.navParams.data.doc.serviceForm.patchValue({
        state: 'DRAFT',
        _id: '',
        code: '',
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.serviceForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Servicio Duplicado",
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
      this.navParams.data.doc.serviceCancel();
      this.pop.dismiss();
    }
}

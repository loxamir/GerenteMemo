import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">Duplicar</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='CONFIRMED'">Desconfirmar</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='SCHEDULED' || navParams.data.doc.serviceForm.value.state=='STARTED'">Volver a Borrador</ion-item>
    <ion-item (click)="share()">Compartir</ion-item>
    <ion-item (click)="print()">Imprimir</ion-item>
  </ion-list>
  `
})
export class ServicePopover {
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

    print(){
      this.navParams.data.doc.print();
      this.pop.dismiss();
    }

    cancel(){
      this.navParams.data.doc.serviceCancel();
      this.pop.dismiss();
    }
}

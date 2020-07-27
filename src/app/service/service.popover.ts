import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">{{'DUPLICATE'|translate}}</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='CONFIRMED'&& !navParams.data.doc.serviceForm.value.payments.length">{{'UNCONFIRM'|translate}}</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.serviceForm.value.state=='SCHEDULED' || navParams.data.doc.serviceForm.value.state=='STARTED'">{{'BACK_TO_QUOTATION'|translate}}</ion-item>
    <ion-item (click)="share()">{{'SHARE'|translate}}</ion-item>
    <ion-item (click)="print()">{{'PRINT'|translate}}</ion-item>
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
        state: 'QUOTATION',
        _id: '',
        code: '',
        residual: this.navParams.data.doc.serviceForm.value.total,
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.serviceForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Servicio Duplicado",
        duration: 500
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

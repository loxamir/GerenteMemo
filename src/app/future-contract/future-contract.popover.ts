import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">{{'DUPLICATE'|translate}}</ion-item>
    <!--ion-item (click)="cancel()" *ngIf="navParams.data.doc.futureContractForm.value.state=='CONFIRMED' && !navParams.data.doc.futureContractForm.value.payments.length">Desconfirmar</ion-item>
    <ion-item (click)="share()">Compartir</ion-item>
    <ion-item (click)="print()">Imprimir</ion-item-->
  </ion-list>
  `
})
export class FutureContractPopover {
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
      this.navParams.data.doc.futureContractForm.patchValue({
        state: 'QUOTATION',
        _id: '',
        code: '',
        date: new Date().toISOString(),
        residual: this.navParams.data.doc.futureContractForm.value.total,
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.futureContractForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Contracto Duplicado",
        duration: 500
      });
      toast.present();
      this.pop.dismiss();
      // this.viewCtrl.dismiss();
    }

    cancel(){
      this.navParams.data.doc.futureContractCancel();
      this.pop.dismiss();
    }

    share(){
      this.navParams.data.doc.share();
      this.pop.dismiss();
    }

    print(){
      this.navParams.data.doc.print();
      this.pop.dismiss();
    }

    return(){
      this.navParams.data.doc.futureContractReturn();
      this.pop.dismiss();
    }
}

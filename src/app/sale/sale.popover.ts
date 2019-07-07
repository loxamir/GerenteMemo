import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">Duplicar</ion-item>
    <ion-item (click)="return()" *ngIf="navParams.data.doc.saleForm.value.state!='QUOTATION'">Devolver</ion-item>
    <ion-item (click)="cancel()" *ngIf="navParams.data.doc.saleForm.value.state=='CONFIRMED' && !navParams.data.doc.saleForm.value.payments.length">Desconfirmar</ion-item>
    <ion-item (click)="share()">Compartir</ion-item>
    <ion-item (click)="print()">Imprimir</ion-item>
    <ion-item (click)="addNote()">Agregar Anotación</ion-item>
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
        date: new Date().toISOString(),
        residual: this.navParams.data.doc.saleForm.value.total,
        planned: [],
        payments: [],
        invoices: [],
      });
      this.navParams.data.doc.saleForm.markAsDirty();
      let toast = await this.toastCtrl.create({
        message: "Venta Duplicada",
        duration: 500
      });
      toast.present();
      this.pop.dismiss();
      // this.viewCtrl.dismiss();
    }

    cancel(){
      this.navParams.data.doc.saleCancel();
      this.pop.dismiss();
    }

    async addNote(){
      await this.navParams.data.doc.saleForm.patchValue({note: ''});
      setTimeout(() => {
        this.navParams.data.doc.note.setFocus();
      }, 300);
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
      this.navParams.data.doc.saleReturn();
      this.pop.dismiss();
    }
}

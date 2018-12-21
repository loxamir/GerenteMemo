import { Component } from '@angular/core';
import { ViewController, NavController, Events, App, NavParams, ToastController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="duplicate()">Duplicar</button>
      <button style="background-color: white;" ion-item (click)="share()">Compartir</button>
    </ion-list>
  `
})
export class SalePopover {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public app: App,
  ) {}

  duplicate(){
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
    let toast = this.toastCtrl.create({
      message: "Venta Duplicada",
      duration: 2000
    });
    toast.present();
    this.viewCtrl.dismiss();
  }

  share(){
    this.navParams.data.doc.share();
    this.viewCtrl.dismiss();
  }
}

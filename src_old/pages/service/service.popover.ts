import { Component } from '@angular/core';
import {  NavController, Events,  ToastController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <button style="background-color: white;" ion-item (click)="duplicate()">Duplicar</ion-button>
    </ion-list>
  `
})
export class ServicePopover {
  constructor(
    public navCtrl: NavController,
    
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
  ) {}

  duplicate(){
    this.navParams.data.doc._id = '';
    this.navParams.data.doc.serviceForm.patchValue({
      state: 'QUOTATION',
      _id: '',
      code: '',
      planned: [],
      payments: [],
      invoices: [],
    });
    this.navParams.data.doc.serviceForm.markAsDirty();
    let toast = this.toastCtrl.create({
      message: "Servicio Duplicado",
      duration: 2000
    });
    toast.present();
    // this.viewCtrl.dismiss();
  }
}

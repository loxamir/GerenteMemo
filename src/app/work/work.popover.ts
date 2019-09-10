import { Component } from '@angular/core';
import {  NavController, PopoverController, ToastController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="duplicate()">{{'DUPLICATE'|translate}}</ion-item>
    <ion-item (click)="gotoStarted()" *ngIf="navParams.data.doc.workForm.value.state=='DONE'">{{'UNCONFIRM'|translate}}</ion-item>
    <ion-item (click)="gotoDraft()" *ngIf="navParams.data.doc.workForm.value.state=='SCHEDULED' || navParams.data.doc.workForm.value.state=='STARTED'">{{'BACK_TO_DRAFT'|translate}}</ion-item>
  </ion-list>
  `
})
export class WorkPopover {
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
    this.navParams.data.doc.workForm.patchValue({
      state: 'DRAFT',
      _id: ''
    });
    this.navParams.data.doc.workForm.markAsDirty();
    let toast = await this.toastCtrl.create({
      message: "Trabajo Duplicado",
      duration: 500
    });
    toast.present();
    this.pop.dismiss();
  }

  gotoStarted(){
    this.navParams.data.doc.gotoStarted();
    this.pop.dismiss();
  }

  gotoDraft(){
    this.navParams.data.doc.gotoDraft();
    this.pop.dismiss();
  }
}

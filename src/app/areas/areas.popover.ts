import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="gotoReport()">Relatorio Agricola</ion-item>
    <ion-item class="popover-item" (click)="gotoCrops()">Safras</ion-item>
    <ion-item class="popover-item" (click)="gotoActivities()">Actividades</ion-item>
  </ion-list>
  `
})
export class AreasPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  close() {
    this.pop.dismiss();
  }

  gotoCrops(){
    // this.navCtrl.navigateForward(['/importer', {'docType': 'sale'}]);
    this.navCtrl.navigateForward(['/crops', {}]);
    this.pop.dismiss();
  }

  gotoReport(){
    // this.navCtrl.navigateForward(['/importer', {'docType': 'sale'}]);
    this.navCtrl.navigateForward(['/activity-report', {}]);
    this.pop.dismiss();
  }

  gotoActivities(){
    this.navCtrl.navigateForward(['/activitys', {}]);
    this.pop.dismiss();
  }

  // importerLine(){
  //   this.navCtrl.navigateForward(['/importer', {'docType': 'sale-line'}]);
  //   this.pop.dismiss();
  // }
  // invoice() {
  //   this.navCtrl.navigateForward(['/invoice-list', {}]);
  //   this.pop.dismiss();
  // }
  // contact() {
  //   this.navCtrl.navigateForward(['/contact-list', {}]);
  //   this.pop.dismiss();
  // }
  // products() {
  //   this.navCtrl.navigateForward(['/product-list', {}]);
  //   this.pop.dismiss();
  // }
  // receivable() {
  //   this.navCtrl.navigateForward(['/planned-list', {}]);
  //   this.pop.dismiss();
  // }
  // receipts() {
  //   this.pop.dismiss();
  //   this.navCtrl.navigateForward(['/receipt-list', {}]);
  // }
}

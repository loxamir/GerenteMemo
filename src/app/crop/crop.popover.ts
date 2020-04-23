import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="showCostReport()">{{'COST_REPORT'|translate}}</ion-item>
    <ion-item (click)="showYieldReport()">{{'YIELD_REPORT'|translate}}</ion-item>
  </ion-list>
  `
})
export class CropPopover {
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

  showCostReport() {
    this.navCtrl.navigateForward(['/activity-report', {
      'reportType': "activity",
      'crop_id': this.navParams.data.doc._id,
    }]);
    this.pop.dismiss();
  }

  showYieldReport() {
    this.navCtrl.navigateForward(['/activity-report', {
      'reportType': "activity",
      groupBy: "yieldAreakg",
      'crop_id': this.navParams.data.doc._id,
    }]);
    this.pop.dismiss();
  }

}

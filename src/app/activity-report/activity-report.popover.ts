import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="showFilter()">{{'FILTERS'|translate}}</ion-item>
  </ion-list>
  `
})
export class ActivityReportPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  showFilter(){
    this.navParams.data.doc.reportActivityForm.value.showFilter = true;
    this.pop.dismiss();
  }
}

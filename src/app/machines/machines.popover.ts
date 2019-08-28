import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="gotoReport()">{{'MACHINE_REPORT'|translate}}</ion-item>
  </ion-list>
  `
})
export class MachinesPopover {
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

  gotoReport(){
    this.navCtrl.navigateForward(['/machine-report', {}]);
    this.pop.dismiss();
  }

  gotoActivities(){
    this.navCtrl.navigateForward(['/activitys', {}]);
    this.pop.dismiss();
  }
}

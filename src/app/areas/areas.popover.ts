import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <!--ion-item class="popover-item" (click)="gotoReport()">{{'AGRO_REPORT'| translate}}</ion-item-->
    <ion-item class="popover-item" (click)="gotoCrops()">{{'CROPS'|translate}}</ion-item>
    <!--ion-item class="popover-item" (click)="gotoActivities()">{{'ACTIVITIES'| translate}}</ion-item-->
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
    this.navCtrl.navigateForward(['/crops', {}]);
    this.pop.dismiss();
  }

  gotoReport(){
    this.navCtrl.navigateForward(['/activity-report', {}]);
    this.pop.dismiss();
  }

  gotoActivities(){
    this.navCtrl.navigateForward(['/activitys', {}]);
    this.pop.dismiss();
  }
}

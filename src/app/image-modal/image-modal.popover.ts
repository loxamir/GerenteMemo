import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="changeDate()">{{'CHANGE_DATE'|translate}}</ion-item>
  </ion-list>
  `
})
export class ImageModalPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  changeDate(){
    this.navParams.data.doc.changeDate();
    this.pop.dismiss();
  }

}

import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="editArea()">{{'EDIT_AREA'|translate}}</ion-item>
  </ion-list>
  `
})
export class AreaPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  editArea(){
    this.navParams.data.doc.showEdit();
    this.pop.dismiss();
  }
}

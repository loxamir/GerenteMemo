import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="editWorks()">{{'EDIT_WORKS'|translate}}</ion-item>
  </ion-list>
  `
})
export class WorksPopover {
  pop: PopoverController;
  today;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
    this.today = new Date().toISOString();
  }

  editWorks(){
    this.navParams.data.doc.showEdit();
    this.pop.dismiss();
  }
}

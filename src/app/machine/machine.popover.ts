import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="changeShowAlll()" *ngIf="!this.navParams.data.doc.showAll">{{'SHOW_WORKS'|translate}}</ion-item>
    <ion-item class="popover-item" (click)="changeShowAlll()" *ngIf="this.navParams.data.doc.showAll">{{'HIDE_WORKS'|translate}}</ion-item>
    <ion-item class="popover-item" (click)="editMachine()">{{'EDIT_MACHINE'|translate}}</ion-item>
  </ion-list>
  `
})
export class MachinePopover {
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

  editMachine(){
    this.navParams.data.doc.showEdit();
    this.pop.dismiss();
  }

  changeShowAlll(){
    this.navParams.data.doc.changeShowAlll();
    this.pop.dismiss();
  }
}

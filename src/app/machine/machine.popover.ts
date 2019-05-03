import { Component } from '@angular/core';
import {  NavController, Events, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="changeShowAlll()" *ngIf="!this.navParams.data.doc.showAll">Incluir Trabajos</ion-item>
    <ion-item class="popover-item" (click)="changeShowAlll()" *ngIf="this.navParams.data.doc.showAll">Esconder Trabajos</ion-item>
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

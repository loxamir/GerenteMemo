import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="logout()">{{'EXIT'|translate}}</ion-item>
    <ion-item (click)="changeLanguage()">{{'CHANGE_LANGUAGE'|translate}}</ion-item>
  </ion-list>
  `
})
export class LoginPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  changeLanguage(){
    this.navParams.data.doc.changeLanguage();
    this.pop.dismiss();
  }

  logout() {
    this.navParams.data.doc.logout();
    this.pop.dismiss();
  }
}

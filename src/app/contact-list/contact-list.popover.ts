import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="importer()">{{'IMPORT_CONTACTS'| translate</ion-item>
  </ion-list>
  `
})
export class ContactListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  importer(){
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/importer', {'docType': 'contact'}]);
  }
}

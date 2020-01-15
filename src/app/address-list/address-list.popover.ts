import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="importer()">{{'IMPORT_ADDRESSS'| translate</ion-item>
  </ion-list>
  `
})
export class AddressListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  importer(){
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/importer', {'docType': 'address'}]);
  }
}

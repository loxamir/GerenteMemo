import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item class="popover-item" (click)="importer()">Importar Contas</ion-item>
  </ion-list>
  `
})
export class AccountListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  importer(){
    this.pop.dismiss();
    this.navCtrl.navigateForward(['/importer', {'docType': 'account'}]);
  }
}

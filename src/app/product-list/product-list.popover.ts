import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams } from '@ionic/angular';

@Component({
  template: `
  <ion-list>
    <ion-item (click)="edit()">Editar Perfil</ion-item>
    <ion-item (click)="logout()">Sair</ion-item>
  </ion-list>
  `
})
export class ProductListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  edit(){
    this.pop.dismiss();
    this.navParams.data.doc.showConfig();
  }

  logout(){
    this.pop.dismiss();
    this.navParams.data.doc.logout();
  }
}

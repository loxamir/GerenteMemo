import { Component } from '@angular/core';
import {  NavController, PopoverController, NavParams, ModalController } from '@ionic/angular';
import { ContactPage } from '../contact/contact.page';
import { SaleListPage } from '../sale-list/sale-list.page';
import { AddressListPage } from '../address-list/address-list.page';

@Component({
  template: `
  <ion-list>
    <ion-item style="background-color: white;" ion-item (click)="profile()">Perfil</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="orders()">Pedidos</ion-item>
    <ion-item style="background-color: white;" ion-item (click)="address()">Direcciones</ion-item>
  </ion-list>
  `
})
export class ProductListPopover {
  pop: PopoverController;

  constructor(
    public navParams: NavParams,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
  ) {
    this.pop = navParams.get('popoverController');
  }

  async profile() {
    let profileModal = await this.modalCtrl.create({
      component: ContactPage,
      componentProps: {}
    })
    profileModal.present();
    // this.navCtrl.navigateForward(['/contact', {}]);
    this.pop.dismiss();
  }
  async orders() {
    this.navCtrl.navigateForward(['/sale-list', {}]);
    // let profileModal = await this.modalCtrl.create({
    //   component: SaleListPage,
    //   componentProps: {}
    // })
    // profileModal.present();
    this.pop.dismiss();
  }
  async address() {
    this.navCtrl.navigateForward(['/address-list', {}]);
    // let profileModal = await this.modalCtrl.create({
    //   component: AddressListPage,
    //   componentProps: {}
    // })
    // profileModal.present();
    this.pop.dismiss();
  }
}

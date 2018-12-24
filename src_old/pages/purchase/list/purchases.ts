import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController , Events, NavParams, ModalController  } from '@ionic/angular';
import { PurchasePage } from '../purchase';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { PurchasesService } from './purchases.service';
import { PurchasesPopover } from './purchases.popover';
import { HelpsPage } from '../../help/list/helps';

@Component({
  selector: 'purchases-page',
  templateUrl: 'purchases.html'
})
export class PurchasesPage {
  purchases: any;
  loading: any;
  searchTerm: string = '';
  page = 0;
  select: boolean;
  field = "contact";
  criteria = "=";

  constructor(
    public navCtrl: NavController,
    public app: App,
    public purchasesService: PurchasesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public modal: ModalController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-purchase', (change)=>{
      this.purchasesService.handleChange(this.purchases, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.purchasesService.getPurchases(
        this.searchTerm, this.page
      ).then((purchases: any[]) => {
        purchases.forEach(purchase => {
          this.purchases.push(purchase);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  searchItems() {
    this.purchasesService.searchItems(
      this.searchTerm, 0
    ).then((purchases) => {
      console.log("purchases", purchases);
      this.purchases = purchases;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.purchasesService.getPurchases(
        this.searchTerm, 0
      ).then((purchases: any[]) => {
        this.purchases = purchases;
      });
      this.page = 1;
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PurchasesPopover);
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.purchasesService.getPurchases(
      this.searchTerm, 0
    ).then((purchases) => {
      this.purchases = purchases;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  openPurchase(purchase) {
    this.events.subscribe('open-purchase', (data) => {
      this.events.unsubscribe('open-purchase');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PurchasePage, {'_id': purchase._id});
  }

  createPurchase(){
    this.events.subscribe('create-purchase', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-purchase', data);
        });
      }
      this.events.unsubscribe('create-purchase');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PurchasePage, {});
  }

  deletePurchase(purchase){
    let index = this.purchases.indexOf(purchase);
    this.purchases.splice(index, 1);
    this.purchasesService.deletePurchase(purchase);
  }
}

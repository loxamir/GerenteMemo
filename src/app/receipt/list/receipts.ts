import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController, Events, NavParams } from '@ionic/angular';
import { ReceiptPage } from '../receipt';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { ReceiptsService } from './receipts.service';
import { ReceiptsPopover } from './receipts.popover';

@Component({
  selector: 'receipts-page',
  templateUrl: 'receipts.html'
})
export class ReceiptsPage {
  receipts: any;
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select = false;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public receiptsService: ReceiptsService,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public popoverCtrl: PopoverController,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    this.events.subscribe('changed-receipt', (change)=>{
      this.receiptsService.handleChange(this.receipts, change);
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.receiptsService.getReceiptsPage(
        this.searchTerm, this.page
      ).then((receipts: any[]) => {
        receipts.forEach(receipt => {
          this.receipts.push(receipt);
        });
        this.page += 1;
      });
      infiniteScroll.complete();
    }, 50);
  }

  searchItems() {
    this.receiptsService.searchItems(
      this.searchTerm, 0
    ).then((receipts) => {
      this.receipts = receipts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.complete();
    }, 200);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(ReceiptsPopover);
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.receiptsService.getReceiptsPage(
      this.searchTerm, 0
    ).then((receipts) => {
      this.receipts = receipts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openReceipt(receipt) {
    this.events.subscribe('open-receipt', (data) => {
      this.events.unsubscribe('open-receipt');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReceiptPage, {'_id': receipt._id});
  }

  createReceipt(){
    this.events.subscribe('create-receipt', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-receipt', data);
        });
      }
      this.events.unsubscribe('create-receipt');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReceiptPage, {});
  }

  deleteReceipt(receipt){
    let index = this.receipts.indexOf(receipt);
    this.receipts.splice(index, 1);
    this.receiptsService.deleteReceipt(receipt);
  }
}

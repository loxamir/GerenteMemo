import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, PopoverController, Events, NavParams } from '@ionic/angular';
import { ReceiptPage } from '../receipt/receipt.page';
import { ActivatedRoute, Router } from '@angular/router';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
// import { ReceiptsService } from './receipts.service';
// import { ReceiptsPopover } from './receipts.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.page.html',
  styleUrls: ['./receipt-list.page.scss'],
})
export class ReceiptListPage implements OnInit {
  receipts: any;
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public translate: TranslateService,
    public events: Events,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-receipt', (change)=>{
      this.handleChange(this.receipts, change);
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getReceiptsPage(
        this.searchTerm, this.page
      ).then((receipts: any[]) => {
        receipts.forEach(receipt => {
          this.receipts.push(receipt);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  searchItems() {
    this.searchItemsS(
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
      refresher.target.complete();
    }, 200);
  }

  async ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getReceiptsPage(
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
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ReceiptPage, {'_id': receipt._id});
    this.navCtrl.navigateForward(['/receipt', {'_id': receipt._id}]);
  }

  createReceipt(){
    this.events.subscribe('create-receipt', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-receipt', data);
        // });
      }
      this.events.unsubscribe('create-receipt');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ReceiptPage, {});
    this.navCtrl.navigateForward(['/receipt', {}]);
  }

  getReceiptsPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'receipt', keyword, page, "contact_name"
      ).then((receipts: any[]) => {
        resolve(receipts);
      });
    });
  }


  deleteReceipt(receipt){
    return this.pouchdbService.deleteDoc(receipt);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'receipt',
      keyword,
      page,
      "contact_name"
    ).then((receipts) => {
        resolve(receipts);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

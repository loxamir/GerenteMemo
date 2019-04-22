import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController,  LoadingController,  Events, PopoverController } from '@ionic/angular';
import { CashMoveListPopover } from './cash-move-list.popover';

import 'rxjs/Rx';
// import { CashMoveListService } from './cash-move-list.service';
// import { CashListService } from '../../list/cash-list.service';
// import { CashMoveListPopover } from './cash-move-list.popover';

@Component({
  selector: 'app-cash-move-list',
  templateUrl: './cash-move-list.page.html',
  styleUrls: ['./cash-move-list.page.scss'],
})
export class CashMoveListPage implements OnInit {
  cashMoveList: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  currency_precision = 2;

  constructor(
    public pouchdbService: PouchdbService,
    public navCtrl: NavController,
    // public cashMoveListService: CashMoveListService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
  this.select = this.route.snapshot.paramMap.get('select');
  this.events.subscribe('changed-cash-move', (change)=>{
    this.handleChange(this.cashMoveList, change);
  })
}

  getCashMoveList(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
        'cash-move', keyword, page, "contact_name"
      ).then((data: any[]) => {
        resolve(data);
      }).catch((error) => {
        console.log("getCashMoveList Error:", error);
      });
    });
  }

  deleteCashMove(cashMove) {
    return this.pouchdbService.deleteDoc(cashMove);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.getCashMoveList(
      this.searchTerm, 0
    ).then((cashMoveList) => {
      this.cashMoveList = cashMoveList;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(CashMoveListPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  //   this.events.subscribe('import-cash-move', (data) => {
  //     setTimeout(() => {
  //       this.setFilteredItems();
  //     }, 800);
  //   });
  // }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: CashMoveListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  openCashMove(cashMove) {
    if (!this.select){
      this.events.subscribe('open-cash-move', (data) => {
        this.events.unsubscribe('open-cash-move');
      })
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // newRootNav.push(CashMovePage, {'_id': cashMove._id});
      this.navCtrl.navigateForward(['/cash-move', {'_id': cashMove._id}]);
    } else {
      this.selectCashMove(cashMove);
    }
  }

  selectCashMove(cashMove) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-cash-move', cashMove);
      // });
    } else {
      this.openCashMove(cashMove);
    }
  }

  createCashMove(){
    this.events.subscribe('create-cash-move', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-cash-move', data);
        // });
      }
      this.events.unsubscribe('create-cash-move');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CashMovePage, {});
    this.navCtrl.navigateForward(['/cash-move', {}]);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getCashMoveList(
        this.searchTerm, this.page
      ).then((cashMoveList: any[]) => {
        cashMoveList.forEach(cashMove => {
          this.cashMoveList.push(cashMove);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

}

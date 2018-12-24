import { Component } from '@angular/core';
import { NavController, App,  LoadingController,  Events, PopoverController } from '@ionic/angular';
import { CashMovePage } from '../cash-move';

import 'rxjs/Rx';
import { CashMoveListService } from './cash-move-list.service';
import { CashListService } from '../../list/cash-list.service';
import { CashMoveListPopover } from './cash-move-list.popover';

@Component({
  selector: 'cash-move-list-page',
  templateUrl: 'cash-move-list.html',
  providers: [CashMoveListService]
})
export class CashMoveListPage {
  cashMoveList: any;
  loading: any;
  searchTerm: string = '';
  select: boolean;
  page = 0;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public cashMoveListService: CashMoveListService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    
    public events: Events,
    public cashListService: CashListService,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-cash-move', (change)=>{
      this.cashMoveListService.handleChange(this.cashMoveList, change);
    })
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.cashMoveListService.getCashMoveList(
      this.searchTerm, 0
    ).then((cashMoveList) => {
      this.cashMoveList = cashMoveList;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(CashMoveListPopover);
    popover.present({
      ev: myEvent
    });
    this.events.subscribe('import-cash-move', (data) => {
      setTimeout(() => {
        this.setFilteredItems();
      }, 800);
    });
  }

  openCashMove(cashMove) {
    if (!this.select){
      this.events.subscribe('open-cash-move', (data) => {
        this.events.unsubscribe('open-cash-move');
      })
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(CashMovePage, {'_id': cashMove._id});
    } else {
      this.selectCashMove(cashMove);
    }
  }

  selectCashMove(cashMove) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-cash-move', cashMove);
      });
    } else {
      this.openCashMove(cashMove);
    }
  }

  createCashMove(){
    this.events.subscribe('create-cash-move', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-cash-move', data);
        });
      }
      this.events.unsubscribe('create-cash-move');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(CashMovePage, {});
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.cashMoveListService.getCashMoveList(
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

  deleteCashMove(cashMove){
    let index = this.cashMoveList.indexOf(cashMove);
    this.cashMoveList.splice(index, 1);
    this.cashMoveListService.deleteCashMove(cashMove);
  }

}

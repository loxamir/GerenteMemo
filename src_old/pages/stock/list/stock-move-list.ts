import { Component } from '@angular/core';
import { NavController, App,  LoadingController,  Events, PopoverController } from '@ionic/angular';
import { StockMovePage } from '../stock-move';

import 'rxjs/Rx';
import { StockMoveListService } from './stock-move-list.service';
import { StockMoveListPopover } from './stock-move-list.popover';

@Component({
  selector: 'stock-move-list-page',
  templateUrl: 'stock-move-list.html',
  providers: [StockMoveListService]
})
export class StockMoveListPage {
  stockMoveList: any;
  loading: any;
  searchTerm: string = '';
  select: boolean;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public stockMoveListService: StockMoveListService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-stock-move', (change)=>{
      this.stockMoveListService.handleChange(this.stockMoveList, change);
    })
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.stockMoveListService.getStockMoveList(
        this.searchTerm, 0
      ).then((stockMoveList: any[]) => {
        this.stockMoveList = stockMoveList;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.stockMoveListService.getStockMoveList(
      this.searchTerm, 0
    ).then((stockMoveList) => {
      this.stockMoveList = stockMoveList;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(StockMoveListPopover);
    popover.present({
      ev: myEvent
    });
  }

  openStockMove(stockMove) {
    if (!this.select){
      this.events.subscribe('open-stock-move', (data) => {
        this.events.unsubscribe('open-stock-move');
      })
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(StockMovePage, {'_id': stockMove._id});
    } else {
      this.selectStockMove(stockMove);
    }
  }

  selectStockMove(stockMove) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-stock-move', stockMove);
      });
    } else {
      this.openStockMove(stockMove);
    }
  }

  createStockMove(){
    this.events.subscribe('create-stock-move', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-stock-move', data);
        });
      }
      this.events.unsubscribe('create-stock-move');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(StockMovePage, {});
  }

  deleteStockMove(stockMove){
    let index = this.stockMoveList.indexOf(stockMove);
    this.stockMoveList.splice(index, 1);
    this.stockMoveListService.deleteStockMove(stockMove);
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.stockMoveListService.getStockMoveList(
        this.searchTerm, this.page
      ).then((stockMoveList: any[]) => {
        stockMoveList.forEach(stockMove => {
          this.stockMoveList.push(stockMove);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }


}

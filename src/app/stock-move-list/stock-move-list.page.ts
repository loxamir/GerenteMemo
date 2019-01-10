import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,  Events, PopoverController, ModalController } from '@ionic/angular';
// import { StockMovePage } from '../stock-move';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';
// import { StockMoveListService } from './stock-move-list.service';
// import { StockMoveListPopover } from './stock-move-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-stock-move-list',
  templateUrl: './stock-move-list.page.html',
  styleUrls: ['./stock-move-list.page.scss'],
})
export class StockMoveListPage implements OnInit {
  stockMoveList: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    // public app: App,
    // public stockMoveListService: StockMoveListService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public router: Router,
    public route: ActivatedRoute,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-stock-move', (change)=>{
      this.handleChange(this.stockMoveList, change);
    })
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getStockMoveList(
        this.searchTerm, 0
      ).then((stockMoveList: any[]) => {
        this.stockMoveList = stockMoveList;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.getStockMoveList(
      this.searchTerm, 0
    ).then((stockMoveList) => {
      this.stockMoveList = stockMoveList;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(StockMoveListPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openStockMove(stockMove) {
    if (!this.select){
      this.events.subscribe('open-stock-move', (data) => {
        this.events.unsubscribe('open-stock-move');
      })
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      this.navCtrl.navigateForward(['/stock-move', {'_id': stockMove._id}]);
    } else {
      this.selectStockMove(stockMove);
    }
  }

  selectStockMove(stockMove) {
    if (this.select){
      // this.navCtrl.navigateBack('/stock-move-list');
      // .then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-stock-move', stockMove);
      // });
    } else {
      this.openStockMove(stockMove);
    }
  }

  createStockMove(){
    this.events.subscribe('create-stock-move', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-stock-move', data);
        // });
      }
      this.events.unsubscribe('create-stock-move');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(StockMovePage, {});
    this.navCtrl.navigateForward('/stock-move', {});
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getStockMoveList(
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
  getStockMoveList(keyword, page){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.searchDocTypeData(
        'stock-move', keyword, page, "contact_name"
      ).then((data: any[]) => {
        resolve(data);
      }).catch((error) => {
        console.log("getStockMoveList Error:", error);
      });
    });
  }

  deleteStockMove(stockMove) {
    return this.pouchdbService.deleteDoc(stockMove);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

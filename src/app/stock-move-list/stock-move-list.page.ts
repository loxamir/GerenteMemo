import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,  Events, PopoverController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';
import { LanguageService } from "../services/language/language.service";
import { TranslateService } from '@ngx-translate/core';
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
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public router: Router,
    public route: ActivatedRoute,
    public languageService: LanguageService,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-stock-move', (change)=>{
      this.handleChange(this.stockMoveList, change);
    })
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
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
      this.loading.dismiss();
    });
  }

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
      this.modalCtrl.dismiss();
      this.events.publish('select-stock-move', stockMove);
    } else {
      this.openStockMove(stockMove);
    }
  }

  createStockMove(){
    this.events.subscribe('create-stock-move', (data) => {
      if (this.select){
        this.modalCtrl.dismiss();
        this.events.publish('select-stock-move', data);
      }
      this.events.unsubscribe('create-stock-move');
    })
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

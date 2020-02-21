import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, PopoverController,
  NavParams
} from '@ionic/angular';
import 'rxjs/Rx';
import { SalePage } from '../sale/sale.page';
import { SalesPopover } from './sale-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { AuthService } from "../services/auth.service";
import { Events } from '../services/events';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.page.html',
  styleUrls: ['./sale-list.page.scss'],
})
export class SaleListPage implements OnInit {
  sales: any = [];
  loading: any;
  searchTerm: string = '';
  page = 0;
  languages: Array<LanguageModel>;
  currency_precision = 2;
  logged: boolean = false;
  contact_id;
  appliedChanges = [];

  constructor(
    public navCtrl: NavController,
    public authService: AuthService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public pouchdbService: PouchdbService,
    public languageService: LanguageService,
    public translate: TranslateService,
  ) {
    this.events.subscribe('changed-sale', (data)=>{
      if (this.appliedChanges.indexOf(data.change.doc._id+data.change.doc._rev)==-1){
        this.appliedChanges.push(data.change.doc._id+data.change.doc._rev);
        this.handleChange(this.sales, data.change);
      }
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getSalesPage(
        this.searchTerm,
        this.page
      ).then((sales: any[]) => {
        sales.forEach(sale => {
          this.sales.push(sale);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: SalesPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    //this.loading.present();
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.authService.loggedIn.subscribe(async status => {
      this.loading.dismiss();
      if (status) {
        this.logged = true;
        let data = await this.authService.getData();
        this.setFilteredItems();
      } else {
        this.logged = false;
      }
    });
  }

  setFilteredItems() {
    this.getSalesPage(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  async openSale(sale) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    await this.navCtrl.navigateForward(['/sale', {'_id': sale._id}]);
    await this.loading.dismiss();
  }

  async createSale(){
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    await this.navCtrl.navigateForward(['/sale', {}]);
    await this.loading.dismiss();
  }

  getSalesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'sale',
        keyword,
        page,
        "contact_name"
      ).then((sales: any[]) => {
        resolve(sales);
      });
    });
  }

  deleteSale(slidingItem, sale){
    slidingItem.close();
    return this.pouchdbService.deleteDoc(sale);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'sale',
      keyword,
      page,
      "contact_name"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

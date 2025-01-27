import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, PopoverController, Events,
  NavParams
} from '@ionic/angular';
import 'rxjs/Rx';
import { File } from '@ionic-native/file/ngx';
import { SalePage } from '../sale/sale.page';
// import { SalesService } from './sales.service';
import { SalesPopover } from './sale-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { FormatService } from '../services/format.service';

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

  constructor(
    public navCtrl: NavController,
    // public salesService: SalesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public file: File,
    public pouchdbService: PouchdbService,
    public languageService: LanguageService,
    public translate: TranslateService,
    public formatService: FormatService,
  ) {



    this.events.subscribe('changed-sale', (change)=>{
      this.handleChange(this.sales, change);
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
    // console.log("teste my event");
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
    this.setFilteredItems();
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
    this.events.subscribe('open-sale', (data) => {
      this.events.unsubscribe('open-sale');
    })
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
      ).then(async (sales: any[]) => {
        await this.formatService.asyncForEach(sales, async (sale: any) => {
          let payments: any = await this.pouchdbService.getView(
            'Informes/Recibos', 3, ["Venta "+sale.code, null], ["Venta "+sale.code, "z"]);
            let paid_value = payments.reduce(function(paid, item) {
              paid += parseFloat(item.value);
              return paid
            }, 0)
            let residual = sale['total']-paid_value;
            sale['residual'] = residual;
            if (sale.state == 'CONFIRMED' && residual == 0){
              sale.state = 'PAID';
            } else if (sale.state == 'PAID' && sale['residual'] > 0){
              sale.state = 'CONFIRMED';
            }
        })
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

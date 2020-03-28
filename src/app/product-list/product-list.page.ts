import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController,
  PopoverController, ToastController, MenuController } from '@ionic/angular';
import { ProductPage } from '../product/product.page';
import 'rxjs/Rx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPopover } from './product-list.popover';
import { FormatService } from '../services/format.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { Events } from '../services/events';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  @ViewChild('searchBar', { static: true }) searchBar;

  products: any = [];
  // loading: any;
  select;
  category_id: string = 'all';
  page = 0;
  last_record = '';
  searchTerm: string = '';
  currency_precision = 0;
  categories = [];
  config = {};

  constructor(
    public navCtrl: NavController,
    public router: Router,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    // public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
    public languageService: LanguageService,
    public toastCtrl: ToastController,
    public events: Events,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public menuCtrl: MenuController,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.category_id = this.route.snapshot.paramMap.get('category_id') || 'all';
    this.events.subscribe('changed-product', (data) => {
      this.handleChange(this.products, data.change);
    })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.loading = await this.loadingCtrl.create({});
    this.showCategories();
    this.setFilteredItems();
    // await this.loading.present();

    let config: any = (await this.pouchdbService.getDoc('config.profile', false));
    this.config = config;
    this.currency_precision = config.currency_precision || this.currency_precision;
    //
    // if (this.select) {
    //   setTimeout(() => {
    //     this.searchBar.setFocus();
    //   }, 200);
    // }
  }

  async showCategories(){
    if (this.category_id=='all'){
      let categories_tmp:any = await this.pouchdbService.getView('Informes/categories', undefined,
      [""],
      ["z"],
      false,
      false,
      undefined,
      undefined,
      true,
    )
    let categories = [];
    categories = categories_tmp.map(function(item){
      return item.doc;
    });
    this.categories = categories;
    }
  }

  setFilteredItems() {
    return new Promise(async (resolve, reject) => {
      let products:any = await this.getProductsPage();
      this.products = products;
      this.page = 0;
      // await this.loading.dismiss();
      resolve(true);
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(async () => {
      if (this.searchTerm){
        await this.searchItemsLoad();
        infiniteScroll.target.complete();
      } else {
        this.page += 1;
        let products: any = await this.getProductsPage();
        products.forEach(product => {
          this.products.push(product);
        });
        infiniteScroll.target.complete();
      }
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(async() => {
      let products: any = await this.getProductsPage();
      this.products = products;
      this.page = 1;
      refresher.target.complete();
    }, 50);
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: ProductListPopover,
      event: myEvent,
      componentProps: { popoverController: this.popoverCtrl }
    });
    popover.present();
  }

  async openProduct(product) {
    let profileModal = await this.modalCtrl.create({
      component: ProductPage,
      componentProps: {
        "select": true,
        "_id": product._id,
        "product": product,
        "whatsapp": this.config.whatsapp,
      }
    })
    profileModal.present();
    // this.navCtrl.navigateForward(['/product', { '_id': product._id}])
  }

  closeModal() {
    this.navCtrl.navigateBack('');
  }

  getProductsPage() {
    return new Promise(async (resolve, reject) => {
      if (this.category_id == 'all') {
        let products_tmp:any = await this.pouchdbService.getView(
          'Informes/publishedSequence',
          undefined,
          [""],
          ["z"],
          false,
          false,
          15,
          15*this.page,
          true,
        )
        console.log("products_tmp", products_tmp);
        let products = [];
        products = products_tmp.map(function(item){
          return item.doc;
        });
        resolve(products);
      } else {
        let products_tmp:any = await this.pouchdbService.getView(
          'Informes/publishedProductCategory',
          undefined,
          [this.category_id],
          [this.category_id+"z"],
          false,
          false,
          15,
          15*this.page,
          true,
        )
        let products = [];
        products = products_tmp.map(function(item){
          return item.doc;
        });
        resolve(products);
      }
    })
  }

  searchItems() {
    return new Promise(async resolve => {
      if (!this.searchTerm){
        this.page = 0;
        let products = await this.getProductsPage();
        this.products = products;
      } else {
        if (this.category_id == 'all'){
          this.pouchdbService.searchDocs(
            'product',
            this.searchTerm,
            '',
            undefined,
            undefined,
            'name',
            'increase',
            true
          ).then((items:any) => {
            console.log("ittems",items);
            this.products = items;
            this.page = 0;
            this.last_record = items && items.length && items[items.length-1].name || '';
            // this.loading.dismiss();
            resolve(items);
          })
        } else {
          this.pouchdbService.searchDocsField(
            'product',
            this.searchTerm,
            '',
            'category_id',
            this.category_id,
            'sequence',
            'increase',
            true
          ).then((items:any) => {
            this.products = items;
            this.page = 0;
            this.last_record = items && items.length && items[items.length-1].name || '';
            // this.loading.dismiss();
            resolve(items);
          })
        }
      }
    })
  }

  searchItemsLoad() {
    return new Promise(resolve => {
      console.log("searchDocs")
      if (this.category_id == 'all'){
        this.pouchdbService.searchDocs(
          'product',
          this.searchTerm,
          this.last_record,
          undefined,
          undefined,
          'name',
          'increase',
          true
        ).then((items:any) => {
          items.forEach(item=>{
            this.products.push(item);
          })
          this.page += 1;
          this.last_record = items && items.length && items[items.length-1].name || '';
          // this.loading.dismiss();
          resolve(items);
        })
      } else {
        this.pouchdbService.searchDocsField(
          'product',
          this.searchTerm,
          this.last_record,
          'category_id',
          this.category_id,
          'name',
          'increase',
          true
        ).then((items:any) => {
          items.forEach(item=>{
            this.products.push(item);
          })
          this.page += 1;
          this.last_record = items && items.length && items[items.length-1].name || '';
          // this.loading.dismiss();
          resolve(items);
        })
      }
    })
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  async filterCategory(category) {
    this.page = 0;
    this.category_id = category._id;
    this.products = [];
    this.setFilteredItems();
  }

  goBack(){
    this.page = 0;
    this.searchTerm = "";
    this.category_id = 'all';
    this.setFilteredItems();
  }
}

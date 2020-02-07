import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ModalController, Events,
  PopoverController, ToastController } from '@ionic/angular';
import { ProductPage } from '../product/product.page';
import 'rxjs/Rx';
import { File } from '@ionic-native/file/ngx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPopover } from './product-list.popover';
import { FormatService } from '../services/format.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { SalePage } from '../sale/sale.page';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  @ViewChild('searchBar', { static: true }) searchBar;

  products: any = [];
  loading: any;
  select;
  type: string = 'all';
  page = 0;
  operation = "sale";
  searchTerm: string = '';
  currency_precision = 0;
  editMode = false;
  promoted_products = [];
  promoted_products2 = [];
  promoted_categories = [];
  config = {};

  constructor(
    public navCtrl: NavController,
    public router: Router,
    public translate: TranslateService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
    public languageService: LanguageService,
    public toastCtrl: ToastController,
    public events: Events,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public file: File,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.operation = this.route.snapshot.paramMap.get('operation') || this.operation;
    this.type = this.route.snapshot.paramMap.get('type') || 'all';
    this.events.subscribe('changed-product', (change) => {
      this.handleChange(this.products, change);
    })
    // this.events.subscribe('changed-stock-move', (change) => {
    //   this.handleViewChange(this.products, change);
    // })
    // this.events.subscribe('got-database', ()=>{
    //   this.setFilteredItems();
    // })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile', true));
    console.log("config",config);
    if (!config._id){
      let este = await this.pouchdbService.getConnect();
      this.events.subscribe(('end-sync'), async (change) => {
        if (!config._id){
          config = (await this.pouchdbService.getDoc('config.profile', true));
          this.config = config;
          this.setPromoted(config);
        }
        this.currency_precision = config.currency_precision || this.currency_precision;
        await this.setFilteredItems();
        if (this.select) {
          setTimeout(() => {
            this.searchBar.setFocus();
          }, 200);
        }
        this.events.unsubscribe('end-sync')
      })
    } else {
      this.config = config;
      this.setPromoted(config);
      this.currency_precision = config.currency_precision || this.currency_precision;
      await this.setFilteredItems();
      if (this.select) {
        setTimeout(() => {
          this.searchBar.setFocus();
        }, 200);
      }
    }

  }

  async setPromoted(config){
    let getList = [];
    config.promoted_products.forEach(product=>{
      getList.push(product.product_id);
    })
    config.promoted_categories.forEach(category=>{
      getList.push(category.category_id);
    })
    let docList:any = await this.pouchdbService.getList(getList, true);
    var doc_dict = {};
    docList.forEach(row=>{
      doc_dict[row.id] = row.doc;
    })
    let first = true;
    config.promoted_products.forEach(product=>{
      if (first){
        this.promoted_products.push(doc_dict[product.product_id] || {});
        first = false;
      } else {
        this.promoted_products2.push(doc_dict[product.product_id] || {});
        first = true;
      }
    })
    config.promoted_categories.forEach(category=>{
      this.promoted_categories.push(doc_dict[category.category_id] || {});
    })
    // this.promoted_products = config.products;
    // this.promoted_categories = config.categories;
  }

  setFilteredItems() {
    return new Promise(async (resolve, reject) => {
      this.getProductsPage(
        this.searchTerm, 0, this.type
      ).then(async (products: any[]) => {
        if (this.type == 'all') {
          this.products = products;
        }
        else {
          this.products = products.filter(word => word.type == this.type);
        }
        this.page = 1;
        await this.loading.dismiss();
        resolve(true);
      });
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((items) => {
      this.products = items;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getProductsPage(
        this.searchTerm, this.page, this.type
      ).then((products: any[]) => {
        products.forEach(product => {
          this.products.push(product);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getProductsPage(
        this.searchTerm, 0, this.type
      ).then((products: any[]) => {
        this.products = products;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  async presentPopover(myEvent) {
    // console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: ProductListPopover,
      event: myEvent,
      componentProps: { popoverController: this.popoverCtrl }
    });
    popover.present();
  }

  selectProduct(product) {
    if (this.select) {
      this.modalCtrl.dismiss();
      this.events.publish('select-product', product);
    } else {
      this.openProduct(product);
    }
  }

  async openProduct(product) {
    this.events.subscribe('open-product', (data) => {
      this.events.unsubscribe('open-product');
    })
    if (this.select) {
      let profileModal = await this.modalCtrl.create({
        component: ProductPage,
        componentProps: {
          "select": true,
          "_id": product._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
    }
  }

  closeModal() {
    this.navCtrl.navigateBack('');
  }

  async createProduct() {
    this.events.subscribe('create-product', (data) => {
      if (this.select) {
        this.events.publish('select-product', data);
      }
      this.events.unsubscribe('create-product');
    })
    if (this.select) {
      let profileModal = await this.modalCtrl.create({
        component: ProductPage,
        componentProps: {
          "select": true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward('/product', {});
    }
  }

  getProductsPage(keyword, page, type = 'all') {
    return new Promise(async (resolve, reject) => {
      let products: any;
      if (type == 'all') {
        products = await this.pouchdbService.searchDocTypeData('product', keyword, page, null, null, 'name', 'increase');
      } else {
        products = await this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'type', type, 'name', 'increase')
      }
      // await this.formatService.asyncForEach(products, async (product: any)=>{
      //   let viewList: any = await this.pouchdbService.getView('stock/Depositos', 2,
      //   ["warehouse.physical.my", product._id],
      //   ["warehouse.physical.my", product._id+"z"])
      //   product.stock = viewList && viewList[0] && viewList[0].value || 0;
      // })
      resolve(products);
    })
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
      this.pouchdbService.searchDocs(
        'product',
        keyword,
        page,
        undefined,
        undefined,
        'name',
        'increase'
      ).then((items) => {
        resolve(items);
      })
    })
  }

  async deleteProduct(product) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let viewList: any = await this.pouchdbService.getView('Informes/productUse', 1,
    [product._id],
    [product._id+"z"]);
    if (viewList.length){
      this.loading.dismiss();
      let toast = await this.toastCtrl.create({
      message: "No se puede borrar, producto en uso",
      duration: 1000
      });
      toast.present();
    } else {
      await this.pouchdbService.deleteDoc(product);
      this.loading.dismiss();
    }
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  async handleViewChange(list, change) {
    list.forEach(async (product:any)=>{
      // if (product._id == change.id){
      //   let viewList: any = await this.pouchdbService.getView('stock/Depositos', 2,
      //   ["warehouse.physical.my", product._id],
      //   ["warehouse.physical.my", product._id+"z"])
      //   product.stock = viewList && viewList[0] && viewList[0].value || 0;
      //   return;
      // }
    })
  }

    async openOrder() {
      let profileModal = await this.modalCtrl.create({
        component: SalePage,
        componentProps: {
          "select": true,
          "_id": 'sale.5f60137b-2ca5-4291-a1a2-30a68d7e7082',
        }
      })
      profileModal.present();
    }

    enableEditMode(){
      this.editMode = !this.editMode;
    }


}

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ModalController,
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
import { Events } from '../services/events';

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
  category_id: string = 'all';
  page = 0;
  searchTerm: string = '';
  currency_precision = 0;
  config = {};
  appliedChanges = [];

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
    this.category_id = this.route.snapshot.paramMap.get('category_id') || 'all';
    this.events.subscribe('changed-product', (change) => {
      if (this.appliedChanges.indexOf(change.change.doc._id+change.change.doc._rev)==-1){
        this.appliedChanges.push(change.change.doc._id+change.change.doc._rev);
        this.handleChange(this.products, change.change);
      }
    })
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
    if (!config._id){
      let este = await this.pouchdbService.getConnect();
      this.events.subscribe(('end-sync'), async (change) => {
        if (!config._id){
          config = (await this.pouchdbService.getDoc('config.profile', true));
          this.config = config;
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
      this.currency_precision = config.currency_precision || this.currency_precision;
      await this.setFilteredItems();
      if (this.select) {
        setTimeout(() => {
          this.searchBar.setFocus();
        }, 200);
      }
    }
  }

  setFilteredItems() {
    return new Promise(async (resolve, reject) => {
      this.getProductsPage(
        this.searchTerm, 0, this.category_id
      ).then(async (products: any[]) => {
        if (this.category_id == 'all') {
          this.products = products;
        }
        else {
          this.products = products.filter(word => word.category_id == this.category_id);
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
        this.searchTerm, this.page, this.category_id
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
        this.searchTerm, 0, this.category_id
      ).then((products: any[]) => {
        this.products = products;
        this.page = 1;
      });
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
    // if (this.select) {
      // let profileModal = await this.modalCtrl.create({
      //   component: ProductPage,
      //   componentProps: {
      //     "select": true,
      //     "_id": product._id,
      //   }
      // })
      // profileModal.present();
    // } else {
      this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
    // }
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
        products = await this.pouchdbService.searchDocTypeData('product', keyword, page, null, null, 'sequence', 'increase', 30);
      } else {
        products = await this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'category_id', type, 'sequence', 'increase', 30)
      }
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

    async setImages(){
      console.log("set Images");
      let products:any = await this.pouchdbService.getDocType('product');
      products.forEach(variable => {
        if (!variable.images ){
          variable.images = [];
          if (variable._attachments){
            Object.keys(variable._attachments).forEach((file_name:any)=>{
              variable.images.push(file_name);
            })
          }
        }
      });
      console.log("seted Images", products);
      await this.pouchdbService.updateDocList(products);
      console.log("Finish");
    }

    async filterCategory(category) {
      this.category_id = category._id;
      this.setFilteredItems();
    }

    goBack(){
      this.category_id = 'all';
      this.setFilteredItems();
    }
}

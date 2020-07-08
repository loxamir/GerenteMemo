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
import { ConfigPage } from '../config/config.page';

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
  config:any = {};
  appliedChanges = [];
  categories = [];
  database = '';
  last_record = '';

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
    this.database = this.pouchdbService.getDatabaseName();
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
        this.showCategories();
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
      this.showCategories();
      await this.setFilteredItems();
      if (this.select) {
        setTimeout(() => {
          this.searchBar.setFocus();
        }, 200);
      }
    }
  }

  // setFilteredItems() {
  //   return new Promise(async (resolve, reject) => {
  //     this.getProductsPage(
  //       this.searchTerm, 0, this.category_id
  //     ).then(async (products: any[]) => {
  //       console.log("set filter on", products);
  //       if (this.category_id == 'all') {
  //         this.products = products;
  //       }
  //       else {
  //         this.products = products.filter(word => word.category_id == this.category_id);
  //       }
  //       this.page = 1;
  //       await this.loading.dismiss();
  //       resolve(true);
  //     });
  //   });
  // }

  setFilteredItems() {
   return new Promise(async (resolve, reject) => {
     let products:any = await this.getProductsPage();
     this.products = products;
     this.page = 0;
     await this.loading.dismiss();
     resolve(true);
   });
 }

  // searchItems() {
  //   this.searchItemsS(
  //     this.searchTerm, 0
  //   ).then((items) => {
  //     this.products = items;
  //     this.page = 1;
  //     this.loading.dismiss();
  //   });
  // }

  // doInfinite(infiniteScroll) {
  //   setTimeout(() => {
  //     this.getProductsPage(
  //       this.searchTerm, this.page, this.category_id
  //     ).then((products: any[]) => {
  //       products.forEach(product => {
  //         this.products.push(product);
  //       });
  //       this.page += 1;
  //     });
  //     infiniteScroll.target.complete();
  //   }, 50);
  // }

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

  // doRefresh(refresher) {
  //   setTimeout(() => {
  //     this.getProductsPage(
  //       this.searchTerm, 0, this.category_id
  //     ).then((products: any[]) => {
  //       this.products = products;
  //       this.page = 1;
  //     });
  //     refresher.target.complete();
  //   }, 50);
  // }

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

//   async showCategories(){
//   if (this.category_id=='all'){
//     let categories:any = await this.pouchdbService.searchDocTypeData(
//     'category',
//     "", null, null, null, 'sequence', 'increase');
//     this.categories = categories;
//   }
// }

async showCategories(){
  if (this.category_id=='all'){
    let categories_tmp:any = await this.pouchdbService.getView('Informes/categories',
    undefined,
    [],
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

async showConfig() {
    let profileModal = await this.modalCtrl.create({
      component: ConfigPage,
      componentProps: {
        select: true
      }
    })
    profileModal.present();
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

  // getProductsPage(keyword, page, type = 'all') {
  //   return new Promise(async (resolve, reject) => {
  //     let products: any;
  //     if (type == 'all') {
  //       console.log("get all");
  //       products = await this.pouchdbService.searchDocTypeData('product', keyword, page, null, null, 'sequence', 'increase', 30);
  //       console.log("igot all");
  //     } else {
  //       products = await this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'category_id', type, 'sequence', 'increase', 30)
  //     }
  //     resolve(products);
  //   })
  // }
  getProductsPage() {
  return new Promise(async (resolve, reject) => {
    if (this.category_id == 'all') {
      let products_tmp:any = await this.pouchdbService.getView(
        'Informes/publishedSequence',
        undefined,
        [],
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

  // searchItemsS(keyword, page) {
  //   return new Promise(resolve => {
  //     this.pouchdbService.searchDocs(
  //       'product',
  //       keyword,
  //       page,
  //       undefined,
  //       undefined,
  //       'name',
  //       'increase'
  //     ).then((items) => {
  //       resolve(items);
  //     })
  //   })
  // }

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

  async deleteProduct(product) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    await this.pouchdbService.deleteDoc(product);
    this.loading.dismiss();
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

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
import { SalePage } from '../sale/sale.page';
import { Storage } from '@ionic/storage';

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
  order: any;
  logged: boolean = false;

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
    public storage: Storage,
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

    if (!this.logged){
      this.loading.dismiss();
      // let order: any = await this.pouchdbService.searchDocTypeData('sale',"",0);
      let order: any = await this.storage.get("sales")
      if (order){
        if (order.state == 'QUOTATION'
        || order.state == 'CONFIRMED'
      ){
          this.order = order;
        }
      }
    }


    this.events.subscribe('add-product', async (data) => {
      console.log("addProduct");
      let total = data.product.price*data.product.quantity;
      let line = {
        product: data.product,
        "product_id": data.product._id,
        "product_name": data.product.name,
        "quantity": data.product.quantity,
        "price": data.product.price,
        "size": data.product.size,
        "note": data.product.note
      }
      if (this.order){
        this.order.items.push(line);
        this.order.total += total;
        this.order.amount_unInvoiced += total;
        this.order.residual += total;
        // let updatedOrder:any = await this.pouchdbService.updateDoc(this.order);
        // this.order._rev = updatedOrder.rev;

      } else {
        // let delivery_product:any = await this.pouchdbService.getDoc("product.delivery");
        // let delivery = {
        //   "product_id": delivery_product._id,
        //   "product_name": delivery_product.name,
        //   "quantity": 1,
        //   "price":delivery_product.price,
        //   "note": delivery_product.description,
        //   "fixed": true,
        // }
        // total += delivery_product.price;
        let now = new Date().toISOString();
        let order = {
          // "contact_name": this.contact.name,
          "name": "",
          "code": "123",
          "date": now,
          "origin_id": null,
          "total": total,
          "residual": total,
          "note": null,
          "state": "QUOTATION",
          "discount": {
            "value": 0,
            "discountProduct": true,
            "lines": 0
          },
          "payments": [],
          "payment_name": "Credito",
          "invoice": "",
          "invoices": [],
          "amount_unInvoiced": total,
          "seller": {},
          "seller_name": "",
          "currency": {},
          "create_user": "admin",
          "create_time": now,
          "write_user": "admin",
          "write_time": now,
          "items": [line],
          // "lines": [line, delivery],
          "docType": "sale",
          // "contact_id": this.contact_id,
          "project_id": "",
          "pay_cond_id": "payment-condition.credit"
          }
          // let orderDoc = await this.pouchdbService.createDoc(order);
          this.storage.set("order", order)
          // console.log("orderDoc", orderDoc);
          this.order = order;
      }
      console.log("order", this.order);
      // this.events.unsubscribe('open-contact');
    })
  }

  async openOrder() {
    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: {
        "select": true,
        "data": this.order,
      }
    })
    profileModal.present();
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
    if (this.logged) {
      this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
    } else {
      let profileModal = await this.modalCtrl.create({
        component: ProductPage,
        componentProps: {
          "select": true,
          "_id": product._id,
        }
      })
      profileModal.present();
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

    selectProduct(product) {
      if (this.select) {
        this.modalCtrl.dismiss();
        this.events.publish('select-product', {product: product});
      } else {
        this.openProduct(product);
      }
    }
}

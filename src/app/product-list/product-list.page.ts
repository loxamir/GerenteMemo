import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, PopoverController } from '@ionic/angular';
import { ProductPage } from '../product/product.page';
import 'rxjs/Rx';
import { File } from '@ionic-native/file/ngx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPopover } from './product-list.popover';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  @ViewChild('searchBar') searchBar;

  products: any = [];
  loading: any;
  select;
  type: string = 'all';
  page = 0;
  operation = "sale";
  searchTerm: string = '';
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public router: Router,
    // public productsService: ProductsService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    // public modal: ModalController,
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
    this.events.subscribe('changed-stock-move', (change) => {
      this.handleViewChange(this.products, change);
    })
    // this.events.subscribe('got-database', ()=>{
    //   this.setFilteredItems();
    // })
    // var foo = { foo: true };
    // history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    await this.setFilteredItems();
    if (this.select) {
      setTimeout(() => {
          this.searchBar.setFocus();
      }, 200);
    }
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
    console.log("teste my event");
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
      let viewList: any = await this.pouchdbService.getView('stock/Depositos', 2)
      products.forEach(product => {
        //Get stock value from cash moves report
        let stock = 0;
        viewList.forEach(view => {
          if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id) {
            stock += view.value;
          }
        })
        product.stock = stock;
      })
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

  deleteProduct(product) {
    return this.pouchdbService.deleteDoc(product);
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change) {
    this.pouchdbService.getView(
      'stock/Depositos', 2
    ).then((stocks: any[]) => {
      let data: any[] = list;
      let viewList: any[] = stocks;
      data.forEach(product => {
        //Get stock value from cash moves report
        let stock = 0;
        viewList.forEach(view => {
          if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id) {
            stock += view.value;
          }
        })
        product.stock = stock;
      })
    });
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ModalController,
  PopoverController, ToastController, MenuController } from '@ionic/angular';
import { ProductPage } from '../product/product.page';
import 'rxjs/Rx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPopover } from './product-list.popover';
import { FormatService } from '../services/format.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { SalePage } from '../sale/sale.page';
import { AuthService } from "../services/auth.service";
import { Events } from '../services/events';
import { LoginPage } from '../login/login.page';

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
  operation = "sale";
  searchTerm: string = '';
  currency_precision = 0;
  editMode = false;
  promoted_products = [];
  promoted_products2 = [];
  categories = [];
  config = {};

  amount: number = 0;
  order: any;
  logged: boolean = false;
  contact: any = {};
  contact_id;
  // contact_name;

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
    public menuCtrl: MenuController,
    public authService: AuthService,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.operation = this.route.snapshot.paramMap.get('operation') || this.operation;
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
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.authService.loggedIn.subscribe(async status => {
      console.log("status ngOnInit", status);
      if (status) {
        let data = await this.authService.getData();
        this.contact_id = "contact."+data.currentUser.email;
        let contact:any = await this.pouchdbService.getDoc(this.contact_id, true);

        if (JSON.stringify(contact) == "{}"){
          console.log("create contact");
          this.events.subscribe('login-success', (data:any)=>{
            this.logged = true;
            this.contact = data.contact;
          })
        } else {
          this.logged = true;
          this.contact = contact;
        }

        this.loading.dismiss();
        let order: any = await this.pouchdbService.searchDocTypeData('sale',"",0);
        if (order[0]){
          if (order[0].state == 'QUOTATION'
          || order[0].state == 'CONFIRMED'
        ){
            this.order = order[0];
          }
        }
        this.events.subscribe('changed-sale', (data) => {
          if (data.change.deleted){
            this.order = undefined;
          } else {
            if (data.change.doc.state == 'QUOTATION' || data.change.doc.state == 'CONFIRMED'){
              this.order = data.change.doc;
            } else if (data.change.doc.state == 'PAID'){
              this.order = undefined;
            }
          }
        })
      } else {
        this.logged = false;
        this.events.subscribe('login-success', (data) => {
          this.contact = data.contact;
        })
        this.loading.dismiss();
      }
    });



    this.events.subscribe('add-product', async (data) => {
      let total = data.product.price*data.product.quantity;
      let line = {
        "product_id": data.product._id,
        "product_name": data.product.name,
        "quantity": data.product.quantity,
        "price": data.product.price,
        "size": data.product.size,
        "note": data.product.note
      }
      if (this.order){
        this.order.lines.push(line);
        this.order.total += total;
        this.order.amount_unInvoiced += total;
        this.order.residual += total;
        let updatedOrder:any = await this.pouchdbService.updateDoc(this.order);
        this.order._rev = updatedOrder.rev;

      } else {
        let now = new Date().toISOString();
        let order = {
          "contact_name": this.contact.name,
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
          "lines": [line],
          "docType": "sale",
          "contact_id": this.contact_id,
          "project_id": "",
          "pay_cond_id": "payment-condition.credit"
          }
          let orderDoc = await this.pouchdbService.createDoc(order);
          // console.log("orderDoc", orderDoc);
          this.order = orderDoc;
      }
      // this.events.unsubscribe('open-contact');
    })

    let config: any = (await this.pouchdbService.getDoc('config.profile', true));
    // console.log("config",config);
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
    let categories:any = await this.pouchdbService.searchDocTypeData('category');
    this.categories = categories;
  }

  setFilteredItems() {
    return new Promise(async (resolve, reject) => {
      this.getProductsPage(
        this.searchTerm, 0, this.category_id
      ).then(async (products: any[]) => {
        this.products = products;
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

  selectProduct(product) {
    if (this.select) {
      this.modalCtrl.dismiss();
      this.events.publish('select-product', {product: product});
    } else {
      this.openProduct(product);
    }
  }

  async openProduct(product) {
    let profileModal = await this.modalCtrl.create({
      component: ProductPage,
      componentProps: {
        "select": true,
        "_id": product._id,
      }
    })
    profileModal.present();
  }

  closeModal() {
    this.navCtrl.navigateBack('');
  }

  getProductsPage(keyword, page, category_id = 'all') {
    return new Promise(async (resolve, reject) => {
      let products: any;
      if (category_id == 'all') {
        products = await this.pouchdbService.searchDocTypeData('product', keyword, page, null, null, 'name', 'increase');
      } else {
        products = await this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'category_id', category_id, 'name', 'increase')
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

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  async filterCategory(category) {
    this.category_id = category._id;
    this.setFilteredItems();
  }

  goBack(){
    this.searchTerm = "";
    this.category_id = 'all';
    this.setFilteredItems();
  }

  async openOrder() {
    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: {
        "select": true,
        "_id": this.order._id,
      }
    })
    profileModal.present();
  }

  async login(){
    let profileModal = await this.modalCtrl.create({
      component: LoginPage,
      componentProps: {}
    })
    profileModal.present();
  }
}

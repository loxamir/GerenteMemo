import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { CashService } from '../cash.service';
import { StockMoveService } from './stock-move.service';
// import { CashListPage } from '../list/cash-list';
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
// import { ConfigService } from '../config/config.service';
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-stock-move',
  templateUrl: './stock-move.page.html',
  styleUrls: ['./stock-move.page.scss'],
})
export class StockMovePage implements OnInit {
  @ViewChild('input') myInput;

  stockMoveForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  // cash_id: string;
  // default_quantity: number;
  // default_name: number;

  constructor(

    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public stockMoveService: StockMoveService,
    // public cashService: CashService,
    public events: Events,
    // public configService: ConfigService,
    public pouchdbService: PouchdbService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    // this.cash_id = this.route.snapshot.paramMap.get('cash_id;
    // this.default_quantity = parseFloat(this.route.snapshot.paramMap.get('default_quantity'))||1;
    // this.default_name = this.route.snapshot.paramMap.get('default_name');
  }

  ngOnInit() {
    var today = new Date().toISOString();

    setTimeout(() => {
      this.myInput.setFocus();
    }, 50);

    this.stockMoveForm = this.formBuilder.group({
      name: new FormControl(this.route.snapshot.paramMap.get('name'), Validators.required),
      quantity: new FormControl(this.route.snapshot.paramMap.get('default_quantity'), Validators.required),
      date: new FormControl(today, Validators.required),
      state: new FormControl('wait'),
      // cash: new FormControl({}),
      // cash_id: new FormControl(this.route.snapshot.paramMap.get('cash_id),
      origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
      warehouseFrom: new FormControl({}),
      warehouseFrom_id: new FormControl(this.route.snapshot.paramMap.get('warehouseFrom_id')),
      warehouseTo: new FormControl({}),
      warehouseTo_id: new FormControl(this.route.snapshot.paramMap.get('warehouseTo_id')),
      product: new FormControl({}),
      product_id: new FormControl(this.route.snapshot.paramMap.get('product_id')),
      signal: new FormControl(this.route.snapshot.paramMap.get('signal')||'-'),
      check_id: new FormControl(''),
      bank: new FormControl(''),
      number: new FormControl(''),
      owner: new FormControl(''),
      cost: new FormControl(0),
      code: new FormControl(''),
      maturity: new FormControl(''),
      contact: new FormControl({}),
      contact_id: new FormControl(this.route.snapshot.paramMap.get('contact_id')),
      _id: new FormControl(''),
    });
    if (this._id){
      this.stockMoveService.getStockMove(this._id).then((data) => {
        this.stockMoveForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      this.stockMoveForm.markAsDirty();
      //console.log("caja", this.route.snapshot.paramMap.get('cash);
      if (this.route.snapshot.paramMap.hasOwnProperty('warehouseFrom')){
        this.stockMoveForm.patchValue({
          warehouseFrom: this.route.snapshot.paramMap.get('warehouseFrom'),
          warehouseFrom_id: this.route.snapshot.paramMap.get('warehouseFrom')['_id'],
          warehouseTo: this.route.snapshot.paramMap.get('warehouseTo'),
          warehouseTo_id: this.route.snapshot.paramMap.get('warehouseTo')['_id'],
        });
      // } else {
      //   this.configService.getConfig().then(config => {
      //     // let warehouse = config.warehouse;
      //     // let product = config.product;
      //     //console.log("configconfig", config);
      //     this.stockMoveForm.patchValue({
      //       warehouseFrom: config.warehouse,
      //       warehouseFrom_id: config.warehouse['_id'],
      //       warehouseTo: config.warehouse,
      //       warehouseTo_id: config.warehouse['_id'],
      //       // product: config.contact,
      //       // contact_id: config.contact['_id'],
      //     });
      //   });
        // this.cashService.getDefaultCash().then(default_cash => {
        //
        // });
      }
      //this.loading.dismiss();
    }
  }

  // ionViewDidEnter() {
  // }

  // ionViewDidLoad() {
  //   //console.log("ionViewDidLoad");
  //   //this.loading.present();
  //
  //   if (this._id){
  //     this.getStockMove(this._id).then((data) => {
  //       this.stockMoveForm.patchValue(data);
  //       //this.loading.dismiss();
  //     });
  //   } else {
  //     this.stockMoveForm.markAsDirty();
  //     //console.log("caja", this.route.snapshot.paramMap.get('cash);
  //     if (this.route.snapshot.paramMap.hasOwnProperty('warehouseFrom')){
  //       this.stockMoveForm.patchValue({
  //         warehouseFrom: this.route.snapshot.paramMap.get('warehouseFrom'),
  //         warehouseFrom_id: this.route.snapshot.paramMap.get('warehouseFrom')['_id'],
  //         warehouseTo: this.route.snapshot.paramMap.get('warehouseTo'),
  //         warehouseTo_id: this.route.snapshot.paramMap.get('warehouseTo')['_id'],
  //       });
  //     } else {
  //       this.configService.getConfig().then(config => {
  //         // let warehouse = config.warehouse;
  //         // let product = config.product;
  //         //console.log("configconfig", config);
  //         this.stockMoveForm.patchValue({
  //           warehouseFrom: config.warehouse,
  //           warehouseFrom_id: config.warehouse['_id'],
  //           warehouseTo: config.warehouse,
  //           warehouseTo_id: config.warehouse['_id'],
  //           // product: config.contact,
  //           // contact_id: config.contact['_id'],
  //         });
  //       });
  //       // this.cashService.getDefaultCash().then(default_cash => {
  //       //
  //       // });
  //     }
  //     //this.loading.dismiss();
  //   }
  // }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'quantity': [
      { type: 'required', message: 'QUANTITY_IS_REQUIRED' }
    ],
    'date': [
      { type: 'required', message: 'Date is required.' }
    ]
  };

  buttonSave() {
    var today = new Date().toISOString();
    this.stockMoveForm.value.date = this.stockMoveForm.value.date;
    if (this.stockMoveForm.value.date <= today){
      this.stockMoveForm.value.state = 'done';
    } else {
      this.stockMoveForm.value.state = 'wait';
    }
    if (this._id){
      this.stockMoveService.updateStockMove(this.stockMoveForm.value);
      this.navCtrl.navigateBack('/stock-move-list');
      // .then(() => {
        this.events.publish('open-stock-move', this.stockMoveForm.value);
      // });
    } else {
      this.stockMoveService.createStockMove(this.stockMoveForm.value).then(doc => {
        //console.log("the_doc", doc);
        this.stockMoveForm.value._id = doc['id'];
        this.navCtrl.navigateBack('/stock-move-list');
        // .then(() => {
          this.events.publish('create-stock-move', this.stockMoveForm.value);
        // });
      });
    }
  }

  selectWarehouseFrom() {
    return new Promise(async resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        console.log("data98", data);
        this.stockMoveForm.patchValue({
          warehouseFrom: data,
          warehouseFrom_id: data._id,
        });
        this.stockMoveForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        profileModal.dismiss();
        resolve(true);
      })
      let profileModal = await this.modal.create({
        component: WarehouseListPage,
        componentProps: {
          "select": true
        }});
      await profileModal.present();
    });
  }

  selectWarehouseTo() {
    return new Promise(async resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.stockMoveForm.patchValue({
          warehouseTo: data,
          warehouseTo_id: data._id,
        });
        this.stockMoveForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        profileModal.dismiss();
        resolve(true);
      })
      let profileModal = await this.modal.create({
        component: WarehouseListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectProduct() {
     return new Promise(async resolve => {
       this.events.subscribe('select-product', (data) => {
         this.stockMoveForm.patchValue({
           product: data,
           product_id: data._id,
         });
         this.stockMoveForm.markAsDirty();
         this.events.unsubscribe('select-product');
         profileModal.dismiss();
         resolve(true);
       })
       let profileModal = await this.modal.create({
         component: ProductListPage,
         componentProps: {
           "select": true,
         }});
       profileModal.present();
     });
   }

   selectContact() {
      return new Promise(async resolve => {
        this.events.subscribe('select-contact', (data) => {
          this.stockMoveForm.patchValue({
            contact: data,
            contact_id: data._id,
          });
          this.stockMoveForm.markAsDirty();
          this.events.unsubscribe('select-contact');
          profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modal.create({
          component: ContactListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

  onSubmit(values){
    //console.log(values);
  }


    // getStockMove(doc_id): Promise<any> {
    //   return new Promise((resolve, reject)=>{
    //     this.pouchdbService.getDoc(doc_id).then((stock_move) => {
    //       this.pouchdbService.getDoc(stock_move['warehouseFrom_id']).then((warehouseFrom => {
    //         stock_move['warehouseFrom'] = warehouseFrom;
    //         this.pouchdbService.getDoc(stock_move['warehouseTo_id']).then((warehouseTo => {
    //           stock_move['warehouseTo'] = warehouseTo;
    //             this.pouchdbService.getDoc(stock_move['product_id']).then((product => {
    //               stock_move['product'] = product;
    //               this.pouchdbService.getDoc(stock_move['contact_id']).then(contact => {
    //                 stock_move['contact'] = contact || {};
    //                 console.log("stockMove", stock_move);
    //                 resolve(stock_move);
    //               });
    //             }));
    //           }));
    //       }));
    //     });
    //   });
    // }
    //
    // createStockMove(viewData){
    //   return new Promise((resolve, reject)=>{
    //     let stock = Object.assign({}, viewData);
    //     this.pouchdbService.getDoc(stock.product_id).then(product=>{
    //       stock.product = product;
    //       stock.docType = 'stock-move';
    //       stock.quantity = parseFloat(stock.quantity);
    //       let product_cost = stock.cost/stock.quantity;
    //       if (stock.product && !stock.cost){
    //         product_cost = parseFloat(stock.product.cost);
    //       }
    //       let old_stock = parseFloat(stock.product.stock);
    //       let old_cost = parseFloat(stock.product.cost);
    //       if (stock.contact){
    //         stock.contact_name = stock.contact.name;
    //       }
    //       if (stock.warehouseFrom){
    //         stock.warehouseFrom_name = stock.warehouseFrom.name;
    //       }
    //       if (stock.warehouseTo){
    //         stock.warehouseTo_name = stock.warehouseTo.name;
    //       }
    //       if (stock.product){
    //         stock.product_name = stock.product.name;
    //       }
    //       // this.configService.getSequence('stock_move').then((code) => {
    //         // stock['code'] = code;
    //         // stock['code'] = this.formatService.string_pad(4, code, "right", "0");
    //         delete stock.stock;
    //         delete stock.product;
    //         delete stock.contact;
    //         delete stock.warehouseTo;
    //         delete stock.warehouseFrom;
    //         return this.pouchdbService.createDoc(stock).then(data => {
    //           // if (stock.cost && stock.warehouseTo_id.split('.')[1] == 'physical'){
    //           //   this.productService.updateStockAndCost(
    //           //     stock.product_id,
    //           //     stock.quantity,
    //           //     product_cost,
    //           //     old_stock,
    //           //     old_cost);
    //           // }
    //           resolve(data);
    //         })
    //       });
    //     // });
    //   });
    // }
    //
    // updateStockMove(viewData){
    //   let stock = Object.assign({}, viewData);
    //   stock.docType = 'stock-move';
    //   stock.quantity = parseFloat(stock.quantity);
    //   if (stock.contact){
    //     stock.contact_name = stock.contact.name;
    //   }
    //   delete stock.stock;
    //   delete stock.product;
    //   delete stock.contact;
    //   delete stock.warehouseTo;
    //   delete stock.warehouseFrom;
    //   return this.pouchdbService.updateDoc(stock);
    // }

}

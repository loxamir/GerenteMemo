import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events, TextInput } from '@ionic/angular';
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
import { WarehousesPage } from './warehouse/list/warehouses';
import { ProductsPage } from '../product/list/products';
import { ContactsPage } from '../contact/list/contacts';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'stock-move-page',
  templateUrl: 'stock-move.html'
})
export class StockMovePage {
  @ViewChild('input') myInput: TextInput;

  stockMoveForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  // cash_id: string;
  default_quantity: number;
  default_name: number;

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public stockMoveService: StockMoveService,
    // public cashService: CashService,
    public events: Events,
    public configService: ConfigService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    // this.cash_id = this.navParams.data.cash_id;
    this.default_quantity = parseFloat(this.navParams.data.default_quantity||1);
    this.default_name = this.navParams.data.default_name;
  }

  ionViewWillLoad() {
    var today = new Date().toISOString();


    this.stockMoveForm = this.formBuilder.group({
      name: new FormControl(this.default_name, Validators.required),
      quantity: new FormControl(this.default_quantity, Validators.required),
      date: new FormControl(today, Validators.required),
      state: new FormControl('wait'),
      // cash: new FormControl({}),
      // cash_id: new FormControl(this.navParams.data.cash_id),
      origin_id: new FormControl(this.navParams.data.origin_id),
      warehouseFrom: new FormControl({}),
      warehouseFrom_id: new FormControl(this.navParams.data.warehouseFrom_id),
      warehouseTo: new FormControl({}),
      warehouseTo_id: new FormControl(this.navParams.data.warehouseTo_id),
      product: new FormControl({}),
      product_id: new FormControl(this.navParams.data.product_id),
      signal: new FormControl(this.navParams.data.signal||'-'),
      check_id: new FormControl(''),
      bank: new FormControl(''),
      number: new FormControl(''),
      owner: new FormControl(''),
      cost: new FormControl(0),
      code: new FormControl(''),
      maturity: new FormControl(''),
      contact: new FormControl({}),
      contact_id: new FormControl(this.navParams.data.contact_id),
      _id: new FormControl(''),
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 50);
  }

  ionViewDidLoad() {
    //console.log("ionViewDidLoad");
    this.loading.present();

    if (this._id){
      this.stockMoveService.getStockMove(this._id).then((data) => {
        this.stockMoveForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.stockMoveForm.markAsDirty();
      //console.log("caja", this.navParams.data.cash);
      if (this.navParams.data.hasOwnProperty('warehouseFrom')){
        this.stockMoveForm.patchValue({
          warehouseFrom: this.navParams.data.warehouseFrom,
          warehouseFrom_id: this.navParams.data.warehouseFrom['_id'],
          warehouseTo: this.navParams.data.warehouseTo,
          warehouseTo_id: this.navParams.data.warehouseTo['_id'],
        });
      } else {
        this.configService.getConfig().then(config => {
          // let warehouse = config.warehouse;
          // let product = config.product;
          //console.log("configconfig", config);
          this.stockMoveForm.patchValue({
            warehouseFrom: config.warehouse,
            warehouseFrom_id: config.warehouse['_id'],
            warehouseTo: config.warehouse,
            warehouseTo_id: config.warehouse['_id'],
            // product: config.contact,
            // contact_id: config.contact['_id'],
          });
        });
        // this.cashService.getDefaultCash().then(default_cash => {
        //
        // });
      }
      this.loading.dismiss();
    }
  }

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
      this.navCtrl.pop().then(() => {
        this.events.publish('open-stock-move', this.stockMoveForm.value);
      });
    } else {
      this.stockMoveService.createStockMove(this.stockMoveForm.value).then(doc => {
        //console.log("the_doc", doc);
        this.stockMoveForm.value._id = doc['id'];
        this.navCtrl.pop().then(() => {
          this.events.publish('create-stock-move', this.stockMoveForm.value);
        });
      });
    }
  }

  selectWarehouseFrom() {
    return new Promise(resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.stockMoveForm.patchValue({
          warehouseFrom: data,
          warehouseFrom_id: data._id,
        });
        this.stockMoveForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        resolve(true);
      })
      let profileModal = this.modal.create(WarehousesPage, {"select": true});
      profileModal.present();
    });
  }

  selectWarehouseTo() {
    return new Promise(resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.stockMoveForm.patchValue({
          warehouseTo: data,
          warehouseTo_id: data._id,
        });
        this.stockMoveForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        resolve(true);
      })
      let profileModal = this.modal.create(WarehousesPage, {"select": true});
      profileModal.present();
    });
  }

  selectProduct() {
     return new Promise(resolve => {
       this.events.subscribe('select-product', (data) => {
         this.stockMoveForm.patchValue({
           product: data,
           product_id: data._id,
         });
         this.stockMoveForm.markAsDirty();
         this.events.unsubscribe('select-product');
         resolve(true);
       })
       let profileModal = this.modal.create(ProductsPage, {"select": true});
       profileModal.present();
     });
   }

   selectContact() {
      return new Promise(resolve => {
        this.events.subscribe('select-contact', (data) => {
          this.stockMoveForm.patchValue({
            contact: data,
            contact_id: data._id,
          });
          this.stockMoveForm.markAsDirty();
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {"select": true});
        profileModal.present();
      });
    }

  onSubmit(values){
    //console.log(values);
  }
}

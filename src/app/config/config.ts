import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ConfigService } from './config.service';
import { Base64 } from '@ionic-native/base64';
//import { CategoriesPage } from '../category/list/categories';
import { CurrencyListPage } from '../currency/list/currency-list';
import { CashListPage } from '../cash/list/cash-list';
import { AccountsPage } from '../cash/move/account/list/accounts';
import { ContactsPage } from '../contact/list/contacts';
import { WarehousesPage } from '../stock/warehouse/list/warehouses';
import { Storage } from '@ionic/storage';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { ProductsPage } from '../product/list/products';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ConfigInvoicePage } from './invoice/invoice';
import { UserPage } from './user/user';

@Component({
  selector: 'config-page',
  templateUrl: 'config.html'
})
export class ConfigPage {
  configForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public configService: ConfigService,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    public base64: Base64,
    public events:Events,
    public storage: Storage,
    public alertCtrl: AlertController,
    // public camera: Camera,
    public pouchdbService: PouchdbService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.configForm = this.formBuilder.group({
      name: ['', Validators.required],
      image: [''],
      doc: [''],
      currency: [{}],
      cash: [{}],
      account: [{}],
      warehouse: [{}],
      labor_product: [{}],
      input_product: [{}],
      travel_product: [{}],
      contact: [{}],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      city: [''],
      country: [''],
      state: [''],
      // tab: ['profile'],
      invoice_sequence: [''],
      sale_sequence: [1],
      service_sequence: [1],
      warehouse_sequence: [1],
      account_sequence: [1],
      receipt_sequence: [1],
      product_sequence: [1],
      purchase_sequence: [1],
      asset_sequence: [1],
      contact_sequence: [1],
      cash_move_sequence: [1],
      stock_move_sequence: [1],
      invoice_template: [''],
      invoicePrint: [{}],
      users: [],
      _id: [''],
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    this.configService.getConfig().then((data) => {
      this.configForm.patchValue(data);
      this.loading.dismiss();
    });
  }

  buttonSave() {
    this.configService.updateConfig(this.configForm.value);
    this.navCtrl.pop().then(() => {
      this.events.publish('open-config', this.configForm.value);
    });
    this.setDbUsers();
  }

  setDbUsers(){
    let names = [];
    this.configForm.value.users.forEach((user: any)=>{
      names.push(user.name);
    })
    console.log("names", names);
    let security = {
      "_id": "_security",
      "admins": {
        "names": names,
        "roles": []
      },
      "members": {
          "names": names,
          "roles": []
      }
    }
    this.pouchdbService.putSecurity(security);
  }

  deleteUser(user){
      let index = this.configForm.value.users.indexOf(user);
      this.configForm.value.users.splice(index, 1);
  }

  selectCurrency() {
    return new Promise(resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.configForm.patchValue({
          currency: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(data);
      })
      let profileModal = this.modal.create(CurrencyListPage, {"select": true});
      profileModal.present();
    });
  }

  selectCash() {
    return new Promise(resolve => {
      this.events.subscribe('select-cash', (data) => {
        this.configForm.patchValue({
          cash: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-cash');
        resolve(data);
      })
      let profileModal = this.modal.create(CashListPage, {"select": true});
      profileModal.present();
    });
  }

  selectLaborProduct() {
    return new Promise(resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          labor_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true});
      profileModal.present();
    });
  }

  selectInputProduct() {
    return new Promise(resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          input_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true});
      profileModal.present();
    });
  }

  selectTravelProduct() {
    return new Promise(resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          travel_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true});
      profileModal.present();
    });
  }

  selectAccount() {
    return new Promise(resolve => {
      this.events.subscribe('select-account', (data) => {
        this.configForm.patchValue({
          account: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(data);
      })
      let profileModal = this.modal.create(AccountsPage, {"select": true});
      profileModal.present();
    });
  }
  selectWarehouse() {
    return new Promise(resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.configForm.patchValue({
          warehouse: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        resolve(data);
      })
      let profileModal = this.modal.create(WarehousesPage, {"select": true});
      profileModal.present();
    });
  }
  selectContact() {
    return new Promise(resolve => {
      this.events.subscribe('select-contact', (data) => {
        this.configForm.patchValue({
          contact: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-contact');
        resolve(data);
      })
      this.navCtrl.push(ContactsPage, {"select": true});
    });
  }

  logout() {
    this.storage.set('database', false).then(()=>{
      window.location.reload();
    });
  }

  changeData() {
    this.configService.changeData();
  }

  setLanguage(lang: LanguageModel){
    let language_to_set = this.translate.getDefaultLang();

    if(lang){
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'price': [
      { type: 'required', message: 'Price is required.' }
    ],
    'cost': [
      { type: 'required', message: 'Cost is required.' }
    ]
  };

  onSubmit(values){
    //console.log(values);
  }

  duplicateDB(){
    // this.pouchdbService.duplicateDb();
  }

  configInvoicePrint() {
    return new Promise(resolve => {
      let profileModal = this.modal.create(
        ConfigInvoicePage, this.configForm.value.invoicePrint
      );
      profileModal.onDidDismiss(data => {
        if (data) {
          Object.keys(data).forEach(key=>{
            data[key] = parseFloat(data[key]);
          })
          this.configForm.patchValue({
            invoicePrint: data,
          });
          this.configForm.markAsDirty();
        }
      });
      profileModal.present();
    });
  }

  addUser() {
    return new Promise(resolve => {
      let profileModal = this.modal.create(
        UserPage, {}
      );
      profileModal.onDidDismiss(data => {
        if (data) {
          this.configForm.value.users.push(data);
          this.configForm.patchValue({
            users: this.configForm.value.users,
          });
          this.configForm.markAsDirty();
        }
      });
      profileModal.present();
    });
  }

  editUser(user) {
    // return new Promise(resolve => {
      let profileModal = this.modal.create(
        UserPage, user
      );
      profileModal.onDidDismiss(data => {
        if (data) {
          user["name"] = data.name;
          user["phone"] = data.phone;
          user["sale"] = data.sale;
          user["purchase"] = data.purchase;
          user["finance"] = data.finance;
          user["service"] = data.service;
          user["report"] = data.report;
          user["config"] = data.config;
          console.log("data user", data);
          console.log("user user", user);
          // this.configForm.patchValue({
          //   users: this.configForm.value.users,
          // });
          this.configForm.markAsDirty();
        }
      });
      profileModal.present();
    // });
  }
}

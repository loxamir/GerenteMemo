import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ConfigService } from './config.service';
// import { Base64 } from '@ionic-native/base64';
//import { CategoriesPage } from '../category/list/categories';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { CashListPage } from '../cash-list/cash-list.page';
import { AccountListPage } from '../account-list/account-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { Storage } from '@ionic/storage';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { ProductListPage } from '../product-list/product-list.page';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { InvoiceConfigPage } from '../invoice-config/invoice-config.page';
import { UserPage } from '../user/user.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
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
    public route: ActivatedRoute,

    public formBuilder: FormBuilder,
    // public base64: Base64,
    public events:Events,
    public storage: Storage,
    public alertCtrl: AlertController,
    // public camera: Camera,
    public pouchdbService: PouchdbService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  ngOnInit() {
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
    //this.loading.present();
    this.configService.getConfig().then((data) => {
      this.configForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  buttonSave() {
    this.configService.updateConfig(this.configForm.value);
    // this.navCtrl.navigateBack().then(() => {
      this.events.publish('open-config', this.configForm.value);
    // });
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
    return new Promise(async resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.configForm.patchValue({
          currency: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: CurrencyListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectCash() {
    return new Promise(async resolve => {
      this.events.subscribe('select-cash', (data) => {
        this.configForm.patchValue({
          cash: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-cash');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: CashListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectLaborProduct() {
    return new Promise(async resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          labor_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: ProductListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectInputProduct() {
    return new Promise(async resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          input_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: ProductListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectTravelProduct() {
    return new Promise(async resolve => {
      this.events.subscribe('select-product', (data) => {
        this.configForm.patchValue({
          travel_product: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-product');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: ProductListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectAccount() {
    return new Promise(async resolve => {
      this.events.subscribe('select-account', (data) => {
        this.configForm.patchValue({
          account: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(data);
      })
      let profileModal = await this.modal.create({
        component: AccountListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }
  selectWarehouse() {
    return new Promise(async resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.configForm.patchValue({
          warehouse: data,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-warehouse');
        resolve(data);
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
      this.navCtrl.navigateForward(['/contact-list', {"select": true}]);
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
    return new Promise(async resolve => {
      console.log("invoice", {"teste": "ok"});
      let profileModal = await this.modal.create({
        component: InvoiceConfigPage,
        componentProps: {"teste": "ok"}
      });
      await profileModal.present();
      const { data } = await profileModal.onDidDismiss();
      // await profileModal.onDidDismiss(data => {
        if (data) {
          Object.keys(data).forEach(key=>{
            data[key] = parseFloat(data[key]);
          })
          this.configForm.patchValue({
            invoicePrint: data,
          });
          this.configForm.markAsDirty();
        }
      // });

    });
  }

  addUser() {
    return new Promise(async resolve => {
      let profileModal = await this.modal.create({
        component: UserPage,
        componentProps: {}
      });
      profileModal.present();
      let data = await profileModal.onDidDismiss();
      // data => {
        if (data) {
          this.configForm.value.users.push(data);
          this.configForm.patchValue({
            users: this.configForm.value.users,
          });
          this.configForm.markAsDirty();
        }
      // });
    });
  }

  async editUser(user) {
    // return new Promise(resolve => {
      let profileModal = await this.modal.create({
        component: UserPage,
        componentProps: user
      });
      profileModal.present();
      let data: any = profileModal.onDidDismiss();
      // data => {
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
      // });
    // });
  }

}
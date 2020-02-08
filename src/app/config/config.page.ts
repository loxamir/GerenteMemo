import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { TicketConfigPage } from '../ticket-config/ticket-config.page';
import { UserPage } from '../user/user.page';
import { ActivatedRoute, Router } from '@angular/router';
import { RestProvider } from "../services/rest/rest";
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductCategoryListPage } from '../product-category-list/product-category-list.page';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  @ViewChild('pwaphoto', { static: false }) pwaphoto: ElementRef;
  @ViewChild('pwacamera', { static: false }) pwacamera: ElementRef;
  @ViewChild('pwagalery', { static: false }) pwagalery: ElementRef;
  configForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  select;
  logo = undefined;
  showProducts = false;
  showCategories = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
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
    public restProvider: RestProvider,
    public pouchdbService: PouchdbService,
  ) {



    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.configForm = this.formBuilder.group({
      name: ['', Validators.required],
      image: [''],
      color: ['blue'],
      serviceNote: [''],
      doc: [''],
      currency: [{}],
      cash: [{}],
      account: [{}],
      warehouse: [{}],
      labor_product: [{}],
      input_product: [{}],
      travel_product: [{}],
      contact: [{}],
      products: [[]],
      categories: [[]],
      default_payment: [{}],
      default_contact: [{}],
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
      currency_precision: 2,
      invoice_template: [''],
      invoicePrint: [{}],
      ticketPrint: [{}],
      users: [],
      _id: [''],
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.configService.getConfig().then((data) => {
      this.configForm.patchValue(data);
      this.loading.dismiss();
    });
  }

  buttonSave() {
    this.configService.updateConfig(this.configForm.value, this.logo);
    if (this.configForm.controls.product_sequence.dirty){
      // console.log("product sequence changed");
      this.configService.setNextSequence('product', 1, this.configForm.value.product_sequence);
    }
    if (this.select){
      this.modalCtrl.dismiss();
      this.events.publish('open-config', this.configForm.value);
    } else {
      this.navCtrl.navigateBack('/tabs/sale-list');
      // .then(() => {
        this.events.publish('open-config', this.configForm.value);
      // });
    }
    //TODO: Restore this to work with multi-users
    // this.setDbUsers();
  }

  justSave() {
    this.configService.updateConfig(this.configForm.value, this.logo);
    if (this.configForm.controls.product_sequence.dirty){
      this.configService.setNextSequence('product', 1, this.configForm.value.product_sequence);
    }
  }

  setDbUsers(){
    let names = [];
    this.configForm.value.users.forEach((user: any)=>{
      names.push(user.name);
    })
    // console.log("names", names);
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
          currency_precision: data.precision,
        });
        this.configForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(data);
      })
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
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
      let profileModal = await this.modalCtrl.create({
        component: WarehouseListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }
  selectContact() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();

      this.events.subscribe('select-contact', (data) => {
        this.configForm.patchValue({
          contact: data,
        });
        this.configForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-contact');
        resolve(data);
      })
      // this.navCtrl.navigateForward(['/contact-list', {"select": true}]);
    });
  }

  selectDefaultContact() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();

      this.events.subscribe('select-contact', (data) => {
        this.configForm.patchValue({
          default_contact: data,
        });
        this.configForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-contact');
        resolve(data);
      })
      // this.navCtrl.navigateForward(['/contact-list', {"select": true}]);
    });
  }

  selectDefaultPayment() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: PaymentConditionListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();

      this.events.subscribe('select-payment-condition', (data) => {
        this.configForm.patchValue({
          default_payment: data,
        });
        this.configForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-payment-condition');
        resolve(data);
      })
      // this.navCtrl.navigateForward(['/contact-list', {"select": true}]);
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

  async configInvoicePrint() {
    // return new Promise(async resolve => {
      // console.log("invoice", {"teste": "ok"});
      let profileModal = await this.modalCtrl.create({
        component: InvoiceConfigPage,
        componentProps: this.configForm.value.invoicePrint,
      });
      await profileModal.present();
      const { data } = await profileModal.onDidDismiss();
      // await profileModal.onDidDismiss(data => {
        if (data) {
          Object.keys(data).forEach(key=>{
            if (key != 'invoiceDateType' && key != 'invoicePaymentType' && key != 'paperSize'){
              data[key] = parseFloat(data[key]);
            }
          })
          this.configForm.patchValue({
            invoicePrint: data,
          });
          this.justSave();
        }
      // });

    // });
  }

  async configTicketPrint() {
    // return new Promise(async resolve => {
      // console.log("ticket", {"teste": "ok"});
      let profileModal = await this.modalCtrl.create({
        component: TicketConfigPage,
        componentProps: this.configForm.value.ticketPrint,
      });
      await profileModal.present();
      const { data } = await profileModal.onDidDismiss();
      // await profileModal.onDidDismiss(data => {
        if (data) {
          // Object.keys(data).forEach(key=>{
          //   if (key != 'invoiceDateType' && key != 'invoicePaymentType' && key != 'paperSize'){
          //     data[key] = parseFloat(data[key]);
          //   }
          // })
          this.configForm.patchValue({
            ticketPrint: data,
          });
          this.justSave();
        }
      // });

    // });
  }


  addUser() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: UserPage,
        componentProps: {}
      });
      await profileModal.present();
      // let data = await profileModal.onDidDismiss();
      const { data } = await profileModal.onDidDismiss();
      // console.log("userdata", data);
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
      let profileModal = await this.modalCtrl.create({
        component: UserPage,
        componentProps: user
      });
      await profileModal.present();
      // let data: any = profileModal.onDidDismiss();
      const { data } = await profileModal.onDidDismiss();
      // data => {
        if (data) {
          user["name"] = data.name;
          user["username"] = data.username;
          user["sale"] = data.sale;
          user["purchase"] = data.purchase;
          user["finance"] = data.finance;
          user["service"] = data.service;
          user["report"] = data.report;
          user["config"] = data.config;
          user["registered"] = data.registered;
          // console.log("data user", data);
          // console.log("user user", user);
          // this.configForm.patchValue({
          //   users: this.configForm.value.users,
          // });
          this.configForm.markAsDirty();
        }
      // });
    // });
  }


  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.configForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
              header: this.translate.instant('DISCARD'),
              message: this.translate.instant('SURE_DONT_SAVE'),
              buttons: [{
                      text: this.translate.instant('YES'),
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: this.translate.instant('NO'),
                      handler: () => {
                          // need to do something if the user stays?
                      }
                  }]
          });

          // Show the alert
          alertPopup.present();

          // Return false to avoid the page to be popped up
          return false;
      } else {
        this.exitPage();
      }
  }

  private exitPage() {
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      this.configForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/sale-list');
    }
  }

  // async setLegalName(){
  //   let contacts:any = await this.pouchdbService.getDocType('contact');
  //   let contactList = []
  //   contacts.forEach((contact: any)=>{
  //     if (contact.document){
  //       this.restProvider.getRucName(contact.document).then((data: any)=>{
  //         if (data.name!='HttpErrorResponse'){
  //           contact.legal_name = data.name;
  //           contactList.push(contact);
  //         }
  //       })
  //     }
  //   })
  //   this.pouchdbService.updateDocList(contactList);
  // }


  async setLegalName(){
    let contacts:any = await this.pouchdbService.getDocType('contact');
    let contactList = []
    const start = async () => {
      await this.asyncForEach(contacts, async (contact: any)=>{
        if (contact.document){
          if (contact.document[contact.document.length-2]=='-'){
            let data:any = await this.restProvider.getRucName(contact.document);
            if (data.name!='HttpErrorResponse'){
              contact.name_legal = data.name;
              contactList.push(contact);
            }
          }
          // })
        }
      })
      // console.log("contactList", contactList);
      this.pouchdbService.updateDocList(contactList);
    }
    start();
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  openPWAPhotoPicker() {
    if (this.pwaphoto == null) {
      return;
    }

    this.pwaphoto.nativeElement.click();
  }

  openPWACamera() {
    if (this.pwacamera == null) {
      return;
    }

    this.pwacamera.nativeElement.click();
  }

  openPWAGalery() {
    if (this.pwagalery == null) {
      return;
    }

    this.pwagalery.nativeElement.click();
  }

  previewFile() {
    let self = this;
    var preview: any = document.querySelector('#imageSrc');
    var file = this.pwaphoto.nativeElement.files[0];
    var reader = new FileReader();
    reader.onload = (event: Event) => {
      preview.src = reader.result;
      this.configForm.patchValue({
        image: reader.result,
      })
      this.configForm.markAsDirty();
      preview.onload = function() {

        var percentage = 1;
        let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)
        if (image_diameter > max_diameter) {
          percentage = max_diameter / image_diameter
        }

        var canvas: any = window.document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.height = canvas.width * (preview.height / preview.width);
        var oc = window.document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = preview.width * percentage;
        oc.height = preview.height * percentage;
        canvas.width = oc.width;
        canvas.height = oc.height;
        octx.drawImage(preview, 0, 0, oc.width, oc.height);
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);

        let jpg = ctx.canvas.toDataURL("image/jpeg");
        fetch(jpg)
          .then(res => res.blob())
          .then(blob => self.logo = blob)
      }
    }

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  async addProduct(){
    this.events.unsubscribe('select-product');
    this.events.subscribe('select-product', async (product) => {
      this.configForm.value.products.unshift(product)
      this.configForm.markAsDirty();
      this.events.unsubscribe('select-product');
      profileModal.dismiss();
    })
    let profileModal = await this.modalCtrl.create({
      component: ProductListPage,
      componentProps: {
        "select": true
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
  }

  async addCategory(){
    this.events.unsubscribe('select-category');
    this.events.subscribe('select-category', async (category) => {
      this.configForm.value.categories.unshift(category)
      this.configForm.markAsDirty();
      this.events.unsubscribe('select-category');
      profileModal.dismiss();
    })
    let profileModal = await this.modalCtrl.create({
      component: ProductCategoryListPage,
      componentProps: {
        "select": true
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
  }

  deleteProduct(item, slidingItem){
    slidingItem.close();
    let index = this.configForm.value.products.indexOf(item);
    this.configForm.value.products.splice(index, 1);
    this.configForm.markAsDirty();
  }

  deleteCategory(item, slidingItem){
    slidingItem.close();
    let index = this.configForm.value.categories.indexOf(item);
    this.configForm.value.categories.splice(index, 1);
    this.configForm.markAsDirty();
  }

  flipProducts(){
    this.showProducts = !this.showProducts;
  }

  flipCategories(){
    this.showCategories = !this.showCategories;
  }

}

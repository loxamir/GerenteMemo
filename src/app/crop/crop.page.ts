import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController,  ModalController, LoadingController,
   AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { CropService } from './crop.service';
import { WorkPage } from '../work/work.page';
// import { CropMoveService } from './move/crop-move.service';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
// import { AccountsPage } from './move/account/list/accounts';
import { ProductListPage } from '../product-list/product-list.page';
import { AreasPage } from '../areas/areas.page';

import { FutureContractPage } from '../future-contract/future-contract.page';

@Component({
  selector: 'app-crop',
  templateUrl: './crop.page.html',
  styleUrls: ['./crop.page.scss'],
})
export class CropPage implements OnInit {

  cropForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  select;
  create;
  today = new Date();
  currency_precision = 2;
  areaMeasure = "ha";

  deleteList = [];

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public cropService: CropService,
    // public cropMoveService: CropMoveService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
  ) {
    //this.loading = //this.loadingCtrl.create({});
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.create = this.route.snapshot.paramMap.get('create');
    this.events.subscribe('changed-crop-move', (change)=>{
      this.cropService.handleChange(this.cropForm.value.moves, change);
    })
  }

  async ngOnInit() {
    this.cropForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      date_start: new FormControl(new Date()),
      date_end: new FormControl(new Date()),
      product: new FormControl({}),
      product_name: new FormControl(),
      // currency_name: new FormControl(''),
      moves: new FormControl([]),
      items: new FormControl([]),
      average_price: new FormControl(0),
      contracts: new FormControl([]),
      futureContracts: new FormControl([]),
      // type: new FormControl('liquidity'),
      section: new FormControl('places'),
      state: new FormControl('ACTIVE'),
      area: new FormControl(0),
      code: new FormControl(''),
      contracts_quantity: new FormControl(0),
      contracts_amount: new FormControl(0),
      _id: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.areaMeasure = config.areaMeasure
    this.currency_precision = config.currency_precision;
    if (this._id){
      this.cropService.getCrop(this._id).then((data) => {
        this.cropForm.patchValue(data);
        this.recomputeValues();
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    this.deleteList.forEach(item=>{
      this.pouchdbService.deleteDoc(item);
    })
    if (this._id){
      this.cropService.updateCrop(this.cropForm.value);
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-crop', this.cropForm.value);
        if (this.select){
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/crops');
        }
      // });
    } else {
      this.cropService.createCrop(this.cropForm.value).then(doc => {
        //console.log("docss", doc);
        this.cropForm.patchValue({
          _id: doc['doc']['id'],
        });
        this._id = doc['doc']['id'];
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-crop', this.cropForm.value);
        // });
        if (this.select){
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/crops');
        }
      });
    }
  }

  selectProduct() {
    return new Promise(async resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        this.cropForm.patchValue({
          product: data,
          product_name: data.name,
        });
        this.cropForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-product');
        profileModal.dismiss();
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: {
          "select": true,
          "filter": "product",
        }
      });
      profileModal.present();
    });
  }

  setLanguage(lang: LanguageModel){
    let language_to_set = this.translate.getDefaultLang();
    if(lang){
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }


  async openWork(item) {
    this.events.subscribe('open-crop-move', (data) => {
      item.amount = data.amount;
      item.date = data.date;
      this.events.unsubscribe('open-crop-move');
    });
    let profileModal = await this.modalCtrl.create({
      component:WorkPage,
      componentProps: {
        "_id": item._id,
      }});
    profileModal.present();
  }

  async addActivity(){
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: {
        "roca": this.cropForm.value,
      }
    });
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.cropService.getCrop(this._id).then((data) => {
        this.cropForm.patchValue(data);
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 200);
  }

  doRefreshList(){
    this.cropService.getCrop(this._id).then((data) => {
      this.cropForm.patchValue(data);
      //this.loading.dismiss();
    });
  }

  onSubmit(values){
    //console.log(values);
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
    if(this.cropForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DISCARD'),
        message: this.translate.instant('SURE_DONT_SAVE'),
        buttons: [{
          text: this.translate.instant('YES'),
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => { }
        }]
      });
      alertPopup.present();
      return false;
    } else {
      this.exitPage();
    }
  }

  private exitPage() {
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      this.cropForm.markAsPristine();
      this.navCtrl.navigateBack('/crops');
    }
  }

  async addItem(){
    let self = this;
    if (this.cropForm.value.state=='ACTIVE'){
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.events.unsubscribe('select-area');
      this.events.subscribe('select-area', async (field) => {
        self.cropForm.value.items.unshift({
          'area': parseFloat(field.surface),
          'field': field,
        })
        self.recomputeValues();
        self.cropForm.markAsDirty();
        self.events.unsubscribe('select-area');
        profileModal.dismiss();
      })
      let profileModal = await this.modalCtrl.create({
        component: AreasPage,
        componentProps: {
          "select": true
        }
      });
      await profileModal.present();
      await this.loading.dismiss();
      await profileModal.onDidDismiss();
    }
  }

  async openItem(item) {
    if (this.cropForm.value.state=='ACTIVE'){
      this.events.unsubscribe('select-area');
      this.events.subscribe('select-area', (data) => {
        console.log("vars", data);
        item.area = data.surface;
        item.area = data;
        this.recomputeValues();
        this.cropForm.markAsDirty();
        this.events.unsubscribe('select-area');
        profileModal.dismiss();
      })
      let profileModal = await this.modalCtrl.create({
        component: AreasPage,
        componentProps: {
          "select": true,
        }});
        await profileModal.present();
        await profileModal.onDidDismiss();
    }
  }

  async editItemQuantity(item){
    if (this.cropForm.value.state=='ACTIVE'){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('PRODUCT_QUANTITY'),
        message: this.translate.instant('WHAT_PRODUCT_QUANTITY'),
        inputs: [
          {
            type: 'number',
            name: 'area',
            value: item.area
        },

        ],
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
          },
          {
            text: this.translate.instant('CONFIRM'),
            handler: data => {
              item.area = parseFloat(data.area);
              this.recomputeValues();
              this.cropForm.markAsDirty();
            }
          }
        ]
      });

      await prompt.present();
      await prompt.onDidDismiss();
    }
  }

  async deleteItem(slidingItem, item){
    if (this.cropForm.value.state=='ACTIVE'){
      slidingItem.close();
      let index = this.cropForm.value.items.indexOf(item)
      this.cropForm.value.items.splice(index, 1);
      this.cropForm.markAsDirty();
      this.recomputeValues();
    }
  }

  async addContract(){
    if (!this.cropForm.value._id){
      //TODO: Avoid orphan contracts
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('NEED_SAVE'),
        message: this.translate.instant('SAVE_CROP_FIRST'),
        buttons: [{
          text: this.translate.instant('Ok'),
          handler: () => { }
        }]
      });
      alertPopup.present();
    } else {

    return new Promise(async resolve => {
      this.events.unsubscribe('create-future-contract');
      this.events.subscribe('create-future-contract', (data) => {
        this.cropForm.value.futureContracts.unshift(data);
        this.recomputeValues();
        this.cropForm.markAsDirty();
        this.events.unsubscribe('create-future-contract');
        profileModal.dismiss();
        resolve(true);
      })

      let profileModal = await this.modalCtrl.create({
        component: FutureContractPage,
        componentProps: {
          "select": true,
          "crop": this.cropForm.value,
        }
      });
      profileModal.present();
    });
    }
  }

  async editContract(contract, index){

    return new Promise(async resolve => {
      this.events.unsubscribe('edit-future-contract');
      this.events.subscribe('edit-future-contract', (data) => {
        this.cropForm.value.futureContracts[index] = data;
        this.cropForm.markAsDirty();
        this.recomputeValues();
        this.events.unsubscribe('edit-future-contract');
        profileModal.dismiss();
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: FutureContractPage,
        componentProps: {
          "select": true,
          "_id": contract._id,
        }
      });
      profileModal.present();
    });
  }

  async deleteContract(slidingItem, item){
    // if (this.cropForm.value.state=='ACTIVE'){
    this.deleteList.push(item);
      slidingItem.close();
      let index = this.cropForm.value.futureContracts.indexOf(item)
      this.cropForm.value.futureContracts.splice(index, 1);
      this.cropForm.markAsDirty();
      this.recomputeValues();
    // }
  }

  recomputeValues(){
    let areaTotal = 0;
    let quantityTotal = 0;
    let contractTotal = 0;
    quantityTotal = this.cropForm.value.futureContracts.reduce((prevVal, contract)=>{
      return prevVal + contract.quantity;
    }, 0)
    contractTotal = this.cropForm.value.futureContracts.reduce((prevVal, contract)=>{
      return prevVal + contract.price*contract.quantity;
    }, 0);
    areaTotal = this.cropForm.value.items.reduce((prevVal, field)=>{
      return prevVal + field.area;
    }, 0)
    this.cropForm.patchValue({
      'contracts_amount': contractTotal,
      'contracts_quantity': quantityTotal,
      'area': areaTotal,
      'average_price': Math.round((contractTotal/quantityTotal)*100)/100
    })
    console.log("recompute values");
  }

  setDone(){
    this.cropForm.patchValue({
      'state': "FINISHED",
    })
    this.buttonSave();
  }

  setActive(){
    this.cropForm.patchValue({
      'state': "ACTIVE",
    })
    this.buttonSave();
  }

}

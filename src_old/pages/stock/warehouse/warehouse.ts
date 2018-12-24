import { Component } from '@angular/core';
import { NavController, App, NavParams, ModalController, LoadingController,
  AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { WarehouseService } from './warehouse.service';
import { StockMovePage } from '../stock-move';
import { StockMoveService } from '../stock-move.service';
// import { WarehouseTransferPage } from './transfer/warehouse-transfer';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { WarehousesPage } from './list/warehouses';

@Component({
  selector: 'warehouse-page',
  templateUrl: 'warehouse.html'
})
export class WarehousePage {

  warehouseForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public warehouseService: WarehouseService,
    public StockMoveService: StockMoveService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
  }

  ionViewWillLoad() {
    this.warehouseForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      currency: new FormControl({}),
      currency_name: new FormControl(''),
      moves: new FormControl([]),
      checks: new FormControl([]),
      type: new FormControl('physical'),
      code: new FormControl(''),
      sequence: new FormControl(1),
      note: new FormControl(''),
      default: new FormControl(false),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.warehouseService.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  // selectCurrency() {
  //   return new Promise(resolve => {
  //     // this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-currency');
  //     this.events.subscribe('select-currency', (data) => {
  //       this.warehouseForm.patchValue({
  //         currency: data,
  //         currency_name: data.name,
  //       });
  //       this.warehouseForm.markAsDirty();
  //       // this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-currency');
  //       resolve(true);
  //     })
  //     let profileModal = this.modal.create(CurrencyListPage, {"select": true});
  //     profileModal.present();
  //   });
  // }

  buttonSave() {
    if (this._id){
      this.warehouseService.updateWarehouse(this.warehouseForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-warehouse', this.warehouseForm.value);
      });
    } else {
      this.warehouseService.createWarehouse(this.warehouseForm.value).then(doc => {
        //console.log("docss", doc);
        this.warehouseForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-warehouse', this.warehouseForm.value);
        });
      });
    }
  }

  setLanguage(lang: LanguageModel){
    let language_to_set = this.translate.getDefaultLang();
    if(lang){
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }


  openItem(item) {
    this.events.subscribe('open-warehouse-move', (data) => {
      //console.log("Payment", data);
      item.amount = data.amount;
      item.date = data.date;
      this.recomputeValues();
      this.events.unsubscribe('open-warehouse-move');
    });
    //console.log("item", item);
    this.navCtrl.navigateForward(StockMovePage, {
      "_id": item._id,
    });
  }

  recomputeValues() {

  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ]
  };

  // addItem() {
  //     this.events.unsubscribe('create-warehouse-move');
  //     this.events.subscribe('create-warehouse-move', (data) => {
  //       this.doRefreshList();
  //       this.events.unsubscribe('create-warehouse-move');
  //     });
  //
  //     let profileModal = this.modal.create(StockMovePage, {
  //       "warehouseFrom": this.warehouseForm.value,
  //       "warehouseTo": this.warehouseForm.value,
  //     });
  //     profileModal.present();
  // }

  selectWarehouse() {
    return new Promise(resolve => {
      this.events.subscribe('select-warehouse', (data) => {
        this.events.unsubscribe('select-warehouse');
        resolve(data);
      })
      let profileModal = this.modal.create(WarehousesPage, {"select": true});
      profileModal.present();
    });
  }

  addIncome(fab){
    this.events.unsubscribe('create-warehouse-move');
    this.events.subscribe('create-warehouse-move', (data) => {
      this.doRefreshList();
      this.events.unsubscribe('create-warehouse-move');
    });
    fab.close();
    this.selectWarehouse().then(warehouse=>{
      let profileModal = this.modal.create(StockMovePage, {
        "warehouseFrom": warehouse,
        "warehouseTo": this.warehouseForm.value,
      });
      profileModal.present();
    })
  }

  addExpense(fab){
    this.events.unsubscribe('create-warehouse-move');
    this.events.subscribe('create-warehouse-move', (data) => {
      this.doRefreshList();
      this.events.unsubscribe('create-warehouse-move');
    });
    fab.close();
    this.selectWarehouse().then(warehouse=>{
      let profileModal = this.modal.create(StockMovePage, {
        "warehouseFrom": this.warehouseForm.value,
        "warehouseTo": warehouse,
      });
      profileModal.present();
    })
  }

  // addTransfer(){
  //   this.events.unsubscribe('create-warehouse-move');
  //   this.events.subscribe('create-warehouse-move', (data) => {
  //     this.doRefreshList();
  //     this.events.unsubscribe('create-warehouse-move');
  //   });
  //   this.selectWarehouse().then(warehouse=>{
  //     let profileModal = this.modal.create(StockMovePage, {
  //       "warehouseFrom": warehouse,
  //       "warehouseTo": this.warehouseForm.value,
  //     });
  //     profileModal.present();
  //   })
  // }

  doRefresh(refresher) {
    setTimeout(() => {
      // this.StockMoveListService.getStockMoveList(this.searchTerm, 0).then((StockMoveList: any[]) => {
      //   this.StockMoveList = StockMoveList;
      //   this.page = 1;
      // });
      // this.updateTotal();
      this.warehouseService.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 500);
  }

  doRefreshList(){
    this.warehouseService.getWarehouse(this._id).then((data) => {
      this.warehouseForm.patchValue(data);
      this.recomputeValues();
      //this.loading.dismiss();
    });
  }

  // addItem(){
  //   this.events.subscribe('create-warehouse-move', (data) => {
      // if (data.amount > 0){
      //   let moves = this.warehouseForm.value.moves;
      //   moves.unshift(data);
      // }
  //     this.events.unsubscribe('create-warehouse-move');
  //   });
  //   this.navCtrl.navigateForward(StockMovePage, {
  //     "warehouse_id": this._id,
  //     "warehouse": this.warehouseForm.value,
  //   });
  // }
  // addTransfer(){
  //   this.events.subscribe('create-warehouse-transfer', (data) => {
  //     //console.log("Payment", data);
  //     if (data.amount > 0){
  //       this.warehouseForm.value.moves.push({
  //         'name': data.name,
  //         'amount': parseFloat(data.fromAmount),
  //         'date': data.date
  //       });
  //       this.recomputeValues();
  //     }
  //     this.events.unsubscribe('create-warehouse-transfer');
  //   });
  //   this.navCtrl.navigateForward(WarehouseTransferPage, {
  //     "fromWarehouseId": this._id,
  //     "fromWarehouse": this.warehouseForm.value,
  //   });
  // }
  //
  // openCheck(check){
  //   this.events.subscribe('open-warehouse-transfer', (data) => {
  //     //console.log("Payment", data);
  //     if (data.amount > 0){
  //       this.warehouseForm.value.moves.push({
  //         'name': data.name,
  //         'amount': parseFloat(data.fromAmount),
  //         'date': data.date
  //       });
  //       this.recomputeValues();
  //     }
  //     this.events.unsubscribe('open-warehouse-transfer');
  //   });
  //   //console.log("check", check);
  //   this.navCtrl.navigateForward(WarehouseTransferPage, {
  //     "fromWarehouseId": this._id,
  //     "fromWarehouse": this.warehouseForm.value,
  //     "fromAmount": check.amount,
  //     "check": check,
  //   });
  // }

  onSubmit(values){
    //console.log(values);
  }

  changeName(){
    let prompt = this.alertCtrl.create({
      title: 'Nombre del Caja',
      message: 'Cual es el nombre de este caja?',
      inputs: [
        {
          name: 'name',
          placeholder: 'Caja Chica',
          value: this.warehouseForm.value.name
      },

      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirmar',
          handler: data => {
            //console.log("sale", data);
            this.warehouseForm.value.name = data.name;
          }
        }
      ]
    });

    prompt.present();
  }

}

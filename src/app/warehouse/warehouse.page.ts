import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController,
  AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { WarehouseService } from './warehouse.service';
import { StockMovePage } from '../stock-move/stock-move.page';
// import { StockMoveService } from '../stock-move.service';
// import { WarehouseTransferPage } from './transfer/warehouse-transfer';
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.page.html',
  styleUrls: ['./warehouse.page.scss'],
})
export class WarehousePage implements OnInit {

  warehouseForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public warehouseService: WarehouseService,
    // public StockMoveService: StockMoveService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    // public app: App,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
  ) {
    this.languages = this.languageService.getLanguages();
    // this._id = this.navParams.data._id;
    this._id = this.route.snapshot.paramMap.get('_id');
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  async ngOnInit() {
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
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (this._id){
      this.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  // ionViewDidLoad() {
  //   //this.loading.present();
  //
  // }

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
      this.updateWarehouse(this.warehouseForm.value);
      this.navCtrl.navigateBack('/warehouse-list');
      // .then(() => {
        this.events.publish('open-warehouse', this.warehouseForm.value);
      // });
    } else {
      this.createWarehouse(this.warehouseForm.value).then(doc => {
        //console.log("docss", doc);
        this.warehouseForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.navigateBack('/warehouse-list');
        // .then(() => {
          this.events.publish('create-warehouse', this.warehouseForm.value);
        // });
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
    this.navCtrl.navigateForward(['/stock-move', {
      "_id": item._id,
    }]);
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
    return new Promise(async resolve => {
      this.events.subscribe('select-warehouse', (data) => {
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

  addIncome(fab){
    this.events.unsubscribe('create-warehouse-move');
    this.events.subscribe('create-warehouse-move', (data) => {
      this.doRefreshList();
      this.events.unsubscribe('create-warehouse-move');
    });
    fab.close();
    this.selectWarehouse().then(async warehouse=>{
      let profileModal = await this.modal.create({
        component: StockMovePage,
        componentProps: {
          "warehouseFrom": warehouse,
          "warehouseTo": this.warehouseForm.value,
        }
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
    this.selectWarehouse().then(async (warehouse)=>{
      let profileModal = await this.modal.create({
        component: StockMovePage,
        componentProps: {
        "warehouseFrom": this.warehouseForm.value,
        "warehouseTo": warehouse,
      }});
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
      this.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
        //this.loading.dismiss();
      });
      refresher.target.complete();
    }, 500);
  }

  doRefreshList(){
    this.getWarehouse(this._id).then((data) => {
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

  async changeName(){
    let prompt = await this.alertCtrl.create({
      header: 'Nombre del Caja',
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

  getWarehouse(doc_id): Promise<any> {
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Depositos', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        console.log("Depositos", planneds);
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        planneds.forEach(item => {
          // if (item.value != 0){
            pts.push(item);
            console.log("ites", item);
            promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
            balance += parseFloat(item.value);
          // }
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(stockMoves => {
          // resolve(pts);
          console.log("stockMoves", stockMoves);
          console.log("pts", pts);
          // let warehouse = ;
          let warehouse = Object.assign({}, stockMoves[stockMoves.length-1]);
          warehouse.moves = [];
          warehouse.balance = balance;
          warehouse.warehouse = stockMoves[stockMoves.length-1];
          warehouse.name
          for(let i=0;i<pts.length;i++){
            stockMoves[i].stock = pts[i].value;
            warehouse.moves.unshift(stockMoves[i]);
            console.log(stockMoves[i].value);
          }
          console.log("PTS2", warehouse);
          // let receivables = pts.filter(word => word['contact_name'] && word['contact_name'].toString().search(new RegExp(keyword, "i")) != -1);
          resolve(warehouse);
        })
      });
    });
  }

  // createWarehouse(warehouse){
  //   warehouse.docType = 'warehouse';
  //   delete warehouse.moves;
  //   delete warehouse.warehouse;
  //   return this.pouchdbService.createDoc(warehouse);
  // }

  createWarehouse(warehouse){
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return new Promise((resolve, reject)=>{
      let code= 'es';
      if (warehouse.code != ''){
        this.pouchdbService.createDoc(warehouse).then(doc => {
          if (warehouse.type == 'physical'){
            warehouse._id = "warehouse.physical."+warehouse.code;
          }
          resolve({doc: doc, warehouse: warehouse});
        });
      } else {
        // this.configService.getSequence('warehouse').then((code) => {
        //   warehouse['code'] = code;
          if (warehouse.type == 'physical'){
            warehouse._id = "warehouse.physical."+code;
          }
          this.pouchdbService.createDoc(warehouse).then(doc => {
            resolve({doc: doc, warehouse: warehouse});
          });
        // });
      }

    });
  }

  getDefaultWarehouse(){
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getDoc('config.profile').then((config: any) => {
        this.pouchdbService.getDoc(config.warehouse_id).then(default_warehouse => {
          resolve(default_warehouse);
        })
      });
    });
  }

  updateWarehouse(warehouse){
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return this.pouchdbService.updateDoc(warehouse);
  }

  deleteWarehouse(warehouse){
    return this.pouchdbService.deleteDoc(warehouse);
  }

}

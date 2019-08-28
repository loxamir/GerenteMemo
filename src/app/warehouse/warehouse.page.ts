import { Component, OnInit } from '@angular/core';
import {
  NavController, ModalController, LoadingController,
  AlertController, Events
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { StockMovePage } from '../stock-move/stock-move.page';
import { InputPage } from '../input/input.page';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../config/config.service';

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
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public configService: ConfigService,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  async ngOnInit() {
    this.warehouseForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      count: new FormControl(0),
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
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (this._id) {
      this.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  buttonSave() {
    if (this._id) {
      this.updateWarehouse(this.warehouseForm.value);
      this.navCtrl.navigateBack('/warehouse-list');
      this.events.publish('open-warehouse', this.warehouseForm.value);
    } else {
      this.createWarehouse(this.warehouseForm.value).then(doc => {
        this.warehouseForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.navigateBack('/warehouse-list');
        this.events.publish('create-warehouse', this.warehouseForm.value);
      });
    }
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();
    if (lang) {
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }


  async openItem(item) {
    let profileModal = await this.modalCtrl.create({
      component: InputPage,
      componentProps: {
        "select": true,
        "_id": item._id,
        "warehouse_id": this._id,
      }
    });
    await profileModal.present();
  }

  recomputeValues() {

  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ]
  };

  selectWarehouse() {
    return new Promise(async resolve => {
      this.events.subscribe('select-warehouse', (data) => {
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

  addIncome(fab) {
    this.events.unsubscribe('create-warehouse-move');
    this.events.subscribe('create-warehouse-move', (data) => {
      this.doRefreshList();
      this.events.unsubscribe('create-warehouse-move');
    });
    fab.close();
    this.selectWarehouse().then(async warehouse => {
      let profileModal = await this.modalCtrl.create({
        component: StockMovePage,
        componentProps: {
          "warehouseFrom": warehouse,
          "warehouseTo": this.warehouseForm.value,
        }
      });
      profileModal.present();
    })
  }

  addExpense(fab) {
    this.events.unsubscribe('create-warehouse-move');
    this.events.subscribe('create-warehouse-move', (data) => {
      this.doRefreshList();
      this.events.unsubscribe('create-warehouse-move');
    });
    fab.close();
    this.selectWarehouse().then(async (warehouse) => {
      let profileModal = await this.modalCtrl.create({
        component: StockMovePage,
        componentProps: {
          "warehouseFrom": this.warehouseForm.value,
          "warehouseTo": warehouse,
        }
});
      profileModal.present();
    })
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getWarehouse(this._id).then((data) => {
        this.warehouseForm.patchValue(data);
        this.recomputeValues();
      });
      refresher.target.complete();
    }, 500);
  }

  doRefreshList() {
    this.getWarehouse(this._id).then((data) => {
      this.warehouseForm.patchValue(data);
      this.recomputeValues();
    });
  }

  onSubmit(values) {
    //console.log(values);
  }

  async changeName() {
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
          text: this.translate.instant('CONFIRM'),
          handler: data => {
            this.warehouseForm.value.name = data.name;
          }
        }
      ]
    });

    prompt.present();
  }

  getWarehouse(doc_id): Promise<any> {
    return new Promise((resolve, reject) => {
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Depositos', 2,
        [doc_id, '0'],
        [doc_id, 'z']
      ).then((planneds: any[]) => {
        let promise_ids = [];
        let pts = [];
        let balance = 0;
        let count = 0;
        planneds.forEach(item => {
          pts.push(item);
          promise_ids.push(this.pouchdbService.getDoc(item.key[1]));
          balance += parseFloat(item.value);
          count += 1;
        })
        promise_ids.push(this.pouchdbService.getDoc(doc_id));
        Promise.all(promise_ids).then(stockMoves => {
          let warehouse = Object.assign({}, stockMoves[stockMoves.length - 1]);
          warehouse.moves = [];
          warehouse.balance = balance;
          warehouse.count = count;
          warehouse.warehouse = stockMoves[stockMoves.length - 1];
          warehouse.name
          for (let i = 0; i < pts.length; i++) {
            stockMoves[i].stock = pts[i].value;
            warehouse.moves.unshift(stockMoves[i]);
          }
          resolve(warehouse);
        })
      });
    });
  }

  createWarehouse(warehouse) {
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return new Promise(async (resolve, reject)=>{
      let code = await this.configService.getSequence('warehouse');
      warehouse['code'] = code;
      if (warehouse.type == 'physical'){
        warehouse._id = "warehouse.physical."+code;
      }
      this.pouchdbService.createDoc(warehouse).then(doc => {
        resolve({doc: doc, warehouse: warehouse});
      });
    });
  }

  getDefaultWarehouse() {
    return new Promise((resolve, reject) => {
      this.pouchdbService.getDoc('config.profile').then((config: any) => {
        this.pouchdbService.getDoc(config.warehouse_id).then(default_warehouse => {
          resolve(default_warehouse);
        })
      });
    });
  }

  updateWarehouse(warehouse) {
    warehouse.docType = 'warehouse';
    delete warehouse.moves;
    delete warehouse.warehouse;
    return this.pouchdbService.updateDoc(warehouse);
  }

  deleteWarehouse(warehouse) {
    return this.pouchdbService.deleteDoc(warehouse);
  }

}

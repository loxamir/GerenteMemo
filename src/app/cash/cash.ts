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
import { CashService } from './cash.service';
import { CashMovePage } from './move/cash-move';
import { CashMoveService } from './move/cash-move.service';
import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { AccountsPage } from './move/account/list/accounts';
import { FormatService } from "../services/format.service";

@Component({
  selector: 'cash-page',
  templateUrl: 'cash.html'
})
export class CashPage {

  cashForm: FormGroup;
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
    public cashService: CashService,
    public cashMoveService: CashMoveService,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public pouchdbService: PouchdbService,
    public events: Events,
    public formatService: FormatService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    this.events.subscribe('changed-cash-move', (change)=>{
      // this.cashService.handleChange(this.cashForm.value.moves, change);
      this.cashService.localHandleChangeData(
      this.cashForm.value.moves, this.cashForm.value.waiting, change);
    })
  }

  ionViewWillLoad() {
    this.cashForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      balance: new FormControl(0),
      currency: new FormControl({}),
      // currency_name: new FormControl(''),
      moves: new FormControl([]),
      checks: new FormControl([]),
      waiting: new FormControl([]),
      bank_name: new FormControl(''),
      type: new FormControl('cash'),
      section: new FormControl('moves'),
      sequence: new FormControl(1),
      note: new FormControl(''),
      code: new FormControl(''),
      // default: new FormControl(false),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.cashService.getCash(this._id).then((data) => {
        this.cashForm.patchValue(data);
        this.recomputeValues();
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  selectCurrency() {
    return new Promise(resolve => {
      // this.avoidAlertMessage = true;
      this.events.unsubscribe('select-currency');
      this.events.subscribe('select-currency', (data) => {
        this.cashForm.patchValue({
          currency: data,
          // currency_name: data.name,
        });
        this.cashForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
      let profileModal = this.modal.create(CurrencyListPage, {"select": true});
      profileModal.present();
    });
  }

  buttonSave() {
    if (this._id){
      this.cashService.updateCash(this.cashForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-cash', this.cashForm.value);
      });
    } else {
      this.cashService.createCash(this.cashForm.value).then(doc => {
        //console.log("docss", doc);
        this.cashForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.navCtrl.pop().then(() => {
          this.events.publish('create-cash', this.cashForm.value);
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
    this.events.subscribe('open-cash-move', (data) => {
      //console.log("Payment", data);
      item.amount = data.amount;
      item.date = data.date;
      this.recomputeValues();
      this.events.unsubscribe('open-cash-move');
    });
    //console.log("item", item);
    this.navCtrl.push(CashMovePage, {
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
  //     this.events.unsubscribe('create-cash-move');
  //     this.events.subscribe('create-cash-move', (data) => {
  //       this.doRefreshList();
  //       this.events.unsubscribe('create-cash-move');
  //     });
  //
  //     let profileModal = this.modal.create(CashMovePage, {
  //       "accountFrom": this.cashForm.value,
  //       "accountTo": this.cashForm.value,
  //     });
  //     profileModal.present();
  // }

  selectAccount() {
    return new Promise(resolve => {
      this.events.subscribe('select-account', (data) => {
        this.events.unsubscribe('select-account');
        resolve(data);
      })
      let profileModal = this.modal.create(AccountsPage, {"select": true});
      profileModal.present();
    });
  }

  addIncome(fab){
    // this.events.unsubscribe('create-cash-move');
    // this.events.subscribe('create-cash-move', (data) => {
    //   this.doRefreshList();
    //   this.events.unsubscribe('create-cash-move');
    // });
    fab.close();
    let profileModal = this.modal.create(CashMovePage, {
      "accountTo": this.cashForm.value,
    });
    profileModal.present();
  }

  addTransfer(fab){
    // this.events.unsubscribe('create-cash-move');
    // this.events.subscribe('create-cash-move', (data) => {
    //   this.doRefreshList();
    //   this.events.unsubscribe('create-cash-move');
    // });
    fab.close();
    let profileModal = this.modal.create(CashMovePage, {
      "accountFrom": this.cashForm.value,
      "transfer": true,
    });
    profileModal.present();
  }

  addExpense(fab){
    // this.events.unsubscribe('create-cash-move');
    // this.events.subscribe('create-cash-move', (data) => {
    //   this.doRefreshList();
    //   this.events.unsubscribe('create-cash-move');
    // });
    fab.close();
    let profileModal = this.modal.create(CashMovePage, {
      "accountFrom": this.cashForm.value,
    });
    profileModal.present();
    // this.selectAccount().then(account=>{
    //   let profileModal = this.modal.create(CashMovePage, {
    //     "accountFrom": this.cashForm.value,
    //     "accountTo": account,
    //   });
    //   profileModal.present();
    // })
  }

  // addTransfer(){
  //   this.events.unsubscribe('create-cash-move');
  //   this.events.subscribe('create-cash-move', (data) => {
  //     this.doRefreshList();
  //     this.events.unsubscribe('create-cash-move');
  //   });
  //   this.selectAccount().then(account=>{
  //     let profileModal = this.modal.create(CashMovePage, {
  //       "accountFrom": account,
  //       "accountTo": this.cashForm.value,
  //     });
  //     profileModal.present();
  //   })
  // }

  doRefresh(refresher) {
    setTimeout(() => {
      // this.cashMoveListService.getCashMoveList(this.searchTerm, 0).then((cashMoveList: any[]) => {
      //   this.cashMoveList = cashMoveList;
      //   this.page = 1;
      // });
      // this.updateTotal();
      this.cashService.getCash(this._id).then((data) => {
        this.cashForm.patchValue(data);
        this.recomputeValues();
        this.loading.dismiss();
      });
      refresher.complete();
    }, 500);
  }

  doRefreshList(){
    this.cashService.getCash(this._id).then((data) => {
      this.cashForm.patchValue(data);
      this.recomputeValues();
      this.loading.dismiss();
    });
  }

  // addItem(){
  //   this.events.subscribe('create-cash-move', (data) => {
      // if (data.amount > 0){
      //   let moves = this.cashForm.value.moves;
      //   moves.unshift(data);
      // }
  //     this.events.unsubscribe('create-cash-move');
  //   });
  //   this.navCtrl.push(CashMovePage, {
  //     "cash_id": this._id,
  //     "cash": this.cashForm.value,
  //   });
  // }
  // addTransfer(){
  //   this.events.subscribe('create-cash-transfer', (data) => {
  //     //console.log("Payment", data);
  //     if (data.amount > 0){
  //       this.cashForm.value.moves.push({
  //         'name': data.name,
  //         'amount': parseFloat(data.fromAmount),
  //         'date': data.date
  //       });
  //       this.recomputeValues();
  //     }
  //     this.events.unsubscribe('create-cash-transfer');
  //   });
  //   this.navCtrl.push(CashTransferPage, {
  //     "fromCashId": this._id,
  //     "fromCash": this.cashForm.value,
  //   });
  // }

  // openCheck(check){
  //   this.events.subscribe('open-cash-transfer', (data) => {
  //     //console.log("Payment", data);
  //     if (data.amount > 0){
  //       this.cashForm.value.moves.push({
  //         'name': data.name,
  //         'amount': parseFloat(data.fromAmount),
  //         'date': data.date
  //       });
  //       this.recomputeValues();
  //     }
  //     this.events.unsubscribe('open-cash-transfer');
  //   });
  //   //console.log("check", check);
  //   this.navCtrl.push(CashTransferPage, {
  //     "fromCashId": this._id,
  //     "fromCash": this.cashForm.value,
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
          value: this.cashForm.value.name
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
            this.cashForm.value.name = data.name;
          }
        }
      ]
    });

    prompt.present();
  }

}

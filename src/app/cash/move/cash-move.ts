import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ViewController, Events, TextInput, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { CashService } from '../cash.service';
import { CashMoveService } from './cash-move.service';
// import { CashListPage } from '../list/cash-list';
import { AccountsPage } from './account/list/accounts';
import { ContactsPage } from '../../contact/list/contacts';
import { ConfigService } from '../../config/config.service';
import { ChecksPage } from '../../check/list/checks';
import { CurrencyListPage } from '../../currency/list/currency-list';

@Component({
  selector: 'cash-move-page',
  templateUrl: 'cash-move.html'
})
export class CashMovePage {
  @ViewChild('input') myInput: TextInput;
  @ViewChild('description') description: TextInput;

  cashMoveForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  // cash_id: string;
  default_amount: number;
  default_name: number;
  today: any;
  from_cash: boolean = false;
  to_cash: boolean = false;
  transfer: boolean = false;

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
    public cashMoveService: CashMoveService,
    public cashService: CashService,
    public events: Events,
    public configService: ConfigService,
    public alertCtrl: AlertController,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    // this.cash_id = this.navParams.data.cash_id;
    this.default_amount = this.navParams.data.default_amount;
    this.default_name = this.navParams.data.default_name;
    this.today = new Date();
    // console.log("dados nav", this.navParams.data)
    if (this.navParams.data.accountTo && this.navParams.data.accountTo._id.split('.')[1]=='cash'){
      // console.log("to cash");
      this.to_cash = true;
    }
    if (this.navParams.data.accountFrom && this.navParams.data.accountFrom._id.split('.')[1]=='cash'){
      // console.log("from cash");
      this.from_cash = true;
    }
    if (this.navParams.data.transfer){
      // console.log("from cash");
      this.transfer = true;
    }
  }

  ionViewWillLoad() {
    var today = new Date().toISOString();


    this.cashMoveForm = this.formBuilder.group({
      name: new FormControl(this.default_name, Validators.required),
      amount: new FormControl(this.default_amount||'', Validators.required),
      date: new FormControl(today, Validators.required),
      dateDue: new FormControl(today, Validators.required),
      state: new FormControl('DRAFT'),
      // cash: new FormControl({}),
      // cash_id: new FormControl(this.navParams.data.cash_id),
      origin_id: new FormControl(this.navParams.data.origin_id),
      accountFrom: new FormControl({}),
      accountFrom_id: new FormControl(this.navParams.data.accountFrom_id),
      accountTo: new FormControl({}),
      accountTo_id: new FormControl(this.navParams.data.accountTo_id),
      contact: new FormControl(this.navParams.data.contact||{}),
      contact_id: new FormControl(this.navParams.data.contact_id),
      // project: new FormControl(this.navParams.data.project||{}),
      // project_name: new FormControl(this.navParams.data.project_name||''),
      signal: new FormControl(this.navParams.data.signal||'-'),
      check: new FormControl(this.navParams.data.check||{}),
      bank: new FormControl(''),
      amount_residual: new FormControl(this.default_amount||null),
      payments: new FormControl([]),
      invoices: new FormControl([]),
      number: new FormControl(''),
      owner: new FormControl(''),
      code: new FormControl(''),
      maturity: new FormControl(''),

      currency: new FormControl(this.navParams.data.currency||{}),
      currency_amount: new FormControl(this.navParams.data.currency_amount||0),
      currency_residual: new FormControl(this.navParams.data.currency_residual||0),
      _id: new FormControl(''),
    });
  }

  goNextStep() {
    if (this.cashMoveForm.value.state == 'DRAFT'){
      if (this.cashMoveForm.value.amount == ''){
        this.myInput.setFocus();
      }
      else if (!this.cashMoveForm.value.name){
        this.description.setFocus();
        return;
      }
      else if (Object.keys(this.cashMoveForm.value.accountFrom).length === 0){
        this.selectAccountFrom();
        return;
      }
      else if (Object.keys(this.cashMoveForm.value.accountTo).length === 0){
        this.selectAccountTo();
        return;
      }
      else if (!this.transfer && Object.keys(this.cashMoveForm.value.contact).length === 0){
        this.selectContact();
        return;
      }
      else {
        let prompt = this.alertCtrl.create({
          title: 'Confirmar',
          message: 'Estas seguro que deseas confirmar el movimiento?',
          buttons: [
            {
              text: 'No',
              handler: data => {
              }
            },
            {
              text: 'Si',
              handler: data => {
                // this.addTravel();
                this.confirmCashMove();
              }
            }
          ]
        });
        prompt.present();
      }
    }
    else {
      this.navCtrl.pop();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 200);
  }

  ionViewDidLoad() {
    //console.log("ionViewDidLoad");
    this.loading.present();

    if (this._id){
      this.cashMoveService.getCashMove(this._id).then((data) => {
        // data.date = Date(data.date)
        this.cashMoveForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.cashMoveForm.markAsDirty();
      //console.log("caja", this.navParams.data.cash);
      // if (this.navParams.data.hasOwnProperty('cash')){
      //   this.cashMoveForm.patchValue({
      //     cash: this.navParams.data.cash,
      //     cash_id: this.navParams.data.cash._id,
      //   });
      // } else {
        this.configService.getConfig().then(config => {
          let accountFrom = this.navParams.data.accountFrom || {};
          let accountTo = this.navParams.data.accountTo || {};
          let contact = this.navParams.data.contact || {};
          //console.log("configconfig", config);
          this.cashMoveForm.patchValue({
            cash: config.cash,
            cash_id: config.cash['_id'],
            accountFrom: accountFrom,
            accountFrom_id: accountFrom['_id'],
            accountTo: accountTo,
            accountTo_id: accountTo['_id'],
            contact: contact,
            contact_id: contact['_id'],
          });
        });
        // this.cashService.getDefaultCash().then(default_cash => {
        //
        // });
      // }
      this.loading.dismiss();
    }
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'amount': [
      { type: 'required', message: 'Amount is required.' }
    ],
    'date': [
      { type: 'required', message: 'Date is required.' }
    ]
  };

  buttonSave() {
    // var today = new Date().toISOString();
    // this.cashMoveForm.value.date = this.cashMoveForm.value.date;
    // if (this.cashMoveForm.value.date <= today){
    //   this.cashMoveForm.value.state = 'DONE';
    // } else {
    //   this.cashMoveForm.value.state = 'DRAFT';
    // }
    if (this._id){
      this.cashMoveService.updateCashMove(this.cashMoveForm.value);
      this.cashMoveForm.markAsPristine();
      this.navCtrl.pop();
    } else {
      this.cashMoveService.createCashMove(this.cashMoveForm.value).then(doc => {
        //console.log("the_doc", doc);
        this.cashMoveForm.value._id = doc['id'];
        this.cashMoveForm.markAsPristine();
        this.navCtrl.pop();
      });
    }
  }

  confirmState(){
    this.cashMoveForm.patchValue({
      'state': 'DONE',
    });
    this.buttonSave();
  }

  confirmCashMove(){
    let state = 'DONE';
    if (this.cashMoveForm.value.accountTo_id.split('.')[1] == 'bank'){
      state = 'WAITING'
    }
    this.cashMoveForm.patchValue({
      'state': state,
    });
    this.buttonSave();
  }

  selectCheck() {
    return new Promise(resolve => {
      this.events.subscribe('select-check', (data) => {
        this.cashMoveForm.patchValue({
          check: data,
          amount: data.amount,
          currency: data.currency
          // cash_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-check');
        resolve(true);
      })
      let profileModal = this.modal.create(ChecksPage, {"select": true});
      profileModal.present();
    });
  }

  selectCurrency() {
    return new Promise(resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.cashMoveForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
      let profileModal = this.modal.create(CurrencyListPage, {"select": true});
      profileModal.present();
    });
  }

  selectAccountFrom() {
    return new Promise(resolve => {
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountFrom: data,
          accountFrom_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
      let profileModal = this.modal.create(AccountsPage, {"select": true, show_cash_in: this.to_cash, show_cash_out: this.from_cash, transfer: this.navParams.data.transfer, accountFrom: this.navParams.data.accountFrom, payable: this.navParams.data.payable, receivable: this.navParams.data.receivable});
      profileModal.present();
    });
  }

  selectAccountTo() {
    return new Promise(resolve => {
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountTo: data,
          accountTo_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
      let profileModal = this.modal.create(AccountsPage, {"select": true, show_cash_in: this.to_cash, show_cash_out: this.from_cash,  transfer: this.navParams.data.transfer, accountFrom: this.navParams.data.accountFrom, payable: this.navParams.data.payable, receivable: this.navParams.data.receivable});
      profileModal.present();
    });
  }

  selectContact() {
     return new Promise(resolve => {
       this.events.subscribe('select-contact', (data) => {
         this.cashMoveForm.patchValue({
           contact: data,
           contact_id: data._id,
         });
         this.cashMoveForm.markAsDirty();
         this.events.unsubscribe('select-contact');
         resolve(true);
       })
       let profileModal = this.modal.create(ContactsPage, {"select": true});
       profileModal.present();
     });
   }

   // selectProject() {
   //   console.log("selectProject");
   //   if (this.cashMoveForm.value.state!='DONE'){
   //     return new Promise(resolve => {
   //       // this.avoidAlertMessage = true;
   //       this.events.unsubscribe('select-project');
   //       this.events.subscribe('select-project', (data) => {
   //         this.cashMoveForm.patchValue({
   //           project: data,
   //           project_name: data.name,
   //         });
   //         this.cashMoveForm.markAsDirty();
   //         // this.avoidAlertMessage = false;
   //         this.events.unsubscribe('select-project');
   //         resolve(true);
   //       })
   //       let profileModal = this.modal.create(ProjectsPage, {"select": true});
   //       profileModal.present();
   //     });
   //   }
   // }

  onSubmit(values){
    //console.log(values);
  }
}

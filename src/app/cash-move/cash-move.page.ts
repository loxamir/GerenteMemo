import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { CashMoveService } from './cash-move.service';
import { AccountListPage } from '../account-list/account-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { ConfigService } from '../config/config.service';
import { CheckListPage } from '../check-list/check-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { ContactPage } from '../contact/contact.page';
import { CheckPage } from '../check/check.page';

@Component({
  selector: 'app-cash-move',
  templateUrl: './cash-move.page.html',
  styleUrls: ['./cash-move.page.scss'],
})
export class CashMovePage implements OnInit {

  // constructor() { }
  @ViewChild('amount') amount;
  @ViewChild('description') description;
  @ViewChild('currency_amount') currency_amountField;

@Input() _id;
// @Input() select;
@Input() origin_id;
@Input() accountFrom_id;
@Input() accountTo_id;
@Input() accountFrom;
@Input() accountTo;
@Input() contact;
@Input() contact_id;
@Input() signal;
@Input() check;
company_currency_id = 'currency.PYG';
@Input() currency;
@Input() currency_amount;
@Input() currency_residual;
@Input() currency_exchange;
@Input() payable;
@Input() receivable;
@Input() select;

  cashMoveForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  // _id: string;
  // cash_id: string;
  default_amount: number;
  default_name: number;
  today: any;
  from_cash: boolean = false;
  to_cash: boolean = false;
  transfer: boolean = false;
  changing = false;
  currency_precision = 2;
  company_currency_name = "";
  constructor(

    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public cashMoveService: CashMoveService,
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
    // public navParams: NavParams,
    public events: Events,
    public configService: ConfigService,
    public alertCtrl: AlertController,
  ) {
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id =  this.route.snapshot.paramMap.get('_id');
    this.select =  this.route.snapshot.paramMap.get('select');
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
    this.transfer = this.route.snapshot.paramMap.get('transfer') == 'true';
    // this.default_amount = this.default_amount');
    // this.default_name = this.default_name');
    this.today = new Date();
    // console.log("dados nav", this.

  }

  async ngOnInit() {
    // var today = new Date().toISOString();


    this.cashMoveForm = this.formBuilder.group({
      name: new FormControl(this.default_name),
      amount: new FormControl(this.default_amount||'', Validators.required),
      date: new FormControl(this.today.toISOString(), Validators.required),
      dateDue: new FormControl(this.today.toISOString(), Validators.required),
      state: new FormControl('DRAFT'),
      // cash: new FormControl({}),
      // cash_id: new FormControl(this.cash_id')),
      origin_id: new FormControl(this.origin_id),
      accountFrom: new FormControl({}),
      accountFrom_id: new FormControl(this.accountFrom_id),
      accountTo: new FormControl({}),
      accountTo_id: new FormControl(this.accountTo_id),
      contact: new FormControl(this.contact||{}),
      contact_id: new FormControl(this.contact_id),
      // project: new FormControl(this.project||{}),
      // project_name: new FormControl(this.project_name||''),
      signal: new FormControl(this.signal||'-'),
      check: new FormControl(this.check||{}),
      bank: new FormControl(''),
      amount_residual: new FormControl(this.default_amount||null),
      payments: new FormControl([]),
      invoices: new FormControl([]),
      number: new FormControl(''),
      owner: new FormControl(''),
      code: new FormControl(''),
      maturity: new FormControl(''),
      is_check: new FormControl(false),
      is_other_currency:  new FormControl(false),
      close_id: new FormControl(),
      currency: new FormControl(this.currency||{}),
      currency_id: new FormControl(''),
      currency_amount: new FormControl(this.currency_amount||0),
      currency_residual: new FormControl(this.currency_residual||0),
      currency_exchange: new FormControl(this.currency_exchange||this.currency && this.currency.exchange_rate||1),
      inverted_exchange_rate: new FormControl(this.currency && this.currency.inverted_exchange_rate||1),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    if (this.accountTo && (this.accountTo['_id'].split('.')[1]=='cash' || this.accountTo['_id'].split('.')[1]=='bank' || this.accountTo['_id'].split('.')[1]=='check')){
      // console.log("to cash");
      this.to_cash = true;
    }
    if (this.accountFrom && (this.accountFrom['_id'].split('.')[1]=='cash' || this.accountFrom['_id'].split('.')[1]=='bank' || this.accountFrom['_id'].split('.')[1]=='check')){
      // console.log("from cash");
      this.from_cash = true;
    }
    if (this.transfer){
      // console.log("from cash");
      this.transfer = true;
      this.contact = await this.pouchdbService.getDoc('contact.myCompany');
    } else {
      this.contact = await this.pouchdbService.getDoc('contact.unknown');
    }
    let config = await this.configService.getConfig();
    // let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.company_currency_id = config.currency._id;
    this.company_currency_name = config.currency.name;
    if (this._id){
      this.cashMoveService.getCashMove(this._id).then((data) => {
        // data.date = Date(data.date)
        this.cashMoveForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.cashMoveForm.markAsDirty();
      //console.log("caja", this.cash);
      // if (this.hasOwnProperty('cash')){
      //   this.cashMoveForm.patchValue({
      //     cash: this.cash,
      //     cash_id: this.cash._id,
      //   });
      // } else {
        // this.configService.getConfig().then(config => {
        // let config = await this.configService.getConfig();
        // // let config:any = (await this.pouchdbService.getDoc('config.profile'));
        // this.currency_precision = config.currency_precision;
        // this.company_currency_id = config.currency._id;
        // this.company_currency_name = config.currency.name;
          let accountFrom = this.accountFrom || {};
          let accountTo = this.accountTo || {};
          let contact = this.contact || {};
          //console.log("configconfig", config);
          let currency = config.currency
          if (this.currency._id){
            currency = this.currency
          }
          this.cashMoveForm.patchValue({
            currency: currency,
            currency_id: currency['_id'],
            accountFrom: accountFrom,
            accountFrom_id: accountFrom['_id'],
            accountTo: accountTo,
            accountTo_id: accountTo['_id'],
            contact: contact,
            contact_id: contact['_id'],
          });
        // });
        // this.cashService.getDefaultCash().then(default_cash => {
        //
        // });
      // }
      await this.loading.dismiss();
      setTimeout(() => {
        if (JSON.stringify(this.cashMoveForm.value.currency) == '{}' ||
        this.cashMoveForm.value.currency._id == this.company_currency_id){
          this.amount.value = '';
          this.amount.setFocus();
        } else {
          this.currency_amountField.value = '';
          this.currency_amountField.setFocus();
        }
        this.cashMoveForm.markAsPristine();
      }, 200);
    }
  }

  changedExchangeRate() {
    this.cashMoveForm.patchValue({
      currency_exchange: 1/this.cashMoveForm.value.inverted_exchange_rate,
    })
  }

  showSave(){
    return (
      this.cashMoveForm.dirty
      && this.cashMoveForm.value.amount
      && JSON.stringify(this.cashMoveForm.value.accountFrom) != '{}'
      && JSON.stringify(this.cashMoveForm.value.accountTo) != '{}'
    )
  }

  checkForeingCurrency(){
    // console.log("este ", JSON.stringify(this.cashMoveForm.value.currency) != '{}', this.cashMoveForm.value.currency._id != this.company_currency_id);
    return (
      JSON.stringify(this.cashMoveForm.value.currency) != '{}'
      && this.cashMoveForm.value.currency._id != this.company_currency_id
    )
  }

  async goNextStep() {
    if (this.cashMoveForm.value.state == 'DRAFT'){
      if (this.cashMoveForm.value.amount == ''){
        if (!this.currency._id){
          this.amount.setFocus();
        } else {
          this.currency_amountField.setFocus();
        }
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
      else if (!this.cashMoveForm.value.name){
        this.description.setFocus();
        return;
      }
      else if (
        this.cashMoveForm.value.is_check==true
        && Object.keys(this.cashMoveForm.value.check).length==0
      ){
        this.selectCheck();
      }
      else if (
        this.cashMoveForm.value.is_other_currency==true
        && Object.keys(this.cashMoveForm.value.currency).length==0
      ){
        this.selectCurrency();
      }
      else if (
        this.cashMoveForm.value.is_other_currency==true
        && Object.keys(this.cashMoveForm.value.currency).length!=0
        && this.cashMoveForm.value.currency_amount===0
      ){
        this.currency_amount.setFocus();
      }

      else {
        // TODO: Just use this for bank destination moves
        // let prompt = await this.alertCtrl.create({
        //   header: 'Confirmar',
        //   message: 'Estas seguro que deseas confirmar el movimiento?',
        //   buttons: [
        //     {
        //       text: 'No',
        //       handler: data => {
        //       }
        //     },
        //     {
        //       text: 'Si',
        //       handler: data => {
        //         // this.addTravel();
        //         this.confirmCashMove();
        //       }
        //     }
        //   ]
        // });
        // prompt.present();
      }
    }
    else {
      // this.navCtrl.navigateBack();
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

  async saveCashMove(){
    await this.buttonSave();
  }

  buttonSave() {
    // var today = new Date().toISOString();
    // this.cashMoveForm.value.date = this.cashMoveForm.value.date;
    // if (this.cashMoveForm.value.date <= today){
    //   this.cashMoveForm.value.state = 'DONE';
    // } else {
    //   this.cashMoveForm.value.state = 'DRAFT';
    // }
    return new Promise(async resolve => {
      if (this.cashMoveForm.value.currency && this.cashMoveForm.value.currency._id != this.company_currency_id){
        this.cashMoveForm.patchValue({
          "currency_residual": this.cashMoveForm.value.currency_amount
        })
      }
      if (this._id){
        await this.cashMoveService.updateCashMove(this.cashMoveForm.value);
        this.cashMoveForm.markAsPristine();
        if (this.select){
          this.modalCtrl.dismiss();
          resolve(true);
        } else {
          this.navCtrl.navigateBack('/cash-move-list');
          resolve(true);
        }
      } else {
        this.cashMoveService.createCashMove(this.cashMoveForm.value).then(doc => {
          //console.log("the_doc", doc);
          this.cashMoveForm.value._id = doc['id'];
          this._id = doc['id'];
          if (this.select){
            this.modalCtrl.dismiss()
            resolve(true);
          } else {
            this.cashMoveForm.markAsPristine();
            this.navCtrl.navigateBack('/cash-move-list');
            resolve(true);
          }
        });
      }
    })
  }

 async confirmState(){
    this.cashMoveForm.patchValue({
      'state': 'DONE',
    });
    await this.buttonSave();
    if (JSON.stringify(this.cashMoveForm.value.check) != '{}'){
      let check = this.cashMoveForm.value.check;
      check['state'] = 'CHANGED';
      await this.pouchdbService.updateDoc(check);
    }
  }

  async rejectCheck(){
     this.cashMoveForm.patchValue({
       'state': 'DONE',
     });
     await this.buttonSave();
     if (JSON.stringify(this.cashMoveForm.value.check) != '{}'){
       let check = this.cashMoveForm.value.check;
       check['state'] = 'REJECTED';
       check['account_id'] = this.cashMoveForm.value.accountFrom._id;
       await this.pouchdbService.updateDoc(check);
     }
     let cashMove = Object.assign({}, this.cashMoveForm.value);
     cashMove['docType'] = 'cash-move';
     cashMove['accountTo_id'] = this.cashMoveForm.value.accountFrom._id;
     cashMove['date'] = this.today.toISOString();
     cashMove['accountTo_name'] = this.cashMoveForm.value.accountFrom.name;
     cashMove['accountFrom_id'] = this.cashMoveForm.value.accountTo._id;
     cashMove['accountFrom_name'] = this.cashMoveForm.value.accountTo.name;
     cashMove['check_id'] = this.cashMoveForm.value.check._id;
     delete cashMove._id;
     delete cashMove._rev;
     this.pouchdbService.createDoc(cashMove)
   }

  async confirmCashMove(){
    let state = 'DONE';
    if (this.cashMoveForm.value.accountTo_id.split('.')[1] == 'bank' || JSON.stringify(this.cashMoveForm.value.check) != '{}'){
      state = 'WAITING'
    }
    this.cashMoveForm.patchValue({
      'state': state,
    });
    await this.buttonSave();
    if (JSON.stringify(this.cashMoveForm.value.check) != '{}'){
      let check = this.cashMoveForm.value.check;
      if (this.cashMoveForm.value.accountTo_id.split('.')[1] == 'bank'){
        check['state'] = 'DEPOSITED';
        check['account_id'] = this.cashMoveForm.value.accountTo_id;
        await this.pouchdbService.updateDoc(check);
      } else if (this.cashMoveForm.value.accountTo_id.split('.')[1] == 'cash'){
        check['state'] = 'CHANGED';
        check['account_id'] = this.cashMoveForm.value.accountTo_id;
        await this.pouchdbService.updateDoc(check);
      } else if (this.cashMoveForm.value.accountTo_id.split('.')[1] == 'check'){
        check['state'] = 'RECEIVED';
        check['account_id'] = this.cashMoveForm.value.accountTo_id;
        await this.pouchdbService.updateDoc(check);
      }
    }
  }

  printAccountText(){
    let summary = this.cashMoveForm.value.accountTo.printedText || "";
    console.log("summary", summary);
    if (summary){
      let list = summary.split("${").splice(1);
      list.forEach(variable=>{
          variable = variable.split("}")[0];
          console.log("variable", variable);
          let objectList = variable.split('.');
          if (objectList.length > 1){
            let generatedVariable = this.cashMoveForm.value;
            objectList.forEach(vari=>{
              generatedVariable=generatedVariable[vari];
            })
            summary = summary.replace("${"+variable+"}", generatedVariable);
          } else {
            summary = summary.replace("${"+variable+"}", this.cashMoveForm.value[variable]);
          }
      })
    }
    let filename = this.cashMoveForm.value.accountTo.filename || "";
    console.log("filename", filename);
    if (filename){
      let list = filename.split("${").splice(1);
      list.forEach(variable=>{
          variable = variable.split("}")[0];
          console.log("variable", variable);
          let objectList = variable.split('.');
          if (objectList.length > 1){
            let generatedVariable = this.cashMoveForm.value;
            objectList.forEach(vari=>{
              generatedVariable=generatedVariable[vari];
            })
            filename = filename.replace("${"+variable+"}", generatedVariable);
          } else {
            filename = filename.replace("${"+variable+"}", this.cashMoveForm.value[variable]);
          }
      })
    }
    this.formatService.printMatrixClean(summary, filename);
  }

  editContact() {
    return new Promise(async resolve => {
      this.events.unsubscribe('open-contact');
      this.events.subscribe('open-contact', (data) => {
        this.cashMoveForm.patchValue({
          contact: data,
          // type: data.type,
          // cash_out: data.cash_out,
          // cash_in: data.cash_in,
          // transfer: data.transfer,
          // payable: data.payable,
          // receivable: data.receivable,
        });
        this.cashMoveForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('open-contact');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactPage,
        componentProps: {
          "select": true,
          "_id": this.cashMoveForm.value.contact._id,
        }
      });
      profileModal.present();
    });
  }

  editCheck() {
    return new Promise(async resolve => {
      this.events.unsubscribe('open-check');
      this.events.subscribe('open-check', (data) => {
        this.cashMoveForm.patchValue({
          check: data,
          // type: data.type,
          // cash_out: data.cash_out,
          // cash_in: data.cash_in,
          // transfer: data.transfer,
          // payable: data.payable,
          // receivable: data.receivable,
        });
        this.cashMoveForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('open-check');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: CheckPage,
        componentProps: {
          "select": true,
          "_id": this.cashMoveForm.value.check._id,
        }
      });
      profileModal.present();
    });
  }

  selectCheck() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: CheckListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
      this.events.subscribe('select-check', (data) => {
        this.cashMoveForm.patchValue({
          check: data,
          amount: data.amount,
          currency: data.currency,
          currency_amount: data.currency_amount,
          currency_exchange: data.currency_exchange
          // cash_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-check');
        resolve(true);
      })
    });
  }

  selectCurrency() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: CurrencyListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
      this.events.subscribe('select-currency', (data) => {
        let amount = this.cashMoveForm.value.amount;
        let amountCurrency = this.cashMoveForm.value.amount;
        if (
          data._id != this.company_currency_id &&
          this.cashMoveForm.value.currency._id == this.company_currency_id
        ){
          amountCurrency = this.cashMoveForm.value.amount;
          amount = this.cashMoveForm.value.amount*parseFloat(data.exchange_rate);
        } else if (
          data._id == this.company_currency_id &&
          this.cashMoveForm.value.currency._id != this.company_currency_id
        ){
          amount = this.cashMoveForm.value.currency_amount;
          amountCurrency = amount;
        }
        console.log("data", data);
        console.log("amount", amount);
        console.log("amountCurrency", amountCurrency);
        console.log("this.company_currency_id", this.company_currency_id);
        this.cashMoveForm.patchValue({
          amount: amount,
          currency_amount: amountCurrency,
          currency_exchange: data.exchange_rate,
          currency: data,
          currency_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        profileModal.dismiss();
        setTimeout(() => {
           // this.amount.setFocus();
           // this.currency_amountField.setFocus();
           if (data && data._id == this.company_currency_id){
             this.amount.setFocus();
           } else {
             this.currency_amountField.setFocus();
           }
          // this.cashMoveForm.markAsPristine();
        }, 200);
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
    });
  }

  selectAccountFrom() {
    // let self = this;
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: AccountListPage,
        componentProps: {
          "select": true,
          show_cash_in: this.to_cash,
          show_cash_out: this.from_cash,
          transfer: this.transfer,
          accountFrom: this.accountFrom,
          payable: this.payable,
          receivable: this.receivable,
        }
      });
      profileModal.present();
      this.events.subscribe('select-account', async (data) => {
        let dict = {
          accountFrom: data,
          accountFrom_id: data._id,
        }
        if (data.currency_id){
          let currency:any = await this.pouchdbService.getDoc(data.currency_id);
            dict['currency'] = currency;
            dict['currency_id'] = data.currency_id;
            dict['currency_exchange'] = currency.exchange_rate;
        }
        this.cashMoveForm.patchValue(dict);
        this.cashMoveForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
    });
  }

  selectAccountTo() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: AccountListPage,
        componentProps: {
          "select": true,
          show_cash_in: this.to_cash,
          show_cash_out: this.from_cash,
          transfer: this.transfer,
          accountFrom: this.accountFrom,
          payable: this.payable,
          receivable: this.receivable
        }
      });
      profileModal.present();
      this.events.subscribe('select-account', async (data) => {
        let dict = {
          accountTo: data,
          accountTo_id: data._id,
        }
        if (data.currency_id){
          let currency:any = await this.pouchdbService.getDoc(data.currency_id);
            dict['currency'] = currency;
            dict['currency_id'] = data.currency_id;
            dict['currency_exchange'] = currency.exchange_rate;
        }
        this.cashMoveForm.patchValue(dict);
        this.cashMoveForm.markAsDirty();
        profileModal.dismiss();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
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
         this.cashMoveForm.patchValue({
           contact: data,
           contact_id: data._id,
         });
         this.cashMoveForm.markAsDirty();
         profileModal.dismiss();
         this.events.unsubscribe('select-contact');
         resolve(true);
       })
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
   //       let profileModal = this.modalCtrl.create(ProjectsPage, {"select": true});
   //       profileModal.present();
   //     });
   //   }
   // }

  onSubmit(values){
    //console.log(values);
  }

  showNextButton(){
    // console.log("stock",this.cashMoveForm.value.stock);
    if (this.cashMoveForm.value.amount==null){
      return true;
    }
    // else if (this.cashMoveForm.value.name==null){
    //   return true;
    // }
    else if (Object.keys(this.cashMoveForm.value.contact).length==0){
    // else if (this.cashMoveForm.value.contact.toJSON()=='{}'){
      return true;
    }
    else if (Object.keys(this.cashMoveForm.value.accountTo).length==0){
      return true;
    }
    // else if (this.cashMoveForm.value.accountFrom.toJSON()=='{}'){
    else if (Object.keys(this.cashMoveForm.value.accountFrom).length==0){
      return true;
    }
    else if (
      this.cashMoveForm.value.is_check==true
      && Object.keys(this.cashMoveForm.value.check).length==0
    ){
      return true;
    }
    else if (
      this.cashMoveForm.value.is_other_currency==true
      && Object.keys(this.cashMoveForm.value.currency).length==0
    ){
      return true;
    }
    else if (
      this.cashMoveForm.value.is_other_currency==true
      && Object.keys(this.cashMoveForm.value.currency).length!=0
      && this.cashMoveForm.value.currency_amount===0
    ){
      return true;
    }
    else {
      return false;
    }
  }

  discard(){
    this.canDeactivate();
  }
  async canDeactivate() {
      if(this.cashMoveForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
              header: 'Descartar',
              message: '¿Deseas salir sin guardar?',
              buttons: [{
                      text: 'Si',
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: 'No',
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
      // this.cashMoveForm.markAsPristine();
      this.navCtrl.navigateBack('/cash-move-list');
    }
  }


  changedCurrencyAmount() {
    if (this.cashMoveForm.value.currency._id != this.company_currency_id){
      if (!this.changing) {
        this.changing = true;
        let amountExchange = parseFloat(this.cashMoveForm.value.currency_exchange);
        let amountCompanyCurrency = this.cashMoveForm.value.currency_amount * amountExchange;
        this.cashMoveForm.patchValue({
          amount: amountCompanyCurrency.toFixed(this.currency_precision),
          currency_exchange: amountExchange.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }

  changedAmount() {
    if (this.cashMoveForm.value.currency._id != this.company_currency_id){
      if (!this.changing) {
        this.changing = true;
        let amountCurrency = this.cashMoveForm.value.currency_amount;
        let amountExchange = this.cashMoveForm.value.amount/amountCurrency;
        this.cashMoveForm.patchValue({
          // currency_amount: amountCompanyCurrency.toFixed(this.currency_precision),
          currency_exchange: amountExchange.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }
  changedExchange() {
    if (this.cashMoveForm.value.currency._id != this.company_currency_id){
      if (!this.changing) {
        this.changing = true;
        let amountExchange = this.cashMoveForm.value.currency_exchange;
        let amountCompanyCurrency = this.cashMoveForm.value.currency_amount * amountExchange;
        this.cashMoveForm.patchValue({
          amount: amountCompanyCurrency.toFixed(this.currency_precision),
          // currency_exchange: amountExchange.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }


}

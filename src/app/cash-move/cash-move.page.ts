import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { CashService } from '../cash/cash.service';
import { CashMoveService } from './cash-move.service';
// import { CashListPage } from '../list/cash-list';
import { AccountListPage } from '../account-list/account-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { ConfigService } from '../config/config.service';
import { CheckListPage } from '../check-list/check-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { ActivatedRoute, Router } from '@angular/router';

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
@Input() currency;
@Input() currency_amount;
@Input() currency_residual;
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
    // public cashService: CashService,
    // public navParams: NavParams,
    public events: Events,
    public configService: ConfigService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
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

  ngOnInit() {
    var today = new Date().toISOString();
    setTimeout(() => {
      this.amount.setFocus();
      this.cashMoveForm.markAsPristine();
    }, 200);

    this.cashMoveForm = this.formBuilder.group({
      name: new FormControl(this.default_name, Validators.required),
      amount: new FormControl(this.default_amount||'', Validators.required),
      date: new FormControl(today, Validators.required),
      dateDue: new FormControl(today, Validators.required),
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
      currency_amount: new FormControl(this.currency_amount||0),
      currency_residual: new FormControl(this.currency_residual||0),
      _id: new FormControl(''),
    });
    if (this.accountTo && this.accountTo['_id'].split('.')[1]=='cash'){
      // console.log("to cash");
      this.to_cash = true;
    }
    if (this.accountFrom && this.accountFrom['_id'].split('.')[1]=='cash'){
      // console.log("from cash");
      this.from_cash = true;
    }
    if (this.transfer){
      // console.log("from cash");
      this.transfer = true;
    }

    if (this._id){
      this.cashMoveService.getCashMove(this._id).then((data) => {
        // data.date = Date(data.date)
        this.cashMoveForm.patchValue(data);
        //this.loading.dismiss();
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
          let accountFrom = this.accountFrom || {};
          let accountTo = this.accountTo || {};
          let contact = this.contact || {};
          //console.log("configconfig", config);
          this.cashMoveForm.patchValue({
            // cash: config.cash,
            // cash_id: config.cash['_id'],
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
      //this.loading.dismiss();
    }
  }

  async goNextStep() {
    if (this.cashMoveForm.value.state == 'DRAFT'){
      if (this.cashMoveForm.value.amount == ''){
        this.amount.setFocus();
      }
      else if (!this.transfer && Object.keys(this.cashMoveForm.value.contact).length === 0){
        this.selectContact();
        return;
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
      if (this.select){
        this.modalCtrl.dismiss()
      } else {
        this.navCtrl.navigateBack('/cash-move-list');
      }
    } else {
      this.cashMoveService.createCashMove(this.cashMoveForm.value).then(doc => {
        //console.log("the_doc", doc);
        if (this.select){
          this.modalCtrl.dismiss()
        } else {
          this.cashMoveForm.value._id = doc['id'];
          this.cashMoveForm.markAsPristine();
          this.navCtrl.navigateBack('/cash-move-list');
        }
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
          currency: data.currency
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
        this.cashMoveForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        profileModal.dismiss();
        this.currency_amount.setFocus();
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
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountFrom: data,
          accountFrom_id: data._id,
        });
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
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountTo: data,
          accountTo_id: data._id,
        });
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
    else if (this.cashMoveForm.value.name==null){
      return true;
    }
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


}

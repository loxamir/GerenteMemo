import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events, TextInput, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { CashService } from '../cash.service';
import { CashMoveService } from './cash-move.service';
// import { CashListPage } from '../list/cash-list';
import { AccountListPage } from '../account-list/account-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
// import { ConfigService } from '../../config/config.service';
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

    public navCtrl: NavController,
    public modal: ModalController,
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
    public events: Events,
    // public configService: ConfigService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    // this.cash_id = this.route.snapshot.paramMap.get('cash_id');
    // this.default_amount = this.route.snapshot.paramMap.get('default_amount');
    // this.default_name = this.route.snapshot.paramMap.get('default_name');
    this.today = new Date();
    // console.log("dados nav", this.route.snapshot.paramMap.get('
    if (this.route.snapshot.paramMap.get('accountTo') && this.route.snapshot.paramMap.get('accountTo')._id.split('.')[1]=='cash'){
      // console.log("to cash");
      this.to_cash = true;
    }
    if (this.route.snapshot.paramMap.get('accountFrom') && this.route.snapshot.paramMap.get('accountFrom')._id.split('.')[1]=='cash'){
      // console.log("from cash");
      this.from_cash = true;
    }
    if (this.route.snapshot.paramMap.get('transfer')){
      // console.log("from cash");
      this.transfer = true;
    }
  }

  ngOnInit() {
    var today = new Date().toISOString();


    this.cashMoveForm = this.formBuilder.group({
      name: new FormControl(this.default_name, Validators.required),
      amount: new FormControl(this.default_amount||'', Validators.required),
      date: new FormControl(today, Validators.required),
      dateDue: new FormControl(today, Validators.required),
      state: new FormControl('DRAFT'),
      // cash: new FormControl({}),
      // cash_id: new FormControl(this.route.snapshot.paramMap.get('cash_id')),
      origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
      accountFrom: new FormControl({}),
      accountFrom_id: new FormControl(this.route.snapshot.paramMap.get('accountFrom_id')),
      accountTo: new FormControl({}),
      accountTo_id: new FormControl(this.route.snapshot.paramMap.get('accountTo_id')),
      contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}),
      contact_id: new FormControl(this.route.snapshot.paramMap.get('contact_id')),
      // project: new FormControl(this.route.snapshot.paramMap.get('project')||{}),
      // project_name: new FormControl(this.route.snapshot.paramMap.get('project_name')||''),
      signal: new FormControl(this.route.snapshot.paramMap.get('signal')||'-'),
      check: new FormControl(this.route.snapshot.paramMap.get('check')||{}),
      bank: new FormControl(''),
      amount_residual: new FormControl(this.default_amount||null),
      payments: new FormControl([]),
      invoices: new FormControl([]),
      number: new FormControl(''),
      owner: new FormControl(''),
      code: new FormControl(''),
      maturity: new FormControl(''),

      currency: new FormControl(this.route.snapshot.paramMap.get('currency')||{}),
      currency_amount: new FormControl(this.route.snapshot.paramMap.get('currency_amount')||0),
      currency_residual: new FormControl(this.route.snapshot.paramMap.get('currency_residual')||0),
      _id: new FormControl(''),
    });
  }

  async goNextStep() {
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
        let prompt = await this.alertCtrl.create({
          header: 'Confirmar',
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
      // this.navCtrl.navigateBack();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.myInput.setFocus();
    }, 200);
  }

  ionViewDidLoad() {
    //console.log("ionViewDidLoad");
    //this.loading.present();

    if (this._id){
      this.cashMoveService.getCashMove(this._id).then((data) => {
        // data.date = Date(data.date)
        this.cashMoveForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      this.cashMoveForm.markAsDirty();
      //console.log("caja", this.route.snapshot.paramMap.get('cash);
      // if (this.route.snapshot.paramMap.get('hasOwnProperty('cash')){
      //   this.cashMoveForm.patchValue({
      //     cash: this.route.snapshot.paramMap.get('cash,
      //     cash_id: this.route.snapshot.paramMap.get('cash._id,
      //   });
      // } else {
        // this.configService.getConfig().then(config => {
          let accountFrom = this.route.snapshot.paramMap.get('accountFrom') || {};
          let accountTo = this.route.snapshot.paramMap.get('accountTo') || {};
          let contact = this.route.snapshot.paramMap.get('contact') || {};
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
      // this.navCtrl.navigateBack();
    } else {
      this.cashMoveService.createCashMove(this.cashMoveForm.value).then(doc => {
        //console.log("the_doc", doc);
        this.cashMoveForm.value._id = doc['id'];
        this.cashMoveForm.markAsPristine();
        // this.navCtrl.navigateBack();
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
      let profileModal = await this.modal.create({
        component: CheckListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectCurrency() {
    return new Promise(async resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.cashMoveForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(true);
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

  selectAccountFrom() {
    return new Promise(async resolve => {
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountFrom: data,
          accountFrom_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
      let profileModal = await this.modal.create({
        component: AccountListPage,
        componentProps: {
          "select": true,
          show_cash_in: this.to_cash,
          show_cash_out: this.from_cash,
          transfer: this.route.snapshot.paramMap.get('transfer'),
          accountFrom: this.route.snapshot.paramMap.get('accountFrom'),
          payable: this.route.snapshot.paramMap.get('payable'),
          receivable: this.route.snapshot.paramMap.get('receivable'),
        }
      });
      profileModal.present();
    });
  }

  selectAccountTo() {
    return new Promise(async resolve => {
      this.events.subscribe('select-account', (data) => {
        this.cashMoveForm.patchValue({
          accountTo: data,
          accountTo_id: data._id,
        });
        this.cashMoveForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(true);
      })
      let profileModal = await this.modal.create({
        component: AccountListPage,
        componentProps: {
          "select": true,
          show_cash_in: this.to_cash,
          show_cash_out: this.from_cash,
          transfer: this.route.snapshot.paramMap.get('transfer'),
          accountFrom: this.route.snapshot.paramMap.get('accountFrom'),
          payable: this.route.snapshot.paramMap.get('payable'),
          receivable: this.route.snapshot.paramMap.get('receivable')
        }
      });
      profileModal.present();
    });
  }

  selectContact() {
     return new Promise(async resolve => {
       this.events.subscribe('select-contact', (data) => {
         this.cashMoveForm.patchValue({
           contact: data,
           contact_id: data._id,
         });
         this.cashMoveForm.markAsDirty();
         this.events.unsubscribe('select-contact');
         resolve(true);
       })
       let profileModal = await this.modal.create({
         component: ContactListPage,
         componentProps: {
           "select": true
         }
       });
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

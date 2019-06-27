import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { CheckService } from './check.service';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { CashListPage } from '../cash-list/cash-list.page';
import { AccountListPage } from '../account-list/account-list.page';
import { CashMoveService } from '../cash-move/cash-move.service';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'app-check',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
})
export class CheckPage implements OnInit {
  @ViewChild('amount') amountField;
  @ViewChild('name') name;
  @ViewChild('currency_amount') currency_amountField;

  checkForm: FormGroup;
  loading: any;
  _id: string;
  select;
  company_currency_id = 'currency.PYG';
  company_currency_name = "";
  @Input() contact;
  @Input() amount;
  @Input() bank;
  @Input() account;
  @Input() currency;
  @Input() exchange_rate;
  @Input() currency_amount;
  @Input() my_check;
  @Input() signal = "+";
  changing = false;
  currency_precision = 2;
  showExtra = false;
  view_exchange_rate: number = 1;
  languages: Array<LanguageModel>;
  currencies: any = {};
  receipt_currency_id = 'currency.PYG';

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public checkService: CheckService,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
    public cashMoveService: CashMoveService,
    public pouchdbService: PouchdbService,
    public configService: ConfigService,
  ) {
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.contact = this.route.snapshot.paramMap.get('contact');
    this.bank = this.route.snapshot.paramMap.get('bank');
    this.account = this.route.snapshot.paramMap.get('account');
    this.currency = this.route.snapshot.paramMap.get('currency');
    this.amount = this.route.snapshot.paramMap.get('amount');
    this.signal = this.route.snapshot.paramMap.get('signal');
    this.my_check = this.route.snapshot.paramMap.get('my_check');
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  async ngOnInit() {
    this.checkForm = this.formBuilder.group({
      bank_name: new FormControl(this.bank && this.bank.name || ''),
      bank: new FormControl(this.bank || {}),
      name: new FormControl(null),
      checkAccount: new FormControl(''),
      amount: new FormControl(this.amount || null),
      owner_name: new FormControl(''),
      owner_doc: new FormControl(''),
      my_check: new FormControl(this.my_check || false),
      emision_date: new FormControl(new Date().toISOString()),
      maturity_date: new FormControl(new Date().toISOString()),
      contact: new FormControl(this.contact || {}),
      account: new FormControl(this.account || {}),
      state: new FormControl('NEW'),
      currency: new FormControl(this.currency || {}),
      currency_amount: new FormControl(this.currency_amount || 0),
      exchange_rate: new FormControl(this.exchange_rate || 1),
      currency_id: new FormControl(''),
      note: new FormControl(''),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config = await this.configService.getConfig();
    this.currency_precision = config.currency_precision;
    this.company_currency_id = config.currency._id;
    this.receipt_currency_id = this.company_currency_id;
    let pyg = await this.pouchdbService.getDoc('currency.PYG')
    let usd = await this.pouchdbService.getDoc('currency.USD')
    this.currencies = {
      "currency.PYG": pyg,
      "currency.USD": usd,
    }
    this.company_currency_name = config.currency.name;
    if (config.currency.inverted_rate) {
      this.view_exchange_rate = parseFloat(config.currency.exchange_rate);
    } else {
      this.view_exchange_rate = (1 / parseFloat(config.currency.exchange_rate));
    }
    if (this._id) {
      this.checkService.getCheck(this._id).then((data) => {
        if (config.currency.inverted_rate) {
          this.view_exchange_rate = parseFloat(this.currencies[data.currency_id].exchange_rate);
        } else {
          this.view_exchange_rate = (1 / parseFloat(this.currencies[data.currency_id].exchange_rate));
        }
        this.checkForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      await this.loading.dismiss();
      setTimeout(() => {
        if (JSON.stringify(this.checkForm.value.currency) == '{}' ||
          this.checkForm.value.currency._id == this.company_currency_id) {
          if (this.checkForm.value.amount) {
            this.name.setFocus()
          } else {
            this.amountField.setFocus();
          }
        } else if (!this.checkForm.value.currency_amount) {
          this.currency_amountField.setFocus();
        } else {
          this.name.setFocus()
        }
        this.checkForm.markAsPristine();
      }, 200);
    }
  }

  flipExtra() {
    this.showExtra = !this.showExtra;
  }

  changedCurrencyAmount() {
    if (this.receipt_currency_id != this.company_currency_id) {
      if (!this.changing) {
        this.changing = true;
        let amountExchange = parseFloat(this.checkForm.value.exchange_rate);
        if (this.currencies[this.receipt_currency_id].inverted_rate) {
          this.view_exchange_rate = amountExchange;
        } else {
          this.view_exchange_rate = 1 / amountExchange;
        }
        let amountCompanyCurrency = this.checkForm.value.currency_amount * this.view_exchange_rate;
        this.checkForm.patchValue({
          amount: amountCompanyCurrency.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }

  changedAmount() {
    if (this.receipt_currency_id != this.company_currency_id) {
      if (!this.changing) {
        this.changing = true;
        let amountCurrency = parseFloat(this.checkForm.value.currency_amount);
        let amountExchange;
        if (this.currencies[this.receipt_currency_id].inverted_rate) {
          amountExchange = parseFloat(this.checkForm.value.amount) / amountCurrency;
        } else {
          amountExchange = amountCurrency / parseFloat(this.checkForm.value.amount);
        }
        this.checkForm.patchValue({
          exchange_rate: amountExchange.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }
  changedExchange() {
    if (this.receipt_currency_id != this.company_currency_id) {
      if (!this.changing) {
        this.changing = true;
        let amountExchange;
        if (this.currencies[this.receipt_currency_id].inverted_rate) {
          amountExchange = parseFloat(this.checkForm.value.exchange_rate);
        } else {
          amountExchange = 1 / parseFloat(this.checkForm.value.exchange_rate);
        }
        let amountCompanyCurrency = this.checkForm.value.currency_amount * amountExchange;
        this.checkForm.patchValue({
          amount: amountCompanyCurrency.toFixed(this.currency_precision),
        })
        setTimeout(() => {
          this.changing = false;
        }, 10);
      }
    }
  }

  showSaveButton() {
    let data = this.checkForm.value.name && this.checkForm.dirty;
    return data;
  }

  async depositCheck() {
    let doc = {
      "amount": this.checkForm.value.amount,
      "name": "Depositado cheque " + this.checkForm.value.name,
      "date": new Date().toISOString(),
      "accountFrom_id": this.checkForm.value.account._id,
      "contact_id": this.checkForm.value.contact._id,
      "check_id": this.checkForm.value._id,
      'signal': this.checkForm.value.signal,
      "state": 'WAITING',
      "origin_id": this.checkForm.value._id,
    }
    if (JSON.stringify(this.checkForm.value.currency) != '{}') {
      doc['currency_id'] = this.checkForm.value.currency._id;
      doc['currency_amount'] = this.checkForm.value.currency_amount;
      doc['exchange_rate'] = this.checkForm.value.exchange_rate;
    }
    await this.selectAccount();
    this.checkForm.patchValue({
      state: "DEPOSITED",
    })
    doc["accountTo_id"] = this.checkForm.value.account._id;
    if (this.checkForm.value.account._id.split('.')[1] == 'cash') {
      doc['state'] = 'DONE';
    }
    await this.cashMoveService.createCashMove(doc);
    await this.buttonSave();
  }

  checkForeingCurrency() {
    return (
      JSON.stringify(this.checkForm.value.currency) != '{}'
      && this.checkForm.value.currency._id != this.company_currency_id
    )
  }

  async changeMyCheck() {
    if (this.checkForm.value.my_check) {
      let contact: any = await this.pouchdbService.getDoc('contact.myCompany');
      this.checkForm.patchValue({
        owner_name: contact.name,
        owner_doc: contact.document,
        contact: contact,
      })
    } else {
      this.checkForm.patchValue({
        owner_name: '',
        owner_doc: '',
        contact: {},
      })
    }
  }

  changeCheck() {
    this.checkForm.patchValue({
      state: "CHANGED",
    });
    this.buttonSave();
  }

  buttonSave() {
    if (this._id) {
      this.checkService.updateCheck(this.checkForm.value);
      this.events.publish('open-check', this.checkForm.value);
      this.modalCtrl.dismiss();
    } else {
      this.checkService.createCheck(this.checkForm.value).then((doc: any) => {
        this.checkForm.patchValue({
          _id: doc.check._id,
        });
        this._id = doc.check._id;
        this.events.publish('create-check', this.checkForm.value);
        this.modalCtrl.dismiss();
      });
    }
  }

  selectContact() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.checkForm.patchValue({
          contact: data,
        });
        this.checkForm.markAsDirty();
        this.events.unsubscribe('select-contact');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
    });
  }

  selectAccount() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-account');
      this.events.subscribe('select-account', (data) => {
        this.checkForm.patchValue({
          account: data,
        });
        this.checkForm.markAsDirty();
        this.events.unsubscribe('select-account');
        resolve(true);
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

  selectBank() {
    return new Promise(async resolve => {
      this.events.unsubscribe('select-cash');
      this.events.subscribe('select-cash', async (data: any) => {
        let currency = await this.pouchdbService.getDoc(data.currency_id);
        this.checkForm.patchValue({
          bank: data,
          currency: currency,
          bank_name: data.bank_name,
        });
        this.checkForm.markAsDirty();
        this.events.unsubscribe('select-cash');
        resolve(true);
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

  selectCurrency() {
    return new Promise(async resolve => {
      let profileModal = await this.modalCtrl.create({
        component: CurrencyListPage,
        componentProps: {
          "select": true
        }
      });
      profileModal.present();
      this.events.subscribe('select-currency', async (data) => {
        let amount = this.checkForm.value.amount;
        let amountCurrency = this.checkForm.value.amount;
        if (
          data._id != this.company_currency_id &&
          JSON.stringify(this.checkForm.value.currency) == '{}' || this.checkForm.value.currency._id == this.company_currency_id
        ) {
          amountCurrency = (this.checkForm.value.amount / parseFloat(data.exchange_rate)).toFixed(data.precision);
          amount = this.checkForm.value.amount;
        } else if (
          data._id == this.company_currency_id &&
          JSON.stringify(this.checkForm.value.currency) != '{}' || this.checkForm.value.currency._id != this.company_currency_id
        ) {
          amountCurrency = 0;
        }
        let smallDiff = 0;
        if ((amountCurrency - Math.round(amountCurrency)) > 0) {
          smallDiff = 10 ** (-1 * data.precision);
        }
        this.checkForm.patchValue({
          amount: amount,
          currency_amount: (parseFloat(amountCurrency) + smallDiff).toFixed(data.precision),
          exchange_rate: data.exchange_rate,
          currency: data,
          currency_id: data._id,
        });
        this.receipt_currency_id = data._id;
        if (data.inverted_rate) {
          this.view_exchange_rate = parseFloat(data.exchange_rate);
        } else {
          this.view_exchange_rate = (1 / parseFloat(data.exchange_rate));
        }
        this.checkForm.markAsDirty();
        await profileModal.dismiss();
        setTimeout(() => {
          if (data && data._id == this.company_currency_id) {
            this.amountField.setFocus();
          } else {
            this.currency_amountField.setFocus();
          }
        }, 200);
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
    });
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ]
  };

  onSubmit(values) {
    //console.log(values);
  }

  showNextButton() {
    if (this.checkForm.value.amount == null) {
      return true;
    }
    else if (this.checkForm.value.name == null) {
      return true;
    }
    else if (Object.keys(this.checkForm.value.contact).length == 0) {
      return true;
    }
    else {
      return false;
    }
  }

  discard() {
    this.canDeactivate();
  }
  async canDeactivate() {
    if (this.checkForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: 'Descartar',
        message: '¿Deseas salir sin guardar?',
        buttons: [{
          text: 'Si',
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: 'No',
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
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.navCtrl.navigateBack('/contact-list');
    }
  }

  async goNextStep() {
    if (this.checkForm.value.amount == null) {
      this.amountField.setFocus();
      return;
    }
    else if (this.checkForm.value.name == null) {
      this.name.setFocus();
      return;
    }
    else if (Object.keys(this.checkForm.value.contact).length === 0) {
      this.selectContact();
      return;
    }
  }

}

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
    @Input() currency_exchange;
    @Input() currency_amount;
    @Input() my_check;
    @Input() signal = "+";
    changing = false;
    currency_precision = 2;
    showExtra = false;

    languages: Array<LanguageModel>;

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
      // setTimeout(() => {
      //   this.amountField.setFocus();
      // }, 200);

      this.checkForm = this.formBuilder.group({
        bank_name: new FormControl(this.bank && this.bank.name || ''),
        bank: new FormControl(this.bank||{}),
        name: new FormControl(null),
        checkAccount: new FormControl(''),
        amount: new FormControl(this.amount||null),
        owner_name: new FormControl(''),
        owner_doc: new FormControl(''),
        my_check: new FormControl(this.my_check||false),
        emision_date: new FormControl(new Date().toISOString()),
        maturity_date: new FormControl(new Date().toISOString()),
        contact: new FormControl(this.contact||{}),
        account: new FormControl(this.account||{}),
        state: new FormControl('NEW'),
        currency: new FormControl(this.currency||{}),
        currency_amount: new FormControl(this.currency_amount||0),
        currency_exchange: new FormControl(this.currency_exchange||1),
        currency_id: new FormControl(''),
        note: new FormControl(''),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      // let config:any = await this.pouchdbService.getDoc('config.profile');
      // this.currency_precision = config.currency_precision;
      let config = await this.configService.getConfig();
      // let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      this.company_currency_id = config.currency._id;
      this.company_currency_name = config.currency.name;
      if (this._id){
        this.checkService.getCheck(this._id).then((data) => {
          this.checkForm.patchValue(data);
          this.loading.dismiss();
        });
      } else {
        await this.loading.dismiss();
        setTimeout(() => {
           if (JSON.stringify(this.checkForm.value.currency) == '{}' ||
          this.checkForm.value.currency._id == this.company_currency_id){
             if (this.checkForm.value.amount){
               this.name.setFocus()
             } else {
               this.amountField.setFocus();
             }
           } else if (! this.checkForm.value.currency_amount) {
             this.currency_amountField.setFocus();
           } else {
             this.name.setFocus()
           }
           this.checkForm.markAsPristine();
        }, 200);
      }
    }

    flipExtra(){
      this.showExtra = !this.showExtra;
    }

    changedCurrencyAmount() {
      if (this.checkForm.value.currency._id != this.company_currency_id){
        if (!this.changing) {
          this.changing = true;
          let amountExchange = parseFloat(this.checkForm.value.currency_exchange);
          let amountCompanyCurrency = this.checkForm.value.currency_amount * amountExchange;
          this.checkForm.patchValue({
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
      if (this.checkForm.value.currency._id != this.company_currency_id){
        if (!this.changing) {
          this.changing = true;
          let amountCurrency = this.checkForm.value.currency_amount;
          let amountExchange = this.checkForm.value.amount/amountCurrency;
          this.checkForm.patchValue({
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
      if (this.checkForm.value.currency._id != this.company_currency_id){
        if (!this.changing) {
          this.changing = true;
          let amountExchange = this.checkForm.value.currency_exchange;
          let amountCompanyCurrency = this.checkForm.value.currency_amount * amountExchange;
          this.checkForm.patchValue({
            amount: amountCompanyCurrency.toFixed(this.currency_precision),
            // currency_exchange: amountExchange.toFixed(this.currency_precision),
          })
          setTimeout(() => {
            this.changing = false;
          }, 10);
        }
      }
    }

    showSaveButton(){
      let data = this.checkForm.value.name && this.checkForm.dirty;
      return data;
    }

    async depositCheck(){
      let doc = {
        "amount": this.checkForm.value.amount,
        "name": "Depositado cheque "+ this.checkForm.value.name,
        "date": new Date().toISOString(),
        "accountFrom_id": this.checkForm.value.account._id,
        "contact_id": this.checkForm.value.contact._id,
        "check_id": this.checkForm.value._id,
        'signal': this.checkForm.value.signal,
        "state": 'WAITING',
        "origin_id": this.checkForm.value._id,
      }
      if (JSON.stringify(this.checkForm.value.currency) != '{}'){
        doc['currency_id'] = this.checkForm.value.currency._id;
        doc['currency_amount'] = this.checkForm.value.currency_amount;
        doc['currency_exchange'] = this.checkForm.value.currency_exchange;
      }
      await this.selectAccount();
      this.checkForm.patchValue({
        state: "DEPOSITED",
      })
      doc["accountTo_id"] = this.checkForm.value.account._id;
      if (this.checkForm.value.account._id.split('.')[1] == 'cash'){
        doc['state'] = 'DONE';
      }
      await this.cashMoveService.createCashMove(doc);
      await this.buttonSave();
    }

    checkForeingCurrency(){
      // console.log("este ", JSON.stringify(this.checkForm.value.currency) != '{}', this.checkForm.value.currency._id != this.company_currency);
      return (
        JSON.stringify(this.checkForm.value.currency) != '{}'
        && this.checkForm.value.currency._id != this.company_currency_id
      )
    }

    async changeMyCheck(){
      if (this.checkForm.value.my_check){
        let contact: any = await this.pouchdbService.getDoc('contact.myCompany');
        this.checkForm.patchValue({
          owner_name: contact.name,
          owner_doc: contact.document,
          contact: contact,
          // bank_name: bank
        })
      } else {
        this.checkForm.patchValue({
          owner_name: '',
          owner_doc: '',
          contact: {},
          // bank_name: bank
        })
      }
    }

    changeCheck(){
      this.checkForm.patchValue({
        state: "CHANGED",
      });
      this.buttonSave();
    }

    buttonSave() {
      if (this._id){
        this.checkService.updateCheck(this.checkForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-check', this.checkForm.value);
          this.modalCtrl.dismiss();
        // });
      } else {
        this.checkService.createCheck(this.checkForm.value).then((doc: any) => {
          this.checkForm.patchValue({
            _id: doc.check._id,
          });
          this._id = doc.check._id;
          // this.navCtrl.navigateBack().then(() => {
            this.events.publish('create-check', this.checkForm.value);
            this.modalCtrl.dismiss();
          // });
        });
      }
    }

    selectContact() {
        return new Promise(async resolve => {
          // this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          this.events.subscribe('select-contact', (data) => {
            this.checkForm.patchValue({
              contact: data,
            });
            this.checkForm.markAsDirty();
            // this.avoidAlertMessage = false;
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
          // this.avoidAlertMessage = true;
          this.events.unsubscribe('select-account');
          this.events.subscribe('select-account', (data) => {
            this.checkForm.patchValue({
              account: data,
            });
            this.checkForm.markAsDirty();
            // this.avoidAlertMessage = false;
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
          // this.avoidAlertMessage = true;
          this.events.unsubscribe('select-cash');
          this.events.subscribe('select-cash', async (data: any) => {
            let currency = await this.pouchdbService.getDoc(data.currency_id);
            this.checkForm.patchValue({
              bank: data,
              currency: currency,
              bank_name: data.bank_name,
            });
            this.checkForm.markAsDirty();
            // this.avoidAlertMessage = false;
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

    // selectCurrency() {
    //   return new Promise(async resolve => {
    //     this.events.subscribe('select-currency', (data) => {
    //       this.checkForm.patchValue({
    //         currency: data,
    //         // cash_id: data._id,
    //       });
    //       this.checkForm.markAsDirty();
    //       this.events.unsubscribe('select-currency');
    //       resolve(true);
    //     })
    //     let profileModal = await this.modalCtrl.create({
    //       component: CurrencyListPage,
    //       componentProps: {
    //         "select": true
    //       }
    //     });
    //     profileModal.present();
    //   });
    // }

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
            JSON.stringify(this.checkForm.value.currency)=='{}' || this.checkForm.value.currency._id == this.company_currency_id
          ){
            amountCurrency = (this.checkForm.value.amount/parseFloat(data.exchange_rate)).toFixed(data.precision);
            console.log("amountCurrency1", amountCurrency);
            amount = this.checkForm.value.amount;
          } else if (
            data._id == this.company_currency_id &&
            JSON.stringify(this.checkForm.value.currency)!='{}' || this.checkForm.value.currency._id != this.company_currency_id
          ){
            console.log("this.checkForm.value", this.checkForm.value.amount);
            // amount = 22;
            amountCurrency = 0;
            console.log("amountCurrency2", amount);
          }
          console.log("data", data);
          console.log("amount", amount);
          console.log("amountCurrency", amountCurrency);
          console.log("this.company_currency_id", this.company_currency_id);
          let smallDiff = 0;
          if ((amountCurrency - Math.round(amountCurrency)) > 0){
            smallDiff = 10**(-1*data.precision);
          }
          this.checkForm.patchValue({
            amount: amount,
            currency_amount: (parseFloat(amountCurrency) + smallDiff).toFixed(data.precision),
            currency_exchange: data.exchange_rate,
            currency: data,
            currency_id: data._id,
          });
          this.checkForm.markAsDirty();
          await profileModal.dismiss();
          setTimeout(() => {
             // this.amount.setFocus();
             // this.currency_amountField.setFocus();
             if (data && data._id == this.company_currency_id){
               this.amountField.setFocus();
             } else {
               // this.currency_amountField.value =
               this.currency_amountField.setFocus();
             }
            // this.checkForm.markAsPristine();
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

    onSubmit(values){
      //console.log(values);
    }

      showNextButton(){
        if (this.checkForm.value.amount==null){
          return true;
        }
        else if (this.checkForm.value.name==null){
          return true;
        }
        else if (Object.keys(this.checkForm.value.contact).length==0){
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
          if(this.checkForm.dirty) {
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
          // this.checkForm.markAsPristine();
          this.navCtrl.navigateBack('/contact-list');
        }
      }


      async goNextStep() {
        if (this.checkForm.value.amount == null){
          this.amountField.setFocus();
          return;
        }
          else if (this.checkForm.value.name == null){
            this.name.setFocus();
            return;
          }
          else if (Object.keys(this.checkForm.value.contact).length === 0){
            this.selectContact();
            return;
          }
        }

}

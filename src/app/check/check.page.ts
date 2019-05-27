import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { CheckService } from './check.service';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { ReceiptListPage } from '../receipt-list/receipt-list.page';
import { CashListPage } from '../cash-list/cash-list.page';


@Component({
  selector: 'app-check',
  templateUrl: './check.page.html',
  styleUrls: ['./check.page.scss'],
})
export class CheckPage implements OnInit {
  @ViewChild('amount') amountField;
  @ViewChild('name') name;

    checkForm: FormGroup;
    loading: any;
    _id: string;
    select;
    @Input() contact;
    @Input() amount;

    languages: Array<LanguageModel>;

    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public checkService: CheckService,
      public alertCtrl: AlertController,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public events: Events,
      public pouchdbService: PouchdbService,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      this.contact = this.route.snapshot.paramMap.get('contact');
      this.amount = this.route.snapshot.paramMap.get('amount');
      this.translate.setDefaultLang('es');
      this.translate.use('es');
    }

    ngOnInit() {
      setTimeout(() => {
        this.amountField.setFocus();
      }, 200);
      this.checkForm = this.formBuilder.group({
        bank_name: new FormControl(''),

        bank: new FormControl({}),
        name: new FormControl(null),
        amount: new FormControl(this.amount||null),
        owner_name: new FormControl(''),
        owner_doc: new FormControl(''),
        my_check: new FormControl(false),
        emision_date: new FormControl(''),
        maturity_date: new FormControl(''),
        contact: new FormControl(this.contact||{}),
        state: new FormControl('draft'),
        currency: new FormControl(this.route.snapshot.paramMap.get('currency')||{}),
        note: new FormControl(''),
        receipt: new FormControl(this.route.snapshot.paramMap.get('receipt')||{}),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      //this.loading.present();
      if (this._id){
        this.getCheck(this._id).then((data) => {
          this.checkForm.patchValue(data);
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
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

    buttonSave() {
      if (this._id){
        this.updateCheck(this.checkForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-check', this.checkForm.value);
          this.modalCtrl.dismiss();
        // });
      } else {
        this.createCheck(this.checkForm.value).then((doc: any) => {
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

    selectCurrency() {
      return new Promise(async resolve => {
        this.events.subscribe('select-currency', (data) => {
          this.checkForm.patchValue({
            currency: data,
            // cash_id: data._id,
          });
          this.checkForm.markAsDirty();
          this.events.unsubscribe('select-currency');
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: CurrencyListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

    selectReceipt() {
      return new Promise(async resolve => {
        this.events.subscribe('select-receipt', (data) => {
          this.checkForm.patchValue({
            receipt: data,
          });
          this.checkForm.markAsDirty();
          this.events.unsubscribe('select-receipt');
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: ReceiptListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }

    setLanguage(lang: LanguageModel){
      let language_to_set = this.translate.getDefaultLang();

      if(lang){
        language_to_set = lang.code;
      }
      this.translate.setDefaultLang(language_to_set);
      this.translate.use(language_to_set);
    }

    validation_messages = {
      'name': [
        { type: 'required', message: 'Name is required.' }
      ]
    };

    onSubmit(values){
      //console.log(values);
    }

    getCheck(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        return this.pouchdbService.getDoc(doc_id).then(pouchData=>{
          this.pouchdbService.getDoc(pouchData['bank_id']).then(bank => {
            pouchData['bank'] = bank;
            resolve(pouchData);
          });
        });
      });
    }


    createCheck(check){
      return new Promise((resolve, reject)=>{
        check.docType = 'check';
        if (check.bank){
          check.bank_id = check.bank._id;
        }
        delete check.bank;

        if (check.code != ''){
          this.pouchdbService.createDoc(check).then(doc => {
            resolve({doc: doc, check: check});
          });
        } else {
          // this.configService.getSequence('check').then((code) => {
          //   check['code'] = code;
            this.pouchdbService.createDoc(check).then(doc => {
              resolve({doc: doc, check: check});
            });
          // });
        }
      });

      // return this.pouchdbService.createDoc(check);
    }

    updateCheck(check){
      check.docType = 'check';
      if (check.bank){
        check.bank_id = check.bank._id;
      }
      delete check.bank;
      return this.pouchdbService.updateDoc(check);
    }


      showNextButton(){
        // console.log("stock",this.checkForm.value.stock);
        if (this.checkForm.value.amount==null){
          return true;
        }
        else if (this.checkForm.value.name==null){
          return true;
        }
        else if (Object.keys(this.checkForm.value.contact).length==0){
        // else if (this.checkForm.value.contact.toJSON()=='{}'){
          return true;
        }
        // else if (Object.keys(this.checkForm.value.accountTo).length==0){
        //   return true;
        // }
        // // else if (this.checkForm.value.accountFrom.toJSON()=='{}'){
        // else if (Object.keys(this.checkForm.value.accountFrom).length==0){
        //   return true;
        // }
        // else if (
        //   this.checkForm.value.is_check==true
        //   && Object.keys(this.checkForm.value.check).length==0
        // ){
        //   return true;
        // }
        // else if (
        //   this.checkForm.value.is_other_currency==true
        //   && Object.keys(this.checkForm.value.currency).length==0
        // ){
        //   return true;
        // }
        // else if (
        //   this.checkForm.value.is_other_currency==true
        //   && Object.keys(this.checkForm.value.currency).length!=0
        //   && this.checkForm.value.currency_amount===0
        // ){
        //   return true;
        // }
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

          // else if (Object.keys(this.checkForm.value.accountFrom).length === 0){
          //   this.selectAccountFrom();
          //   return;
          // }
          // else if (Object.keys(this.checkForm.value.accountTo).length === 0){
          //   this.selectAccountTo();
          //   return;
          // }
          // else if (
          //   this.checkForm.value.is_check==true
          //   && Object.keys(this.checkForm.value.check).length==0
          // ){
          //   this.selectCheck();
          // }
          // else if (
          //   this.checkForm.value.is_other_currency==true
          //   && Object.keys(this.checkForm.value.currency).length==0
          // ){
          //   this.selectCurrency();
          // }
          // else if (
          //   this.checkForm.value.is_other_currency==true
          //   && Object.keys(this.checkForm.value.currency).length!=0
          //   && this.checkForm.value.currency_amount===0
          // ){
          //   this.currency_amount.setFocus();
          // }

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

}

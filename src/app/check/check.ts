import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { CheckService } from './check.service';
import { ContactsPage } from '../contact/list/contacts';
import { CurrencyListPage } from '../currency/list/currency-list';
import { ReceiptsPage } from '../receipt/list/receipts';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { CashListPage } from '../cash/list/cash-list';

@Component({
  selector: 'check-page',
  templateUrl: 'check.html'
})
export class CheckPage {

  checkForm: FormGroup;
  loading: any;
  _id: string;

  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public checkService: CheckService,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.get('_id');
  }

  ionViewWillLoad() {
    this.checkForm = this.formBuilder.group({
      bank_name: new FormControl(''),
      bank: new FormControl({}),
      name: new FormControl(''),
      amount: new FormControl(),
      owner_name: new FormControl(''),
      owner_doc: new FormControl(''),
      my_check: new FormControl(false),
      emision_date: new FormControl(''),
      maturity_date: new FormControl(''),
      contact: new FormControl(this.navParams.data.contact||{}),
      state: new FormControl('draft'),
      currency: new FormControl(this.navParams.data.currency||{}),
      note: new FormControl(''),
      receipt: new FormControl(this.navParams.data.receipt||{}),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.checkService.getCheck(this._id).then((data) => {
        this.checkForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
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
      this.checkService.updateCheck(this.checkForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-check', this.checkForm.value);
      });
    } else {
      this.checkService.createCheck(this.checkForm.value).then((doc: any) => {
        this.checkForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.navCtrl.pop().then(() => {
          this.events.publish('create-check', this.checkForm.value);
        });
      });
    }
  }

  selectContact() {
      return new Promise(resolve => {
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
        let profileModal = this.modal.create(ContactsPage, {"select": true});
        profileModal.present();
      });
  }

  selectBank() {
      return new Promise(resolve => {
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
        let profileModal = this.modal.create(CashListPage, {"select": true});
        profileModal.present();
      });
  }

  selectCurrency() {
    return new Promise(resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.checkForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.checkForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
      let profileModal = this.modal.create(CurrencyListPage, {"select": true});
      profileModal.present();
    });
  }

  selectReceipt() {
    return new Promise(resolve => {
      this.events.subscribe('select-receipt', (data) => {
        this.checkForm.patchValue({
          receipt: data,
        });
        this.checkForm.markAsDirty();
        this.events.unsubscribe('select-receipt');
        resolve(true);
      })
      let profileModal = this.modal.create(ReceiptsPage, {"select": true});
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
}

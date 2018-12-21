import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Events, TextInput } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ContactService } from './contact.service';
import { RestProvider } from "../services/rest/rest";
import { CurrencyListPage } from '../currency/list/currency-list';

import { AdvancePage } from '../advance/advance';
import { SalaryPage } from '../salary/salary';

@Component({
  selector: 'contact-page',
  templateUrl: 'contact.html'
})
export class ContactPage {
@ViewChild('name') name: TextInput;
@ViewChild('document') document: TextInput;

  contactForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public contactService: ContactService,
    public restProvider: RestProvider,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    if (this.navParams.data._id){
      this.opened = true;
    }
  }

  ionViewWillLoad() {
    this.contactForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      name_legal: new FormControl(''),
      address: new FormControl(''),
      phone: new FormControl(''),
      // document: new FormControl(''), // parse(regex(de 1 a 9 mais o hifen '-'))),
      document: new FormControl('', Validators.compose([
        // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
        Validators.pattern('^[0-9+-]+$')
      ])),
      code: new FormControl(''),
      section: new FormControl('salary'),
      email: new FormControl(''),
      note: new FormControl(''),
      // image: new FormControl(''),
      customer: new FormControl(this.navParams.data.customer||false),
      supplier: new FormControl(this.navParams.data.supplier||false),
      seller: new FormControl(this.navParams.data.seller||false),
      employee: new FormControl(this.navParams.data.employee||false),
      salary: new FormControl(0),
      currency: new FormControl({}),
      hire_date: new FormControl(undefined),
      salaries: new FormControl([]),
      advances: new FormControl([]),
      _id: new FormControl(''),
    });
  }

  selectCurrency() {
    return new Promise(resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.contactForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.contactForm.markAsDirty();
        this.events.unsubscribe('select-currency');
        resolve(true);
      })
      let profileModal = this.modal.create(CurrencyListPage, {"select": true});
      profileModal.present();
    });
  }

  ionViewDidLoad() {
    this.loading.present();
    if (this._id){
      this.contactService.getContact(this._id).then((data) => {
        this.contactForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  addAdvance() {
      this.events.unsubscribe('create-advance');
      this.events.subscribe('create-advance', (data) => {
          console.log("DDDDDDDATA", data);
          this.contactForm.value.advances.push({
            'amount': data.amount,
            'date': data.date,
            'state': data.state,
            '_id': data._id,
          });
        this.justSave();
        this.events.unsubscribe('create-advance');
      });
      let plannedItems = [];
      let profileModal = this.modal.create(AdvancePage, {
        "contact": this.contactForm.value,
        "name": "Anticipo "+this.contactForm.value.name,
      });
      profileModal.present();
  }

  addSalary() {
      this.events.unsubscribe('create-salary');
      this.events.subscribe('create-salary', (data) => {
          console.log("DDDDDDDATA", data);
          this.contactForm.value.salaries.push({
            'amount': data.amount,
            'date': data.date,
            'state': data.state,
            '_id': data._id,
          });
        this.justSave();
        this.events.unsubscribe('create-salary');
      });
      let plannedItems = [];
      let profileModal = this.modal.create(SalaryPage, {
        "contact": this.contactForm.value,
        "name": "Salario "+this.contactForm.value.name,
      });
      profileModal.present();
  }

  openSalary(salary){
    this.events.unsubscribe('open-salary');
    this.events.subscribe('open-salary', (data) => {
      salary.amount = data.amount;
      salary.date = data.date;
      salary.state = data.state;
      this.justSave();
      this.events.unsubscribe('open-salary');
    });
    let plannedItems = [];
    let profileModal = this.modal.create(SalaryPage, {"_id": salary._id
    });
    profileModal.present();
  }

  openAdvance(advance){
    this.events.unsubscribe('open-advance');
    this.events.subscribe('open-advance', (data) => {
        console.log("DDDDDDDATA", data);
      advance.amount = data.amount;
      advance.date = data.date;
      advance.state = data.state;
      this.justSave();
      this.events.unsubscribe('open-advance');
    });
    let plannedItems = [];
    let profileModal = this.modal.create(AdvancePage, {"_id": advance._id});
    profileModal.present();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }

  goNextStep() {
    // if (this.contactForm.value.state == 'DRAFT'){
      if (!this.contactForm.value.name){
        this.name.setFocus();
        // return;
      }
      else if (!this.contactForm.value.document){
        this.document.setFocus();
        // return;
      }
      else if (this.contactForm.value.document&&!this.contactForm.value.name_legal){
        this.getLegalName();
        // return;
      }
      else if (this.contactForm.dirty) {
        this.justSave();
      } else {
        if (this.opened){
          this.navCtrl.pop().then(() => {
            this.events.publish('open-contact', this.contactForm.value);
          });
        } else {
          this.navCtrl.pop().then(() => {
            this.events.publish('create-contact', this.contactForm.value);
          });
        }
      }
  }

  getLegalName(){
    this.restProvider.getRucName(this.contactForm.value.document).then((data: any)=>{
      this.contactForm.patchValue({
        'name_legal': data.name,
      })
    })
  }
  justSave() {
    if (this._id){
      this.contactService.updateContact(this.contactForm.value);
      this.contactForm.markAsPristine();
    } else {
      this.contactService.createContact(this.contactForm.value).then((doc: any) => {
        // this.contactForm.patchValue({
        //   _id: doc.doc.id,
        // });
        this._id = doc.doc.id;
        this.contactForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    if (this._id){
      this.contactService.updateContact(this.contactForm.value);
      this.navCtrl.pop().then(() => {
        this.events.publish('open-contact', this.contactForm.value);
      });
    } else {
      this.contactService.createContact(this.contactForm.value).then((doc: any) => {
        // this.contactForm.patchValue({
        //   _id: doc.doc.id,
        // });
        this._id = doc.doc.id;
        this.navCtrl.pop().then(() => {
          this.events.publish('create-contact', this.contactForm.value);
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

  validation_messages = {
    'name': [
      { type: 'required', message: 'El Nombre es un campo Necesario' }
    ],
    'document': [
      { type: 'pattern', message: 'Use solo numeros y "-" por ejemplo: 4444444-4.' },
    ],
  };

  onSubmit(values){
    //console.log("teste", values);
  }
}

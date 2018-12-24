import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController,  Events, TextInput } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { SalaryService } from './salary.service';
import { RestProvider } from "../services/rest/rest";
import { SalaryInputPage } from "./input/input";
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { ContactsPage } from '../contact/list/contacts';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'salary-page',
  templateUrl: 'salary.html'
})
export class SalaryPage {
@ViewChild('name') name: TextInput;
@ViewChild('amount') amount: TextInput;

  salaryForm: FormGroup;
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
    public salaryService: SalaryService,
    public restProvider: RestProvider,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public printer: Printer,
    public configService: ConfigService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    if (this.navParams.data._id){
      this.opened = true;
    }
  }

  ionViewWillLoad() {
    this.salaryForm = this.formBuilder.group({
      name: new FormControl(this.navParams.data.name || '', Validators.required),
      contact: new FormControl(this.navParams.data.contact || {}),
      date: new FormControl(this.navParams.data.date||new Date().toISOString()),
      date_start: new FormControl(this.navParams.data.date_start||this.getFirstDateOfMonth()),
      date_end: new FormControl(this.navParams.data.date_end||this.getEndOfMonth()),
      inputs: new FormControl(this.navParams.data.inputs||[]),
      amount: new FormControl(this.navParams.data.amount||this.navParams.data.contact && this.navParams.data.contact.salary ||0),
      _id: new FormControl(''),
    });
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString();
  }

  getEndOfMonth() {
    var today = new Date();
    // var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
    return new Date(today.getFullYear(), today.getMonth(), 0).toISOString();
  }

  selectContact() {
    // if (this.salaryForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.salaryForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.salaryForm.markAsDirty();
          this.getInputs();
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {
          "select": true,
          "filter": "employee",
          'employee': true,
        });
        profileModal.present();
      });
    // }
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.salaryService.getSalary(this._id).then((data) => {
        this.salaryForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      if (Object.keys(this.salaryForm.value.contact).length != 0){
        this.getInputs();
      }
      //this.loading.dismiss();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }

  getInputs(){
    let salary = this.salaryForm.value.contact && this.salaryForm.value.contact.salary || 0
    this.salaryForm.patchValue({
      "inputs": [],
    });
    this.salaryForm.value.inputs.push({
      "name": "Salario",
      "amount": salary,
    });
    this.pouchdbService.getRelated(
    "advance", "contact_id", this.salaryForm.value.contact._id).then((advances) => {
      let total = 0;
      advances.forEach((advance: any)=>{
        this.salaryForm.value.inputs.push({
          "name": advance.name,
          "amount": -advance.amount,
        });
      })
      this.recomputeValues();
    });
  }

  recomputeValues(){
    let total = 0;
    this.salaryForm.value.inputs.forEach((item) => {
      total += parseFloat(item.amount);
    });
    this.salaryForm.patchValue({
      amount: total,
    });
  }

  goNextStep() {
    // if (this.salaryForm.value.state == 'DRAFT'){
      if (!this.salaryForm.value.name){
        this.name.setFocus();
        // return;
      }
      else if (!this.salaryForm.value.amount){
        this.amount.setFocus();
        // return;
      }
      this.getInputs();
      // else if (this.salaryForm.value.document&&!this.salaryForm.value.name_legal){
      //   this.getLegalName();
      //   // return;
      // }
      // else if (this.salaryForm.dirty) {
      //   this.justSave();
      // } else {
      //   if (this.opened){
      //     this.navCtrl.navigateBack().then(() => {
      //       this.events.publish('open-salary', this.salaryForm.value);
      //     });
      //   } else {
      //     this.navCtrl.navigateBack().then(() => {
      //       this.events.publish('create-salary', this.salaryForm.value);
      //     });
      //   }
      // }
  }

  justSave() {
    if (this._id){
      this.salaryService.updateSalary(this.salaryForm.value);
      this.salaryForm.markAsPristine();
    } else {
      this.salaryService.createSalary(this.salaryForm.value).then((doc: any) => {
        this.salaryForm.patchValue({
          _id: doc.doc.id,
        });
        this._id = doc.doc.id;
        this.salaryForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    if (this._id){
      this.salaryService.updateSalary(this.salaryForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-salary', this.salaryForm.value);
      });
    } else {
      this.salaryService.createSalary(this.salaryForm.value).then((doc: any) => {
        this.salaryForm.patchValue({
          _id: doc.doc.id,
        });
        this._id = doc.doc.id;
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-salary', this.salaryForm.value);
        });
      });
    }
  }

  addInput() {
      let profileModal = this.modal.create(SalaryInputPage, {});
      profileModal.onDidDismiss(data => {
        this.salaryForm.value.inputs.push(data);
        this.recomputeValues();
      });
      profileModal.present();
  }

  openInput(input){
    let profileModal = this.modal.create(SalaryInputPage, input);
    profileModal.onDidDismiss(data => {
      input.name = data.name;
      input.amount = data.amount;
      this.recomputeValues();
    });
    profileModal.present();
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

  printAndroid(){
    this.configService.getConfigDoc().then((data) => {
      this.printer.isAvailable().then(onSuccess => {
      }, onError => {
      });
      let options: PrintOptions = {
         name: 'Salario',
         duplex: false,
         landscape: false,
         grayscale: true
      };
      let result = `
      <span style="background: blue">
        Salario de `+this.salaryForm.value.contact.name+`

      </span>`;
      this.printer.print(result, options).then(onSuccess => {}, onError => {});
    });
  }
}

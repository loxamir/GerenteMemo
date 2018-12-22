import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { ModalController, LoadingController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
// import { ContactService } from '../services/contact.page.service';
// import { RestProvider } from "../services/rest/rest";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  contactForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;

  constructor(
    // public navCtrl: NavController,
    public modal: ModalController,
    // public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public contactService: ContactService,
    // public restProvider: RestProvider,
    // public navParams: NavParams,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public restProvider: RestProvider,
  ) {
    // this.loading = this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    // this._id = this.navParams.data._id;
    // if (this.navParams.data._id){
    //   this.opened = true;
    // }
    // this.route.params.subscribe(...);
  }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: new FormControl(this.route.snapshot.paramMap.get('name')||''),
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
      customer: new FormControl(this.route.snapshot.paramMap.get('customer')||false),
      supplier: new FormControl(this.route.snapshot.paramMap.get('supplier')||false),
      seller: new FormControl(this.route.snapshot.paramMap.get('seller')||false),
      employee: new FormControl(this.route.snapshot.paramMap.get('employee')||false),
      salary: new FormControl(0),
      currency: new FormControl({}),
      hire_date: new FormControl(undefined),
      salaries: new FormControl([]),
      advances: new FormControl([]),
      _id: new FormControl(''),
    });
    this._id = this.route.snapshot.paramMap.get('_id');
    // this.route.params.subscribe(...);
    if (this._id){
      this.getContact(this._id).then((data) => {
        this.contactForm.patchValue(data);
        // this.loading.dismiss();
      });
    } else {
      // this.loading.dismiss();
    }
    // this.buttonSave();

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
      this.updateContact(this.contactForm.value);
      this.contactForm.markAsPristine();
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
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
      this.updateContact(this.contactForm.value);
      // this.navCtrl.pop().then(() => {
        this.events.publish('open-contact', this.contactForm.value);
      // });
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        // this.contactForm.patchValue({
        //   _id: doc.doc.id,
        // });
        console.log("create contact", doc);
        this._id = doc.doc.id;
        // this.navCtrl.pop().then(() => {
          this.events.publish('create-contact', this.contactForm.value);
        // });
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


  getContact(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  createContact(contact){
    return new Promise((resolve, reject)=>{
      contact.docType = 'contact';
      if (contact.code != ''){
        console.log("sin code", contact.code);
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({doc: doc, contact: contact});
        });
      } else {
        // this.configService.getSequence('contact').then((code) => {
        //   contact['code'] = code;
          this.pouchdbService.createDoc(contact).then(doc => {
            resolve({doc: doc, contact: contact});
          });
        // });
      }
    });
  }

  updateContact(contact){
    contact.docType = 'contact';
    return this.pouchdbService.updateDoc(contact);
  }

}

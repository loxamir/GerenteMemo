import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { NavController, ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
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
@ViewChild('name') name;
@ViewChild('document') document;
@ViewChild('phone') phone;
@ViewChild('address') address;
@ViewChild('salary') salary;

  contactForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    // public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertCtrl: AlertController,
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
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    // this._id = this.navParams.data._id;
    // if (this.navParams.data._id){
    //   this.opened = true;
    // }
    // this.route.params.subscribe(...);
  }
  goBack(){
    this.navCtrl.navigateBack('/contact-list');
  }
  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: new FormControl(this.route.snapshot.paramMap.get('name')||null),
      name_legal: new FormControl(null),
      address: new FormControl(null),
      phone: new FormControl(null),
      // document: new FormControl(''), // parse(regex(de 1 a 9 mais o hifen '-'))),
      document: new FormControl(null, Validators.compose([
        // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
        Validators.pattern('^[0-9+-]+$')
      ])),
      code: new FormControl(''),
      section: new FormControl('salary'),
      email: new FormControl(''),
      note: new FormControl(''),
      // image: new FormControl(''),
      customer: new FormControl(this.route.snapshot.paramMap.get('customer')=='true'||false),
      supplier: new FormControl(this.route.snapshot.paramMap.get('supplier')=='true'||false),
      seller: new FormControl(this.route.snapshot.paramMap.get('seller')=='true'||false),
      employee: new FormControl(this.route.snapshot.paramMap.get('employee')=='true'||false),
      salary: new FormControl(null),
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

  changedDocument(){
    let dv = this.contactForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1){
      console.log("ruc", this.contactForm.value.document);
      this.getLegalName();
    }
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
      this.navCtrl.navigateBack('/contact-list').then(() => {
        this.events.publish('open-contact', this.contactForm.value);
      });
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        // this.contactForm.patchValue({
        //   _id: doc.doc.id,
        // });
        console.log("create contact", doc);
        this._id = doc.doc.id;
        // this.navCtrl.pop().then(() => {
        this.navCtrl.navigateBack('/contact-list').then(() => {
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


  getContact(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
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

  goNextStep() {
  // if (this.contactForm.value.state == 'DRAFT'){
    if (this.contactForm.value.name==null){
      this.name.setFocus();
    }
    else if (this.contactForm.value.document==null){
      this.document.setFocus();
    }
    else if (this.contactForm.value.phone==null){
      this.phone.setFocus();
    }
    else if (this.contactForm.value.address==null){
      this.address.setFocus();
    }
    else if (this.contactForm.value.employee==true&&this.contactForm.value.salary==null){
      this.salary.setFocus();
    }
    // else if (this.contactForm.value.document&&!this.contactForm.value.name_legal){
    //   this.getLegalName();
    //   // return;
    // }
    // else if (this.contactForm.dirty) {
    //   this.justSave();
    // } else {
    //   if (this.opened){
    //     this.navCtrl.navigateBack('contacts').then(() => {
    //       this.events.publish('open-contact', this.contactForm.value);
    //     });
    //   } else {
    //     this.navCtrl.navigateBack('contacts').then(() => {
    //       this.events.publish('create-contact', this.contactForm.value);
    //     });
    //   }
    // }
  }

  getLegalName(){
    this.restProvider.getRucName(this.contactForm.value.document).then((data: any)=>{
      console.log("data", data);
      if (data.name!='HttpErrorResponse'){
        this.contactForm.patchValue({
          'name_legal': data.name,
        })
      }
    })
  }

  showNextButton(){
    // console.log("stock",this.contactForm.value.stock);
    if (this.contactForm.value.name==null){
      return true;
    }
    else if (this.contactForm.value.document==null){
      return true;
    }
    else if (this.contactForm.value.phone==null){
      return true;
    }
    else if (this.contactForm.value.address==null){
      return true;
    }
    else if (this.contactForm.value.employee==true&&this.contactForm.value.salary==null){
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
      if(this.contactForm.dirty) {
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
      this.contactForm.markAsPristine();
      this.navCtrl.navigateBack('/contact-list');
  }
}

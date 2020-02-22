import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { AuthService } from "../services/auth.service";
import { ContactService } from './contact.service';
import { Events } from '../services/events';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild('name', { static: true }) name;
  @ViewChild('document', { static: true }) document;
  @ViewChild('phone', { static: true }) phone;

  contactForm: FormGroup;
  loading: any;
  _id: string;
  opened: boolean = false;
  select;
  customer;
  supplier;
  seller;
  employee;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertCtrl: AlertController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public restProvider: RestProvider,
    public authService: AuthService,
    public contactService: ContactService,
    private plt: Platform,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.customer = this.route.snapshot.paramMap.get('customer');
    this.supplier = this.route.snapshot.paramMap.get('supplier');
    this.seller = this.route.snapshot.paramMap.get('seller');
    this.employee = this.route.snapshot.paramMap.get('employee');
  }

  async ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: new FormControl(this.route.snapshot.paramMap.get('name') || null),
      name_legal: new FormControl(null),
      // address: new FormControl({}),
      phone: new FormControl(null),
      document: new FormControl(null, Validators.compose([
        Validators.pattern('^[0-9+-]+$')
      ])),
      code: new FormControl(''),
      section: new FormControl('salary'),
      email: new FormControl(''),
      note: new FormControl(''),
      customer: new FormControl(this.customer || false),
      supplier: new FormControl(this.supplier || false),
      seller: new FormControl(this.seller || false),
      employee: new FormControl(this.employee || false),
      user: new FormControl(false),
      user_details: new FormControl({}),
      salary: new FormControl(null),
      currency: new FormControl({}),
      hire_date: new FormControl(undefined),
      salaries: new FormControl([]),
      advances: new FormControl([]),
      fixed: new FormControl(false),
      image: new FormControl(''),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
      _attachments: new FormControl(),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();


    this.authService.loggedIn.subscribe(async status => {
      console.log("estado", status);
      if (status) {
        let data = await this.authService.getData();
        this._id = "contact."+data.currentUser.email;
        if (this._id) {
          this.contactService.getContact(this._id).then((data) => {
            this.contactForm.patchValue(data);
            this.plt.ready().then(() => {
        })
            this.loading.dismiss();
          });
        } else {
          this.loading.dismiss();
        }
      } else {
        // this.logged = false;
      }
    });
  }

  logout(){
    this.authService.logout();
    this.modalCtrl.dismiss();
  }


  changedDocument() {
    let dv = this.contactForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1) {
      this.getLegalName();
    }
  }

  justSave() {
    if (this._id) {
      this.updateContact(this.contactForm.value);
      this.contactForm.markAsPristine();
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        this.contactForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    if (this._id) {
      this.updateContact(this.contactForm.value);
      if (this.select) {
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/product-list');
        this.events.publish('open-contact', {contact: this.contactForm.value});
      }
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        if (this.select) {
          this.events.publish('create-contact', {contact: this.contactForm.value});
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/product-list');
          this.events.publish('create-contact', {contact: this.contactForm.value});
        }
      });
    }
  }

  addressList(){
    this.navCtrl.navigateForward('/address-list');
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();

    if (lang) {
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

  onSubmit(values) {
    //console.log("teste", values);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }
  createContact(viewData) {
    return new Promise((resolve, reject) => {
      let contact = Object.assign({}, viewData);
      contact.docType = 'contact';
      if (contact.code != '') {
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({ doc: doc, contact: contact });
        });
      } else {
        this.pouchdbService.createDoc(contact).then(doc => {
          resolve({ doc: doc, contact: contact });
        });
      }
    });
  }

  updateContact(viewData) {
    let contact = Object.assign({}, viewData);
    contact.docType = 'contact';
    return this.pouchdbService.updateDoc(contact);
  }

  goNextStep() {
    if (this.contactForm.value.name == null) {
      this.name.setFocus();
    }
    else if (this.contactForm.value.document == null) {
      this.document.setFocus();
    }
    else if (this.contactForm.value.phone == null) {
      this.phone.setFocus();
    }
  }

  getLegalName() {
    this.restProvider.getRucName(this.contactForm.value.document).then((data: any) => {
      if (data.name != 'HttpErrorResponse') {
        let dict = {
          'name_legal': data.name,
        }
        if (!this.contactForm.value.name || this.contactForm.value.name == '') {
          let firstname = data.name.split(', ')[1] || '';
          let lastname = data.name.split(', ')[0];
          if (firstname) {
            dict['name'] = firstname + " " + lastname;
          } else {
            dict['name'] = lastname;
          }
        }
        this.contactForm.patchValue(dict)
      }
    })
  }

  showNextButton() {
    if (this.contactForm.value.name == null) {
      return true;
    }
    else if (this.contactForm.value.document == null) {
      return true;
    }
    else if (this.contactForm.value.phone == null) {
      return true;
    }
    else if (this.contactForm.value.address == null) {
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
    if (this.contactForm.dirty) {
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('DISCARD'),
        message: this.translate.instant('SURE_DONT_SAVE'),
        buttons: [{
          text: this.translate.instant('YES'),
          handler: () => {
            this.exitPage();
          }
        },
        {
          text: this.translate.instant('NO'),
          handler: () => {
          }
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
      this.navCtrl.navigateBack('/product-list');
    }
  }
}

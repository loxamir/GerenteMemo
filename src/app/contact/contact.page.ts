import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { UserPage } from '../user/user.page';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild('name', { static: true }) name;
  @ViewChild('document', { static: true }) document;
  @ViewChild('phone', { static: true }) phone;
  @ViewChild('address', { static: true }) address;
  @ViewChild('salary', { static: false }) salary;

  contactForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
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
      address: new FormControl(null),
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
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    if (this._id) {
      this.getContact(this._id).then((data) => {
        this.contactForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
  }

  changedDocument() {
    let dv = this.contactForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1) {
      this.getLegalName();
    }
  }

  async editUser(user) {
    let profileModal = await this.modalCtrl.create({
      component: UserPage,
      componentProps: this.contactForm.value.user_details
    });
    await profileModal.present();
    const { data } = await profileModal.onDidDismiss();
    if (data) {
      user["name"] = data.name;
      user["username"] = data.username;
      user["sale"] = data.sale;
      user["purchase"] = data.purchase;
      user["finance"] = data.finance;
      user["service"] = data.service;
      user["report"] = data.report;
      user["config"] = data.config;
      user["registered"] = data.registered;
      this.contactForm.patchValue({
        user_details: user,
      });
      this.justSave();
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
        this.navCtrl.navigateBack('/contact-list');
        this.events.publish('open-contact', this.contactForm.value);
      }
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        if (this.select) {
          this.events.publish('create-contact', this.contactForm.value);
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/contact-list');
          this.events.publish('create-contact', this.contactForm.value);
        }
      });
    }
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


  getContact(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }
  createContact(contact) {
    return new Promise((resolve, reject) => {
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

  updateContact(contact) {
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
    else if (this.contactForm.value.address == null) {
      this.address.setFocus();
    }
    else if (this.contactForm.value.employee == true && this.contactForm.value.salary == null) {
      this.salary.setFocus();
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
    else if (this.contactForm.value.employee == true && this.contactForm.value.salary == null) {
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
      this.navCtrl.navigateBack('/contact-list');
    }
  }
}

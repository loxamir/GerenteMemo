import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, ModalController, LoadingController, AlertController, Events, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { UserPage } from '../user/user.page';
import { AuthService } from "../services/auth.service";
// import { AddressListPage } from '../address-list/address-list.page';
import { ContactService } from './contact.service';
// declare var google;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild('name', { static: true }) name;
  @ViewChild('document', { static: true }) document;
  @ViewChild('phone', { static: true }) phone;
  // @ViewChild('address', { static: true }) address;
  @ViewChild('salary', { static: false }) salary;
  // @ViewChild('map', { static: false }) mapElement: ElementRef;
  // map: any;

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

          // let mapOptions = {
          //   zoom: 20,
          //   mapTypeId: google.maps.MapTypeId.HYBRID,
          //   mapTypeControl: false,
          //   streetViewControl: false,
          //   fullscreenControl: false
          // }
          // this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
          //
          // let options = {
          //   maximumAge: 3000,
          //   timeout: 5000,
          //   enableHighAccuracy: true
          // }
          // console.log("data", data);
          // if (data.address.latitude && data.address.longitude){
          //   this.showMap( data.address.latitude, data.address.longitude);
          // }
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

  // showMap(latitude, longitude){
  //   let latLng = new google.maps.LatLng(latitude, longitude);
  //   this.map.setCenter(latLng);
  //   const icon = {
  //     url: 'assets/icon/favicon.png', // image url
  //     scaledSize: new google.maps.Size(50, 50), // scaled size
  //   };
  //   const marker = new google.maps.Marker({
  //     position: latLng,
  //     map: this.map,
  //     title: 'Hello World!',
  //     icon: icon
  //   });
  //   const contentString = '<div id="content">' +
  //   '<div id="siteNotice">' +
  //   '</div>' +
  //   '<h1 id="firstHeading" class="firstHeading">Local de Entrega</h1>' +
  //   '<div id="bodyContent">' +
  //   // '<img src="assets/icon/user.png" width="200">' +
  //   '<p>Este es el local donde se entregara el pedido</p><br/><br/>';
  //   const infowindow = new google.maps.InfoWindow({
  //     content: contentString,
  //     maxWidth: 400
  //   });
  //   marker.addListener('click', function() {
  //     infowindow.open(this.map, marker);
  //   });
  //   this.map.setZoom(20);
  // }

  // selectAddress() {
  //   return new Promise(async resolve => {
  //     // if (this.contactForm.value.state=='QUOTATION'){
  //       this.loading = await this.loadingCtrl.create({});
  //       await this.loading.present();
  //       // this.avoidAlertMessage = true;
  //       // this.listenBarcode = false;
  //       this.events.unsubscribe('select-address');
  //       this.events.subscribe('select-address', (data) => {
  //         this.contactForm.patchValue({
  //           address: data,
  //           // address_name: data.name,
  //         });
  //         this.showMap( data.latitude, data.longitude);
  //         this.contactForm.markAsDirty();
  //         // this.avoidAlertMessage = false;
  //         this.events.unsubscribe('select-address');
  //         profileModal.dismiss();
  //         resolve(data);
  //       })
  //       let profileModal = await this.modalCtrl.create({
  //         component: AddressListPage,
  //         componentProps: {
  //           "select": true
  //         }
  //       });
  //       await profileModal.present();
  //       await this.loading.dismiss();
  //       await profileModal.onDidDismiss();
  //       // this.listenBarcode = true;
  //     // }
  //   });
  // }

  logout(){
    this.authService.logout();
    this.navCtrl.navigateBack(['/product-list', {}]);
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
        this.navCtrl.navigateBack('/product-list');
        this.events.publish('open-contact', this.contactForm.value);
      }
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        if (this.select) {
          this.events.publish('create-contact', this.contactForm.value);
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/product-list');
          this.events.publish('create-contact', this.contactForm.value);
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
      contact.address_id = contact.address._id;
      delete contact.address;
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
    contact.address_id = contact.address._id;
    delete contact.address;
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
      this.navCtrl.navigateBack('/product-list');
    }
  }
}

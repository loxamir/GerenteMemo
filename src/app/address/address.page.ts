import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { Events } from '../services/events';
import { AuthService } from "../services/auth.service";
declare var google;
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  @ViewChild('name', { static: true }) name;
  @ViewChild('document', { static: true }) document;
  @ViewChild('phone', { static: true }) phone;
  @ViewChild('address', { static: true }) address;
  @ViewChild('salary', { static: false }) salary;
  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;

  addressForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  opened: boolean = false;
  select;
  customer;
  supplier;
  seller;
  employee;
  contact_id

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
    private geolocation: Geolocation,
    private plt: Platform,
  ) {
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  async ngOnInit() {
    this.addressForm = this.formBuilder.group({
      name: new FormControl('Casa'),
      latitude: new FormControl(''),
      longitude: new FormControl(''),
      contact_id: new FormControl(''),
      note: new FormControl(''),
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

    this.authService.loggedIn.subscribe(async status => {

      console.log("status", status);
      if (status) {
        let data = await this.authService.getData();
        this.contact_id = "contact."+data.currentUser.email;
        this.addressForm.patchValue({
          contact_id: this.contact_id
        })
      }
    })


    this.plt.ready().then(() => {

  let mapOptions = {
    zoom: 20,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  }
  this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  let options = {
    maximumAge: 3000,
    timeout: 5000,
    enableHighAccuracy: true
  }
  if (this._id) {
    this.getAddress(this._id).then((data) => {
      this.addressForm.patchValue(data);
      if (!this.addressForm.value.latitude){
        this.geolocation.getCurrentPosition(options).then(pos => {
          this.showMap(pos.coords.latitude, pos.coords.longitude);
          this.addressForm.patchValue({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        }).catch((error) => {
          console.log('Error getting location', error);
        });
      } else {
        this.showMap(this.addressForm.value.latitude, this.addressForm.value.longitude);
      }
      this.loading.dismiss();
    });
  } else {
    this.geolocation.getCurrentPosition(options).then(pos => {
      this.showMap(pos.coords.latitude, pos.coords.longitude);
      this.addressForm.patchValue({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
      this.addressForm.markAsDirty();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
    this.loading.dismiss();
  }
  if (!this.addressForm.value.latitude){
    this.geolocation.getCurrentPosition(options).then(pos => {
      this.showMap(pos.coords.latitude, pos.coords.longitude);
      this.addressForm.patchValue({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
      this.addressForm.markAsDirty();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  } else {
    this.showMap(this.addressForm.value.latitude, this.addressForm.value.longitude);
  }
});


}

showMap(latitude, longitude){
  let latLng = new google.maps.LatLng(latitude, longitude);
  this.map.setCenter(latLng);
  const icon = {
    url: 'assets/icon/favicon.png', // image url
    scaledSize: new google.maps.Size(50, 50), // scaled size
  };
  const marker = new google.maps.Marker({
    position: latLng,
    map: this.map,
    title: 'Hello World!',
    icon: icon
  });
  const contentString = '<div id="content">' +
  '<div id="siteNotice">' +
  '</div>' +
  '<h1 id="firstHeading" class="firstHeading">Local de Entrega</h1>' +
  '<div id="bodyContent">' +
  // '<img src="assets/icon/user.png" width="200">' +
  '<p>Este es el local donde se entregara el pedido</p><br/><br/>';
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    maxWidth: 400
  });
  marker.addListener('click', function() {
    infowindow.open(this.map, marker);
  });
  this.map.setZoom(20);
  this.loading.dismiss();
  }

  getGPSCordinates(){
    this.geolocation.getCurrentPosition().then((resp) => {
     console.log("resp", resp);
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  logout(){
    this.authService.logout();
    this.navCtrl.navigateBack(['/product-list', {}]);
  }


  changedDocument() {
    let dv = this.addressForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1) {
      this.getLegalName();
    }
  }

  justSave() {
    if (this._id) {
      this.updateAddress(this.addressForm.value);
      this.addressForm.markAsPristine();
    } else {
      this.createAddress(this.addressForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        this.addressForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    console.log("buttonSave");
    if (this._id) {
      this.updateAddress(this.addressForm.value);
      if (this.select) {
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/address-list');
        this.events.publish('open-address', {address: this.addressForm.value});
      }
    } else {
      this.createAddress(this.addressForm.value).then((doc: any) => {
        this._id = doc.doc.id;
        if (this.select) {
          this.events.publish('create-address', {address: this.addressForm.value});
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/address-list');
          this.events.publish('create-address', {address: this.addressForm.value});
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


  getAddress(doc_id): Promise<any> {
    return this.pouchdbService.getDoc(doc_id);
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }
  createAddress(address) {
    return new Promise((resolve, reject) => {
      address.docType = 'address';
      this.pouchdbService.createDoc(address).then(doc => {
        resolve({ doc: doc, address: address });
      });
    });
  }

  updateAddress(address) {
    address.docType = 'address';
    return this.pouchdbService.updateDoc(address);
  }

  goNextStep() {
    if (this.addressForm.value.name == null) {
      this.name.setFocus();
    }
    else if (this.addressForm.value.document == null) {
      this.document.setFocus();
    }
    else if (this.addressForm.value.phone == null) {
      this.phone.setFocus();
    }
    else if (this.addressForm.value.address == null) {
      this.address.setFocus();
    }
    else if (this.addressForm.value.employee == true && this.addressForm.value.salary == null) {
      this.salary.setFocus();
    }
  }

  getLegalName() {
    this.restProvider.getRucName(this.addressForm.value.document).then((data: any) => {
      if (data.name != 'HttpErrorResponse') {
        let dict = {
          'name_legal': data.name,
        }
        if (!this.addressForm.value.name || this.addressForm.value.name == '') {
          let firstname = data.name.split(', ')[1] || '';
          let lastname = data.name.split(', ')[0];
          if (firstname) {
            dict['name'] = firstname + " " + lastname;
          } else {
            dict['name'] = lastname;
          }
        }
        this.addressForm.patchValue(dict)
      }
    })
  }

  showNextButton() {
    if (this.addressForm.value.name == null) {
      return true;
    }
    else if (this.addressForm.value.document == null) {
      return true;
    }
    else if (this.addressForm.value.phone == null) {
      return true;
    }
    else if (this.addressForm.value.address == null) {
      return true;
    }
    else if (this.addressForm.value.employee == true && this.addressForm.value.salary == null) {
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
    if (this.addressForm.dirty) {
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
      this.navCtrl.navigateBack('/address-list');
    }
  }
}

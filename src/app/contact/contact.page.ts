import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { NavController, ModalController, LoadingController, AlertController,
  ToastController, Events } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ActivatedRoute } from '@angular/router';
// import { ContactService } from '../services/contact.page.service';
// import { RestProvider } from "../services/rest/rest";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from "../services/rest/rest";
import { UserPage } from '../user/user.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { FormatService } from '../services/format.service';

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
    public bluetoothSerial: BluetoothSerial,
    public alertCtrl: AlertController,
    // public contactService: ContactService,
    // public restProvider: RestProvider,
    // public navParams: NavParams,
    public formatService: FormatService,
    public toastCtrl: ToastController,
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
    this._id = this.route.snapshot.paramMap.get('_id');
    // this._id = this.route.snapshot.paramMap.get('_id');
    // this.route.params.subscribe(...);
    // console.log("paramap", this.route.snapshot.paramMap.get('_id'), this._id);
    this.select = this.route.snapshot.paramMap.get('select');

    this.customer = this.route.snapshot.paramMap.get('customer');
    this.supplier = this.route.snapshot.paramMap.get('supplier');
    this.seller = this.route.snapshot.paramMap.get('seller');
    this.employee = this.route.snapshot.paramMap.get('employee');

    // if (this.navParams.data._id){
    //   this.opened = true;
    // }
    // this.route.params.subscribe(...);
  }
  // goBack(){
  //   this.navCtrl.navigateBack('/contact-list');
  // }
  async ngOnInit() {
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
      customer: new FormControl(this.customer||false),
      supplier: new FormControl(this.supplier||false),
      seller: new FormControl(this.seller||false),
      employee: new FormControl(this.employee||false),
      user: new FormControl(false),
      user_details: new FormControl({}),
      salary: new FormControl(null),
      currency: new FormControl({}),
      hire_date: new FormControl(undefined),
      salaries: new FormControl([]),
      datePrint: new FormControl(new Date()),
      numeracion: new FormControl("0001 al 0150"),

      talonarios: new FormControl(1),
      vias: new FormControl(2),
      faturas_talonario: new FormControl(50),

      rubro: new FormControl(),
      timbrado: new FormControl(),
      dateStart: new FormControl(),
      dateEnd: new FormControl(),
      invoiceNumberStart: new FormControl("001-001-0000001"),
      invoiceNumberEnd: new FormControl("001-001-0000100"),

      advances: new FormControl([]),
      _id: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    console.log("paramap", this.route.snapshot.paramMap.get('_id'), this._id, this.select);
    if (this._id){
      this.getContact(this._id).then((data) => {
        this.contactForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
    // this.buttonSave();

  }


  async preprint() {
    let start = parseInt(this.contactForm.value.invoiceNumberStart.split("-")[2]);
    let end = parseInt(this.contactForm.value.invoiceNumberEnd.split("-")[2]);
    let prefix = this.contactForm.value.invoiceNumberEnd.split("-")[1]+"-"+this.contactForm.value.invoiceNumberEnd.split("-")[1]
    // let number = start;
    let numberLength = this.contactForm.value.invoiceNumberStart.split("-")[2].length;
    //First via
    // let prefix = this.contactForm.value.invoiceNumberStart.split("-");
    // let type = "Duplicado: Archivo Tributario";
    // let client = true;
    // let type = "Original: Cliente";
    let ticket = "";
    let types = ["Original: Cliente", "Duplicado: Archivo Tributario"];
    if (this.contactForm.value.vias == 3){
      types = ["Original: Cliente", "Duplicado: Archivo Tributario", "Triplicado: Auditoria"];
    }
    for(let number=start;number<=end;number++){
      // ticket += this.formatService.string_pad(48, number.toString(), 'right', ' ')+"\n";
      let invoiceNumber = prefix+"-"+this.formatService.string_pad(
        numberLength, number, 'right', '0');
      types.forEach(type=>{
            ticket += "------------------------------------------------\n";
            ticket += this.formatService.string_pad(96,this.contactForm.value.name.substring(0, 96), 'left', ' ')+"\n";
            ticket += "De "+this.formatService.string_pad(93,this.contactForm.value.name_legal.substring(0, 93), 'left', ' ')+"\n";
            ticket += this.formatService.string_pad(96,this.contactForm.value.rubro.substring(0, 96), 'left', ' ')+"\n";
            ticket += this.formatService.string_pad(96,this.contactForm.value.address.substring(0, 96), 'left', ' ')+"\n";
            // ticket += "\n";
            ticket += "Telefono: "+this.contactForm.value.phone.substring(0, 38)+"\n";
            ticket += "RUC o CI: "+this.contactForm.value.document.substring(0, 38)+"\n";
            ticket += "------------------------------------------------\n";
            ticket += "Timbrado Numero:"+this.formatService.string_pad(32, this.contactForm.value.timbrado, 'right', ' ')+"\n";
            ticket += "Fecha de Inicio Vigencia:"+this.formatService.string_pad(23, (new Date(this.contactForm.value.dateStart)).toLocaleDateString('es-PY'), 'right', ' ')+"\n";
            ticket += "Fecha Fin de Vigencia:"+this.formatService.string_pad(26, (new Date(this.contactForm.value.dateEnd)).toLocaleDateString('es-PY'), 'right', ' ')+"\n";
            ticket += "Factura Numero: "+this.formatService.string_pad(32, invoiceNumber, 'right', ' ')+"\n";
            ticket += "------------------------------------------------\n";
            ticket += "Fecha:\n";
            ticket += "Cliente:\n";
            ticket += "\n";
            ticket += "C.I. o RUC:\n";
            ticket += "Direccion:\n";
            ticket += "\n";
            ticket += "Telefono:\n";
            ticket += "Condicion de Pago:\n";
            ticket += "------------------------------------------------\n";
            ticket += " Codigo  |  Descripcion\n";
            ticket += "   Cant  |    Precio    |    Subtotal    | IVA  \n";
            ticket += "------------------------------------------------\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += "------------------------------------------------\n";
            ticket += "TOTAL\n";
            ticket += "Total Gravadas 10%:\n";
            ticket += "Total Gravadas  5%:\n";
            ticket += "Total Gravadas  0%:\n";
            ticket += "\n";
            ticket += "LIQUIDACION DE IVA\n";
            ticket += "Total Gravadas 10%:\n";
            ticket += "Total Gravadas  5%:\n";
            ticket += "TOTAL IVA:\n";
            ticket += "\n";
            ticket += "------------------------------------------------\n";
            ticket += "Grafica Bien Hecho - ELIABE BOREL - RUC5448651-3\n";
            ticket += "Avda. Blas Garay - km 6 - San Isidro - CDE - PY \n";
            ticket += "Telefono: (061) 577 572 - Habilitacion Nro: 1782\n";
            ticket += "Numeros: "+this.contactForm.value.numeracion+" - "+(new Date(this.contactForm.value.datePrint)).toLocaleDateString('es-PY')+" - "+this.contactForm.value.talonarios+" Tal " + this.contactForm.value.faturas_talonario + "x"+this.contactForm.value.vias+ "\n";
            ticket += type+"\n";
            ticket += "------------------------------------------------\n";
            ticket += "\n";
            ticket += "\n";
      })
    }
    console.log(ticket);
    // Print to bluetooth printer
    let toast = await this.toastCtrl.create({
    message: "Imprimiendo...",
    duration: 1000
    });
      toast.present();
      this.bluetoothSerial.isEnabled().then(res => {
        this.bluetoothSerial.list().then((data)=> {
          this.bluetoothSerial.connect(data[0].id).subscribe((data)=>{
            this.bluetoothSerial.isConnected().then(async res => {
              // |---- 32 characteres ----|
              // var blob = new Blob([ticket], { type: "text/plain;charset=utf-8" });
              let teste = await this.bluetoothSerial.write(ticket);
              // setTimeout(() => {
                // this.name.setFocu  s();
                // bluetoothSerial.subscribe('\n', success, failure);
                // this.bluetoothSerial.disconnect();
              // }, 2000);
            }).catch(res => {
              //console.log("res1", res);
            });
          },error=>{
            //console.log("error", error);
          });
        })
      }).catch(res => {
        //console.log("res", res);
      });
}

  changedDocument(){
    let dv = this.contactForm.value.document.split('-')[1] || '';
    if (dv && dv.length == 1){
      console.log("ruc", this.contactForm.value.document);
      this.getLegalName();
    }
  }

  async editUser(user) {
    // return new Promise(resolve => {
      let profileModal = await this.modalCtrl.create({
        component: UserPage,
        componentProps: this.contactForm.value.user_details
      });
      await profileModal.present();
      // let data: any = profileModal.onDidDismiss();
      const { data } = await profileModal.onDidDismiss();
      // data => {
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
          console.log("data user", data);
          console.log("user user", user);
          this.contactForm.patchValue({
            user_details: user,
          });
          this.justSave();
        }
      // });
    // });
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
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/contact-list');
        // .then(() => {
          this.events.publish('open-contact', this.contactForm.value);
        // });
      }
    } else {
      this.createContact(this.contactForm.value).then((doc: any) => {
        // this.contactForm.patchValue({
        //   _id: doc.doc.id,
        // });
        console.log("create contact", doc);
        this._id = doc.doc.id;
        // this.navCtrl.pop().then(() => {
        if (this.select){
          this.events.publish('create-contact', this.contactForm.value);
          this.modalCtrl.dismiss();
        } else {
          this.navCtrl.navigateBack('/contact-list');
          // .then(() => {
            this.events.publish('create-contact', this.contactForm.value);
          // });
        }
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
        let dict = {
          'name_legal': data.name,
        }
        if (!this.contactForm.value.name || this.contactForm.value.name == ''){
          let firstname = data.name.split(', ')[1] || '';
          let lastname = data.name.split(', ')[0];
          if (firstname){
            dict['name'] = firstname +" "+ lastname;
          } else {
            dict['name'] = lastname;
          }
        }
        this.contactForm.patchValue(dict)
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
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      // this.contactForm.markAsPristine();
      this.navCtrl.navigateBack('/contact-list');
    }
  }
}

import { Component, ViewChild } from '@angular/core';
import { NavController, App,  LoadingController, AlertController, Select, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer, PrintOptions } from '@ionic-native/printer';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { InvoiceService } from './invoice.service';
import { ContactsPage } from '../contact/list/contacts';
import { ContactPage } from '../contact/contact';
import { ProductService } from '../product/product.service';
import { ProductsPage } from '../product/list/products';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
import { FormatService } from '../services/format.service';
import { InvoicePopover } from './invoice.popover';

@Component({
  selector: 'invoice-page',
  templateUrl: 'invoice.html'
})
export class InvoicePage {
@ViewChild(Select) select: Select;
@HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let timeStamp = event.timeStamp - this.timeStamp;
    this.timeStamp = event.timeStamp;
    if(event.which === 13){ //ignore returns
          // let toast = this.toastCtrl.create({
          // message: "enter "+this.barcode,
          // duration: 1000
          // });
          // toast.present();
          let found = false;
          this.invoiceForm.value.items.forEach(item => {
            if (item.product.code == this.barcode){
              this.sumItem(item);
              //item.quantity += 1;
              found = true;
            }
          });
          if (!found){
            this.productService.getProductByCode(this.barcode).then(data => {
              //console.log("vars", data);
              this.invoiceForm.value.items.push({
                'quantity': 1,
                'price': data.price,
                'product': data
              })
              this.recomputeValues();
              this.invoiceForm.markAsDirty();
            });
          }

          this.barcode = "";
          //return;
      }
      //console.log("timeStamp", timeStamp);
      if(!timeStamp || timeStamp < 5 || this.barcode == ""){
          //code = "";
          this.barcode += event.key;
      }
      if( event.which < 48 || event.which >= 58 ){ // not a number
          this.barcode = "";
      }

      setTimeout(function(){
          this.barcode = ""
      }, 30);

  }

  timeStamp: any;
  totalInWords = "";
  barcode: string = "";
  invoiceForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;

  languages: Array<LanguageModel>;
  type: any = 'out';

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public modal: ModalController,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public invoiceService: InvoiceService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public productService: ProductService,
    // public plannedService: PlannedService,
    public bluetoothSerial: BluetoothSerial,
    public toastCtrl: ToastController,
    public printer: Printer,
    public configService: ConfigService,
    public formatService: FormatService,
    public events:Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    this.type = this.navParams.data.type;
    this.avoidAlertMessage = false;
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(InvoicePopover, {doc: this});
    popover.present({
      ev: myEvent
    });
  }

  ionViewWillLoad() {
    //var today = new Date().toISOString();
    //console.log("this.navParams.data.origin_ids", this.navParams.data.contact);
    let items = [];
    if (this.navParams.data.items){
      this.navParams.data.items.forEach(item=>{
        items.push({
          'product': item.product,
          'description': item.description,
          'price': item.price,
          'quantity': item.quantity,
        });
      })
    }
    this.invoiceForm = this.formBuilder.group({
      contact: new FormControl(this.navParams.data.contact||{}, Validators.required),
      name: new FormControl(''),
      contact_name: new FormControl(this.navParams.data.contact && this.navParams.data.contact.name||''),
      code: new FormControl(''),
      date: new FormControl(this.today),
      total: new FormControl(0),
      residual: new FormControl(0),
      tax: new FormControl(0),
      note: new FormControl(),
      state: new FormControl('QUOTATION'),
      // tab: new FormControl(this.navParams.data.tab||'products'),
      items: new FormControl(items||[], Validators.required),
      type: new FormControl(this.navParams.data.type||'out'),
      payments: new FormControl(this.navParams.data.payments||[]),
      planned: new FormControl(this.navParams.data.planned||[]),
      invoices: new FormControl([]),
      paymentCondition: new FormControl(this.navParams.data.paymentCondition||''),
      payment_name: new FormControl(''),
      number: new FormControl(''),
      _id: new FormControl(''),
      origin_id: new FormControl(this.navParams.data.origin_id||''),
      // origin_ids: new FormControl(this.navParams.data.origin_ids||[]),
    });
    this.recomputeValues();
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.invoiceService.getInvoice(this._id).then((data) => {
        //console.log("data invoice", data);
        this.invoiceForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  ionViewCanLeave() {
      if(this.invoiceForm.dirty && ! this.avoidAlertMessage) {
          let alertPopup = this.alertCtrl.create({
              title: 'Queres Descartar Cambios?',
              message: '¿Estas seguro que deseas salir de la factura sin guardar las modificaciones?',
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
      }
  }

  private exitPage() {
      this.invoiceForm.markAsPristine();
      this.navCtrl.navigateBack();
  }

  // goNextStep() {
  //   if (this.invoiceForm.value.state == 'QUOTATION'){
  //     if(!this.invoiceForm.value._id){
  //       this.justSave();
  //     }
  //     this.confirmInvoice();
  //   } else if (this.invoiceForm.value.state == 'CONFIRMED'){
  //     this.navCtrl.navigateBack();
  //   } else if (this.invoiceForm.value.state == 'PAID'){
  //     this.navCtrl.navigateBack();
  //   }
  // }

  goNextStep() {
    if (this.invoiceForm.value.state == 'QUOTATION'){

      if (this.invoiceForm.value.items.length==0){
        this.addItem();
      }
      else if (Object.keys(this.invoiceForm.value.contact).length === 0){
        this.selectContact();
      }
      else if (this.invoiceForm.value.contact.document == ''){
        this.editContact();
        let toast = this.toastCtrl.create({
        message: "Informar el RUC del Contacto",
        duration: 3000
        });
        toast.present();
      }
      else if (this.invoiceForm.value.paymentCondition==''){
        this.select.open();
      } else {
        this.setNumber();
      }




    //   console.log("set Focus");
    //   if (this.invoiceForm.value.client_request == ''){
    //     this.clientRequest.setFocus();
    //   }
    //   else if (this.invoiceForm.value.production){
    //     if (Object.keys(this.invoiceForm.value.product).length === 0){
    //       this.selectProduct();
    //     } else {
    //       this.setStarted();
    //       return;
    //     }
    //   } else {
    //     if (Object.keys(this.invoiceForm.value.contact).length === 0){
    //       this.selectContact();
    //     } else {
    //       this.setStarted();
    //       return;
    //     }
    //   }
    // }
    // if (this.invoiceForm.value.state == 'STARTED'){
    //   if(!this.invoiceForm.value._id){
    //     this.buttonSave();
    //   }
    //   if (this.invoiceForm.value.works.length==0){
    //     this.addItem();
    //   }
    //   else if (this.invoiceForm.value.inputs.length==0 && ! this.ignore_inputs){
    //     console.log("ignore_inputs");
    //     let prompt = this.alertCtrl.create({
    //       title: 'Productos Consumidos',
    //       message: 'Has consumido algun producto durante el trabajo?',
    //       buttons: [
    //         {
    //           text: 'No',
    //           handler: data => {
    //             console.log("ignore_inputs");
    //
    //             this.ignore_inputs = true;
    //             let prompt = this.alertCtrl.create({
    //               title: 'Viaticos',
    //               message: 'Has hecho algun viaja para realizar el trabajo?',
    //               buttons: [
    //                 {
    //                   text: 'No',
    //                   handler: data => {
    //                     // this.addTravel();
    //                     this.ignore_travels = true;
    //                   }
    //                 },
    //                 {
    //                   text: 'Si',
    //                   handler: data => {
    //                     this.addTravel();
    //                   }
    //                 }
    //               ]
    //             });
    //             prompt.present();
    //           }
    //         },
    //         {
    //           text: 'Si',
    //           handler: data => {
    //             this.addInput();
    //             // item.description = data.description;
    //           }
    //         }
    //       ]
    //     });
    //
    //     prompt.present();
    //   }
    //   else if (this.invoiceForm.value.travels.length==0 && ! this.ignore_travels){
    //     console.log("ignore_travels");
    //     let prompt = this.alertCtrl.create({
    //       title: 'Viaticos',
    //       message: 'Has hecho algun viaja para realizar el trabajo?',
    //       buttons: [
    //         {
    //           text: 'No',
    //           handler: data => {
    //             // this.addTravel();
    //             this.ignore_travels = true;
    //           }
    //         },
    //         {
    //           text: 'Si',
    //           handler: data => {
    //             this.addTravel();
    //           }
    //         }
    //       ]
    //     });
    //     prompt.present();
    //   }
    //   else {
    //     console.log("Confirm Service");
    //     this.confirmService();
    //   }
    // } else if (this.invoiceForm.value.state == 'CONFIRMED'){
    //     this.beforeAddPayment();
    // } else if (this.invoiceForm.value.state == 'PAID'){
    //   if (this.invoiceForm.value.invoices.length){
    //     this.navCtrl.navigateBack();
    //   } else {
    //     this.addInvoice();
    //   }
  } else {
      this.navCtrl.navigateBack();
    }
  }




  beforeConfirm(){
    if (this.invoiceForm.value.items.length == 0){
      this.addItem();
    } else {
      // this.invoiceForm.patchValue({
      //   tab: "invoice",
      // });
      if (Object.keys(this.invoiceForm.value.contact).length === 0){
        this.selectContact().then( data => {
          // if (Object.keys(this.invoiceForm.value.paymentCondition).length === 0){
          //   this.selectPaymentCondition();
          // }
        });
      // } else if (Object.keys(this.invoiceForm.value.paymentCondition).length === 0){
      //   this.selectPaymentCondition();
      } else {
        this.setNumber();
      }
    }
  }

  addDays(date, days) {
    days = parseInt(days);
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  buttonSave() {
    if (this._id){
      this.invoiceService.updateInvoice(this.invoiceForm.value);
      this.invoiceForm.markAsPristine();
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-invoice', this.invoiceForm.value);
      });
    } else {
      //this.invoiceService.createInvoice(this.invoiceForm.value);
      this.invoiceService.createInvoice(this.invoiceForm.value).then(doc => {
        //console.log("docss", doc);
        this.invoiceForm.patchValue({
          _id: doc['doc'].id,
          code: doc['invoice'].code,
        });
        this._id = doc['doc'].id;
        this.invoiceForm.markAsPristine();
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-invoice', this.invoiceForm.value);
        });
      });
    }
  }

  justSave() {
    if (this._id){
      this.invoiceService.updateInvoice(this.invoiceForm.value);
      this.invoiceForm.markAsPristine();
      this.events.publish('open-invoice', this.invoiceForm.value);
    } else {
      //this.invoiceService.createInvoice(this.invoiceForm.value);
      this.invoiceService.createInvoice(this.invoiceForm.value).then(doc => {
        //console.log("docss", doc);
        this.invoiceForm.patchValue({
          _id: doc['doc'].id,
          code: doc['invoice'].code,
        });
        this._id = doc['doc'].id;
        this.invoiceForm.markAsPristine();
        this.events.publish('create-invoice', this.invoiceForm.value);
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

  deleteItem(item){
    if (this.invoiceForm.value.state=='QUOTATION'){
      let index = this.invoiceForm.value.items.indexOf(item)
      this.invoiceForm.value.items.splice(index, 1);
      this.recomputeValues();
    }
  }

  recomputeTotal(){
    if (this.invoiceForm.value.state=='QUOTATION'){
      let total = 0;
      this.invoiceForm.value.items.forEach((item) => {
        total = total + item.quantity*item.price;
      });
      this.invoiceForm.patchValue({
        total: total,
      });
    }
  }

  recomputeTax(){
    let tax:number = 0;
    this.invoiceForm.value.items.forEach((item) => {
      tax += parseFloat(item.price)*parseFloat(item.quantity)/11;
    });
    this.invoiceForm.patchValue({
      tax: tax,
    });
  }

  recomputeResidual(){
    let residual:number = parseFloat(this.invoiceForm.value.total);
    this.invoiceForm.value.payments.forEach((item) => {
      residual -= parseFloat(item.total);
    });
    this.invoiceForm.patchValue({
      residual: residual,
    });
  }

  // addItem(){
  //   if (this.invoiceForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.subscribe('select-product', (product) => {
  //       this.invoiceForm.value.items.push({
  //         'description': product.name,
  //         'quantity': 1,
  //         'price': product.price,
  //         'product': product
  //       })
  //       this.recomputeValues();
  //       this.invoiceForm.markAsDirty();
  //       this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }
  //
  // openItem(item) {
  //   if (this.invoiceForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.subscribe('select-product', (product) => {
  //       //console.log("vars", product);
  //       item.price = product.price;
  //       item.product = product;
  //       item.description = product.name;
  //       this.recomputeValues();
  //       this.avoidAlertMessage = false;
  //       this.invoiceForm.markAsDirty();
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }

  addItem(){
    if(!this.invoiceForm.value._id){
      this.buttonSave();
    }
    if (this.invoiceForm.value.state=='QUOTATION'){
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        //console.log("vars", data);
        this.invoiceForm.value.items.unshift({
          'quantity': 1,
          'price': data.price,
          'cost': data.cost,
          'product': data,
          'description': data.name,
        })
        this.recomputeValues();
        this.invoiceForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-product');
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true});
      profileModal.present();
    }
  }

  openItem(item) {
    if (this.invoiceForm.value.state=='QUOTATION'){
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        //console.log("vars", data);
        item.price = data.price;
        item.product = data;
        item.description = data.name;
        this.recomputeValues();
        this.avoidAlertMessage = false;
        this.invoiceForm.markAsDirty();
        this.events.unsubscribe('select-product');
      })
      let profileModal = this.modal.create(ProductsPage, {"select": true});
      profileModal.present();
    }
  }

  sumItem(item) {
    if (this.invoiceForm.value.state=='QUOTATION'){
      item.quantity = parseFloat(item.quantity)+1;
      this.recomputeValues();
    }
  }

  remItem(item) {
    if (this.invoiceForm.value.state=='QUOTATION'){
      item.quantity = parseFloat(item.quantity)-1;
      this.recomputeValues();
    }
  }

  editItemPrice(item){
    if (this.invoiceForm.value.state=='QUOTATION'){
      let prompt = this.alertCtrl.create({
        title: 'Precio del Producto',
        message: 'Cual es el precio de este producto?',
        inputs: [
          {
            type: 'number',
            name: 'price',
            value: item.price
        },

        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Confirmar',
            handler: data => {
              item.price = data.price;
              this.recomputeValues();
            }
          }
        ]
      });

      prompt.present();
    }
  }

  editItemQuantity(item){
    if (this.invoiceForm.value.state=='QUOTATION'){
      let prompt = this.alertCtrl.create({
        title: 'Cantidad del Producto',
        message: 'Cual es el Cantidad de este producto?',
        inputs: [
          {
            type: 'number',
            name: 'quantity',
            value: item.quantity
        },

        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Confirmar',
            handler: data => {
              item.quantity = data.quantity;
              this.recomputeValues();
            }
          }
        ]
      });

      prompt.present();
    }
  }

  editItemDescription(item){
    if (this.invoiceForm.value.state=='QUOTATION'){
      let prompt = this.alertCtrl.create({
        title: 'Description de la linea',
        message: 'Cual es la mejor description para esta linea?',
        inputs: [
          {
            type: 'text',
            name: 'description',
            value: item.description
        },

        ],
        buttons: [
          {
            text: 'Cancel'
          },
          {
            text: 'Confirmar',
            handler: data => {
              item.description = data.description;
            }
          }
        ]
      });

      prompt.present();
    }
  }

  recomputeValues() {
    this.recomputeTotal();
    this.recomputeTax();
    this.recomputeResidual();
    if (this.invoiceForm.value.total > 0 && this.invoiceForm.value.residual == 0 && this.invoiceForm.value.state == 'PRINTED'){
      this.invoiceForm.patchValue({
        state: "PAID",
      });
    }
  }

  // validation_messages = {
  //   'contact': [
  //     { type: 'required', message: 'Client is required.' }
  //   ]
  // };

  setNumber(){
    if (this.invoiceForm.value.type == 'in'){
      this.informNumber("001-001-000");
    } else if (this.invoiceForm.value.code){
      this.informNumber(this.invoiceForm.value.code);
    } else {
      this.configService.showNextSequence('invoice').then((code) => {
        this.informNumber(code);
      });
    }
  }

  informNumber(code){
    let prompt = this.alertCtrl.create({
      title: 'Crear Factura',
      message: 'Deseas Crear e Imprimir la Factura legal?',
      inputs: [
        {
          name: 'code',
          placeholder: '001-001-0001234',
          value: code
      },

      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Imprimir',
          handler: data => {
            if (this.invoiceForm.value.type == 'out'){
              this.configService.setNextSequence('invoice', data.code).then(dados => {
                //console.log("dados", dados);
                this.invoiceForm.patchValue({
                  code: data.code,
                  state: 'PRINTED',
                });
                this.recomputeValues();
                this.printAndroid();
                this.justSave();
                // this.navCtrl.navigateBack();
              });
            } else {
              this.invoiceForm.patchValue({
                code: data.code,
                state: 'RECEIVED',
              });
              this.recomputeValues();
              // this.printAndroid();
              this.justSave();
              // this.navCtrl.navigateBack();
            }
          }
        }
      ]
    });

    prompt.present();
  }

  confirmInvoice() {
    if (this.invoiceForm.value.state=='QUOTATION'){
      this.beforeConfirm();
    }
  }

  // changeTab() {
  //   ////console.log("changeTab", this.invoiceForm);
  //   this.invoiceForm.controls.tab.markAsPristine();
  // }

  // addPayment() {
  //   this.avoidAlertMessage = true;
  //   let plannedItems = [];
  //   //let planned.amount_paid = this.invoiceForm.value.planned[0].amount;
  //
  //   this.invoiceForm.value.planned.forEach(planned => {
  //     //planned.amount_paid = planned.amount;
  //     if (planned.state == 'WAIT'){
  //       plannedItems.push(planned);
  //     }
  //   })
  //
  //   this.events.unsubscribe('create-receipt');
  //   this.events.subscribe('create-receipt', (data) => {
  //     //console.log("receipt", data);
  //     //if (data.amount > 0){
  //       // let index = this.invoiceForm.value.planned.indexOf(plannedItems[0])
  //       // //console.log("plannedItems[0]", index);
  //       // this.invoiceForm.value.payments.splice(index, 1);
  //     //}
  //       this.invoiceForm.value.payments.push({
  //         'total': data.total,
  //         'date': data.date,
  //         'cash': data.cash,
  //         'state': data.state,
  //         '_id': data._id,
  //       });
  //     //}
  //     this.recomputeValues();
  //     this.avoidAlertMessage = false;
  //     this.justSave();
  //     this.events.unsubscribe('create-receipt');
  //   });
  //   //console.log("this.invoiceForm.value.planned", this.invoiceForm.value.planned);
  //   plannedItems = [plannedItems[0]];
  //   this.navCtrl.navigateForward(ReceiptPage, {
  //     //"default_amount": default_amount,
  //     //"default_name": "Pago Venta",
  //     "addPayment": true,
  //     "contact": this.invoiceForm.value.contact,
  //     "items": plannedItems,
  //     "origin_ids": [this.invoiceForm.value._id],
  //   });
  // //}
  // }

  // openPayment(item) {
  //   this.events.unsubscribe('open-receipt');
  //   this.events.subscribe('open-receipt', (data) => {
  //     this.events.unsubscribe('open-receipt');
  //   });
  //   this.navCtrl.navigateForward(ReceiptPage, {
  //     "_id": item._id,
  //   });
  // }

  onSubmit(values){
    //console.log(values);
  }

  // selectContact() {
  //   if (this.invoiceForm.value.state=='QUOTATION'){
  //     return new Promise(resolve => {
  //       this.avoidAlertMessage = true;
  //       this.events.subscribe('select-contact', (contact) => {
  //         this.invoiceForm.patchValue({
  //           contact: contact,
  //           contact_name: contact.name,
  //         });
  //         this.invoiceForm.markAsDirty();
  //         this.avoidAlertMessage = false;
  //         this.events.unsubscribe('select-contact');
  //         resolve(true);
  //       })
  //       this.navCtrl.navigateForward(ContactsPage, {"select": true});
  //     });
  //   }
  // }

  selectContact() {
    if (this.invoiceForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.invoiceForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.invoiceForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {
          "select": true,
        });
        profileModal.present();
      });
    }
  }

  editContact() {
    if (this.invoiceForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.avoidAlertMessage = true;
        this.events.subscribe('open-contact', (contact) => {
          this.invoiceForm.patchValue({
            contact: contact,
            contact_name: contact.name,
          });
          this.invoiceForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('open-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactPage, {
          "_id": this.invoiceForm.value.contact._id
        });
        profileModal.present();
      });
    }
  }

  print() {
    this.configService.getConfigDoc().then((data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      let date = this.invoiceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      let payment_condition = this.invoiceForm.value.paymentCondition || "";
      let contact_name = this.invoiceForm.value.contact.name || "";
      let code = this.invoiceForm.value.code || "";
      let doc = this.invoiceForm.value.contact.document || "";
      //let direction = this.invoiceForm.value.contact.city || "";
      //let phone = this.invoiceForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.invoiceForm.value.items.forEach(item => {
        let code = item.product.code;
        let quantity = item.quantity;
        //  let productName = item.product.name;
        let price = item.price;
        let subtotal = quantity*price;
        let exenta = 0;
        let iva5 = 0;
        let iva10 = 0;
        if (item.product.tax == "iva10"){
          iva10 = item.quantity*item.price;
          totalIva10 += iva10;
        } else if (item.product.tax == "exenta"){
          exenta = item.quantity*item.price;
          totalExentas += exenta;
        } else if (item.product.tax == "iva5"){
          iva5 = item.quantity*item.price;
          totalIva5 += iva5;
        }
        code = this.formatService.string_pad(4, code.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        quantity = this.formatService.string_pad(7, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
        subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        let product_name = this.formatService.string_pad(32, item.description);
        lines += code+quantity+price+subtotal+product_name+"\n";
      });
      let totalAmount = totalIva10 + totalIva5 + totalExentas;
      totalAmount = this.formatService.string_pad(16, totalAmount, "right");

      let ticket=""
      ticket +=company_name+"\n";
      ticket += "Ruc: "+company_ruc+"\n";
      ticket += "Tel: "+company_phone+"\n";
      ticket += "\n";
      ticket += "FACTURA: "+code+"\n";
      ticket += "Fecha: "+date+"\n";
      ticket += "Cliente: "+contact_name+"\n";
      ticket += "Ruc: "+doc+"\n";
      ticket += "\n";
      ticket += "Condicion de pago: "+payment_condition+"\n";
      ticket += "\n";
      ticket += "--------------------------------\n";
      ticket += "ARTICULOS DEL PEDIDO\n";
      ticket += "\n";
      ticket += "Cod.  Cant.   Precio   Sub-total\n";
      ticket += lines;
      ticket += "--------------------------------\n";
      ticket += "TOTAL Gs.:     "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
      ticket += "--------------------------------\n";
      ticket += "AVISO LEGAL: Este comprobante \n";
      ticket += "no tiene valor fiscal.\n";
      ticket += "--------------------------------\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "--------------------------------\n";
      ticket += "Firma del vendedor: Francisco Xavier Schwertner\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "--------------------------------\n";
      ticket += "Firma del cliente: "+contact_name+"\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";


      //console.log("ticket", ticket);


      // Print to bluetooth printer
      let toast = this.toastCtrl.create({
      message: "Start ",
      duration: 3000
      });
      toast.present();
      this.bluetoothSerial.isEnabled().then(res => {
        this.bluetoothSerial.list().then((data)=> {
          this.bluetoothSerial.connect(data[0].id).subscribe((data)=>{
            this.bluetoothSerial.isConnected().then(res => {
              // |---- 32 characteres ----|
              this.bluetoothSerial.write(ticket);
              this.bluetoothSerial.disconnect();
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
    });
  }

  printAndroid(){
    this.configService.getConfigDoc().then((data) => {

      let template_model = data.invoice_template;
      let marginTop = data.invoicePrint['marginTop_config'];
      let marginLeft = data.invoicePrint['marginLeft_config'];
      let printerFactor = data.invoicePrint['printerFactor_config'];

      Object.keys(data.invoicePrint).forEach(key=>{
        let value = 0;
        if (key.split("_")[1] == 'top'){
          value = (data.invoicePrint[key] - marginTop)*printerFactor;
        }
        else if (key.split("_")[1] == 'left'){
          value = (data.invoicePrint[key] - marginLeft)*printerFactor;
        }
        else if (key.split("_")[1] == 'width'){
          value = (data.invoicePrint[key])*printerFactor;
        }
        else if (key.split("_")[1] == 'height'){
          value = (data.invoicePrint[key])*printerFactor;
        }
        else {
          // console.log("key", key);
          return;
        }
        template_model = template_model.replace(key, value);
      })

      // this.printer.pick().then(printer => {
        let number = this.invoiceForm.value.code || "";
        let date = this.invoiceForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        //console.log("date", date);
        let payment_condition = this.invoiceForm.value.paymentCondition || "";
        let contact_name = this.invoiceForm.value.contact.name_legal || this.invoiceForm.value.contact.name || "";
        let doc = this.invoiceForm.value.contact.document || "";
        let direction = this.invoiceForm.value.contact.address || "";
        let phone = this.invoiceForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.invoiceForm.value.items.forEach(item => {
          let quantity = item.quantity;
          let productName = item.description || item.product.name;
          let price = item.price;
          let exenta = 0;
          let iva5 = 0;
          let iva10 = 0;
          if (item.product.tax == "iva10"){
            iva10 = item.quantity*item.price;
            totalIva10 += iva10;
          } else if (item.product.tax == "exenta"){
            exenta = item.quantity*item.price;
            totalExentas += exenta;
          } else if (item.product.tax == "iva5"){
            iva5 = item.quantity*item.price;
            totalIva5 += iva5;
          }
          lines += `<div class="lines-quantity">
            `+quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
            </div>
            <div class="lines-product">
              `+productName+`
            </div>
            <div class="lines-price">
              `+price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
            </div>
            <div class="lines-tax0">
              `+exenta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
            </div>
            <div class="lines-tax5">
              `+iva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
            </div>
            <div class="lines-tax10">
              `+iva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
            </div>
            <br/>`;
        });

        let totalAmount = totalIva10 + totalIva5 + totalExentas;
        let totalInWords = this.formatService.NumeroALetras(totalAmount, "PYG");
        let amountIva10 = (totalIva10/11).toFixed(0);
        let amountIva5 = (totalIva5/21).toFixed(0);
        let amountIva = parseFloat(amountIva10) + parseFloat(amountIva5);
        this.printer.isAvailable().then(onSuccess => {
          //console.log("onSuccess", onSuccess);
        }, onError => {
          //console.log("onError", onError);
        });
        let options: PrintOptions = {
             name: 'MyDocument',
             //printerId: 'printer007',
             duplex: false,
             landscape: false,
             grayscale: true
           };
           //console.log("dafdata", data.invoice_template);
           let template = template_model;
           template = template.replace("+number+", number);
           template = template.replace("+date+", date);
           template = template.replace("+payment_condition+", payment_condition);
           template = template.replace("+contact_name+", contact_name);
           template = template.replace("+doc+", doc);
           template = template.replace("+direction+", direction);
           template = template.replace("+phone+", phone);
           template = template.replace("+lines+", lines);
           template = template.replace("+totalExentas+", totalExentas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+totalIva5+", totalIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+totalIva10+", totalIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+totalInWords+", totalInWords);
           template = template.replace("+totalAmount+", totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+amountIva5+", amountIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+amountIva10+", amountIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           template = template.replace("+amountIva+", amountIva.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));

           // template = template.replace("+number+", number);
           // template = template.replace("+date+", date);
           // template = template.replace("+payment_condition+", payment_condition);
           // template = template.replace("+contact_name+", contact_name);
           // template = template.replace("+doc+", doc);
           // template = template.replace("+direction+", direction);
           // template = template.replace("+phone+", phone);
           // template = template.replace("+lines+", lines);
           // template = template.replace("+totalExentas+", totalExentas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+totalIva5+", totalIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+totalIva10+", totalIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+totalInWords+", totalInWords);
           // template = template.replace("+totalAmount+", totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+amountIva5+", amountIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+amountIva10+", amountIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           // template = template.replace("+amountIva+", amountIva.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
           let result = ""
           for(let i=0;i<data.invoicePrint['copy_count'];i++){
             // console.log("teplateda", i);
             result += template;
             if (i<(data.invoicePrint['copy_count']-1)){
               result += '<div class="space"></div>';
             }
           }
           console.log("html template", result);
           this.printer.print(result, options).then(onSuccess => {
             //console.log("onSuccess2", onSuccess);
           }, onError => {
             //console.log("onError2", onError);
           });
         //})
    });
  }
}

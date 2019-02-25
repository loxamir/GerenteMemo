import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, Platform, LoadingController, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { InvoiceService } from './invoice.service';
import { ContactListPage } from '../contact-list/contact-list.page';
import { ContactPage } from '../contact/contact.page';
// import { ProductService } from '../product/product.service';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
import { FormatService } from '../services/format.service';
// import { InvoicePopover } from './invoice.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit {

  @Input() _id;
  @Input() contact;
  @Input() paymentCondition;
  @Input() items;
  @Input() type: any = 'out';
  @Input() origin_id;

  @ViewChild('select') select;
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
              // this.productService.getProductByCode(this.barcode).then(data => {
              //   //console.log("vars", data);
              //   this.invoiceForm.value.items.push({
              //     'quantity': 1,
              //     'price': data.price,
              //     'product': data
              //   })
              //   this.recomputeValues();
              //   this.invoiceForm.markAsDirty();
              // });
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
    // _id: string;
    avoidAlertMessage: boolean;

    languages: Array<LanguageModel>;
    // type: any = 'out';

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public modalCtrl: ModalController,
      public platform: Platform,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public invoiceService: InvoiceService,
      public pouchdbService: PouchdbService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      // public productService: ProductService,
      // public plannedService: PlannedService,
      public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      // public popoverCtrl: PopoverController,
    ) {
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      this.type = this.route.snapshot.paramMap.get('type');
      this.avoidAlertMessage = false;
      var foo = { foo: true };
      history.pushState(foo, "Anything", " ");
    }

    // presentPopover(myEvent) {
    //   let popover = this.popoverCtrl.create(InvoicePopover, {doc: this});
    //   popover.present({
    //     ev: myEvent
    //   });
    // }

    async ngOnInit() {
      //var today = new Date().toISOString();
      //console.log("this.route.snapshot.paramMap.get('origin_ids", this.route.snapshot.paramMap.get('contact);
      let items = [];
      if (this.items){
        let lista: any = this.items;
        console.log("lista", lista);
        lista.forEach(item=>{
          items.push({
            'product': item.product,
            'description': item.description,
            'price': item.price,
            'quantity': item.quantity,
          });
        })
      }
      this.invoiceForm = this.formBuilder.group({
        contact: new FormControl(this.contact||{}, Validators.required),
        name: new FormControl(''),
        contact_name: new FormControl(this.contact && this.contact['name']||''),
        code: new FormControl(''),
        date: new FormControl(this.today),
        total: new FormControl(0),
        residual: new FormControl(0),
        tax: new FormControl(0),
        note: new FormControl(),
        state: new FormControl('QUOTATION'),
        // tab: new FormControl(this.route.snapshot.paramMap.get('tab||'products'),
        items: new FormControl(items||[], Validators.required),
        type: new FormControl(this.type||'out'),
        payments: new FormControl(this.route.snapshot.paramMap.get('payments')||[]),
        // planned: new FormControl(this.route.snapshot.paramMap.get('planned')||[]),
        invoices: new FormControl([]),
        paymentCondition: new FormControl(this.paymentCondition||''),
        payment_name: new FormControl(''),
        number: new FormControl(''),
        currency: new FormControl({}),
        _id: new FormControl(''),
        origin_id: new FormControl(this.origin_id||''),
        // origin_ids: new FormControl(this.route.snapshot.paramMap.get('origin_ids||[]),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      this.recomputeValues();
      //this.loading.present();
      // console.log("id", this._id);
      // if (this._id){
      //   this.pouchdbService.getDoc(this._id).then((data) => {
      //     console.log("data invoice", data);
      //     this.invoiceForm.patchValue(data);
      //     //this.loading.dismiss();
      //   });
      // } else {
      //   //this.loading.dismiss();
      // }
      console.log("id", this._id);
      if (this._id){
        this.getInvoice(this._id).then((data) => {
          console.log("data invoice", data);
          this.invoiceForm.patchValue(data);
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
      }
    }

    generatePdf() {
      const div = document.getElementById("htmltoimage");
      const options = {background: "white", height: div.clientHeight, width: div.clientWidth};

      html2canvas(div, options).then((canvas) => {
          //Initialize JSPDF
          let doc = new jsPDF("p", "mm", "a4");
          //Converting canvas to Image
          let imgData = canvas.toDataURL("image/PNG");
          //Add image Canvas to PDF
          doc.addImage(imgData, 'PNG', 20, 20);

          let pdfOutput = doc.output();
          // using ArrayBuffer will allow you to put image inside PDF
          let buffer = new ArrayBuffer(pdfOutput.length);
          let array = new Uint8Array(buffer);
          for (let i = 0; i < pdfOutput.length; i++) {
              array[i] = pdfOutput.charCodeAt(i);
          }

          //Name of pdf
          const fileName = "example.pdf";

          // Make file
          doc.save(fileName);

      });
  }


  downloadImage(){
    const div = document.getElementById("htmltoimage");
    const options = {background:"white",height :div.clientHeight , width : div.clientWidth  };


    // let teste = document.getElementById("htmltoimage");
    console.log("teste element", div);
   html2canvas(div, options).then(canvas => {
     console.log("canvas", canvas);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.download = "test.png";
    a.href =  canvas.toDataURL();
    a.click();
  });


 }

    // async ionViewCanLeave() {
    //     if(this.invoiceForm.dirty && ! this.avoidAlertMessage) {
    //         let alertPopup = await this.alertCtrl.create({
    //             header: 'Queres Descartar Cambios?',
    //             message: '¿Estas seguro que deseas salir de la factura sin guardar las modificaciones?',
    //             buttons: [{
    //                     text: 'Si',
    //                     handler: () => {
    //                         // alertPopup.dismiss().then(() => {
    //                             this.exitPage();
    //                         // });
    //                     }
    //                 },
    //                 {
    //                     text: 'No',
    //                     handler: () => {
    //                         // need to do something if the user stays?
    //                     }
    //                 }]
    //         });
    //
    //         // Show the alert
    //         alertPopup.present();
    //
    //         // Return false to avoid the page to be popped up
    //         return false;
    //     }
    // }
    //
    // private exitPage() {
    //     this.invoiceForm.markAsPristine();
    //     // this.navCtrl.navigateBack();
    // }

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

    async goNextStep() {
      if (this.invoiceForm.value.state == 'QUOTATION'){

        if (this.invoiceForm.value.items.length==0){
          this.addItem();
        }
        else if (Object.keys(this.invoiceForm.value.contact).length === 0){
          this.selectContact();
        }
        else if (this.invoiceForm.value.contact.document == ''){
          this.editContact();
          let toast = await this.toastCtrl.create({
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
        // this.navCtrl.navigateBack();
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
        this.updateInvoice(this.invoiceForm.value);
        this.invoiceForm.markAsPristine();
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-invoice', this.invoiceForm.value);
        // });
      } else {
        //this.invoiceService.createInvoice(this.invoiceForm.value);
        this.createInvoice(this.invoiceForm.value).then(doc => {
          //console.log("docss", doc);
          this.invoiceForm.patchValue({
            _id: doc['doc'].id,
            code: doc['invoice'].code,
          });
          this._id = doc['doc'].id;
          this.invoiceForm.markAsPristine();
          // this.navCtrl.navigateBack().then(() => {
            this.events.publish('create-invoice', this.invoiceForm.value);
          // });
        });
      }
    }

    justSave() {
      if (this._id){
        this.updateInvoice(this.invoiceForm.value);
        this.invoiceForm.markAsPristine();
        this.events.publish('open-invoice', this.invoiceForm.value);
      } else {
        //this.invoiceService.createInvoice(this.invoiceForm.value);
        this.createInvoice(this.invoiceForm.value).then(doc => {
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

    async addItem(){
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
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      }
    }

    async openItem(item) {
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
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true
          }
        });
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

    async editItemPrice(item){
      if (this.invoiceForm.value.state=='QUOTATION'){
        let prompt = await this.alertCtrl.create({
          header: 'Precio del Producto',
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

    async editItemQuantity(item){
      if (this.invoiceForm.value.state=='QUOTATION'){
        let prompt = await this.alertCtrl.create({
          header: 'Cantidad del Producto',
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

    async editItemDescription(item){
      if (this.invoiceForm.value.state=='QUOTATION'){
        let prompt = await this.alertCtrl.create({
          header: 'Description de la linea',
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
        this.informNumberSupplier("001-001-000");
      } else if (this.invoiceForm.value.code){
        this.informNumber(this.invoiceForm.value.code);
      } else {
        this.configService.showNextSequence('invoice').then((code) => {
          this.informNumber(code);
        });
      }
    }

    async informNumber(code){
      let prompt = await this.alertCtrl.create({
        header: 'Crear Factura',
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
              console.log("imprimiv");
              if (this.invoiceForm.value.type == 'out'){
                console.log("cliente");
                this.configService.setNextSequence('invoice', data.code).then(async dados => {
                  // console.log("imprimiv");
                  console.log("dados", dados);
                  this.invoiceForm.patchValue({
                    code: data.code,
                    state: 'PRINTED',
                  });
                  console.log("recomputeValues");
                  this.recomputeValues();
                  console.log("formatService");
                  if (this.platform.is('cordova')){
                    this.printAndroid();
                  } else {
                    let dotmatrix_model:any = await this.pouchdbService.getDoc('config.invoice');
                    console.log("dotmatrix_model", dotmatrix_model);
                    let layout = await this.pouchdbService.getDoc('config.profile')
                    this.formatService.printInvoice(this.invoiceForm.value, dotmatrix_model, layout['invoicePrint']);
                  }
                  this.justSave();
                  // this.navCtrl.navigateBack();
                });
              } else {
                this.invoiceForm.patchValue({
                  code: data.code,
                  state: 'RECEIVED',
                });
                this.recomputeValues();
                this.justSave();
                // this.navCtrl.navigateBack();
              }
            }
          }
        ]
      });

      prompt.present();
    }


    async informNumberSupplier(code){
      let prompt = await this.alertCtrl.create({
        header: 'Numero de Factura',
        message: 'Cual es el numero de la factura?',
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
            text: 'Confirmar',
            handler: data => {
              this.invoiceForm.patchValue({
                code: data.code,
                state: 'RECEIVED',
              });
              this.recomputeValues();
              this.justSave();
              if (this.select){
                this.modalCtrl.dismiss();
              }
              // this.navCtrl.navigateBack();
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
        return new Promise(async resolve => {
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
          let profileModal = await this.modalCtrl.create({
            component: ContactListPage,
            componentProps: {
              "select": true,
            }
          });
          profileModal.present();
        });
      }
    }

    editContact() {
      if (this.invoiceForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
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
          let profileModal = await this.modalCtrl.create({
            component: ContactPage,
            componentProps: {
              "_id": this.invoiceForm.value.contact._id
            }
          });
          profileModal.present();
        });
      }
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
            let iva0 = 0;
            let iva5 = 0;
            let iva10 = 0;
            if (item.product.tax == "iva10"){
              iva10 = item.quantity*item.price;
              totalIva10 += iva10;
            } else if (item.product.tax == "iva0"){
              iva0 = item.quantity*item.price;
              totalExentas += iva0;
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
                `+iva0.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`
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
             let result = ""
             for(let i=0;i<data.invoicePrint['copy_count'];i++){
               // console.log("teplateda", i);
               result += template;
               if (i<(data.invoicePrint['copy_count']-1)){
                 result += '<div class="space"></div>';
               }
             }
             // console.log("html template", result);
             // let html = result;
             //  let fragmentFromString = function (strHTML) {
             //    return document.createRange().createContextualFragment(strHTML);
             //  }
             //  let fragment = fragmentFromString(html);
             //  // document.body.appendChild(fragment);
             //
             // const div = document.getElementById("htmltoimage");
             // // div.html(fragment);
             // div.innerHTML = html;
             // const hoptions = {background: "white", height: div.clientHeight, width: div.clientWidth};
             //
             // html2canvas(div, hoptions).then((canvas) => {
             //   // let a = document.createElement('a');
             //   // document.body.appendChild(a);
             //   // a.download = "test.png";
             //   // a.href =  canvas.toDataURL();
             //   // a.click();
             //
             //     //Initialize JSPDF
             //     let doc = new jsPDF("p", "mm", "a4");
             //     //Converting canvas to Image
             //     let imgData = canvas.toDataURL("image/PNG");
             //     //Add image Canvas to PDF
             //     doc.addImage(imgData, 'PNG', 20, 20);
             //
             //     let pdfOutput = doc.output();
             //     // using ArrayBuffer will allow you to put image inside PDF
             //     let buffer = new ArrayBuffer(pdfOutput.length);
             //     let array = new Uint8Array(buffer);
             //     for (let i = 0; i < pdfOutput.length; i++) {
             //         array[i] = pdfOutput.charCodeAt(i);
             //     }
             //
             //     //Name of pdf
             //     const fileName = "example.pdf";
             //
             //     // Make file
             //     doc.save(fileName);
             //
             // });

             this.printer.print(result, options).then(onSuccess => {
               console.log("onPrintSuccess2", onSuccess);
             }, onError => {
               console.log("onPrintError2", onError);
             });
           //})
      });
    }

    getInvoice(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.unserializeInvoice(doc_id).then(viewData => {
          resolve(viewData);
        });
      });
    }

    createInvoice(viewData){
      return new Promise((resolve, reject)=>{
        let invoice = this.serializeInvoice(viewData)
        this.pouchdbService.createDoc(invoice).then(doc => {
          resolve({doc: doc, invoice: invoice});
        });
      });
    }

    serializeInvoice(viewData){
      let invoice = Object.assign({}, viewData);
      invoice.lines = [];
      invoice.docType = 'invoice';
      delete invoice.payments;
      // delete invoice.planned;
      invoice.contact_id = invoice.contact._id;
      delete invoice.contact;
      invoice.items.forEach(item => {
        invoice.lines.push({
          product_id: item.product_id || item.product._id,
          quantity: item.quantity,
          price: item.price,
          description: item.description,
        })
      });
      delete invoice.items;
      return invoice;
    }

    unserializeInvoice(doc_id){
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
          let getList = [
            pouchData['contact_id'],
          ];
          pouchData['lines'].forEach((item) => {
            if (getList.indexOf(item['product_id'])==-1){
              getList.push(item['product_id']);
            }
          });
          this.pouchdbService.getList(getList).then((docs: any[])=>{
            var doc_dict = {};
            docs.forEach(row=>{
              doc_dict[row.id] = row.doc;
            })
            pouchData.contact = doc_dict[pouchData.contact_id] || {};
            pouchData['items'] = [];
            pouchData.lines.forEach((line: any)=>{
              pouchData['items'].push({
                'product': doc_dict[line.product_id],
                'description': doc_dict[line.product_id].name,
                'quantity': line.quantity,
                'price': line.price,
              })
            })
            resolve(pouchData);
          })
        }));
      });
    }

    updateInvoice(viewData){
      let invoice = this.serializeInvoice(viewData)
      return this.pouchdbService.updateDoc(invoice);
    }

    showNextButton(){
      // console.log("stock",this.invoiceForm.value.stock);
      if (this.invoiceForm.value.amount_paid==null&&this.invoiceForm.value.state=='DRAFT'){
        return true;
      }
      else if (this.invoiceForm.value.state=='DRAFT'){
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
        if(this.invoiceForm.dirty) {
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
        this.invoiceForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/receipt-list');
      }
    }

    selectCurrency() {
      return new Promise(async resolve => {
        this.events.subscribe('select-currency', (data) => {
          this.invoiceForm.patchValue({
            currency: data,
            // cash_id: data._id,
          });
          this.invoiceForm.markAsDirty();
          this.events.unsubscribe('select-currency');
          // profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: CurrencyListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
    }


}

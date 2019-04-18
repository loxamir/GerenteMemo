import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController, Platform, LoadingController, AlertController, Events, ToastController, ModalController, PopoverController} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer } from '@ionic-native/printer';
// import { SpeechRecognition } from '@ionic-native/speech-recognition';
// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ContactListPage } from '../contact-list/contact-list.page';
import { ProductService } from '../product/product.service';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
import { FormatService } from '../services/format.service';
import { ServiceWorkPage } from './work/work.page';
// import { ServiceTravelPage } from './travel/travel.page';
import { InvoicePage } from '../invoice/invoice.page';
import { ReceiptPage } from '../receipt/receipt.page';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ServicePopover } from './service.popover';
import { SocialSharing } from '@ionic-native/social-sharing';
import * as html2canvas from 'html2canvas';

@Component({
  selector: 'app-service',
  templateUrl: './service.page.html',
  styleUrls: ['./service.page.scss'],
})
export class ServicePage implements OnInit {
  @ViewChild('clrequest') clientRequest;
  // @ViewChild(Select) select: Select;
  // @HostListener('document:keypress', ['$event'])
  //   handleKeyboardEvent(event: KeyboardEvent) {
  //     //this.key = event.key;
  //     ////console.log("key", event);
  //     let timeStamp = event.timeStamp - this.timeStamp;
  //     this.timeStamp = event.timeStamp;
  //     //console.log("key", event.key);
  //     if(event.which === 13){ //ignore returns
  //           //console.log("enter", this.barcode);
  //           let toast = this.toastCtrl.create({
  //           message: "enter "+this.barcode,
  //           duration: 1000
  //           });
  //           toast.present();
  //           let found = false;
  //           this.serviceForm.value.inputs.forEach(item => {
  //             if (item.product.code == this.barcode){
  //               this.sumItem(item);
  //               //item.quantity += 1;
  //               found = true;
  //             }
  //           });
  //           if (!found){
  //             this.productService.getProductByCode(this.barcode).then(data => {
  //               //console.log("vars", data);
  //               this.serviceForm.value.inputs.push({
  //                 'quantity': 1,
  //                 'price': data.price,
  //                 'product': data,
  //                 'date': this.today,
  //               })
  //               this.recomputeValues();
  //               this.serviceForm.markAsDirty();
  //             });
  //           }
  //
  //           this.barcode = "";
  //           //return;
  //       }
  //       //console.log("timeStamp", timeStamp);
  //       if(!timeStamp || timeStamp < 5 || this.barcode == ""){
  //           //code = "";
  //           this.barcode += event.key;
  //       }
  //       if( event.which < 48 || event.which >= 58 ){ // not a number
  //           this.barcode = "";
  //       }
  //
  //       setTimeout(function(){
  //           //console.log("end");
  //           this.barcode = ""
  //       }, 30);
  //
  //   }
    select;
    timeStamp: any;
    barcode: string = "";
    serviceForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;
    // travel_product: object;
    labor_product: object;
    languages: Array<LanguageModel>;
    show_works: boolean = false;
    // show_travels: boolean = false;
    show_inputs: boolean = false;
    ignore_inputs: boolean = false;
    // ignore_travels: boolean = false;
    serviceNote;
    currency_precision = 2;

    constructor(
      public socialSharing: SocialSharing,
      public platform: Platform,
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public modalCtrl: ModalController,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      public productService: ProductService,
      public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      public modal: ModalController,
      // public speechRecognition: SpeechRecognition,
      // public tts: TextToSpeech,
      public pouchdbService: PouchdbService,
      public popoverCtrl: PopoverController,
    ) {
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.avoidAlertMessage = false;
    }

    async ngOnInit() {
      //var today = new Date().toISOString();
      this.serviceForm = this.formBuilder.group({
        contact: new FormControl('', Validators.required),
        name: new FormControl(''),
        contact_name: new FormControl(''),
        code: new FormControl(''),
        date: new FormControl(this.today),
        date_end: new FormControl(this.today),
        total: new FormControl(0),
        // travel_amount: new FormControl(0),
        price: new FormControl(0),
        work_amount: new FormControl(0),
        quantity: new FormControl(1),
        note: new FormControl(''),
        state: new FormControl('DRAFT'),
        // tab: new FormControl('service'),
        works: new FormControl([]),
        results: new FormControl([]),
        planned: new FormControl([]),
        product: new FormControl({}),
        residual: new FormControl(0),
        product_name: new FormControl(''),
        invoice: new FormControl(''),
        invoices: new FormControl([]),
        currency: new FormControl(''),
        weather: new FormControl(''),
        language: new FormControl(''),
        production: new FormControl(this.route.snapshot.paramMap.get('production')||false),
        location: new FormControl(''),
        description: new FormControl(''),
        equipment: new FormControl({}),
        // travels: new FormControl([]),
        inputs: new FormControl([]),
        payments: new FormControl([]),
        project: new FormControl({}),
        input_amount: new FormControl(0),
        paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        // equipment_number: new FormControl(''),
        // equipment_brand: new FormControl(''),
        // equipment_model: new FormControl(''),
        // equipment_note: new FormControl(''),
        client_request: new FormControl(''),
        service_overview: new FormControl(''),
        section: new FormControl('works'),

        responsable: new FormControl({}),
        _id: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      this.configService.getConfig().then((data) => {
        // console.log("dddata", data);
        // let config:any = (await this.pouchdbService.getDoc('config.profile'));
        this.currency_precision = data.currency_precision;
        this.serviceNote = data.serviceNote;
        this.labor_product = data.labor_product;
        // this.input_product = data.input_product;
        // this.travel_product = data.travel_product;
        if (this._id){
          this.getService(this._id).then((data) => {
            //console.log("data", data);
            this.serviceForm.patchValue(data);
            this.recomputeValues();
            this.loading.dismiss();
          });
        } else {
          this.loading.dismiss();
          if (!this.serviceForm.value.production){
            setTimeout(() => {
              this.clientRequest.setFocus();
            }, 700);
          }
        }
      });

    }

    async presentPopover(myEvent) {
      console.log("teste my event");
      let popover = await this.popoverCtrl.create({
        component: ServicePopover,
        event: myEvent,
        componentProps: {
          popoverController: this.popoverCtrl,
          doc: this
        }
      });
      popover.present();
    }


    async openItem(item) {
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
            "type": "product"
          }
        });
        await profileModal.present();
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          item.price = data.price;
          item.product = data;
          item.description = data.name;
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.serviceForm.markAsDirty();
          // this.buttonSave();
          profileModal.dismiss();
          this.events.unsubscribe('select-product');
        })
      }
    }

    async openPayment(item) {
      this.events.unsubscribe('open-receipt');
      let profileModal = await this.modalCtrl.create({
        component: ReceiptPage,
        componentProps: {
          "select": true,
          "_id": item._id,
        }
      });
      await profileModal.present();
      this.events.subscribe('open-receipt', (data) => {
        profileModal.dismiss();
        this.events.unsubscribe('open-receipt');
      });
      this.events.subscribe('cancel-receipt', (data) => {
        let newPayments = [];
        let residual = this.serviceForm.value.residual;
        this.serviceForm.value.payments.forEach((receipt, index)=>{
          if (receipt._id != data){
            this.serviceForm.value.payments.slice(index, 1);
            newPayments.push(receipt);
          } else {
            residual += receipt.paid;
          }
        })
        this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.serviceForm.value._id).then((planned) => {
          this.serviceForm.patchValue({
            payments: newPayments,
            residual: residual,
            state: 'CONFIRMED',
            planned: planned
          })
          this.buttonSave();
        });
        this.events.unsubscribe('cancel-receipt');
      });
    }

    recomputeResidual(){
      let residual = parseFloat(this.serviceForm.value.total);
      this.serviceForm.value.payments.forEach((item) => {
        residual -= parseFloat(item.paid || 0);
      });
      let state = this.serviceForm.value.state;
      if (this.serviceForm.value.total > 0 && residual == 0){
          state = "PAID";
      }
      this.serviceForm.patchValue({
        residual: residual,
        state: state,
      });
    }


    setSchedule() {
      if (this.serviceForm.value.production){
        if (Object.keys(this.serviceForm.value.contact).length === 0){
          this.selectProduct().then(()=>{
            this.serviceForm.patchValue({
              'state': "SCHEDULED",
            });
            this.buttonSave();
          });
        } else {
          this.serviceForm.patchValue({
            'state': "SCHEDULED",
          });
          this.buttonSave();
        }
      } else {
        if (Object.keys(this.serviceForm.value.contact).length === 0){
          this.selectContact().then(()=>{
            this.serviceForm.patchValue({
              'state': "SCHEDULED",
            });
            this.buttonSave();
          });
        } else {
          this.serviceForm.patchValue({
            'state': "SCHEDULED",
          });
          this.buttonSave();
        }
      }
    }
    setStarted() {
      if (this.serviceForm.value.production){
        if (Object.keys(this.serviceForm.value.product).length === 0){
          this.selectProduct().then(()=>{
            this.serviceForm.patchValue({
              'state': "STARTED",
            });
            this.buttonSave();
          });
        } else {
          this.serviceForm.patchValue({
            'state': "STARTED",
          });
          this.buttonSave();
        }
      } else {
        if (Object.keys(this.serviceForm.value.contact).length === 0){
          this.selectContact().then(()=>{
            this.serviceForm.patchValue({
              'state': "STARTED",
            });
            this.buttonSave();
          });
        } else {
          this.serviceForm.patchValue({
            'state': "STARTED",
          });
          this.buttonSave();
        }
      }
    }

    // listenRequest() {
    //   let options = {
    //     language: 'pt-BR'
    //   }
    //   this.speechRecognition.hasPermission()
    //   .then((hasPermission: boolean) => {
    //     if (!hasPermission) {
    //       this.speechRecognition.requestPermission();
    //     } else {
    //       this.speechRecognition.startListening(options).subscribe(matches => {
    //         this.serviceForm.patchValue({
    //           client_request: matches[0],
    //         });
    //         this.serviceForm.markAsDirty();
    //       });
    //     }
    //   });
    // }

    // listenService() {
    //   let options = {
    //     language: 'pt-BR'
    //   }
    //   this.speechRecognition.hasPermission()
    //   .then((hasPermission: boolean) => {
    //     if (!hasPermission) {
    //       this.speechRecognition.requestPermission();
    //     } else {
    //       this.tts.speak({
    //         text: "Diga oque deseja",
    //         //rate: this.rate/10,
    //         locale: "pt-BR"
    //       })
    //       .then(() => {
    //         //console.log('Success1');
    //         this.speechRecognition.startListening(options).subscribe(matches => {
    //           this.serviceForm.patchValue({
    //             service_overview: matches[0],
    //           });
    //         });
    //       })
    //       .catch((reason: any) => console.log(reason));
    //     }
    //   });
    // }

    // async ionViewCanLeave() {
    //     if(this.serviceForm.dirty && ! this.avoidAlertMessage) {
    //         let alertPopup = await this.alertCtrl.create({
    //             header: 'Descartar',
    //             message: '¿Deseas salir sin guardar?',
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
    //     this.serviceForm.markAsPristine();
    //     // this.navCtrl.navigateBack();
    // }

    // async goNextStep() {
    //   if (this.serviceForm.value.state == 'DRAFT' || this.serviceForm.value.state == 'SCHEDULED'){
    //     console.log("set Focus");
    //     if (this.serviceForm.value.client_request == '' && !this.serviceForm.value.production){
    //       this.clientRequest.setFocus();
    //     }
    //     else if (this.serviceForm.value.production){
    //       if (Object.keys(this.serviceForm.value.product).length === 0){
    //         this.selectProduct();
    //       } else {
    //         this.setStarted();
    //         return;
    //       }
    //     } else {
    //       if (Object.keys(this.serviceForm.value.contact).length === 0){
    //         this.selectContact();
    //       } else {
    //         this.setStarted();
    //         return;
    //       }
    //     }
    //   }
    //   else if (this.serviceForm.value.state == 'STARTED'){
    //     // if(!this.serviceForm.value._id){
    //     //   this.buttonSave();
    //     // }
    //     if (this.serviceForm.value.works.length==0){
    //       this.addWork();
    //     }
    //     else if (this.serviceForm.value.inputs.length==0 && ! this.ignore_inputs){
    //       console.log("ignore_inputs");
    //       let prompt = await this.alertCtrl.create({
    //         header: 'Productos Consumidos',
    //         message: 'Has consumido algun producto durante el trabajo?',
    //         buttons: [
    //           {
    //             text: 'No',
    //             handler: async data => {
    //               console.log("ignore_inputs");
    //
    //               this.ignore_inputs = true;
    //               if (!this.serviceForm.value.production){
    //                 let prompt = await this.alertCtrl.create({
    //                   header: 'Viaticos',
    //                   message: 'Has hecho algun viaje para realizar el trabajo?',
    //                   buttons: [
    //                     {
    //                       text: 'No',
    //                       handler: data => {
    //                         // this.addTravel();
    //                         this.ignore_travels = true;
    //                       }
    //                     },
    //                     {
    //                       text: 'Si',
    //                       handler: data => {
    //                         this.addTravel();
    //                       }
    //                     }
    //                   ]
    //                 });
    //                 prompt.present();
    //               }
    //             }
    //           },
    //           {
    //             text: 'Si',
    //             handler: data => {
    //               this.addInput();
    //               // item.description = data.description;
    //             }
    //           }
    //         ]
    //       });
    //
    //       prompt.present();
    //     }
    //     else if (this.serviceForm.value.travels.length==0 && ! this.ignore_travels && !this.serviceForm.value.production){
    //       console.log("ignore_travels");
    //       let prompt = await this.alertCtrl.create({
    //         header: 'Viaticos',
    //         message: 'Has hecho algun viaje para realizar el trabajo?',
    //         buttons: [
    //           {
    //             text: 'No',
    //             handler: data => {
    //               // this.addTravel();
    //               this.ignore_travels = true;
    //             }
    //           },
    //           {
    //             text: 'Si',
    //             handler: data => {
    //               this.addTravel();
    //             }
    //           }
    //         ]
    //       });
    //       prompt.present();
    //     }
    //     else {
    //       console.log("Confirm Service");
    //       this.beforeConfirm();
    //     }
    //   } else if (this.serviceForm.value.production){
    //     this.beforeConfirm();
    //   } else if (this.serviceForm.value.state == 'CONFIRMED'){
    //       this.beforeAddPayment();
    //   } else if (this.serviceForm.value.state == 'PAID'){
    //     if (this.serviceForm.value.invoices.length){
    //       // this.navCtrl.navigateBack();
    //     } else {
    //       this.addInvoice();
    //     }
    //   }
    // }

    // beforeConfirm(){
    //   //if ( this.serviceForm.value.product){
    //   if (Object.keys(this.serviceForm.value.contact).length === 0){
    //     this.selectContact().then(()=>{
    //       this.serviceConfirm();
    //     })
    //   } else {
    //     this.serviceConfirm();
    //   }
    // }

    beforeConfirm(){
      console.log("datos", this.serviceForm.value);
      if (this.serviceForm.value.production){
        this.pouchdbService.getDoc('contact.myCompany').then((contact: any)=>{
          this.serviceForm.patchValue({
            'contact': contact,
            'contact_name': contact && contact.name || "",
          });

          this.serviceConfirm();
        })
      }
      else {
        if (Object.keys(this.serviceForm.value.contact).length === 0){
          this.selectContact().then( teste => {
            if (Object.keys(this.serviceForm.value.paymentCondition).length === 0){
              this.selectPaymentCondition().then(()=>{
                this.serviceConfirm();
              });
            }
          });
        } else if (Object.keys(this.serviceForm.value.paymentCondition).length === 0){
          this.selectPaymentCondition().then(()=>{
            this.serviceConfirm();
          });
        } else {
          this.serviceConfirm();
        }
      }
    }

    showWorks(){
      this.show_works = !this.show_works;
      if (!this.serviceForm.value.works.length){
        this.addWork();
      }
    }

    // showTravels(){
    //   this.show_travels = !this.show_travels;
    //   if (!this.serviceForm.value.travels.length){
    //     this.addTravel();
    //   }
    // }

    showInputs(){
      this.show_inputs = !this.show_inputs;
      if (!this.serviceForm.value.inputs.length){
        this.addInput();
      }
    }

    async editDescription(item){
      if (this.serviceForm.value.state=='DRAFT'){
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
              text: 'Cancelar'
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

    selectPaymentCondition() {
      return new Promise(async resolve => {
      if (this.serviceForm.value.state=='STARTED' || this.serviceForm.value.state=='DRAFT' || this.serviceForm.value.state=='SCHEDULED'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-payment-condition');
        let profileModal = await this.modalCtrl.create({
          component: PaymentConditionListPage,
          componentProps: {
            "select": true
          }
        });
        await profileModal.present();
        this.events.subscribe('select-payment-condition', (data) => {
          this.serviceForm.patchValue({
            paymentCondition: data,
            payment_name: data.name,
          });
          this.serviceForm.markAsDirty();
          this.avoidAlertMessage = false;
          profileModal.dismiss();
          this.events.unsubscribe('select-payment-condition');
          resolve(data);
          //this.beforeAddPayment();
        })
      }
    });
    }

    addDays(date, days) {
      days = parseInt(days);
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    ionViewWillLeave(){
      //console.log("ionViewWillLeave");
      //this.navCtrl.navigateBack().then(() => {
        this.events.publish('create-service', this.serviceForm.value);
      //});
    }

    beforeAddPayment(){
      if (this.serviceForm.value.state == "DRAFT"){
        // this.afterConfirm().then(data => {
          this.addPayment();
        // });
      } else {
        this.addPayment();
      }
    }

      async addPayment() {
        this.avoidAlertMessage = true;
          this.events.unsubscribe('create-receipt');
          let plannedItems = [];
          this.serviceForm.value.planned.forEach(planned => {
            if (planned.amount_residual > 0){
              plannedItems.push(planned);
            }
          })
          let profileModal = await this.modalCtrl.create({
            component: ReceiptPage,
            componentProps: {
              "select": true,
              "addPayment": true,
              "contact": this.serviceForm.value.contact,
              "account_id": "account.income.sale",
              "project_id": this.serviceForm.value.project_id
              || this.serviceForm.value.project
              && this.serviceForm.value.project._id,
              "name": "Servicio "+this.serviceForm.value.code,
              "accountFrom_id": this.serviceForm.value.paymentCondition.accountTo_id,
              "items": plannedItems,
              "origin_id": this.serviceForm.value._id,
              "signal": "+",
              // "origin_ids": origin_ids,
            }
          });
          await profileModal.present();
          this.events.subscribe('create-receipt', (data) => {
              console.log("DDDDDDDATA", data);
              this.serviceForm.value.payments.push({
                'paid': data.paid,
                'date': data.date,
                'state': data.state,
                '_id': data._id,
              });
            this.serviceForm.patchValue({
              'residual': this.serviceForm.value.residual - data.paid,
            });
            this.recomputeValues();
            this.avoidAlertMessage = false;
            this.buttonSave();
            profileModal.dismiss();
            this.events.unsubscribe('create-receipt');
          });
          console.log("this.serviceForm.value.planned", this.serviceForm.value.planned);
          console.log("plannedItems", JSON.stringify(plannedItems));

      }

    async addInvoice() {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('create-invoice');
      let items = [];
      this.serviceForm.value.inputs.forEach(input=>{
        items.push({
          'product': input.product,
          'description': input.description,
          'price': parseFloat(input.price),
          'quantity': parseFloat(input.quantity),
        })
      });
      // let travel_sum = {
      //   'product': this.travel_product,
      //   'description': this.travel_product['name'],
      //   'price': 0,
      //   'quantity': 0,
      // }
      // let travel_total = 0;
      // this.serviceForm.value.travels.forEach(travel=>{
      //   travel_total += parseFloat(travel['distance']) * parseFloat(travel['price'])
      //   travel_sum['quantity'] += parseFloat(travel['distance']);
      // })
      // if (travel_sum['quantity'] > 0){
      //   travel_sum.price = travel_total/travel_sum['quantity'];
      //   items.unshift(travel_sum);
      // }
      let work_sum = {
        'product': this.labor_product,
        'description': this.labor_product['name'],
        'price': 0,
        'quantity': 0,
      }
      let labor_total = 0;
      this.serviceForm.value.works.forEach(work=>{
        labor_total += parseFloat(work['quantity']) * parseFloat(work['price'])
        work_sum['quantity'] += parseFloat(work['quantity']);
      })
      if (work_sum['quantity'] > 0){
        work_sum.price = labor_total/work_sum['quantity'];
        items.unshift(work_sum);
      }
      let paymentType = 'Credito';
      if (this.serviceForm.value.paymentCondition._id == 'payment-condition.cash'){
        paymentType = 'Contado';
      }
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "select": true,
          "paymentCondition": paymentType,
          "contact_id": this.serviceForm.value.contact._id,
          "contact": this.serviceForm.value.contact,
          "origin_id": this.serviceForm.value._id,
          "items": items,
          'type': 'out',
        }
      });
      await profileModal.present();
      this.events.subscribe('create-invoice', (data) => {
          this.serviceForm.value.invoices.push({
            'code': data.code,
            'date': data.date,
            'residual': data.residual,
            'total': data.total,
            'tax': data.tax,
            'state': data.state,
            '_id': data._id,
          });
        this.avoidAlertMessage = false;
        this.buttonSave();
        let plannedItems = [];
        this.serviceForm.value.planned.forEach(planned => {
          if (planned.amount_residual > 0){
            plannedItems.push(planned);
          }
        })
        this.events.unsubscribe('create-invoice');
      });

    }

    async openInvoice(item) {
      this.events.unsubscribe('open-invoice');
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "select": true,
          "_id": item._id,
        }
      });
      await profileModal.present();
      this.events.subscribe('open-invoice', (data) => {
        this.avoidAlertMessage = false;
        this.buttonSave();
        profileModal.dismiss();
        this.events.unsubscribe('open-invoice');
      });
    }

    buttonSave() {
      if (this._id){
        this.updateService(this.serviceForm.value);
        this.events.publish('open-service', this.serviceForm.value);
        this.serviceForm.markAsPristine();
      } else {
        this.createService(this.serviceForm.value).then(doc => {
          //console.log("docss", doc);
          this.serviceForm.patchValue({
            _id: doc['doc'].id,
            code: doc['service'].code,
          });
          this._id = doc['doc'].id;
          this.events.publish('create-service', this.serviceForm.value);
          this.serviceForm.markAsPristine();
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

    recomputeTotal(){
      // if (this.serviceForm.value.state=='DRAFT'){
        let total = this.serviceForm.value.work_amount +
          this.serviceForm.value.input_amount;
        this.serviceForm.patchValue({
          total: total,
        });
      // }
    }

    // recomputeTravels(){
    //   let travels = 0;
    //   this.serviceForm.value.travels.forEach((travel) => {
    //     if (this.serviceForm.value.production){
    //       travels += parseFloat(travel.distance || 0)*parseFloat(travel.cost || 0);
    //     } else {
    //       travels += parseFloat(travel.distance || 0)*parseFloat(travel.price || 0);
    //     }
    //   });
    //   console.log("travel", travels);
    //   this.serviceForm.patchValue({
    //     travel_amount: travels,
    //   });
    // }

    recomputeWorks(){
      let works = 0;
      this.serviceForm.value.works.forEach((work) => {
        if (this.serviceForm.value.production){
          works += parseFloat(work.quantity|| 0)*parseFloat(work.cost || 0);
        } else {
          works += parseFloat(work.quantity|| 0)*parseFloat(work.price || 0);
        }
      });
      this.serviceForm.patchValue({
        work_amount: works,
      });
    }

    recomputeInputs(){
      let inputs = 0;
      this.serviceForm.value.inputs.forEach((input) => {
        if (this.serviceForm.value.production){
          // works += parseFloat(work.quantity)*parseFloat(this.labor_product['cost']);
          inputs += parseFloat(input.quantity)*parseFloat(input.cost|| 0);
        } else {
          // works += parseFloat(work.quantity)*parseFloat(this.labor_product['price']);
          inputs += parseFloat(input.quantity)*parseFloat(input.price|| 0);
        }
      });
      this.serviceForm.patchValue({
        input_amount: inputs,
      });
    }

    async addWork(){
      // if (this.serviceForm.value.state=='DRAFT'){
        let profileModal = await this.modalCtrl.create({
          component: ServiceWorkPage,
          componentProps: {
            product: this.labor_product,
          }
        });
        await profileModal.present();
        let data: any = await profileModal.onDidDismiss();//data => {
          console.log("Work", data);
          if (data.data) {
            // data.data.cost = data.data.cost;
            // data.data.price = this.labor_product['price'];
            data.data.description = data.data.description || '';
            this.serviceForm.value.works.unshift(data.data)
            this.recomputeValues();
            this.serviceForm.markAsDirty();
            this.show_works=true;
            // this.buttonSave();
          }
        // });
      // }
    }

    async editWork(item){
      // if (this.serviceForm.value.state=='DRAFT'){
        let profileModal = await this.modalCtrl.create({
          component: ServiceWorkPage,
          componentProps: item
        });
        await profileModal.present();
        let data = await profileModal.onDidDismiss()
          if (data.data) {
            //console.log("asdf", data);
            Object.keys(data.data).forEach(key => {
              item[key] = data.data[key];
            })
            this.recomputeValues();
            this.serviceForm.markAsDirty();
            // this.buttonSave();
          }
        // });
      // }
    }

    async editWorkPrice(item){
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        let prompt = await this.alertCtrl.create({
          header: 'Precio del servicio',
          message: 'Cual es el precio de este servicio?',
          inputs: [
            {
              type: 'number',
              name: 'price',
              value: item.price
          },

          ],
          buttons: [
            {
              text: 'Cancelar'
            },
            {
              text: 'Confirmar',
              handler: data => {
                item.price = data.price;
                this.recomputeValues();
                this.serviceForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    removeWork(item){
      // if (this.serviceForm.value.state=='DRAFT'){
        let index = this.serviceForm.value.works.indexOf(item)
        this.serviceForm.value.works.splice(index, 1);
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      // }
    }


    // async addTravel(){
    //   // if (this.serviceForm.value.state=='DRAFT'){
    //     let profileModal = await this.modalCtrl.create({
    //       component: ServiceTravelPage,
    //       componentProps: {}
    //     });
    //     await profileModal.present();
    //     let data: any = await profileModal.onDidDismiss();
    //       if (data.data) {
    //         data.data.cost = this.travel_product['cost'];
    //         data.data.price = this.travel_product['price'];
    //         console.log(data);
    //         this.serviceForm.value.travels.unshift(data.data)
    //         this.recomputeValues();
    //         this.show_travels=true;
    //         this.serviceForm.markAsDirty();
    //         // this.buttonSave();
    //       }
    //     // });
    //   // }
    // }
    //
    // async editTravelPrice(item){
    //   if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
    //     let prompt = await this.alertCtrl.create({
    //       header: 'Precio del Viatico por km',
    //       message: 'Cual es el precio de este del viatico por km?',
    //       inputs: [
    //         {
    //           type: 'number',
    //           name: 'price',
    //           value: item.price
    //       },
    //
    //       ],
    //       buttons: [
    //         {
    //           text: 'Cancelar'
    //         },
    //         {
    //           text: 'Confirmar',
    //           handler: data => {
    //             item.price = data.price;
    //             this.recomputeValues();
    //             this.serviceForm.markAsDirty();
    //           }
    //         }
    //       ]
    //     });
    //
    //     prompt.present();
    //   }
    // }
    //
    // async editTravel(item){
    //   // if (this.serviceForm.value.state=='DRAFT'){
    //     let profileModal = await this.modalCtrl.create({
    //       component:ServiceTravelPage,
    //       componentProps: item
    //     });
    //     await profileModal.present();
    //     let data = await profileModal.onDidDismiss();
    //     if (data.data) {
    //       Object.keys(data.data).forEach(key => {
    //         item[key] = data.data[key];
    //       })
    //       this.recomputeValues();
    //       this.serviceForm.markAsDirty();
    //     }
    //     // });
    //   // }
    // }
    //
    // removeTravel(item){
    //   // if (this.serviceForm.value.state=='DRAFT'){
    //     let index = this.serviceForm.value.travels.indexOf(item)
    //     this.serviceForm.value.travels.splice(index, 1);
    //     this.recomputeValues();
    //     this.serviceForm.markAsDirty();
    //   // }
    // }

    async addInput(){
      // if (this.serviceForm.value.state=='DRAFT'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
            "type": "product",
          }
        });
        await profileModal.present();
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          if (data) {
            this.serviceForm.value.inputs.unshift({
              'quantity': 1,
              'price': data.price,
              'cost': data.cost,
              'product': data,
              'description': data.name,
              'date': this.today,
            })
            this.recomputeValues();
            this.serviceForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.show_inputs=true;
            // this.buttonSave();
            profileModal.dismiss();
            this.events.unsubscribe('select-product');
          }
        })
      // }
    }

    // editInput(item){
    //   // if (this.serviceForm.value.state=='DRAFT'){
    //     let profileModal = this.modalCtrl.create({ component:ServiceInputPage, item);
    //     let data: any profileModal.onDidDismiss();
    //       //console.log("ITEM", data);
    //       if (data) {
    //         Object.keys(data).forEach(key => {
    //           item[key] = data[key];
    //           //console.log(key, "1", data[key], "2", item[key]);
    //         })
    //         //console.log("Item", item);
    //         this.recomputeValues();
    //         this.serviceForm.markAsDirty();
    //         this.buttonSave();
    //       }
    //     });
    //     profileModal.present();
    //   // }
    // }

    removeInput(item){
      // if (this.serviceForm.value.state=='DRAFT'){
        let index = this.serviceForm.value.inputs.indexOf(item)
        this.serviceForm.value.inputs.splice(index, 1);
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      // }
    }
    sumWork(item) {
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      }
    }

    remWork(item) {
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      }
    }

    // sumTravel(item) {
    //   if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
    //     item.distance = parseFloat(item.distance)+1;
    //     this.recomputeValues();
    //     this.serviceForm.markAsDirty();
    //   }
    // }
    //
    // remTravel(item) {
    //   if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
    //     item.distance = parseFloat(item.distance)-1;
    //     this.recomputeValues();
    //     this.serviceForm.markAsDirty();
    //   }
    // }

    sumItem(item) {
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      }
    }

    remItem(item) {
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.serviceForm.markAsDirty();
      }
    }

    async editItemPrice(item){
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
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
              text: 'Cancelar'
            },
            {
              text: 'Confirmar',
              handler: data => {
                item.price = data.price;
                this.recomputeValues();
                this.serviceForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editItemQuantity(item){
      if (this.serviceForm.value.state!='CONFIRMED' && this.serviceForm.value.state!='PRODUCED'){
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
              text: 'Cancelar'
            },
            {
              text: 'Confirmar',
              handler: data => {
                item.quantity = data.quantity;
                this.recomputeValues();
                this.serviceForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editQuantity(){
      if (this.serviceForm.value.state=='DRAFT'){
        let prompt = await this.alertCtrl.create({
          header: 'Cantidad del Producto',
          message: 'Cual es el Cantidad de este producto?',
          inputs: [
            {
              type: 'number',
              name: 'quantity',
              value: this.serviceForm.value.quantity,
          },

          ],
          buttons: [
            {
              text: 'Cancelar'
            },
            {
              text: 'Confirmar',
              handler: data => {
                this.serviceForm.patchValue({
                  'quantity': data.quantity,
                })
                this.recomputeValues();
                this.serviceForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editPrice(){
      if (this.serviceForm.value.state=='DRAFT'){
        let prompt = await this.alertCtrl.create({
          header: 'Valor total esperado',
          message: 'Cual es el Cantidad de este producto?',
          inputs: [
            {
              type: 'number',
              name: 'price',
              value: this.serviceForm.value.price,
          },

          ],
          buttons: [
            {
              text: 'Cancelar'
            },
            {
              text: 'Confirmar',
              handler: data => {
                //console.log("service number", data.number);
                this.serviceForm.patchValue({
                  'price': data.price,
                });
                this.recomputeValues();
                this.serviceForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    recomputeValues() {
      // this.recomputeTravels();
      this.recomputeWorks();
      this.recomputeInputs();
      this.recomputeTotal();
      this.recomputeResidual();
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmService() {
      if (this.serviceForm.value.state=='STARTED'){
        this.beforeConfirm();
      }
    }

    async serviceConfirm(){
      let totalCost = this.serviceForm.value.total;
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas confirmar el servicio?',
        message: 'Si la confirmas no podras cambiar los productos ni el cliente',
        buttons: [
          {
            text: 'Cancelar',
            handler: data => {
              //console.log("Cancelar");
            }
          },
          {
            text: 'Confirmar',
            handler: data => {
              this.afterConfirm();
            }
          }
        ]
      });
      prompt.present();
    }


    afterConfirm(){
      return new Promise(resolve => {
        let totalCost = this.serviceForm.value.total;
        let warehouseTo_id = 'warehouse.client';
        let createList = [];
        if (this.serviceForm.value.production){
          warehouseTo_id = 'warehouse.production';
        }
        this.configService.getConfigDoc().then((config: any)=>{

          this.pouchdbService.getList([
            config.warehouse_id,
            warehouseTo_id,
            'account.other.stock',
            'account.expense.serviceCost',
            'warehouse.production',
            'account.income.service',
            this.serviceForm.value.paymentCondition.accountTo_id,
          ]).then((docList: any)=>{
            let docDict = {}
            docList.forEach(item=>{
              docDict[item.id] = item;
            })


            this.serviceForm.value.inputs.forEach((item) => {
              let product_id = item.product._id;
              let product_name = item.product && item.product.name;
              createList.push({
                'docType': "stock-move",
                'name': "Servicio "+this.serviceForm.value.code,
                'quantity': parseFloat(item.quantity),
                'origin_id': this.serviceForm.value._id,
                'contact_id': this.serviceForm.value.contact._id,
                'contact_name': this.serviceForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'date': new Date(),
                'cost': item.cost*item.quantity,
                'warehouseFrom_id': config.warehouse_id,
                'warehouseFrom_name': docDict[config.warehouse_id].doc.name,
                'warehouseTo_id': warehouseTo_id,
                'warehouseTo_name': docDict[warehouseTo_id].doc.name,
              })
              if (! this.serviceForm.value.production){
                createList.push({
                  'docType': "cash-move",
                  'name': "Servicio "+this.serviceForm.value.code,
                  'contact_id': this.serviceForm.value.contact._id,
                  'contact_name': this.serviceForm.value.contact.name,
                  'amount': item.quantity*(item.product.cost || 0),
                  'origin_id': this.serviceForm.value._id,
                  // "project_id": this.serviceForm.value.project_id,
                  'date': new Date(),
                  'accountFrom_id': 'account.other.stock',
                  'accountFrom_name': docDict['account.other.stock'].doc.name,
                  'accountTo_id': 'account.expense.serviceCost',
                  'accountTo_name': docDict['account.expense.serviceCost'].doc.name,
                })
              }
            });


            if (this.serviceForm.value.production){
              let product_id = this.serviceForm.value.product_id || this.serviceForm.value.product._id;
              let product_name = this.serviceForm.value.product.name || this.serviceForm.value.product_name;
              let unit_cost = this.serviceForm.value.input_amount/this.serviceForm.value.quantity;
              createList.push({
                'docType': "stock-move",
                'name': "Servicio "+this.serviceForm.value.code,
                'quantity': parseFloat(this.serviceForm.value.quantity),
                'origin_id': this.serviceForm.value._id,
                'contact_id': this.serviceForm.value.contact._id,
                'contact_name': this.serviceForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'date': new Date(),
                'cost': this.serviceForm.value.input_amount,
                'warehouseFrom_id': 'warehouse.production',
                'warehouseFrom_name': docDict['warehouse.production'].doc.name,
                'warehouseTo_id': config.warehouse_id,
                'warehouseTo_name': docDict[config.warehouse_id].doc.name,
              });
              this.productService.updateStockAndCost(
                product_id,
                this.serviceForm.value.quantity,
                this.serviceForm.value.input_amount/this.serviceForm.value.quantity,
                this.serviceForm.value.product.stock,
                this.serviceForm.value.product.cost);

            } else {
              this.serviceForm.value.paymentCondition.items.forEach(item => {
                let dateDue = this.addDays(this.today, item.days);
                console.log("dentro", this.serviceForm.value);
                let amount = (item.percent/100)*this.serviceForm.value.total;
                createList.push({
                  '_return': true,
                  'docType': "cash-move",
                  'date': new Date(),
                  'name': "Servicio "+this.serviceForm.value.code,
                  'contact_id': this.serviceForm.value.contact._id,
                  'contact_name': this.serviceForm.value.contact.name,
                  'amount': amount,
                  'amount_residual': amount,
                  'amount_unInvoiced': amount,
                  'payments': [],
                  'invoices': [],
                  'origin_id': this.serviceForm.value._id,
                  'dateDue': dateDue,
                  'accountFrom_id': 'account.income.service',
                  'accountFrom_name': docDict['account.income.service'].doc.name,
                  'accountTo_id': this.serviceForm.value.paymentCondition.accountTo_id,
                  'accountTo_name': docDict[this.serviceForm.value.paymentCondition.accountTo_id].doc.name,
                });
              });
            }
            let state;
            if (this.serviceForm.value.production){
              state = 'PRODUCED';
            } else {
              state = 'CONFIRMED';
            }
            this.pouchdbService.createDocList(createList).then((created: any)=>{
              this.serviceForm.patchValue({
                state: state,
                amount_unInvoiced: this.serviceForm.value.total,
                planned: created,
              });
              console.log("Purchase created", created);
              this.buttonSave();
              resolve(true);
            })
          })
        });
      });
    }

    async serviceCancel(){
      let name = "Desconfirmar";
      if (this.serviceForm.value.state != 'CONFIRMED'){
        name = "Volver a Borrador";
      }
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas '+name+' el Servicio?',
        message: 'Al '+name+' el Servicio todos los registros asociados serán borrados',
        buttons: [
          {
            text: 'No',
            handler: data => {
              //console.log("Cancelar");
            }
          },
          {
            text: 'Si',
            handler: data => {
              this.serviceForm.patchValue({
                 state: 'DRAFT',
              });
              this.removeQuotes();
              this.removeStockMoves();
              this.buttonSave();
            }
          }
        ]
      });
      prompt.present();
    }

    removeQuotes(){
      this.serviceForm.value.planned.forEach(planned => {
        //console.log("removed planned", planned);
        this.deleteService(planned);
      });
      this.serviceForm.patchValue({
        'planned': [],
      });
    }

    removeStockMoves(){
      this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.serviceForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.deleteService(doc);
        })
      });
    }

    onSubmit(values){
      //console.log(values);
    }

    selectContact() {
      //console.log("values");
      if (this.serviceForm.value.state!='PAID' && this.serviceForm.value.state!='CONFIRMED'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          let profileModal = await this.modalCtrl.create({
            component:ContactListPage,
            componentProps: {
              "select": true,
              "filter": "customer",
              "customer": true,
            }
          });
          await profileModal.present();
          this.events.subscribe('select-contact', (data) => {
            this.serviceForm.patchValue({
              contact: data,
              contact_name: data.name,
            });
            this.serviceForm.markAsDirty();
            this.avoidAlertMessage = false;
            profileModal.dismiss()
            this.events.unsubscribe('select-contact');
            resolve(data);
          })
        });
      }
    }

    // selectEquipment() {
    //   //console.log("values");
    //   if (this.serviceForm.value.state!='PAID'){
    //     return new Promise(resolve => {
    //       let profileModal = this.modalCtrl.create({ component:ServiceEquipmentPage, this.serviceForm.value.equipment);
    //       let data: any profileModal.onDidDismiss();
    //         //console.log(data);
    //         if (data) {
    //           this.serviceForm.patchValue({
    //             equipment: data,
    //           });
    //         }
    //       });
    //       profileModal.present();
    //     });
    //   }
    // }

    selectProduct() {
      if (this.serviceForm.value.state!='PAID'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-product');
          let profileModal = await this.modalCtrl.create({
            component:ProductListPage,
            componentProps: {
              "select": true,
            }
          });
          await profileModal.present();
          this.events.subscribe('select-product', (data) => {
            this.serviceForm.patchValue({
              product: data,
              product_name: data.name,
              price: data.price,
            });
            this.serviceForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.recomputeValues();
            profileModal.dismiss();
            this.events.unsubscribe('select-product');
            resolve(data);
          })
        });
      }
    }

    print() {
      if (this.platform.is('cordova')){
        this.configService.getConfigDoc().then( async (data) => {
          let company_name = data.name || "";
          let company_ruc = data.doc || "";
          let company_phone = data.phone || "";
          let date = this.serviceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
          date = date[2]+"/"+date[1]+"/"+date[0]
          let payment_condition = this.serviceForm.value.paymentCondition.name || "";
          let contact_name = this.serviceForm.value.contact.name || "";
          let code = this.serviceForm.value.code || "";
          let doc = this.serviceForm.value.contact.document || "";
          //let direction = this.serviceForm.value.contact.city || "";
          let phone = this.serviceForm.value.contact.phone || "";
          let lines = ""
          let ticket="";

          ticket += company_name+"\n";
          ticket += "Tel: "+company_phone+"\n";
          ticket += "\n";
          ticket += "ORDEN DE SERVICIO "+code+"\n";
          ticket += "Fecha: "+date+"\n";
          ticket += "Cliente: "+contact_name+"\n";
          ticket += "Tel: "+phone+"\n";
          let solicitud = this.formatService.breakString(this.serviceForm.value.client_request, data.ticketPrint.servicePaperWidth, data.ticketPrint.servicePaperWidth-12);
          ticket += "Solicitud: "+solicitud+"\n";
          lines = "";
          this.serviceForm.value.inputs.forEach(item => {
            let code = item.product.code;
            let quantity = item.quantity;
            let price = item.price;
            let subtotal = quantity*price;
            code = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*6/32), code).toString();
            quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*5/32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
            price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*9/32), price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*12/32), subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let product_name = this.formatService.string_pad(data.ticketPrint.servicePaperWidth, item.product.name.substring(0, data.ticketPrint.servicePaperWidth));
            lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
          });
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += "SERVICIOS PRESTADOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-19, "$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          // ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          let work_head = "";
          let work_head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), "Cantidad".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*8/32)));
          let work_head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), "Precio".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*10/32)), 'right');
          let work_head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), "SubTotal".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*14/32)), "right");
          work_head = work_head_quantity+work_head_price+work_head_subtotal+"\n";

          let work_lines = "";
          this.serviceForm.value.works.forEach(item => {

            let quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
            let price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            let subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let work_description = item.description.toString();
            work_lines += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            work_lines += work_description+"\n";
            work_lines += work_head;
            work_lines += quantity+price+subtotal+"\n"
          });
          ticket += work_lines;

          if (this.serviceForm.value.input_amount > 0){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-20, "$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*6/32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*6/32) - 1)).toString();
            let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*5/32) -1, "Cant".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*5/32) - 1));
            let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*9/32), "Precio".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*9/32)), 'right');
            let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*12/32) -1, "SubTotal".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*12/32) -1), "right");
            ticket += head_code+"|"+head_quantity+"|"+head_price+"|"+head_subtotal+"\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += lines;
          }
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += "TOTAL"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-5, "$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += this.formatService.breakString(data.ticketPrint.serviceComment, data.ticketPrint.servicePaperWidth)+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          if (data.ticketPrint.showServiceSign){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Tecnico\n";
          }
          if (data.ticketPrint.showServiceSignClient){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Cliente\n";
          }
          let i = data.ticketPrint.serviceMarginBottom;
          while(i>0){
            ticket += "\n";
            i--;
          }
          //
          // let company_name = data.name || "";
          // let company_ruc = data.doc || "";
          // let company_phone = data.phone || "";
          // let date = this.serviceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
          // date = date[2]+"/"+date[1]+"/"+date[0]
          // let contact_name = this.serviceForm.value.contact.name || "";
          // let code = this.serviceForm.value.code || "";
          // let doc = this.serviceForm.value.contact.document || "";
          // let phone = this.serviceForm.value.contact.phone || "";
          // let lines = ""
          // if (this.serviceForm.value.input_amount > 0){
          //   lines += "--------------------------------\n";
          //   lines += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(12, "G$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          //   lines += "--------------------------------\n";
          //   lines += "Cod.  Cant.   Precio   Sub-total\n";
          //   let totalExentas = 0;
          //   let totalIva5 = 0;
          //   let totalIva10 = 0;
          //   this.serviceForm.value.inputs.forEach(item => {
          //     let code = item.product.code;
          //     let quantity = item.quantity;
          //     let price = item.price;
          //     let subtotal = quantity*price;
          //     let exenta = 0;
          //     let iva5 = 0;
          //     let iva10 = 0;
          //     if (item.product.tax == "iva10"){
          //       iva10 = item.quantity*item.price;
          //       totalIva10 += iva10;
          //     } else if (item.product.tax == "exenta"){
          //       exenta = item.quantity*item.price;
          //       totalExentas += exenta;
          //     } else if (item.product.tax == "iva5"){
          //       iva5 = item.quantity*item.price;
          //       totalIva5 += iva5;
          //     }
          //     code = this.formatService.string_pad(6, code.toString());
          //     quantity = this.formatService.string_pad(5, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          //     price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          //     subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          //     let product_name = this.formatService.string_pad(32, item.product.name.substring(0, 32));
          //     lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
          //   });
          // }
          // let work_lines = "";
          // work_lines += "--------------------------------\n";
          // work_lines += "SERVICIOS PRESTADOS"+this.formatService.string_pad(13, "G$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          // this.serviceForm.value.works.forEach(item => {
          //
          //   let quantity = this.formatService.string_pad(8, item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          //   let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          //   let subtotal = this.formatService.string_pad(14, (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          //   let work_description = this.formatService.breakString(item.description.toString(), 32);
          //   work_lines += "--------------------------------\n";
          //   work_lines += work_description+"\n";
          //   work_lines += "Cantidad    Precio     Sub-total\n";
          //   work_lines += quantity+price+subtotal+"\n"
          // });
          // let totalAmount = this.serviceForm.value.total;
          // totalAmount = this.formatService.string_pad(16, totalAmount, "right");
          // let ticket=""
          // ticket += company_name+"\n";
          // ticket += "Tel: "+company_phone+"\n";
          // ticket += "\n";
          // ticket += "ORDEN DE SERVICIO "+code+"\n";
          // ticket += "Fecha: "+date+"\n";
          // ticket += "Cliente: "+contact_name+"\n";
          // ticket += "Tel: "+phone+"\n";
          // let solicitud = this.formatService.breakString(this.serviceForm.value.client_request, 32, 32-12);
          // ticket += "Solicitud: "+solicitud+"\n";
          // ticket += "\n";
          // ticket += work_lines;
          // ticket += lines;
          // ticket += "--------------------------------\n";
          // ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          // ticket += "--------------------------------\n";
          // ticket += this.formatService.breakString(this.serviceNote, 32)+"\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "--------------------------------\n";
          // ticket += "Firma del tecnico\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "--------------------------------\n";
          // ticket += "Firma del cliente: "+contact_name+"\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";
          // ticket += "\n";


          console.log("\n"+ticket);
          // Print to bluetooth printer
          let toast = await this.toastCtrl.create({
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
      } else {
        this.printMatrix();
      }
    }

    printMatrix(){
      var prefix = "Servicio_";
      var extension = ".prt";
      this.configService.getConfigDoc().then(async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        let date = this.serviceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        let payment_condition = this.serviceForm.value.paymentCondition.name || "";
        let contact_name = this.serviceForm.value.contact.name || "";
        let code = this.serviceForm.value.code || "";
        let doc = this.serviceForm.value.contact.document || "";
        //let direction = this.serviceForm.value.contact.city || "";
        let phone = this.serviceForm.value.contact.phone || "";
        let lines = ""
        let ticket="";
        if (data.ticketPrint.servicePaperWidth >= 80){
          ticket += this.formatService.string_pad(
            data.ticketPrint.servicePaperWidth, " "+
            company_name.substring(0, data.ticketPrint.servicePaperWidth/3)+
            " - Tel: "+company_phone.substring(0, data.ticketPrint.servicePaperWidth/3)+" ",
            'center', '-')+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, ("Servicio: "+code).substring(0, data.ticketPrint.servicePaperWidth/2-5));
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, ("Fecha: "+(new Date(this.serviceForm.value.date)).toLocaleString('es-PY')).substring(0, data.ticketPrint.servicePaperWidth/2-5))+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, ("Cliente: "+this.serviceForm.value.contact.name).substring(0, data.ticketPrint.servicePaperWidth/2-5));
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, ("Telefono: "+phone).substring(0, data.ticketPrint.servicePaperWidth/2-5))+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          let solicitud = this.formatService.breakString(this.serviceForm.value.client_request, data.ticketPrint.servicePaperWidth, data.ticketPrint.servicePaperWidth-23);
          ticket += "Solicitud del Cliente: "+solicitud+"\n";
          // ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          lines = "";
          this.serviceForm.value.works.forEach(item => {
            let code = item.product.code;
            let quantity = item.quantity;
            let price = item.price;
            let subtotal = quantity*price;
            code = this.formatService.string_pad(6, code).toString();
            quantity = this.formatService.string_pad(8, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            price = this.formatService.string_pad(11, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let product_name = this.formatService.string_pad(data.ticketPrint.servicePaperWidth -(6+8+11+12)-6, item.description.toString().substring(0, data.ticketPrint.servicePaperWidth/2));
            lines += "|"+code+"|"+quantity+"|"+product_name+"|"+price+"|"+subtotal+"|\n";
          });
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          let product_description = this.formatService.string_pad(data.ticketPrint.servicePaperWidth -(6+8+11+12)-6, "Descripción");
          ticket += "|Codigo|Cantidad|"+product_description+"|   Precio  |  Subtotal  |\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += lines;
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += "SERVICIOS PRESTADOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-20, "$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          if (this.serviceForm.value.input_amount > 0){
            lines = ""
            this.serviceForm.value.inputs.forEach(item => {
              let code = item.product.code;
              let quantity = item.quantity;
              let price = item.price;
              let subtotal = quantity*price;
              code = this.formatService.string_pad(6, code).toString();
              quantity = this.formatService.string_pad(8, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
              price = this.formatService.string_pad(11, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
              subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
              let product_name = this.formatService.string_pad(data.ticketPrint.servicePaperWidth -(6+8+11+12)-6, item.product.name.substring(0, data.ticketPrint.servicePaperWidth/2));
              lines += "|"+code+"|"+quantity+"|"+product_name+"|"+price+"|"+subtotal+"|\n";
            });
            product_description = this.formatService.string_pad(data.ticketPrint.servicePaperWidth -(6+8+11+12)-6, "Descripción");
            ticket += "|Codigo|Cantidad|"+product_description+"|   Precio  |  Subtotal  |\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += lines;
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-21, "$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          }


          // ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          // ticket += "SERVICIOS PRESTADOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-19, "$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          // // ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          // let work_head = "";
          // let work_head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), "Cantidad".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*8/32)));
          // let work_head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), "Precio".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*10/32)), 'right');
          // let work_head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), "SubTotal".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*14/32)), "right");
          // work_head = work_head_quantity+work_head_price+work_head_subtotal+"\n";
          //
          // let work_lines = "";
          // this.serviceForm.value.works.forEach(item => {
          //
          //   let quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
          //   let price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          //   let subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          //   // let work_description = item.description.toString();
          //   let work_description = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), item.description.substring(0, Math.floor(data.ticketPrint.servicePaperWidth*14/32)), "right");
          //   work_lines += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          //   work_lines += work_description;
          //   work_lines += work_head;
          //   work_lines += quantity+price+subtotal+"\n"
          // });
          // ticket += work_lines;

          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth,
            "Valor Total:"+this.formatService.string_pad(
              14, "$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+" ",
             'right', ' '
          )+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += this.formatService.breakString(data.ticketPrint.serviceComment, data.ticketPrint.servicePaperWidth)+"\n";
          if (data.ticketPrint.showServiceSign || data.ticketPrint.showServiceSignClient){
            ticket += "\n";
            ticket += "\n";
          }
          if (data.ticketPrint.showServiceSign){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, "", 'center', '_');
            ticket += "          ";
          }
          if (data.ticketPrint.showServiceSignClient){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, "", 'center', '_')+"\n";
          }
          if (data.ticketPrint.showServiceSign){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, "Firma del Tecnico ", 'center', ' ');
            ticket += "          ";
          }
          if (data.ticketPrint.showServiceSignClient){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth/2-5, "Firma del cliente", 'center', ' ')+"\n";
          }
          let i = data.ticketPrint.serviceMarginBottom;
          while(i>0){
            ticket += "\n";
            i--;
          }
        } else {
          ticket += company_name+"\n";
          ticket += "Tel: "+company_phone+"\n";
          ticket += "\n";
          ticket += "ORDEN DE SERVICIO "+code+"\n";
          ticket += "Fecha: "+date+"\n";
          ticket += "Cliente: "+contact_name+"\n";
          ticket += "Tel: "+phone+"\n";
          let solicitud = this.formatService.breakString(this.serviceForm.value.client_request, data.ticketPrint.servicePaperWidth, data.ticketPrint.servicePaperWidth-12);
          ticket += "Solicitud: "+solicitud+"\n";
          lines = "";
          this.serviceForm.value.inputs.forEach(item => {
            let code = item.product.code;
            let quantity = item.quantity;
            let price = item.price;
            let subtotal = quantity*price;
            code = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*6/32), code).toString();
            quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*5/32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
            price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*9/32), price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*12/32), subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let product_name = this.formatService.string_pad(data.ticketPrint.servicePaperWidth, item.product.name.substring(0, data.ticketPrint.servicePaperWidth));
            lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
          });
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += "SERVICIOS PRESTADOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-19, "$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          // ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          let work_head = "";
          let work_head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), "Cantidad".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*8/32)));
          let work_head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), "Precio".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*10/32)), 'right');
          let work_head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), "SubTotal".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*14/32)), "right");
          work_head = work_head_quantity+work_head_price+work_head_subtotal+"\n";

          let work_lines = "";
          this.serviceForm.value.works.forEach(item => {

            let quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*8/32), item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
            let price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*10/32), item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            let subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*14/32), (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let work_description = item.description.toString();
            work_lines += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            work_lines += work_description+"\n";
            work_lines += work_head;
            work_lines += quantity+price+subtotal+"\n"
          });
          ticket += work_lines;

          if (this.serviceForm.value.input_amount > 0){
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-20, "$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*6/32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*6/32) - 1)).toString();
            let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*5/32) -1, "Cant".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*5/32) - 1));
            let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*9/32), "Precio".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*9/32)), 'right');
            let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.servicePaperWidth*12/32) -1, "SubTotal".substring(0, Math.floor(data.ticketPrint.servicePaperWidth*12/32) -1), "right");
            ticket += head_code+"|"+head_quantity+"|"+head_price+"|"+head_subtotal+"\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += lines;
          }
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += "TOTAL"+this.formatService.string_pad(data.ticketPrint.servicePaperWidth-5, "$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          ticket += this.formatService.breakString(data.ticketPrint.serviceComment, data.ticketPrint.servicePaperWidth)+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
          if (data.ticketPrint.showServiceSign){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Tecnico\n";
          }
          if (data.ticketPrint.showServiceSignClient){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.servicePaperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Cliente\n";
          }
          let i = data.ticketPrint.serviceMarginBottom;
          while(i>0){
            ticket += "\n";
            i--;
          }
        }
        // console.log("ticket", ticket);
        this.formatService.printMatrixClean(ticket, prefix + this.serviceForm.value.code + extension);
        let toast = await this.toastCtrl.create({
          message: "Imprimiendo...",
          duration: 3000
        });
        toast.present();
      });
    }

  printMatrix2(){
    var prefix = "servicio_";
    var extension = ".prt";
    this.configService.getConfigDoc().then( async (data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      let date = this.serviceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      let contact_name = this.serviceForm.value.contact.name || "";
      let code = this.serviceForm.value.code || "";
      let doc = this.serviceForm.value.contact.document || "";
      let phone = this.serviceForm.value.contact.phone || "";
      let lines = ""
      if (this.serviceForm.value.input_amount > 0){
        lines += "--------------------------------\n";
        lines += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(12, "G$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        lines += "--------------------------------\n";
        lines += "Cod.  Cant.   Precio   Sub-total\n";
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.serviceForm.value.inputs.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
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
          code = this.formatService.string_pad(6, code.toString());
          quantity = this.formatService.string_pad(5, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(32, item.product.name.substring(0, 32));
          lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
        });
      }
      let work_lines = "";
      work_lines += "--------------------------------\n";
      work_lines += "SERVICIOS PRESTADOS"+this.formatService.string_pad(13, "G$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      this.serviceForm.value.works.forEach(item => {

        let quantity = this.formatService.string_pad(8, item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
        let subtotal = this.formatService.string_pad(14, (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        let work_description = item.description.toString();
        work_lines += "--------------------------------\n";
        work_lines += work_description+"\n";
        work_lines += "Cantidad    Precio     Sub-total\n";
        work_lines += quantity+price+subtotal+"\n"
      });
      let totalAmount = this.serviceForm.value.total;
      totalAmount = this.formatService.string_pad(16, totalAmount, "right");
      let ticket=""
      ticket += company_name+"\n";
      ticket += "Tel: "+company_phone+"\n";
      ticket += "\n";
      ticket += "ORDEN DE SERVICIO "+code+"\n";
      ticket += "Fecha: "+date+"\n";
      ticket += "Cliente: "+contact_name+"\n";
      ticket += "Tel: "+phone+"\n";
      ticket += "Solicitud: "+this.serviceForm.value.client_request+"\n";
      ticket += "\n";
      ticket += work_lines;
      ticket += lines;
      ticket += "--------------------------------\n";
      ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      ticket += "--------------------------------\n";
      ticket += this.formatService.breakString(this.serviceNote, 32)+"\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += "--------------------------------\n";
      ticket += "Firma del tecnico\n";
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


      console.log("\n"+ticket);
      this.formatService.printMatrixClean(ticket, prefix + this.serviceForm.value.code + extension);
      let toast = await this.toastCtrl.create({
        message: "Imprimiendo...",
        duration: 3000
      });
      toast.present();

    })
  }

  share() {
    this.configService.getConfigDoc().then( async (data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      //let number = this.serviceForm.value.invoice || "";
      let date = this.serviceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      // let project = this.serviceForm.value.project.name || "";
      let contact_name = this.serviceForm.value.contact.name || "";
      let code = this.serviceForm.value.code || "";
      let doc = this.serviceForm.value.contact.document || "";
      //let direction = this.serviceForm.value.contact.city || "";
      let phone = this.serviceForm.value.contact.phone || "";
      let lines = ""
      if (this.serviceForm.value.input_amount > 0){
        lines += "--------------------------------\n";
        lines += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(12, "G$ "+this.serviceForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";

        lines += "--------------------------------\n";
        lines += "Cod.  Cant.   Precio   Sub-total\n";
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.serviceForm.value.inputs.forEach(item => {
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
          code = this.formatService.string_pad(6, code.toString());
          quantity = this.formatService.string_pad(5, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(32, item.product.name.substring(0, 32));
          lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
        });
      }
      let work_lines = "";
      // this.formatService.string_pad(9, this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      work_lines += "--------------------------------\n";
      work_lines += "SERVICIOS PRESTADOS"+this.formatService.string_pad(13, "G$ "+this.serviceForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      // work_lines += "Tiempo    Precio       Sub-total\n";
      this.serviceForm.value.works.forEach(item => {

        let quantity = this.formatService.string_pad(8, item.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
        let subtotal = this.formatService.string_pad(14, (item.price*item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        let work_description = this.formatService.breakString(item.description.toString(), 32);
        work_lines += "--------------------------------\n";
        work_lines += work_description+"\n";
        work_lines += "Cantidad    Precio     Sub-total\n";
        work_lines += quantity+price+subtotal+"\n"
      });

      // let travel_lines = "";
      // if (this.serviceForm.value.travel_amount > 0){
      //   if (this.serviceForm.value.travels.length>0){
      //     travel_lines += "--------------------------------\n";
      //     travel_lines += "VIATICOS"+this.formatService.string_pad(24, "G$ "+this.serviceForm.value.travel_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      //     travel_lines += "--------------------------------\n";
      //     travel_lines += "Distancia   Precio     Sub-total\n";
      //   }
      //   this.serviceForm.value.travels.forEach(item => {
      //     let quantity = this.formatService.string_pad(8, item.distance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+" km");
      //     let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
      //     let subtotal = this.formatService.string_pad(14, (item.price*item.distance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
      //     travel_lines += quantity+price+subtotal+"\n";
      //   });
      // }

      let totalAmount = this.serviceForm.value.total;
      totalAmount = this.formatService.string_pad(16, totalAmount, "right");
      let ticket='<div style="font-family: monospace;width: 310px;background: #fffae3;word-break: break-all;"><pre>';
      ticket += company_name+"\n";
      // ticket += "Ruc: "+company_ruc+"\n";
      ticket += "Tel: "+company_phone+"\n";
      ticket += "\n";
      ticket += "ORDEN DE SERVICIO "+code+"\n";
      ticket += "Fecha: "+date+"\n";
      ticket += "Cliente: "+contact_name+"\n";
      ticket += "Tel: "+phone+"\n";
      let solicitud = this.formatService.breakString(this.serviceForm.value.client_request, 32, 32-12);
      ticket += "Solicitud: "+solicitud+"\n";
      // ticket += "Ruc: "+doc+"\n";
      // ticket += "\n";
      // ticket += "Local: "+project+"\n";
      ticket += "\n";
      ticket += work_lines;
      ticket += lines;
      // ticket += travel_lines;
      ticket += "--------------------------------\n";
      ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+this.serviceForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
      ticket += "--------------------------------\n";
      ticket += this.formatService.breakString(this.serviceNote, 32)+"\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "--------------------------------\n";
      // ticket += "Firma del tecnico\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "--------------------------------\n";
      // ticket += "Firma del cliente: "+contact_name+"\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      // ticket += "\n";
      ticket += "\n</pre></div>";


      console.log("\n"+ticket);


      //console.log("ticket", ticket);


      // Print to bluetooth printer
      // let toast = await this.toastCtrl.create({
      // message: "Start ",
      // duration: 3000
      // });
      // toast.present();
      // this.bluetoothSerial.isEnabled().then(res => {
      //   this.bluetoothSerial.list().then((data)=> {
      //     this.bluetoothSerial.connect(data[0].id).subscribe((data)=>{
      //       this.bluetoothSerial.isConnected().then(res => {
      //         // |---- 32 characteres ----|
      //         this.bluetoothSerial.write(ticket);
      //         this.bluetoothSerial.disconnect();
      //       }).catch(res => {
      //           //console.log("res1", res);
      //       });
      //    },error=>{
      //      //console.log("error", error);
      //    });
      //  })
      // }).catch(res => {
      //   //console.log("res", res);
      // });
      const div = document.getElementById("htmltoimage");
      div.innerHTML = ticket;
      const options = {background:"white",height :div.clientHeight , width : 310  };


      // let teste = document.getElementById("htmltoimage");
      // console.log("teste element", div);
     html2canvas(div, options).then(canvas => {
       // console.log("canvas", canvas);
       if (this.platform.is('cordova')){
         var contentType = "image/png";
         this.socialSharing.share(
           "Valor Total "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
           "Servicio "+code,
           canvas.toDataURL()
         )
       } else {
         let a = document.createElement('a');
         document.body.appendChild(a);
         a.download = "Servicio-"+code+".png";
         a.href =  canvas.toDataURL();
         a.click();
       }


      //console.log("share sucess");
      // if cordova.file is not available use instead :
      // var folderpath = "file:///storage/emulated/0/Download/";
      // var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
      //console.log("folderpath", folderpath);
      // this.formatService.savebase64AsPDF(
      // canvas.toDataURL(), "Presupuesto.png", canvas, contentType);
    });
    });
  }

    getService(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.unserializeService(doc_id).then(viewData => {
          resolve(viewData);
        });
      });
    }

    createService(viewData){
      return new Promise((resolve, reject)=>{
        let service = this.serializeService(viewData)
        this.configService.getSequence('service').then((code) => {
          service['code'] = code;
          this.pouchdbService.createDoc(service).then(doc => {
            resolve({doc: doc, service: service});
          });
        });
      });
    }

    serializeService(viewData){
      let service = Object.assign({}, viewData);
      service.lines = [];
      service.docType = 'service';
      delete service.planned;
      // delete service.payments;
      service.contact_id = service.contact._id;
      delete service.contact;

      service.pay_cond_id = service.paymentCondition._id;
      delete service.paymentCondition;
      // service.project_id = service.project._id;
      // delete service.project;
      service.inputs.forEach(input => {
        service.lines.push({
          product_id: input.product_id || input.product._id,
          product_name: input.product.name || input.product_name,
          description: input.description,
          quantity: input.quantity,
          price: input.price,
          cost: input.cost,
        })
        //input['product_id'] = input.product_id || input.product._id;
      });
      delete service.inputs;
      return service;
    }

    unserializeService(doc_id){
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
          let getList = [
            pouchData['contact_id'],
            pouchData['pay_cond_id']
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
            pouchData.paymentCondition = doc_dict[pouchData.pay_cond_id] || {};
            let index=2;
            pouchData['inputs'] = [];
            pouchData.lines.forEach((line: any)=>{
              pouchData['inputs'].push({
                'product': doc_dict[line.product_id],
                'description': line.description,
                'quantity': line.quantity,
                'price': line.price,
                'cost': line.cost,
              })
            })

            this.pouchdbService.getRelated(
            "cash-move", "origin_id", doc_id).then((planned) => {
              pouchData['planned'] = planned;
              resolve(pouchData);
            });
          })
        }));
      });
    }

    // unserializeService(doc_id){
    //   return new Promise((resolve, reject)=>{
    //     return this.pouchdbService.getDoc(doc_id).then((pouchData => {
    //       let promise_ids = []
    //       let index = 0;
    //       let get_contact = false;
    //       let get_responsable = false;
    //       // let project_id = false;
    //       ////console.log("pouchData",pouchData);
    //       if (pouchData['contact_id']){
    //         promise_ids.push(this.pouchdbService.getDoc(pouchData['contact_id']));
    //         get_contact = true;
    //         index += 1;
    //       }
    //       if (pouchData['responsable_id']){
    //         get_responsable = true;
    //         promise_ids.push(this.pouchdbService.getDoc(pouchData['responsable_id']));
    //         index += 1;
    //       }
    //       pouchData['lines'].forEach((input) => {
    //         promise_ids.push(this.productService.getProduct(input['product_id']));
    //       });
    //       pouchData['inputs'] = [];
    //       Promise.all(promise_ids).then((promise_data) => {
    //         if (get_contact){
    //           pouchData['contact'] = promise_data[0];
    //         }
    //         if (get_responsable){
    //           pouchData['responsable'] = promise_data[1];
    //         }
    //         for(let i=index;i<pouchData['lines'].length+index;i++){
    //           pouchData['inputs'].push({
    //             'product': promise_data[i],
    //             'description': pouchData['lines'][i-index]['description'],
    //             'quantity': pouchData['lines'][i-index]['quantity'],
    //             'price': pouchData['lines'][i-index]['price'],
    //             'cost': pouchData['lines'][i-index]['cost'],
    //           })
    //         }
    //         this.pouchdbService.getRelated(
    //         "cash-move", "origin_id", doc_id).then((planned) => {
    //           console.log("Planned", planned);
    //           pouchData['planned'] = planned;
    //           resolve(pouchData);
    //         });
    //       });
    //     }));
    //   });
    // }

    updateService(viewData){
      let service = this.serializeService(viewData)
      return this.pouchdbService.updateDoc(service);
    }

    deleteService(service){
    //  if (service.state == 'DRAFT'){
        return this.pouchdbService.deleteDoc(service);
    //  }
    }

    showNextButton(){
      // console.log("stock",this.serviceForm.value.stock);
      if (this.serviceForm.value.state=='PAID'){
        return false;
      }
      else if (this.serviceForm.value.state=='PRODUCED'){
        return false;
      }
      // else if (this.serviceForm.value.price==null){
      //   return true;
      // }
      // else if (this.serviceForm.value.cost==null){
      //   return true;
      // }
      // else if (this.serviceForm.value.type=='product'&&this.serviceForm.value.stock==null){
      //   return true;
      // }
      else {
        return true;
      }
    }
    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.serviceForm.dirty) {
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
        this.serviceForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/service-list');
      }
    }

}

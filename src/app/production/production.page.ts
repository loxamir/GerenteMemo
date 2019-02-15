import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { NavController,  LoadingController, AlertController, Events, ToastController, ModalController, PopoverController} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer } from '@ionic-native/printer';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
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
import { ProductionWorkPage } from './work/work.page';
// import { ServiceTravelPage } from './travel/travel.page';
import { InvoicePage } from '../invoice/invoice.page';
import { ReceiptPage } from '../receipt/receipt.page';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductionPopover } from './production.popover';

@Component({
  selector: 'app-production',
  templateUrl: './production.page.html',
  styleUrls: ['./production.page.scss'],
})
export class ProductionPage implements OnInit {
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
  //           this.productionForm.value.inputs.forEach(item => {
  //             if (item.product.code == this.barcode){
  //               this.sumItem(item);
  //               //item.quantity += 1;
  //               found = true;
  //             }
  //           });
  //           if (!found){
  //             this.productProduction.getProductByCode(this.barcode).then(data => {
  //               //console.log("vars", data);
  //               this.productionForm.value.inputs.push({
  //                 'quantity': 1,
  //                 'price': data.price,
  //                 'product': data,
  //                 'date': this.today,
  //               })
  //               this.recomputeValues();
  //               this.productionForm.markAsDirty();
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
    productionForm: FormGroup;
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

    constructor(
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
      public speechRecognition: SpeechRecognition,
      public tts: TextToSpeech,
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
      this.productionForm = this.formBuilder.group({
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
        state: new FormControl('QUOTATION'),
        // tab: new FormControl('production'),
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
        production_overview: new FormControl(''),

        responsable: new FormControl({}),
        _id: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      this.configService.getConfig().then((data) => {
        console.log("dddata", data);
        this.labor_product = data.labor_product;
        // this.input_product = data.input_product;
        // this.travel_product = data.travel_product;
        if (this._id){
          this.getProduction(this._id).then((data) => {
            //console.log("data", data);
            this.productionForm.patchValue(data);
            this.recomputeValues();
            this.loading.dismiss();
          });
        } else {
          this.loading.dismiss();
          if (!this.productionForm.value.production){
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
        component: ProductionPopover,
        event: myEvent,
        componentProps: {
          popoverController: this.popoverCtrl,
          doc: this
        }
      });
      popover.present();
    }


    async openItem(item) {
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
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
          this.productionForm.markAsDirty();
          this.buttonSave();
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
    }

    recomputeResidual(){
      let residual = parseFloat(this.productionForm.value.total);
      this.productionForm.value.payments.forEach((item) => {
        residual -= parseFloat(item.paid || 0);
      });
      let state = this.productionForm.value.state;
      if (this.productionForm.value.total > 0 && residual == 0){
          state = "PAID";
      }
      this.productionForm.patchValue({
        residual: residual,
        state: state,
      });
    }


    setSchedule() {
      if (this.productionForm.value.production){
        if (Object.keys(this.productionForm.value.contact).length === 0){
          this.selectProduct().then(()=>{
            this.productionForm.patchValue({
              'state': "SCHEDULED",
            });
            this.buttonSave();
          });
        } else {
          this.productionForm.patchValue({
            'state': "SCHEDULED",
          });
          this.buttonSave();
        }
      } else {
        if (Object.keys(this.productionForm.value.contact).length === 0){
          this.selectContact().then(()=>{
            this.productionForm.patchValue({
              'state': "SCHEDULED",
            });
            this.buttonSave();
          });
        } else {
          this.productionForm.patchValue({
            'state': "SCHEDULED",
          });
          this.buttonSave();
        }
      }
    }
    setStarted() {
      if (this.productionForm.value.production){
        if (Object.keys(this.productionForm.value.product).length === 0){
          this.selectProduct().then(()=>{
            this.productionForm.patchValue({
              'state': "STARTED",
            });
            this.buttonSave();
          });
        } else {
          this.productionForm.patchValue({
            'state': "STARTED",
          });
          this.buttonSave();
        }
      } else {
        if (Object.keys(this.productionForm.value.contact).length === 0){
          this.selectContact().then(()=>{
            this.productionForm.patchValue({
              'state': "STARTED",
            });
            this.buttonSave();
          });
        } else {
          this.productionForm.patchValue({
            'state': "STARTED",
          });
          this.buttonSave();
        }
      }
    }

    listenRequest() {
      let options = {
        language: 'pt-BR'
      }
      this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        } else {
          this.speechRecognition.startListening(options).subscribe(matches => {
            this.productionForm.patchValue({
              client_request: matches[0],
            });
            this.productionForm.markAsDirty();
          });
        }
      });
    }

    listenService() {
      let options = {
        language: 'pt-BR'
      }
      this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        } else {
          this.tts.speak({
            text: "Diga oque deseja",
            //rate: this.rate/10,
            locale: "pt-BR"
          })
          .then(() => {
            //console.log('Success1');
            this.speechRecognition.startListening(options).subscribe(matches => {
              this.productionForm.patchValue({
                production_overview: matches[0],
              });
            });
          })
          .catch((reason: any) => console.log(reason));
        }
      });
    }

    // async ionViewCanLeave() {
    //     if(this.productionForm.dirty && ! this.avoidAlertMessage) {
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
    //     this.productionForm.markAsPristine();
    //     // this.navCtrl.navigateBack();
    // }

    async goNextStep() {
      if (this.productionForm.value.state == 'QUOTATION' || this.productionForm.value.state == 'SCHEDULED'){
        console.log("set Focus");
        if (this.productionForm.value.client_request == '' && !this.productionForm.value.production){
          this.clientRequest.setFocus();
        }
        else if (this.productionForm.value.production){
          if (Object.keys(this.productionForm.value.product).length === 0){
            this.selectProduct();
          } else {
            this.setStarted();
            return;
          }
        } else {
          if (Object.keys(this.productionForm.value.contact).length === 0){
            this.selectContact();
          } else {
            this.setStarted();
            return;
          }
        }
      }
      else if (this.productionForm.value.state == 'STARTED'){
        if(!this.productionForm.value._id){
          this.buttonSave();
        }
        if (this.productionForm.value.works.length==0){
          this.addWork();
        }
        else if (this.productionForm.value.inputs.length==0 && ! this.ignore_inputs){
          console.log("ignore_inputs");
          let prompt = await this.alertCtrl.create({
            header: 'Productos Consumidos',
            message: 'Has consumido algun producto durante el trabajo?',
            buttons: [
              {
                text: 'No',
                handler: async data => {
                  console.log("ignore_inputs");

                  this.ignore_inputs = true;
                  // if (!this.productionForm.value.production){
                  //   let prompt = await this.alertCtrl.create({
                  //     header: 'Viaticos',
                  //     message: 'Has hecho algun viaje para realizar el trabajo?',
                  //     buttons: [
                  //       {
                  //         text: 'No',
                  //         handler: data => {
                  //           // this.addTravel();
                  //           this.ignore_travels = true;
                  //         }
                  //       },
                  //       {
                  //         text: 'Si',
                  //         handler: data => {
                  //           this.addTravel();
                  //         }
                  //       }
                  //     ]
                  //   });
                  //   prompt.present();
                  // }
                }
              },
              {
                text: 'Si',
                handler: data => {
                  this.addInput();
                  // item.description = data.description;
                }
              }
            ]
          });

          prompt.present();
        }
        // else if (this.productionForm.value.travels.length==0 && ! this.ignore_travels && !this.productionForm.value.production){
        //   console.log("ignore_travels");
        //   let prompt = await this.alertCtrl.create({
        //     header: 'Viaticos',
        //     message: 'Has hecho algun viaje para realizar el trabajo?',
        //     buttons: [
        //       {
        //         text: 'No',
        //         handler: data => {
        //           // this.addTravel();
        //           this.ignore_travels = true;
        //         }
        //       },
        //       {
        //         text: 'Si',
        //         handler: data => {
        //           this.addTravel();
        //         }
        //       }
        //     ]
        //   });
        //   prompt.present();
        // }
        else {
          console.log("Confirm Service");
          this.beforeConfirm();
        }
      } else if (this.productionForm.value.production){
        this.beforeConfirm();
      } else if (this.productionForm.value.state == 'CONFIRMED'){
          this.beforeAddPayment();
      } else if (this.productionForm.value.state == 'PAID'){
        if (this.productionForm.value.invoices.length){
          // this.navCtrl.navigateBack();
        } else {
          this.addInvoice();
        }
      }
    }

    // beforeConfirm(){
    //   //if ( this.productionForm.value.product){
    //   if (Object.keys(this.productionForm.value.contact).length === 0){
    //     this.selectContact().then(()=>{
    //       this.productionConfirm();
    //     })
    //   } else {
    //     this.productionConfirm();
    //   }
    // }

    beforeConfirm(){
      console.log("datos", this.productionForm.value);
      if (this.productionForm.value.production){
        this.pouchdbService.getDoc('contact.myCompany').then((contact: any)=>{
          this.productionForm.patchValue({
            'contact': contact,
            'contact_name': contact && contact.name || "",
          });

          this.productionConfirm();
        })
      }
      else {
        if (Object.keys(this.productionForm.value.contact).length === 0){
          this.selectContact().then( teste => {
            if (Object.keys(this.productionForm.value.paymentCondition).length === 0){
              this.selectPaymentCondition().then(()=>{
                this.productionConfirm();
              });
            }
          });
        } else if (Object.keys(this.productionForm.value.paymentCondition).length === 0){
          this.selectPaymentCondition().then(()=>{
            this.productionConfirm();
          });
        } else {
          this.productionConfirm();
        }
      }
    }

    showWorks(){
      this.show_works = !this.show_works;
      if (!this.productionForm.value.works.length){
        this.addWork();
      }
    }

    // showTravels(){
    //   this.show_travels = !this.show_travels;
    //   if (!this.productionForm.value.travels.length){
    //     this.addTravel();
    //   }
    // }

    showInputs(){
      this.show_inputs = !this.show_inputs;
      if (!this.productionForm.value.inputs.length){
        this.addInput();
      }
    }

    async editDescription(item){
      if (this.productionForm.value.state=='QUOTATION'){
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

    selectPaymentCondition() {
      return new Promise(async resolve => {
      if (this.productionForm.value.state=='STARTED'){
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
          this.productionForm.patchValue({
            paymentCondition: data,
            payment_name: data.name,
          });
          this.productionForm.markAsDirty();
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
        this.events.publish('create-production', this.productionForm.value);
      //});
    }

    beforeAddPayment(){
      if (this.productionForm.value.state == "QUOTATION"){
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
          this.productionForm.value.planned.forEach(planned => {
            if (planned.amount_residual > 0){
              plannedItems.push(planned);
            }
          })
          let profileModal = await this.modalCtrl.create({
            component: ReceiptPage,
            componentProps: {
              "select": true,
              "addPayment": true,
              "contact": this.productionForm.value.contact,
              "account_id": "account.income.sale",
              "project_id": this.productionForm.value.project_id
              || this.productionForm.value.project
              && this.productionForm.value.project._id,
              "name": "Venta "+this.productionForm.value.code,
              "accountFrom_id": this.productionForm.value.paymentCondition.accountTo_id,
              "items": plannedItems,
              "origin_id": this.productionForm.value._id,
              "signal": "+",
              // "origin_ids": origin_ids,
            }
          });
          await profileModal.present();
          this.events.subscribe('create-receipt', (data) => {
              console.log("DDDDDDDATA", data);
              this.productionForm.value.payments.push({
                'paid': data.paid,
                'date': data.date,
                'state': data.state,
                '_id': data._id,
              });
            this.productionForm.patchValue({
              'residual': this.productionForm.value.residual - data.paid,
            });
            this.recomputeValues();
            this.avoidAlertMessage = false;
            this.buttonSave();
            profileModal.dismiss();
            this.events.unsubscribe('create-receipt');
          });
          console.log("this.productionForm.value.planned", this.productionForm.value.planned);
          console.log("plannedItems", JSON.stringify(plannedItems));

      }

    async addInvoice() {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('create-invoice');
      let items = []
      let work_sum = {
        'product': this.labor_product,
        'description': this.labor_product['name'],
        'price': 0,
        'quantity': 0,
      }
      let labor_total = 0;
      this.productionForm.value.works.forEach(work=>{
        labor_total += parseFloat(work['time']) * parseFloat(work['price'])
        work_sum['quantity'] += parseFloat(work['time']);
      })
      if (work_sum['quantity'] > 0){
        work_sum.price = labor_total/work_sum['quantity'];
        items.push(work_sum);
      }

      // let travel_sum = {
      //   'product': this.travel_product,
      //   'description': this.travel_product['name'],
      //   'price': 0,
      //   'quantity': 0,
      // }
      // let travel_total = 0;
      // this.productionForm.value.travels.forEach(travel=>{
      //   travel_total += parseFloat(travel['distance']) * parseFloat(travel['price'])
      //   travel_sum['quantity'] += parseFloat(travel['distance']);
      // })
      // if (travel_sum['quantity'] > 0){
      //   travel_sum.price = travel_total/travel_sum['quantity'];
      //   items.push(travel_sum);
      // }

      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "select": true,
          "contact_id": this.productionForm.value.contact._id,
          "contact": this.productionForm.value.contact,
          "origin_id": this.productionForm.value._id,
          "items": items,
          'type': 'out',
        }
      });
      await profileModal.present();
      this.events.subscribe('create-invoice', (data) => {
          this.productionForm.value.invoices.push({
            'number': data.number,
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
        this.productionForm.value.planned.forEach(planned => {
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
        this.updateProduction(this.productionForm.value);
        this.events.publish('open-production', this.productionForm.value);
        this.productionForm.markAsPristine();
      } else {
        this.createProduction(this.productionForm.value).then(doc => {
          //console.log("docss", doc);
          this.productionForm.patchValue({
            _id: doc['doc'].id,
            code: doc['production'].code,
          });
          this._id = doc['doc'].id;
          this.events.publish('create-production', this.productionForm.value);
          this.productionForm.markAsPristine();
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

    // recomputeTotal(){
    //   // if (this.productionForm.value.state=='QUOTATION'){
    //     let total = this.productionForm.value.travel_amount +
    //       this.productionForm.value.work_amount +
    //       this.productionForm.value.input_amount;
    //     this.productionForm.patchValue({
    //       total: total,
    //     });
    //   // }
    // }
    //
    // recomputeTravels(){
    //   let travels = 0;
    //   this.productionForm.value.travels.forEach((travel) => {
    //     if (this.productionForm.value.production){
    //       travels += parseFloat(travel.distance || 0)*parseFloat(travel.cost || 0);
    //     } else {
    //       travels += parseFloat(travel.distance || 0)*parseFloat(travel.price || 0);
    //     }
    //   });
    //   console.log("travel", travels);
    //   this.productionForm.patchValue({
    //     travel_amount: travels,
    //   });
    // }

    recomputeWorks(){
      let works = 0;
      this.productionForm.value.works.forEach((work) => {
        if (this.productionForm.value.production){
          works += parseFloat(work.time|| 0)*parseFloat(work.cost || 0);
        } else {
          works += parseFloat(work.time|| 0)*parseFloat(work.price || 0);
        }
      });
      this.productionForm.patchValue({
        work_amount: works,
      });
    }

    recomputeInputs(){
      let inputs = 0;
      this.productionForm.value.inputs.forEach((input) => {
        if (this.productionForm.value.production){
          // works += parseFloat(work.time)*parseFloat(this.labor_product['cost']);
          inputs += parseFloat(input.quantity)*parseFloat(input.cost|| 0);
        } else {
          // works += parseFloat(work.time)*parseFloat(this.labor_product['price']);
          inputs += parseFloat(input.quantity)*parseFloat(input.price|| 0);
        }
      });
      this.productionForm.patchValue({
        input_amount: inputs,
      });
    }

    async addWork(){
      // if (this.productionForm.value.state=='QUOTATION'){
        let profileModal = await this.modalCtrl.create({
          component: ProductionWorkPage,
          componentProps: {}
        });
        await profileModal.present();
        let data: any = await profileModal.onDidDismiss();//data => {
          console.log("Work", data);
          if (data) {
            data.data.cost = this.labor_product['cost'];
            data.data.price = this.labor_product['price'];
            this.productionForm.value.works.unshift(data.data)
            this.recomputeValues();
            this.productionForm.markAsDirty();
            this.show_works=true;
            this.buttonSave();
          }
        // });
      // }
    }

    async editWork(item){
      // if (this.productionForm.value.state=='QUOTATION'){
        let profileModal = await this.modalCtrl.create({
          component: ProductionWorkPage,
          componentProps: item
        });
        await profileModal.present();
        let data = await profileModal.onDidDismiss()
          if (data) {
            //console.log("asdf", data);
            Object.keys(data.data).forEach(key => {
              item[key] = data.data[key];
            })
            this.recomputeValues();
            this.productionForm.markAsDirty();
            this.buttonSave();
          }
        // });
      // }
    }

    async editWorkPrice(item){
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
        let prompt = await this.alertCtrl.create({
          header: 'Precio del servicio por hora',
          message: 'Cual es el precio del la hora?',
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
                this.productionForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    removeWork(item){
      // if (this.productionForm.value.state=='QUOTATION'){
        let index = this.productionForm.value.works.indexOf(item)
        this.productionForm.value.works.splice(index, 1);
        this.recomputeValues();
        this.productionForm.markAsDirty();
      // }
    }


    // async addTravel(){
    //   // if (this.productionForm.value.state=='QUOTATION'){
    //     let profileModal = await this.modalCtrl.create({
    //       component: ServiceTravelPage,
    //       componentProps: {}
    //     });
    //     await profileModal.present();
    //     let data: any = await profileModal.onDidDismiss();
    //       if (data) {
    //         data.data.cost = this.travel_product['cost'];
    //         data.data.price = this.travel_product['price'];
    //         console.log(data);
    //         this.productionForm.value.travels.unshift(data.data)
    //         this.recomputeValues();
    //         this.show_travels=true;
    //         this.productionForm.markAsDirty();
    //         this.buttonSave();
    //       }
    //     // });
    //   // }
    // }
    //
    // async editTravelPrice(item){
    //   if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
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
    //           text: 'Cancel'
    //         },
    //         {
    //           text: 'Confirmar',
    //           handler: data => {
    //             item.price = data.price;
    //             this.recomputeValues();
    //             this.productionForm.markAsDirty();
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
    //   // if (this.productionForm.value.state=='QUOTATION'){
    //     let profileModal = await this.modalCtrl.create({
    //       component:ServiceTravelPage,
    //       componentProps: item
    //     });
    //     await profileModal.present();
    //     let data = await profileModal.onDidDismiss();
    //     if (data) {
    //       Object.keys(data.data).forEach(key => {
    //         item[key] = data.data[key];
    //       })
    //       this.recomputeValues();
    //       this.productionForm.markAsDirty();
    //     }
    //     // });
    //   // }
    // }
    //
    // removeTravel(item){
    //   // if (this.productionForm.value.state=='QUOTATION'){
    //     let index = this.productionForm.value.travels.indexOf(item)
    //     this.productionForm.value.travels.splice(index, 1);
    //     this.recomputeValues();
    //     this.productionForm.markAsDirty();
    //   // }
    // }

    async addInput(){
      // if (this.productionForm.value.state=='QUOTATION'){
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
            this.productionForm.value.inputs.unshift({
              'quantity': 1,
              'price': data.price,
              'cost': data.cost,
              'product': data,
              'description': data.name,
              'date': this.today,
            })
            this.recomputeValues();
            this.productionForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.show_inputs=true;
            this.buttonSave();
            profileModal.dismiss();
            this.events.unsubscribe('select-product');
          }
        })
      // }
    }

    // editInput(item){
    //   // if (this.productionForm.value.state=='QUOTATION'){
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
    //         this.productionForm.markAsDirty();
    //         this.buttonSave();
    //       }
    //     });
    //     profileModal.present();
    //   // }
    // }

    removeInput(item){
      // if (this.productionForm.value.state=='QUOTATION'){
        let index = this.productionForm.value.inputs.indexOf(item)
        this.productionForm.value.inputs.splice(index, 1);
        this.recomputeValues();
        this.productionForm.markAsDirty();
      // }
    }
    sumWork(item) {
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
        item.time = parseFloat(item.time)+1;
        this.recomputeValues();
        this.productionForm.markAsDirty();
      }
    }

    remWork(item) {
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
        item.time = parseFloat(item.time)-1;
        this.recomputeValues();
        this.productionForm.markAsDirty();
      }
    }
    //
    // sumTravel(item) {
    //   if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
    //     item.distance = parseFloat(item.distance)+1;
    //     this.recomputeValues();
    //     this.productionForm.markAsDirty();
    //   }
    // }
    //
    // remTravel(item) {
    //   if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
    //     item.distance = parseFloat(item.distance)-1;
    //     this.recomputeValues();
    //     this.productionForm.markAsDirty();
    //   }
    // }

    sumItem(item) {
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.productionForm.markAsDirty();
      }
    }

    remItem(item) {
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.productionForm.markAsDirty();
      }
    }

    async editItemPrice(item){
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
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
                this.productionForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editItemQuantity(item){
      if (this.productionForm.value.state!='CONFIRMED' && this.productionForm.value.state!='PRODUCED'){
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
                this.productionForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editQuantity(){
      if (this.productionForm.value.state=='QUOTATION'){
        let prompt = await this.alertCtrl.create({
          header: 'Cantidad del Producto',
          message: 'Cual es el Cantidad de este producto?',
          inputs: [
            {
              type: 'number',
              name: 'quantity',
              value: this.productionForm.value.quantity,
          },

          ],
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Confirmar',
              handler: data => {
                this.productionForm.patchValue({
                  'quantity': data.quantity,
                })
                this.recomputeValues();
                this.productionForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editPrice(){
      if (this.productionForm.value.state=='QUOTATION'){
        let prompt = await this.alertCtrl.create({
          header: 'Valor total esperado',
          message: 'Cual es el Cantidad de este producto?',
          inputs: [
            {
              type: 'number',
              name: 'price',
              value: this.productionForm.value.price,
          },

          ],
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Confirmar',
              handler: data => {
                //console.log("production number", data.number);
                this.productionForm.patchValue({
                  'price': data.price,
                });
                this.recomputeValues();
                this.productionForm.markAsDirty();
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
      // this.recomputeTotal();
      this.recomputeResidual();
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmProduction() {
      if (this.productionForm.value.state=='STARTED'){
        this.beforeConfirm();
      }
    }

    async productionConfirm(){
      let totalCost = this.productionForm.value.total;
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
        let totalCost = this.productionForm.value.total;
        let warehouseTo_id = 'warehouse.client';
        let createList = [];
        if (this.productionForm.value.production){
          warehouseTo_id = 'warehouse.production';
        }
        this.configService.getConfigDoc().then((config: any)=>{

          this.pouchdbService.getList([
            config.warehouse_id,
            warehouseTo_id,
            'account.other.stock',
            'account.expense.productionCost',
            'warehouse.production',
            'account.income.production',
            this.productionForm.value.paymentCondition.accountTo_id,
          ]).then((docList: any)=>{
            let docDict = {}
            docList.forEach(item=>{
              docDict[item.id] = item;
            })


            this.productionForm.value.inputs.forEach((item) => {
              let product_id = item.product._id;
              let product_name = item.product && item.product.name;
              createList.push({
                'docType': "stock-move",
                'name': "Servicio "+this.productionForm.value.code,
                'quantity': parseFloat(item.quantity),
                'origin_id': this.productionForm.value._id,
                'contact_id': this.productionForm.value.contact._id,
                'contact_name': this.productionForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'date': new Date(),
                'cost': item.cost*item.quantity,
                'warehouseFrom_id': config.warehouse_id,
                'warehouseFrom_name': docDict[config.warehouse_id].doc.name,
                'warehouseTo_id': warehouseTo_id,
                'warehouseTo_name': docDict[warehouseTo_id].doc.name,
              })
              if (! this.productionForm.value.production){
                createList.push({
                  'docType': "cash-move",
                  'name': "Servicio "+this.productionForm.value.code,
                  'contact_id': this.productionForm.value.contact._id,
                  'contact_name': this.productionForm.value.contact.name,
                  'amount': item.quantity*(item.product.cost || 0),
                  'origin_id': this.productionForm.value._id,
                  // "project_id": this.productionForm.value.project_id,
                  'date': new Date(),
                  'accountFrom_id': 'account.other.stock',
                  'accountFrom_name': docDict['account.other.stock'].doc.name,
                  'accountTo_id': 'account.expense.productionCost',
                  'accountTo_name': docDict['account.expense.productionCost'].doc.name,
                })
              }
            });


            if (this.productionForm.value.production){
              let product_id = this.productionForm.value.product_id || this.productionForm.value.product._id;
              let product_name = this.productionForm.value.product.name || this.productionForm.value.product_name;
              let unit_cost = this.productionForm.value.input_amount/this.productionForm.value.quantity;
              createList.push({
                'docType': "stock-move",
                'name': "Servicio "+this.productionForm.value.code,
                'quantity': parseFloat(this.productionForm.value.quantity),
                'origin_id': this.productionForm.value._id,
                'contact_id': this.productionForm.value.contact._id,
                'contact_name': this.productionForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'date': new Date(),
                'cost': this.productionForm.value.input_amount,
                'warehouseFrom_id': 'warehouse.production',
                'warehouseFrom_name': docDict['warehouse.production'].doc.name,
                'warehouseTo_id': config.warehouse_id,
                'warehouseTo_name': docDict[config.warehouse_id].doc.name,
              });
              this.productService.updateStockAndCost(
                product_id,
                this.productionForm.value.quantity,
                this.productionForm.value.input_amount/this.productionForm.value.quantity,
                this.productionForm.value.product.stock,
                this.productionForm.value.product.cost);

            } else {
              this.productionForm.value.paymentCondition.items.forEach(item => {
                let dateDue = this.addDays(this.today, item.days);
                console.log("dentro", this.productionForm.value);
                let amount = (item.percent/100)*this.productionForm.value.total;
                createList.push({
                  '_return': true,
                  'docType': "cash-move",
                  'date': new Date(),
                  'name': "Servicio "+this.productionForm.value.code,
                  'contact_id': this.productionForm.value.contact._id,
                  'contact_name': this.productionForm.value.contact.name,
                  'amount': amount,
                  'amount_residual': amount,
                  'amount_unInvoiced': amount,
                  'payments': [],
                  'invoices': [],
                  'origin_id': this.productionForm.value._id,
                  'dateDue': dateDue,
                  'accountFrom_id': 'account.income.production',
                  'accountFrom_name': docDict['account.income.production'].doc.name,
                  'accountTo_id': this.productionForm.value.paymentCondition.accountTo_id,
                  'accountTo_name': docDict[this.productionForm.value.paymentCondition.accountTo_id].doc.name,
                });
              });
            }
            let state;
            if (this.productionForm.value.production){
              state = 'PRODUCED';
            } else {
              state = 'CONFIRMED';
            }
            this.pouchdbService.createDocList(createList).then((created: any)=>{
              this.productionForm.patchValue({
                state: state,
                amount_unInvoiced: this.productionForm.value.total,
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

    async productionCancel(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas Cancelar el Servicio?',
        message: 'Al cancelar el Servicio todos los registros asociados serán borrados',
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
              this.productionForm.patchValue({
                 state: 'CANCELED',
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
      this.productionForm.value.planned.forEach(planned => {
        //console.log("removed planned", planned);
        this.deleteProduction(planned);
      });
      this.productionForm.patchValue({
        'planned': [],
      });
    }

    removeStockMoves(){
      this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.productionForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.deleteProduction(doc);
        })
      });
    }

    onSubmit(values){
      //console.log(values);
    }

    selectContact() {
      //console.log("values");
      if (this.productionForm.value.state!='PAID' && this.productionForm.value.state!='CONFIRMED'){
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
            this.productionForm.patchValue({
              contact: data,
              contact_name: data.name,
            });
            this.productionForm.markAsDirty();
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
    //   if (this.productionForm.value.state!='PAID'){
    //     return new Promise(resolve => {
    //       let profileModal = this.modalCtrl.create({ component:ServiceEquipmentPage, this.productionForm.value.equipment);
    //       let data: any profileModal.onDidDismiss();
    //         //console.log(data);
    //         if (data) {
    //           this.productionForm.patchValue({
    //             equipment: data,
    //           });
    //         }
    //       });
    //       profileModal.present();
    //     });
    //   }
    // }

    selectProduct() {
      if (this.productionForm.value.state!='PAID'){
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
            this.productionForm.patchValue({
              product: data,
              product_name: data.name,
              price: data.price,
            });
            this.productionForm.markAsDirty();
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
      this.configService.getConfigDoc().then( async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.productionForm.value.invoice || "";
        let date = this.productionForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        // let project = this.productionForm.value.project.name || "";
        let contact_name = this.productionForm.value.contact.name || "";
        let code = this.productionForm.value.code || "";
        let doc = this.productionForm.value.contact.document || "";
        //let direction = this.productionForm.value.contact.city || "";
        //let phone = this.productionForm.value.contact.phone || "";
        let lines = ""
        lines += "--------------------------------\n";
        lines += "PRODUCTOS CONSUMIDOS"+this.formatService.string_pad(12, "G$ "+this.productionForm.value.input_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";

        lines += "--------------------------------\n";
        lines += "Cod.  Cant.   Precio   Sub-total\n";
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.productionForm.value.inputs.forEach(item => {
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
          let product_name = this.formatService.string_pad(32, item.product.name);
          lines += code+quantity+price+subtotal+"\n"+product_name+"\n";
        });
        let work_lines = "";
        // this.formatService.string_pad(9, this.productionForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        work_lines += "--------------------------------\n";
        work_lines += "SERVICIOS PRESTADOS"+this.formatService.string_pad(13, "G$ "+this.productionForm.value.work_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        // work_lines += "Tiempo    Precio       Sub-total\n";
        this.productionForm.value.works.forEach(item => {

          let quantity = this.formatService.string_pad(8, item.time.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+" hs");
          let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          let subtotal = this.formatService.string_pad(14, (item.price*item.time).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let work_description = item.description.toString();
          work_lines += "--------------------------------\n";
          work_lines += work_description+"\n";
          work_lines += "Tiempo      Precio     Sub-total\n";
          work_lines += quantity+price+subtotal+"\n"
        });

        // let travel_lines = "";
        // travel_lines += "--------------------------------\n";
        // travel_lines += "VIATICOS"+this.formatService.string_pad(24, "G$ "+this.productionForm.value.travel_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        //
        // travel_lines += "--------------------------------\n";
        // travel_lines += "Distancia   Precio     Sub-total\n";
        // this.productionForm.value.travels.forEach(item => {
        //   let quantity = this.formatService.string_pad(8, item.distance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+" km");
        //   let price = this.formatService.string_pad(10, item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
        //   let subtotal = this.formatService.string_pad(14, (item.price*item.distance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        //   travel_lines += quantity+price+subtotal+"\n";
        // });


        let totalAmount = this.productionForm.value.total;
        totalAmount = this.formatService.string_pad(16, totalAmount, "right");
        let ticket=""
        ticket += company_name+"\n";
        // ticket += "Ruc: "+company_ruc+"\n";
        ticket += "Tel: "+company_phone+"\n";
        ticket += "\n";
        ticket += "ORDEN DE SERVICIO "+code+"\n";
        ticket += "Fecha: "+date+"\n";
        ticket += "Cliente: "+contact_name+"\n";
        ticket += "Solicitud: "+this.productionForm.value.client_request+"\n";
        // ticket += "Ruc: "+doc+"\n";
        // ticket += "\n";
        // ticket += "Local: "+project+"\n";
        ticket += "\n";
        ticket += work_lines;
        ticket += lines;
        // ticket += travel_lines;
        ticket += "--------------------------------\n";
        ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+this.productionForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        ticket += "--------------------------------\n";
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


        //console.log("ticket", ticket);


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
    }

    getProduction(doc_id): Promise<any> {
      return new Promise((resolve, reject)=>{
        this.unserializeProduction(doc_id).then(viewData => {
          resolve(viewData);
        });
      });
    }

    createProduction(viewData){
      return new Promise((resolve, reject)=>{
        let production = this.serializeProduction(viewData)
        this.configService.getSequence('production').then((code) => {
          production['code'] = code;
          this.pouchdbService.createDoc(production).then(doc => {
            resolve({doc: doc, production: production});
          });
        });
      });
    }

    serializeProduction(viewData){
      let production = Object.assign({}, viewData);
      production.lines = [];
      production.docType = 'production';
      delete production.planned;
      // delete production.payments;
      production.contact_id = production.contact._id;
      delete production.contact;

      production.pay_cond_id = production.paymentCondition._id;
      delete production.paymentCondition;
      // production.project_id = production.project._id;
      // delete production.project;
      production.inputs.forEach(input => {
        production.lines.push({
          product_id: input.product_id || input.product._id,
          product_name: input.product._id || input.product_name,
          description: input.description,
          quantity: input.quantity,
          price: input.price,
          cost: input.cost,
        })
        //input['product_id'] = input.product_id || input.product._id;
      });
      delete production.inputs;
      return production;
    }

    unserializeProduction(doc_id){
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

    // unserializeProduction(doc_id){
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

    updateProduction(viewData){
      let production = this.serializeProduction(viewData)
      return this.pouchdbService.updateDoc(production);
    }

    deleteProduction(production){
    //  if (production.state == 'QUOTATION'){
        return this.pouchdbService.deleteDoc(production);
    //  }
    }

    showNextButton(){
      // console.log("stock",this.productionForm.value.stock);
      if (this.productionForm.value.state=='PAID'){
        return false;
      }
      else if (this.productionForm.value.state=='PRODUCED'){
        return false;
      }
      // else if (this.productionForm.value.price==null){
      //   return true;
      // }
      // else if (this.productionForm.value.cost==null){
      //   return true;
      // }
      // else if (this.productionForm.value.type=='product'&&this.productionForm.value.stock==null){
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
        if(this.productionForm.dirty) {
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
        this.productionForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/production-list');
      }
    }

}

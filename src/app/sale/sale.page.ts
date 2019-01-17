import { Component, OnInit } from '@angular/core';
import { NavController,  LoadingController, Platform, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
//import { DecimalPipe } from '@angular/common';
import { Printer } from '@ionic-native/printer';
// import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { SaleService } from './sale.service';
import { ContactListPage } from '../contact-list/contact-list.page';
//import { SaleItemPage } from '../sale-item/sale-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { SalesPage } from '../sales/sales';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
// import { PlannedService } from '../planned/planned.service';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
import { ReceiptPage } from '../receipt/receipt.page';
// import { ReceiptService } from '../receipt/receipt.service';
import { InvoicePage } from '../invoice/invoice.page';
import { FormatService } from '../services/format.service';
// import { CashMoveService } from '../cash/move/cash-move.service';
// import { StockMoveService } from '../stock/stock-move.service';
// import { ProjectsPage } from '../project/list/projects';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { SalePopover } from './sale.popover';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CurrencyListPage } from '../currency-list/currency-list.page';
declare var cordova:any;
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';


@Component({
  selector: 'app-sale',
  templateUrl: './sale.page.html',
  styleUrls: ['./sale.page.scss'],
})
export class SalePage implements OnInit {
  // @ViewChild(Select) select: Select;
  @HostListener('document:keypress', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
      //this.key = event.key;
      ////console.log("key", event);
      let timeStamp = event.timeStamp - this.timeStamp;
      this.timeStamp = event.timeStamp;
      //console.log("key", event.key);
      if(event.which === 13){ //ignore returns
            console.log("enter", this.barcode);
            let toast = await this.toastCtrl.create({
            // message: "enter "+this.barcode,
            // duration: 1000
            });
            toast.present();
            let found = false;
            this.saleForm.value.items.forEach(item => {
              if (item.product.barcode == this.barcode){
                this.sumItem(item);
                //item.quantity += 1;
                found = true;
              }
            });
            if (found){
              // this.saleForm.patchValue({
              //   "items": this.saleForm.value.items,
              // });
            } else {
              // this.productService.getProductByCode(this.barcode).then(data => {
              //   if (data){
              //     this.saleForm.value.items.unshift({
              //       'quantity': 1,
              //       'product': data,
              //       'price': data.price,
              //       'cost': data.cost,
              //     })
              //     this.recomputeValues();
              //     this.saleForm.markAsDirty();
              //   }
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
            //console.log("end");
            this.barcode = ""
        }, 30);

    }


    timeStamp: any;
    barcode: string = "";
    saleForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;
    select;
    languages: Array<LanguageModel>;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public modalCtrl: ModalController,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      public platform: Platform,
      public saleService: SaleService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      // public app: App,
      public alertCtrl: AlertController,
      public productService: ProductService,
      // public plannedService: PlannedService,
      // public cashMoveService: CashMoveService,
      // public stockMoveService: StockMoveService,
      // public receiptService: ReceiptService,
      public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      public pouchdbService: PouchdbService,
      // public modal: ModalController,
      public popoverCtrl: PopoverController,
      public socialSharing: SocialSharing,
      // public file: File,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      this.avoidAlertMessage = false;
    }

    ngOnInit() {
      //var today = new Date().toISOString();
      this.saleForm = this.formBuilder.group({
        contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}, Validators.required),
        contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')||''),

        // project: new FormControl(this.route.snapshot.paramMap.get('project||{}),
        // project_name: new FormControl(this.route.snapshot.paramMap.get('project_name||''),

        name: new FormControl(''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today),
        origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
        total: new FormControl(0),
        residual: new FormControl(0),
        note: new FormControl(''),
        state: new FormControl('QUOTATION'),
        // tab: new FormControl('products'),
        items: new FormControl(this.route.snapshot.paramMap.get('items')||[], Validators.required),
        payments: new FormControl([]),
        planned: new FormControl([]),
        paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        invoice: new FormControl(''),
        invoices: new FormControl([]),
        amount_unInvoiced: new FormControl(0),
        seller: new FormControl(this.route.snapshot.paramMap.get('seller')||{}, Validators.required),
        seller_name: new FormControl(this.route.snapshot.paramMap.get('seller_name')||''),
        currency: new FormControl(this.route.snapshot.paramMap.get('currency')||{}),
        _id: new FormControl(''),
      });
              //this.loading.present();
      if (this._id){
        this.saleService.getSale(this._id).then((data) => {
          //console.log("data", data);
          this.saleForm.patchValue(data);
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
    }

    selectCurrency() {
      return new Promise(async resolve => {
        this.events.subscribe('select-currency', (data) => {
          this.saleForm.patchValue({
            currency: data,
            // cash_id: data._id,
          });
          this.saleForm.markAsDirty();
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

    // async ionViewCanLeave() {
    //     if(this.saleForm.dirty && ! this.avoidAlertMessage) {
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

    // private exitPage() {
    //     this.saleForm.markAsPristine();
    //     this.navCtrl.navigateBack('/sale-list');
    // }

    goNextStep() {
      if (this.saleForm.value.state == 'QUOTATION'){
        // if(!this.saleForm.value._id){
        //   this.buttonSave();
        // }
        this.confirmSale();
      } else if (this.saleForm.value.state == 'CONFIRMED'){
          this.beforeAddPayment();
      } else if (this.saleForm.value.state == 'PAID'){
        if (this.saleForm.value.invoices.length){
          this.navCtrl.navigateBack('/sale-list');
        } else {
          this.addInvoice();
        }
      }
    }

    beforeConfirm(){
      if (this.saleForm.value.items.length == 0){
        this.addItem();
      } else {
        if (Object.keys(this.saleForm.value.contact).length === 0){
          this.selectContact().then( teste => {
            if (Object.keys(this.saleForm.value.paymentCondition).length === 0){
              this.selectPaymentCondition().then(()=>{
                this.saleConfimation();
              });
            }
          });
        } else if (Object.keys(this.saleForm.value.paymentCondition).length === 0){
          this.selectPaymentCondition().then(()=>{
            this.saleConfimation();
          });
        } else {
          this.saleConfimation();
        }
      }
    }



    buttonSave() {
      if (this._id){
        this.saleService.updateSale(this.saleForm.value);
        this.saleForm.markAsPristine();
      } else {
        this.saleService.createSale(this.saleForm.value).then(doc => {
          this.saleForm.patchValue({
            _id: doc['doc'].id,
            code: doc['sale'].code,
          });
          this._id = doc['doc'].id;
          this.saleForm.markAsPristine();
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

    async deleteItem(slidingItem, item){
      if (this.saleForm.value.state=='QUOTATION'){
        console.log("delete item", item);
        slidingItem.close();
        let index = this.saleForm.value.items.indexOf(item)
        this.saleForm.value.items.splice(index, 1);
        this.recomputeValues();
      }
    }

    // deletePayment(item){
    //   let index = this.saleForm.value.payments.indexOf(item)
    //   this.saleForm.value.payments.splice(index, 1);
    //   this.recomputeResidual();
    // }

    recomputeTotal(){
      if (this.saleForm.value.state=='QUOTATION'){
        let total = 0;
        this.saleForm.value.items.forEach((item) => {
          total = total + item.quantity*item.price;
        });
        this.saleForm.patchValue({
          total: total,
        });
      }
    }

    recomputeUnInvoiced(){
      let amount_unInvoiced = 0;
      this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.saleForm.value._id
      ).then((planned) => {
        planned.forEach((item) => {
          if (item.amount_unInvoiced){
            amount_unInvoiced += parseFloat(item.amount_unInvoiced);
          }
        });
        this.saleForm.patchValue({
          amount_unInvoiced: amount_unInvoiced,
        });
      });
    }

    recomputeResidual(){
      if (this.saleForm.value.state == 'QUOTATION'){
        let residual = parseFloat(this.saleForm.value.total);
        this.saleForm.value.payments.forEach((item) => {
          residual -= parseFloat(item.paid || 0);
        });
        this.saleForm.patchValue({
          residual: residual,
        });
      }
    }

    async addItem(){
      if(!this.saleForm.value._id){
        this.buttonSave();
      }
      let self = this;
      if (this.saleForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        this.events.subscribe('select-product', async (product) => {
          let prompt = await self.alertCtrl.create({
            header: 'Cantidad del Producto',
            message: 'Cual es el Cantidad de este producto?',
            inputs: [
              {
                type: 'number',
                name: 'quantity',
                value: "1"
            },

            ],
            buttons: [
              {
                text: 'Cancel'
              },
              {
                text: 'Confirmar',
                handler: async data => {
                  // console.log("vars", data);
                  self.saleForm.value.items.unshift({
                    'quantity': data.quantity,
                    'price': product.price,
                    'cost': product.cost,
                    'product': product,
                    'description': product.name,
                  })
                  self.recomputeValues();
                  self.saleForm.markAsDirty();
                  self.avoidAlertMessage = false;
                  self.events.unsubscribe('select-product');
                  profileModal.dismiss();


                  // this.addItem();

                  let prompt2 = await self.alertCtrl.create({
                    header: 'Agregar otro Producto?',
                    // message: 'Cual es el Cantidad de este producto?',
                    buttons: [
                      {
                        text: 'No'
                      },
                      // {
                      //   text: 'Concluir Venta',
                      //   handler: data => {
                      //     this.goNextStep();
                      //   }
                      // },
                      {
                        text: 'Si',
                        handler: data => {
                          this.addItem();
                        }
                      }
                    ]
                  });
                  prompt2.present();

                }
              }
            ]
          });
          prompt.present();
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
      if (this.saleForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          item.price = data.price;
          item.product = data;
          item.description = data.name;
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.saleForm.markAsDirty();
          this.events.unsubscribe('select-product');
          profileModal.dismiss();
        })
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
          }});
        profileModal.present();
      }
    }

    sumItem(item) {
      if (this.saleForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.saleForm.markAsDirty();
      }
    }

    remItem(item) {
      if (this.saleForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.saleForm.markAsDirty();
      }
    }

    async editItemPrice(item){
      if (this.saleForm.value.state=='QUOTATION'){
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
                this.saleForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editItemQuantity(item){
      if (this.saleForm.value.state=='QUOTATION'){
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
                this.saleForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async openPayment(item) {
      this.events.unsubscribe('open-receipt');
      this.events.subscribe('open-receipt', (data) => {
        this.events.unsubscribe('open-receipt');
        // profileModal.dismiss();
      });
      let profileModal = await this.modalCtrl.create({
        component: ReceiptPage,
        componentProps: {
          "select": true,
          "_id": item._id,
        }
      });
      profileModal.present();
    }

    recomputeValues() {
      this.recomputeTotal();
      this.recomputeUnInvoiced();
      this.recomputeResidual();
      if (this.saleForm.value.total > 0 && this.saleForm.value.residual == 0){
        this.saleForm.patchValue({
          state: "PAID",
        });
      }
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmSale() {
      if (this.saleForm.value.state=='QUOTATION'){
        this.beforeConfirm();
      }
    }

    async saleConfimation(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas confirmar la venta?',
        message: 'Si la confirmas no podras cambiar los productos ni el cliente',
        buttons: [
          {
            text: 'Cancelar',
            handler: data => {}
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

    // presentPopover(myEvent) {
    //   let popover = this.popoverCtrl.create(SalePopover, {doc: this});
    //   popover.present({
    //     ev: myEvent
    //   });
    // }

    async presentPopover(myEvent) {
      console.log("teste my event");
      let popover = await this.popoverCtrl.create({
        component: SalePopover,
        event: myEvent,
        componentProps: {
          popoverController: this.popoverCtrl,
          doc: this
        }
      });
      popover.present();
    }

    afterConfirm(){
      return new Promise(resolve => {
        let createList = [];
        this.configService.getConfigDoc().then((config: any)=>{
          this.pouchdbService.getList([
            'warehouse.client',
            config.warehouse_id,
            'account.other.stock',
            'account.expense.soldGoodCost',
            'account.income.sale',
            this.saleForm.value.paymentCondition.accountTo_id
          ]).then((docList: any)=>{
            let docDict = {}
            docList.forEach(item=>{
              docDict[item.id] = item;
            })

            this.saleForm.value.items.forEach((item) => {
              let product_id = item.product_id || item.product._id;
              let product_name = item.product_name || item.product.name;
              createList.push({
                'name': "Venta "+this.saleForm.value.code,
                'quantity': parseFloat(item.quantity),
                'origin_id': this.saleForm.value._id,
                'contact_id': this.saleForm.value.contact._id,
                'contact_name': this.saleForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'docType': "stock-move",
                'date': new Date(),
                'cost': parseFloat(item.cost)*parseFloat(item.quantity),
                'warehouseFrom_id': config.warehouse_id,
                'warehouseFrom_name': docDict[config.warehouse_id].doc.name,
                'warehouseTo_id': 'warehouse.client',
                'warehouseTo_name': docDict['warehouse.client'].doc.name,
              })
              createList.push({
                'name': "Venta "+this.saleForm.value.code,
                'contact_id': this.saleForm.value.contact._id,
                'contact_name': this.saleForm.value.contact.name,
                'amount': item.quantity*item.cost,
                'origin_id': this.saleForm.value._id,
                'date': new Date(),
                'accountFrom_id': 'account.other.stock',
                'accountFrom_name': docDict['account.other.stock'].doc.name,
                'accountTo_id': 'account.expense.soldGoodCost',
                'accountTo_name': docDict['account.expense.soldGoodCost'].doc.name,
                'docType': "cash-move",
              })
            });
            this.saleForm.value.paymentCondition.items.forEach(item => {
              let dateDue = this.formatService.addDays(this.today, item.days);
              // console.log("dentro", this.saleForm.value);
              let amount = (item.percent/100)*this.saleForm.value.total;
              let cashMoveTemplate = {
                '_return': true,
                'date': new Date(),
                'name': "Venta "+this.saleForm.value.code,
                'contact_id': this.saleForm.value.contact._id,
                'contact_name': this.saleForm.value.contact.name,
                'amount': amount,
                'amount_residual': amount,
                'amount_unInvoiced': amount,
                'docType': "cash-move",
                'payments': [],
                'invoices': [],
                'origin_id': this.saleForm.value._id,
                'dateDue': dateDue,
                'accountFrom_id': 'account.income.sale',
                'accountFrom_name': docDict['account.income.sale'].doc.name,
                'accountTo_id': this.saleForm.value.paymentCondition.accountTo_id,
                'accountTo_name': docDict[this.saleForm.value.paymentCondition.accountTo_id].doc.name,
              }
              if (this.saleForm.value.currency._id){
                cashMoveTemplate['currency'] = this.saleForm.value.currency;
                cashMoveTemplate['currency_amount'] = amount;
                cashMoveTemplate['currency_residual'] = amount;
                cashMoveTemplate['amount'] = amount*this.saleForm.value.currency.sale_rate;
                cashMoveTemplate['residual'] = amount*this.saleForm.value.currency.sale_rate;
              }
              createList.push(cashMoveTemplate);
            });

            this.pouchdbService.createDocList(createList).then((created: any)=>{
              this.saleForm.patchValue({
                state: 'CONFIRMED',
                amount_unInvoiced: this.saleForm.value.total,
                planned: created,
              });
              console.log("Sale created", created);
              this.buttonSave();
              resolve(true);
            })
          })
        });
      });
    }

    async saleCancel(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas Cancelar la venta?',
        message: 'Al cancelar la venta todos los registros asociados serán borrados',
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
              //console.log("Confirmar");
              this.saleForm.value.items.forEach((item) => {
                ////console.log("item", item);
                // let product_id = item.product_id || item.product._id;
                // this.productService.updateStock(product_id, item.quantity);
                //this.saleForm.value.step = 'chooseInvoice';
              });
              this.saleForm.patchValue({
                 state: 'QUOTATION',
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
      this.saleForm.value.planned.forEach(planned => {
        //console.log("removed planned", planned);
        this.saleService.deleteSale(planned);
      });
      this.saleForm.patchValue({
        'planned': [],
      });
    }

    removeStockMoves(){
      this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.saleForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.saleService.deleteSale(doc);
        })
      });
    }

    beforeAddPayment(){
      if (this.saleForm.value.state == "QUOTATION"){
        this.afterConfirm().then(data => {
          this.addPayment();
        });
      } else {
        this.addPayment();
      }
    }

    async addPayment() {
      this.avoidAlertMessage = true;
        this.events.unsubscribe('create-receipt');
        this.events.subscribe('create-receipt', (data) => {
            console.log("DDDDDDDATA", data);
            this.saleForm.value.payments.push({
              'paid': data.paid,
              'date': data.date,
              'state': data.state,
              '_id': data._id,
            });
          this.saleForm.patchValue({
            'residual': this.saleForm.value.residual - data.paid,
          });
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.buttonSave();
          this.events.unsubscribe('create-receipt');
          // profileModal.dismiss();
        });
        let plannedItems = [];
        this.saleForm.value.planned.forEach(planned => {
          if (planned.amount_residual > 0){
            plannedItems.push(planned);
          }
        })

          // plannedItems = [this.saleForm.value.planned[this.saleForm.value.planned.length - 1]];

        console.log("this.saleForm.value.planned", this.saleForm.value.planned);
        console.log("plannedItems", JSON.stringify(plannedItems));
        let profileModal = await this.modalCtrl.create({
          component: ReceiptPage,
          componentProps: {
            "select": true,
            "addPayment": true,
            "contact": this.saleForm.value.contact,
            "account_id": "account.income.sale",
            // "project_id": this.saleForm.value.project_id
            // || this.saleForm.value.project
            // && this.saleForm.value.project._id,
            "origin_id": this.saleForm.value._id,
            "name": "Venta "+this.saleForm.value.code,
            "accountFrom_id": this.saleForm.value.paymentCondition.accountTo_id,
            "items": plannedItems,
            "signal": "+",
            // "origin_ids": origin_ids,
          }
        });
        profileModal.present();
    }

    async addInvoice() {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('create-invoice');
      this.events.subscribe('create-invoice', (data) => {
        this.saleForm.value.invoices.push({
          'number': data.number,
          'date': data.date,
          // 'residual': data.residual,
          'total': data.total,
          'tax': data.tax,
          'state': data.state,
          '_id': data._id,
        });
        this.avoidAlertMessage = false;
        this.buttonSave();
        let plannedItems = [];
        this.saleForm.value.planned.forEach(planned => {
          if (planned.hasOwnProperty('amount_residual')){
            plannedItems.push(planned);
          }
        })
        let cashMove = plannedItems[0];
        let amount_invoiced = data.total;
        if (data.total > cashMove.amount_unInvoiced){
          amount_invoiced = cashMove.amount_unInvoiced;
        }
        cashMove.invoices.push({
          "_id": data._id,
          "amount": amount_invoiced,
        });
        cashMove.amount_unInvoiced -= amount_invoiced;
        this.pouchdbService.updateDoc(cashMove);
        this.saleForm.patchValue({
           amount_unInvoiced: cashMove.amount_unInvoiced,
        });
        this.buttonSave();
        // this.saleForm.value.amount_unInvoiced -= cashMove.amount_unInvoiced;
        // this.pouchdbService.getDoc(cashMove.origin_id).then(sale=>{
        //   sale.amount_unInvoiced = cashMove.amount_unInvoiced;
        //   this.pouchdbService.updateDoc(sale);
        // });

        this.events.unsubscribe('create-invoice');
        // profileModal.dismiss();
      });

      let paymentType = 'Credito';
      if (this.saleForm.value.paymentCondition._id == 'payment-condition.cash'){
        paymentType = 'Contado';
      }
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "openPayment": true,
          "select": true,
          "contact_id": this.saleForm.value.contact._id,
          "contact": this.saleForm.value.contact,
          "date": this.saleForm.value.date,
          "paymentCondition": paymentType,
          "origin_id": this.saleForm.value._id,
          "items": this.saleForm.value.items,
          'type': 'out',
        }
      });
      profileModal.present();
    }

    async openInvoice(item) {
      this.events.unsubscribe('open-invoice');
      this.events.subscribe('open-invoice', (data) => {
        this.avoidAlertMessage = false;
        this.buttonSave();
        this.events.unsubscribe('open-invoice');
        // profileModal.dismiss();
      });
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "select": true,
          "_id": item._id,
        }
      });
      profileModal.present();
    }

    onSubmit(values){
      //console.log(values);
    }

    selectContact() {
      if (this.saleForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          this.events.subscribe('select-contact', (data) => {
            this.saleForm.patchValue({
              contact: data,
              contact_name: data.name,
            });
            this.saleForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.events.unsubscribe('select-contact');
            profileModal.dismiss();
            resolve(true);
          })
          let profileModal = await this.modalCtrl.create({
            component: ContactListPage,
            componentProps: {
              "select": true,
              "filter": "customer",
              'customer': true,
            }
          });
          profileModal.present();
        });
      }
    }

    // selectProject() {
    //   console.log("selectProject");
    //   if (this.saleForm.value.state=='QUOTATION'){
    //     return new Promise(resolve => {
    //       this.avoidAlertMessage = true;
    //       this.events.unsubscribe('select-project');
    //       this.events.subscribe('select-project', (data) => {
    //         this.saleForm.patchValue({
    //           project: data,
    //           project_name: data.name,
    //         });
    //         this.saleForm.markAsDirty();
    //         this.avoidAlertMessage = false;
    //         this.events.unsubscribe('select-project');
    //         resolve(true);
    //       })
    //       let profileModal = this.modalCtrl.create(ProjectsPage, {"select": true});
    //       profileModal.present();
    //     });
    //   }
    // }

    selectSeller() {
      // if (this.saleForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          this.events.subscribe('select-contact', (data) => {
            this.saleForm.patchValue({
              seller: data,
              seller_name: data.name,
            });
            this.saleForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.events.unsubscribe('select-contact');
            profileModal.dismiss();
            resolve(true);
          })
          let profileModal = await this.modalCtrl.create({
            component: ContactListPage,
            componentProps: {
              "select": true,
              "filter": "seller",
              'seller': true,
            }
          });
          profileModal.present();
        });
      // }
    }

    selectPaymentCondition() {
      return new Promise(async resolve => {
      if (this.saleForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-payment-condition');
        this.events.subscribe('select-payment-condition', (data) => {
          this.saleForm.patchValue({
            paymentCondition: data,
            payment_name: data.name,
          });
          this.saleForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-payment-condition');
          profileModal.dismiss();
          resolve(data);
          //this.beforeAddPayment();
        })
        let profileModal = await this.modalCtrl.create({
          component: PaymentConditionListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      }
    });
    }

    print() {
      this.configService.getConfigDoc().then(async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.saleForm.value.invoice || "";
        let date = this.saleForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        let payment_condition = this.saleForm.value.paymentCondition.name || "";
        let contact_name = this.saleForm.value.contact.name || "";
        let seller_name = this.saleForm.value.seller.name || "";
        let code = this.saleForm.value.code || "";
        let doc = this.saleForm.value.contact.document || "";
        //let direction = this.saleForm.value.contact.city || "";
        //let phone = this.saleForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.saleForm.value.items.forEach(item => {
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
          code = this.formatService.string_pad(6, code).toString();
          quantity = this.formatService.string_pad(5, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(32, item.product.name);
          lines += code+quantity+price+subtotal+product_name+"\n";
        });
        let totalAmount = totalIva10 + totalIva5 + totalExentas;
        totalAmount = this.formatService.string_pad(16, totalAmount, "right");

        let ticket=""
        ticket +=company_name+"\n";
        ticket += "Ruc: "+company_ruc+"\n";
        ticket += "Tel: "+company_phone+"\n";
        ticket += "\n";
        ticket += "VENTA COD.: "+code+"\n";
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
        // ticket += "TOTAL Gs.:     "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
        ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
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
        ticket += "Firma del vendedor: " +seller_name+"\n";
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


        console.log("ticket", ticket);


        // Print to bluetooth printer
        let toast = await this.toastCtrl.create({
        message: "Imprimiendo...",
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

    share() {
      this.configService.getConfigDoc().then((data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.saleForm.value.invoice || "";
        let date = this.saleForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        let payment_condition = this.saleForm.value.paymentCondition.name || "";
        let contact_name = this.saleForm.value.contact.name || "";
        let seller_name = this.saleForm.value.seller.name || "";
        let code = this.saleForm.value.code || "";
        let doc = this.saleForm.value.contact.document || "";
        //let direction = this.saleForm.value.contact.city || "";
        //let phone = this.saleForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.saleForm.value.items.forEach(item => {
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
        let totalAmount = totalIva10 + totalIva5 + totalExentas;
        totalAmount = this.formatService.string_pad(16, totalAmount, "right");

        let ticket='<div style="font-family: monospace;width: 310px;background: #fffae3;word-break: break-all;"><pre>'
        ticket += company_name+"\n";
        ticket += "Ruc: "+company_ruc+"\n";
        ticket += "Tel: "+company_phone+"\n";
        ticket += "\n";
        ticket += "PRESUPUESTO COD.: "+code+"\n";
        ticket += "Fecha: "+date+"\n";
        ticket += "Vendedor: "+seller_name+"\n";
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
        // ticket += "TOTAL Gs.:     "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
        ticket += "TOTAL"+this.formatService.string_pad(27, "G$ "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        ticket += "--------------------------------\n";
        ticket += "AVISO LEGAL: Este presupuesto \n";
        ticket += "no tiene valor fiscal.\n";
        ticket += "--------------------------------\n";
        ticket += "\n</pre></div>";


        console.log("ticket", ticket);

        const div = document.getElementById("htmltoimage");
        div.innerHTML = ticket;
        const options = {background:"white",height :div.clientHeight , width : 310  };


        // let teste = document.getElementById("htmltoimage");
        console.log("teste element", div);
       html2canvas(div, options).then(canvas => {
         console.log("canvas", canvas);
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.download = "Venta-"+this.saleForm.value.code+".png";
        a.href =  canvas.toDataURL();
        a.click();
      });


        // Print to bluetooth printer
        // console.log("htmlTemplate", ticket);
        // cordova.plugins.pdf.htmlToPDF({
        //   data: ticket,
        //   documentSize: "A4",
        //   landscape: "portrait",
        //   type: "base64"
        // },
        // (sucess) => {
        //     // To define the type of the Blob
        //     //console.log("Ponto3");
        //     var contentType = "application/pdf";
        //     //console.log("share sucess");
        //     // if cordova.file is not available use instead :
        //     // var folderpath = "file:///storage/emulated/0/Download/";
        //     var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
        //     //console.log("folderpath", folderpath);
        //     this.formatService.savebase64AsPDF(folderpath, "Presupuesto.pdf", sucess, contentType);
        //     this.socialSharing.share("Presupuesto alcanza "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "Presupuesto "+code, folderpath+"Presupuesto.pdf")
        // },
        // (error) => console.log('error:', error));

      });
    }

    goBack(){
      this.navCtrl.navigateBack('/sale-list');
    }

    showNextButton(){
      // console.log("stock",this.saleForm.value.stock);
      if (this.saleForm.value.name==null){
        return true;
      }
      else if (this.saleForm.value.price==null){
        return true;
      }
      else if (this.saleForm.value.cost==null){
        return true;
      }
      else if (this.saleForm.value.type=='product'&&this.saleForm.value.stock==null){
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
        if(this.saleForm.dirty) {
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
        this.saleForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/sale-list');
      }
    }
}

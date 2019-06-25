import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
//import { DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { PurchaseService } from './purchase.service';
import { ContactListPage } from '../contact-list/contact-list.page';
//import { PurchaseItemPage } from '../purchase-item/purchase-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { PurchasesPage } from '../purchases/purchases';
import { ProductListPage } from '../product-list/product-list.page';
import { ProductPage } from '../product/product.page';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
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
import { PurchasePopover } from './purchase.popover';
import { CurrencyListPage } from '../currency-list/currency-list.page';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {
@ViewChild('select') select;
@HostListener('document:keypress', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
      //this.key = event.key;
      ////console.log("key", event);
      let timeStamp = event.timeStamp - this.timeStamp;
      this.timeStamp = event.timeStamp;
      //console.log("key", event.key);
      if(event.which === 13){ //ignore returns
            console.log("enter", this.barcode);
            // let toast = await this.toastCtrl.create({
            // message: "enter "+this.barcode,
            // duration: 1000
            // });
            // toast.present();
            let found = false;
            this.purchaseForm.value.items.forEach(item => {
              if (item.product.barcode == this.barcode){
                this.sumItem(item);
                //item.quantity += 1;
                found = true;
              }
            });
            if (!found){
              let bacode= this.barcode;
              console.log("this.barcode11", this.barcode);
              this.productService.getProductByCode(this.barcode).then(async data => {
                console.log("barcode data", data);
                if (data){
                  this.purchaseForm.value.items.unshift({
                    'quantity': 1,
                    'price': data.price,
                    'product': data
                  })
                  this.recomputeValues();
                  this.purchaseForm.markAsDirty();
                } else {
                  console.log("barco", this.barcode);
                  let alertPopup = await this.alertCtrl.create({
                      header: 'Producto no Encontrado',
                      message: '¿Deseas catastrarlo?',
                      buttons: [{
                              text: 'Si',
                              handler: () => {
                                  // alertPopup.dismiss().then(() => {
                                      this.createBarcodeProduct(bacode);
                                      this.barcode = "";
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

                }
              });
            }

            this.barcode = "";
            //return;
        }
        //console.log("timeStamp", timeStamp);
        if(!timeStamp || timeStamp < 20 || this.barcode == ""){
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
    purchaseForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;
    currency_precision = 2;
    company_currency_id = 'currency.PYG';
    languages: Array<LanguageModel>;
    currencies:any = {};

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public purchaseService: PurchaseService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      public productService: ProductService,
      // public cashMoveService: CashMoveService,
      // public stockMoveService: StockMoveService,
      // public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      // public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      public pouchdbService: PouchdbService,
      public modalCtrl: ModalController,
      public popoverCtrl: PopoverController,
    ) {
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.avoidAlertMessage = false;
    }

    async createBarcodeProduct(barcode){
      if(!this.purchaseForm.value._id){
        this.buttonSave();
      }
      if (this.purchaseForm.value.state=='QUOTATION'){

        this.avoidAlertMessage = true;
        this.events.unsubscribe('create-product');
        this.events.subscribe('create-product', async (data) => {
          //console.log("vars", data);
          this.purchaseForm.value.items.unshift({
            'quantity': 1,
            'price': data.cost,
            // 'cost': data.cost,
            'product': data,
            'description': data.name,
          })
          this.recomputeValues();
          this.purchaseForm.markAsDirty();
          // let toast = await this.toastCtrl.create({
          // message: "entra ",
          // duration: 1000
          // });
          // toast.present();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('create-product');
          this.barcode = "";
        })
        console.log("barcode", barcode);
        let profileModal = await this.modalCtrl.create({
          component: ProductPage,
          componentProps: {
            "barcode": barcode,
            "stock": 0,
            "select": true,
            // "cost": 0,
            "type": "product"
          }
        });
        profileModal.present();
      }
    }

    async ngOnInit() {
      //var today = new Date().toISOString();
      this.purchaseForm = this.formBuilder.group({
        contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}, Validators.required),
        contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')||''),

        // project: new FormControl(this.route.snapshot.paramMap.get('project')||{}),
        // project_name: new FormControl(this.route.snapshot.paramMap.get('project_name')||''),

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
        currency: new FormControl({}),
        currency_exchange: new FormControl(1),
        seller: new FormControl(this.route.snapshot.paramMap.get('seller')||{}, Validators.required),
        seller_name: new FormControl(this.route.snapshot.paramMap.get('seller_name')||''),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      this.company_currency_id = config.currency_id || this.company_currency_id;
      let pyg = await this.pouchdbService.getDoc('currency.PYG')
      let usd = await this.pouchdbService.getDoc('currency.USD')
      this.currencies = {
        "currency.PYG": pyg,
        "currency.USD": usd,
      }
      if (this._id){
        this.getPurchase(this._id).then((data) => {
          //console.log("data", data);
          this.purchaseForm.patchValue(data);
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
      }
    }

    // async ionViewCanLeave() {
    //     if(this.purchaseForm.dirty && ! this.avoidAlertMessage) {
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
    // // presentPopover(myEvent) {
    // //   let popover = this.popoverCtrl.create(PurchasePopover, {doc: this});
    // //   popover.present({
    // //     ev: myEvent
    // //   });
    // // }
    async presentPopover(myEvent) {
      console.log("teste my event");
      let popover = await this.popoverCtrl.create({
        component: PurchasePopover,
        event: myEvent,
        componentProps: {
          popoverController: this.popoverCtrl,
          doc: this
        }
      });
      popover.present();
    }
    //
    //
    // private exitPage() {
    //     this.purchaseForm.markAsPristine();
    //     // this.navCtrl.navigateBack();
    // }

    goNextStep() {
      if (this.purchaseForm.value.state == 'QUOTATION'){
        // if(!this.purchaseForm.value._id){
        //   this.buttonSave();
        // }
        this.confirmPurchase();
      } else if (this.purchaseForm.value.state == 'CONFIRMED'){
          this.beforeAddPayment();
      } else if (this.purchaseForm.value.state == 'PAID'){
        if (this.purchaseForm.value.invoices.length){
          // this.navCtrl.navigateBack();
        } else {
          this.addInvoice();
        }
      }
    }

    beforeConfirm(){
      if (this.purchaseForm.value.items.length == 0){
        this.addItem();
      } else {
        // this.purchaseForm.patchValue({
        //   tab: "purchase",
        // });
        if (Object.keys(this.purchaseForm.value.contact).length === 0){
          this.selectContact().then( teste => {
            if (Object.keys(this.purchaseForm.value.paymentCondition).length === 0){
              this.selectPaymentCondition().then(()=>{
                this.purchaseConfimation();
              });
            }
          });
        } else if (Object.keys(this.purchaseForm.value.paymentCondition).length === 0){
          this.selectPaymentCondition().then(()=>{
            this.purchaseConfimation();
          });
        } else {
          this.purchaseConfimation();
        }
      }
    }

    addDays(date, days) {
      days = parseInt(days);
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    // createQuotes(){
    //   return new Promise(resolve => {
    //     let date = new Date();
    //     let promise_ids = [];
    //     console.log("values", this.purchaseForm.value);
    //     this.purchaseForm.value.paymentCondition.items.forEach(item => {
    //       date = this.addDays(this.today, item.days);
    //       console.log("dentro", this.purchaseForm.value);
    //       let amount = (item.percent/100)*this.purchaseForm.value.total;
    //       let data = {
    //         'date': new Date(),
    //         'name': "Compra "+this.purchaseForm.value.code,
    //         'contact_id': this.purchaseForm.value.contact._id,
    //         'amount': amount,
    //         'amount_residual': amount,
    //         'amount_unInvoiced': amount,
    //         'payments': [],
    //         'invoices': [],
    //         'origin_id': this.purchaseForm.value._id,
    //         'dateDue': date,
    //         'project_id': this.purchaseForm.value.project_id,
    //         'accountFrom_id': this.purchaseForm.value.paymentCondition.accountFrom_id,
    //         'accountTo_id': 'account.other.transitStock',
    //         // 'accountTo_id': 'account.receivable',
    //       }
    //       promise_ids.push(this.cashMoveService.createCashMove(data));
    //     });
    //     Promise.all(promise_ids).then(d => {
    //       d.forEach(doc=>{
    //         this.purchaseForm.value.planned.push(doc);
    //       });
    //       resolve(d);
    //     });
    //   });
    //
    // }

    // showPayments() {
    //   this.purchaseForm.patchValue({
    //     tab: "payment",
    //   });
    //   // this.addPayment();
    // }

    ionViewWillLeave(){
      //console.log("ionViewWillLeave");
      //this.navCtrl.navigateBack().then(() => {
        this.events.publish('create-purchase', this.purchaseForm.value);
      //});
    }

    buttonSave() {
      console.log("buttonSave");
      return new Promise(resolve => {
        if (this._id){
          this.updatePurchase(this.purchaseForm.value);
          // this.events.publish('open-purchase', this.purchaseForm.value);
          this.purchaseForm.markAsPristine();
        } else {
          this.createPurchase(this.purchaseForm.value).then(doc => {
            console.log("docss", doc);
            this.purchaseForm.patchValue({
              _id: doc['doc'].id,
              code: doc['purchase'].code,
              create_time: doc['purchase'].create_time,
              create_user: doc['purchase'].create_user,
              write_time: doc['purchase'].write_time,
              write_user: doc['purchase'].write_user,
            });
            this._id = doc['doc'].id;
            console.log("this.purchaseForm", this.purchaseForm.value);
            // this.events.publish('create-purchase', this.purchaseForm.value);
            this.purchaseForm.markAsPristine();
            resolve(true);
          });
        }
      });
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
      if (this.purchaseForm.value.state=='QUOTATION'){
        let index = this.purchaseForm.value.items.indexOf(item)
        this.purchaseForm.value.items.splice(index, 1);
        this.recomputeValues();
      }
    }

    // deletePayment(item){
    //   let index = this.purchaseForm.value.payments.indexOf(item)
    //   this.purchaseForm.value.payments.splice(index, 1);
    //   this.recomputeResidual();
    // }

    recomputeTotal(){
      if (this.purchaseForm.value.state=='QUOTATION'){
        let total = 0;
        this.purchaseForm.value.items.forEach((item) => {
          total = total + item.quantity*item.price;
        });
        this.purchaseForm.patchValue({
          total: total,
        });
      }
    }

    recomputeUnInvoiced(){
      let amount_unInvoiced = 0;
      this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.purchaseForm.value._id
      ).then((planned) => {
        planned.forEach((item) => {
          if (item.amount_unInvoiced){
            amount_unInvoiced += parseFloat(item.amount_unInvoiced);
          }
        });
        this.purchaseForm.patchValue({
          amount_unInvoiced: amount_unInvoiced,
        });
      });
    }

    recomputeResidual(){
      if (this.purchaseForm.value.state == 'QUOTATION'){
        let residual = parseFloat(this.purchaseForm.value.total);
        this.purchaseForm.value.payments.forEach((item) => {
          residual -= parseFloat(item.paid || 0);
        });
        this.purchaseForm.patchValue({
          residual: residual,
        });
      }
    }

    async addItem(){
      // if(!this.purchaseForm.value._id){
      //   this.buttonSave();
      // }
      if (this.purchaseForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
            'operation': 'purchase',
          }
        });
        profileModal.present();
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          this.purchaseForm.value.items.unshift({
            'quantity': 1,
            'price': (data.cost/this.purchaseForm.value.currency_exchange).toFixed(this.currencies[this.purchaseForm.value.currency && this.purchaseForm.value.currency._id || this.company_currency_id].precision),
            // 'cost': data.cost,
            'product': data,
            'description': data.name,
          })
          this.recomputeValues();
          this.purchaseForm.markAsDirty();
          this.avoidAlertMessage = false;
          profileModal.dismiss();
          this.events.unsubscribe('select-product');
        })
      }
    }

    async openItem(item) {
      if (this.purchaseForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
            'operation': 'purchase',
          }
        });
        profileModal.present();
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          item.price = data.cost/this.purchaseForm.value.currency_exchange;
          item.product = data;
          item.description = data.name;
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.purchaseForm.markAsDirty();
          profileModal.dismiss();
          this.events.unsubscribe('select-product');
        })
      }
    }

    sumItem(item) {
      if (this.purchaseForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.purchaseForm.markAsDirty();
      }
    }

    remItem(item) {
      if (this.purchaseForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.purchaseForm.markAsDirty();
      }
    }

    async editItemPrice(item){
      if (this.purchaseForm.value.state=='QUOTATION'){
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
                this.purchaseForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editItemQuantity(item){
      if (this.purchaseForm.value.state=='QUOTATION'){
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
                this.purchaseForm.markAsDirty();
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
      });
      this.events.subscribe('cancel-receipt', (data) => {
        let newPayments = [];
        let residual = this.purchaseForm.value.residual;
        this.purchaseForm.value.payments.forEach((receipt, index)=>{
          if (receipt._id != data){
            this.purchaseForm.value.payments.slice(index, 1);
            newPayments.push(receipt);
          } else {
            residual += parseFloat(receipt.paid);
          }
        })
        this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.purchaseForm.value._id).then((planned) => {
          this.purchaseForm.patchValue({
            payments: newPayments,
            residual: residual,
            state: 'CONFIRMED',
            planned: planned
          })
          this.buttonSave();
        });
        this.events.unsubscribe('cancel-receipt');
      });
      let profileModal = await this.modalCtrl.create({
        component: ReceiptPage,
        componentProps: {
          "_id": item._id,
          "select": true,
        }
      });
      profileModal.present();
    }

    recomputeValues() {
      this.recomputeTotal();
      this.recomputeUnInvoiced();
      this.recomputeResidual();
      if (this.purchaseForm.value.total > 0 && this.purchaseForm.value.residual == 0){
        this.purchaseForm.patchValue({
          state: "PAID",
        });
      }
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmPurchase() {
      if (this.purchaseForm.value.state=='QUOTATION'){
        this.beforeConfirm();
      }
    }

    async purchaseConfimation(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas confirmar la venta?',
        message: 'Si la confirmas no podras cambiar los productos ni el cliente',
        buttons: [
          {
            text: 'Cancelar',
            handler: data => {
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
      return new Promise(async resolve => {
        let createList = [];
        if(!this.purchaseForm.value._id){
          await this.buttonSave();
        }
        let exchangeRate = 1;
        if (JSON.stringify(this.purchaseForm.value.currency) != '{}'
        && this.purchaseForm.value.currency._id != this.company_currency_id){
          exchangeRate = this.purchaseForm.value.currency_exchange;
        }
        this.configService.getConfigDoc().then((config: any)=>{

          this.pouchdbService.getList([
            'warehouse.supplier',
            config.warehouse_id,
            'account.other.transitStock',
            'account.other.stock',
            this.purchaseForm.value.paymentCondition.accountFrom_id,
          ]).then((docList: any)=>{
            let docDict = {}
            docList.forEach(item=>{
              docDict[item.id] = item;
            })

            this.purchaseForm.value.items.forEach((item) => {
              let product_id = item.product._id;
              let product_name = item.product.name;
              let old_stock = item.product.stock || 0;
              let old_cost = item.product.cost || 0;
              this.productService.updateStockAndCost(
                product_id,
                item.quantity,
                item.price*exchangeRate,
                old_stock,
                old_cost);

              createList.push({
                'docType': "stock-move",
                'name': "Compra "+this.purchaseForm.value.code,
                'quantity': parseFloat(item.quantity),
                'origin_id': this.purchaseForm.value._id,
                'contact_id': this.purchaseForm.value.contact._id,
                'contact_name': this.purchaseForm.value.contact.name,
                'product_id': product_id,
                'product_name': product_name,
                'date': new Date(),
                'cost': item.price*item.quantity*exchangeRate,
                'warehouseFrom_id': 'warehouse.supplier',
                'warehouseFrom_name': docDict['warehouse.supplier'].doc.name,
                'warehouseTo_id': config.warehouse_id,
                'warehouseTo_name': docDict[config.warehouse_id].doc.name,
              })
              createList.push({
                'docType': "cash-move",
                'name': "Compra "+this.purchaseForm.value.code,
                'contact_id': this.purchaseForm.value.contact._id,
                'contact_name': this.purchaseForm.value.contact.name,
                'amount': item.quantity*item.price*exchangeRate,
                'origin_id': this.purchaseForm.value._id,
                'date': new Date(),
                'accountFrom_id': 'account.other.transitStock',
                'accountFrom_name': docDict['account.other.transitStock'].doc.name,
                'accountTo_id': 'account.other.stock',
                'accountTo_name': docDict['account.other.stock'].doc.name,
              })
            });
            this.purchaseForm.value.paymentCondition.items.forEach(item => {
              let dateDue = this.addDays(this.today, item.days);
              // console.log("dentro", this.purchaseForm.value);
              let amount = (item.percent/100)*this.purchaseForm.value.total;
              let receivableCashMove = {
                '_return': true,
                'docType': "cash-move",
                'date': new Date(),
                'name': "Compra "+this.purchaseForm.value.code,
                'contact_id': this.purchaseForm.value.contact._id,
                'contact_name': this.purchaseForm.value.contact.name,
                'amount': amount,
                'amount_residual': amount,
                'amount_unInvoiced': amount,
                'payments': [],
                'invoices': [],
                'origin_id': this.purchaseForm.value._id,
                'dateDue': dateDue,
                'accountFrom_id': this.purchaseForm.value.paymentCondition.accountFrom_id,
                'accountFrom_name': docDict[this.purchaseForm.value.paymentCondition.accountFrom_id].doc.name,
                'accountTo_id': 'account.other.transitStock',
                'accountTo_name': docDict['account.other.transitStock'].doc.name,
              }
              if (JSON.stringify(this.purchaseForm.value.currency) != '{}' && this.purchaseForm.value.currency._id != this.company_currency_id) {
                receivableCashMove['currency_amount'] = amount;
                receivableCashMove['currency_id'] = this.purchaseForm.value.currency._id;
                receivableCashMove['currency_exchange'] = exchangeRate;
                receivableCashMove['currency_residual'] = amount;

                receivableCashMove['amount'] = amount*exchangeRate;
                receivableCashMove['amount_residual'] = amount*exchangeRate;

              }
              createList.push(receivableCashMove);
            });

            this.pouchdbService.createDocList(createList).then(async (created: any)=>{
              this.purchaseForm.patchValue({
                state: 'CONFIRMED',
                amount_unInvoiced: this.purchaseForm.value.total,
                planned: created,
              });
              console.log("Purchase created", created);
              await this.buttonSave();
              resolve(true);
            })
          })
        });
      });
    }

    async purchaseCancel(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas Cancelar la Compra?',
        message: 'Al cancelar la Compra todos los registros asociados serán borrados',
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
              this.purchaseForm.value.items.forEach((item) => {
                ////console.log("item", item);
                // let product_id = item.product_id || item.product._id;
                // this.productService.updateStock(product_id, item.quantity);
                //this.purchaseForm.value.step = 'chooseInvoice';
              });
              this.purchaseForm.patchValue({
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
      this.purchaseForm.value.planned.forEach(planned => {
        //console.log("removed planned", planned);
        this.deletePurchase(planned);
      });
      this.purchaseForm.patchValue({
        'planned': [],
      });
    }

    removeStockMoves(){
      this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.purchaseForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.deletePurchase(doc);
        })
      });
    }

    beforeAddPayment(){
      if (this.purchaseForm.value.state == "QUOTATION"){
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
          this.purchaseForm.value.payments.push({
            'paid': data.paid,
            'date': data.date,
            'state': data.state,
            '_id': data._id,
          });
          this.purchaseForm.patchValue({
            'residual': this.purchaseForm.value.residual - data.paid,
          });
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.buttonSave();
          this.events.unsubscribe('create-receipt');
        });
        let plannedItems = [];
        this.purchaseForm.value.planned.forEach(planned => {
          if (planned.amount_residual > 0){
            plannedItems.push(planned);
          }
        })

          // plannedItems = [this.purchaseForm.value.planned[this.purchaseForm.value.planned.length - 1]];

        console.log("this.purchaseForm.value.planned", this.purchaseForm.value.planned);
        console.log("plannedItems", plannedItems);
        let profileModal = await this.modalCtrl.create({
          component: ReceiptPage,
          componentProps: {
            "addPayment": true,
            "select": true,
            "contact": this.purchaseForm.value.contact,
            "account_id": "account.other.transitStock",
            // "project_id": this.purchaseForm.value.project_id
            // || this.purchaseForm.value.project
            // && this.purchaseForm.value.project._id,
            "name": "Compra "+this.purchaseForm.value.code,
            "accountFrom_id": this.purchaseForm.value.paymentCondition.accountFrom_id,
            "items": plannedItems,
            "signal": "-",
            // "origin_ids": origin_ids,
          }
        });
        profileModal.present();
    }

    async addInvoice() {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('create-invoice');
      this.events.subscribe('create-invoice', (data) => {
        this.purchaseForm.value.invoices.push({
          'code': data.code,
          'date': data.date,
          'total': data.total,
          'tax': data.tax,
          'state': data.state,
          '_id': data._id,
        });
        this.avoidAlertMessage = false;
        this.buttonSave();
        let plannedItems = [];
        this.purchaseForm.value.planned.forEach(planned => {
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
        this.purchaseForm.patchValue({
           amount_unInvoiced: cashMove.amount_unInvoiced,
        });
        this.buttonSave();
        // this.purchaseForm.value.amount_unInvoiced -= cashMove.amount_unInvoiced;
        // this.pouchdbService.getDoc(cashMove.origin_id).then(purchase=>{
        //   purchase.amount_unInvoiced = cashMove.amount_unInvoiced;
        //   this.pouchdbService.updateDoc(purchase);
        // });

        this.events.unsubscribe('create-invoice');
      });
      let paymentType = 'Credito';
      if (this.purchaseForm.value.paymentCondition._id == 'payment-condition.cash'){
        paymentType = 'Contado';
      }
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "openPayment": true,
          "select": true,
          "contact_id": this.purchaseForm.value.contact._id,
          "contact": this.purchaseForm.value.contact,
          "date": this.purchaseForm.value.date,
          "paymentCondition": paymentType,
          "origin_id": this.purchaseForm.value._id,
          "items": this.purchaseForm.value.items,
          'type': 'in',
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
      });
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "_id": item._id,
          "select": true,
        }
      });
      profileModal.present();
    }

    onSubmit(values){
      //console.log(values);
    }

    selectContact() {
      // console.log("selectContact");
      if (this.purchaseForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          let profileModal = await this.modalCtrl.create({
            component: ContactListPage,
            componentProps: {
              "select": true,
              "filter": "supplier",
              'supplier': true,
            }
          });
          profileModal.present();
          this.events.subscribe('select-contact', (data) => {
            this.purchaseForm.patchValue({
              contact: data,
              contact_name: data.name,
            });
            this.purchaseForm.markAsDirty();
            this.avoidAlertMessage = false;
            profileModal.dismiss();
            this.events.unsubscribe('select-contact');
            resolve(true);
          })
        });
      }
    }

    // selectProject() {
    //   // console.log("selectProject");
    //   if (this.purchaseForm.value.state=='QUOTATION'){
    //     return new Promise(resolve => {
    //       this.avoidAlertMessage = true;
    //       this.events.unsubscribe('select-project');
    //       this.events.subscribe('select-project', (data) => {
    //         this.purchaseForm.patchValue({
    //           project: data,
    //           project_name: data.name,
    //         });
    //         this.purchaseForm.markAsDirty();
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
      // if (this.purchaseForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          let profileModal = await this.modalCtrl.create({
            component: ContactListPage,
            componentProps: {
              "select": true,
              "filter": "seller"
            }
          });
          profileModal.present();
          this.events.subscribe('select-contact', (data) => {
            this.purchaseForm.patchValue({
              seller: data,
              seller_name: data.name,
            });
            this.purchaseForm.markAsDirty();
            this.avoidAlertMessage = false;
            profileModal.dismiss();
            this.events.unsubscribe('select-contact');
            resolve(true);
          })
        });
      // }
    }

    selectPaymentCondition() {
      return new Promise(async resolve => {
      if (this.purchaseForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-payment-condition');
        let profileModal = await this.modalCtrl.create({
          component: PaymentConditionListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
        this.events.subscribe('select-payment-condition', (data) => {
          this.purchaseForm.patchValue({
            paymentCondition: data,
            payment_name: data.name,
          });
          this.purchaseForm.markAsDirty();
          this.avoidAlertMessage = false;
          profileModal.dismiss();
          this.events.unsubscribe('select-payment-condition');
          resolve(data);
          //this.beforeAddPayment();
        })
      }
    });
    }

      getPurchase(doc_id): Promise<any> {
        return new Promise((resolve, reject)=>{
          this.unserializePurchase(doc_id).then(viewData => {
            resolve(viewData);
          });
        });
      }

      createPurchase(viewData){
        return new Promise((resolve, reject)=>{
          let purchase = this.serializePurchase(viewData)
          this.configService.getSequence('purchase').then((code) => {
            purchase['code'] = code;
            this.pouchdbService.createDoc(purchase).then(doc => {
              resolve({doc: doc, purchase: purchase});
            });
          });
        });
      }

      serializePurchase(viewData){
        let purchase = Object.assign({}, viewData);
        purchase.lines = [];
        purchase.docType = 'purchase';
        // delete purchase.payments;
        delete purchase.planned;
        purchase.contact_id = purchase.contact._id;
        delete purchase.contact;
        purchase.currency_id = purchase.currency._id;
        delete purchase.currency;
        // purchase.project_id = purchase.project._id;
        // delete purchase.project;
        purchase.pay_cond_id = purchase.paymentCondition._id;
        delete purchase.paymentCondition;
        purchase.items.forEach(item => {
          purchase.lines.push({
            product_id: item.product_id || item.product._id,
            product_name: item.product.name || item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost: item.cost,
          })
        });
        delete purchase.items;
        return purchase;
      }

      unserializePurchase(doc_id){
        return new Promise((resolve, reject)=>{
          this.pouchdbService.getDoc(doc_id).then(((pouchData: any) => {
            let getList = [
              pouchData['contact_id'],
              pouchData['pay_cond_id'],
              pouchData['currency_id'],
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
              pouchData.currency = doc_dict[pouchData.currency_id] || {};
              let index=2;
              pouchData['items'] = [];
              pouchData.lines.forEach((line: any)=>{
                pouchData['items'].push({
                  'product': doc_dict[line.product_id],
                  'description': doc_dict[line.product_id].name,
                  'quantity': line.quantity,
                  'price': line.price,
                  'cost': line.cost || 0,
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

      updatePurchase(viewData){
        let purchase = this.serializePurchase(viewData);
        return this.pouchdbService.updateDoc(purchase);
      }

      deletePurchase(purchase){
      //  if (purchase.state == 'QUOTATION'){
          return this.pouchdbService.deleteDoc(purchase);
      //  }
      }


      showNextButton(){
        // console.log("stock",this.purchaseForm.value.stock);
        // if (this.purchaseForm.value.name==null){
          return true;
        // }
        // else if (this.purchaseForm.value.price==null){
        //   return true;
        // }
        // else if (this.purchaseForm.value.cost==null){
        //   return true;
        // }
        // else if (this.purchaseForm.value.type=='product'&&this.purchaseForm.value.stock==null){
        //   return true;
        // }
        // else {
        //   return false;
        // }
      }
      discard(){
        this.canDeactivate();
      }
      async canDeactivate() {
          if(this.purchaseForm.dirty) {
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
          this.purchaseForm.markAsPristine();
          this.navCtrl.navigateBack('/tabs/purchase-list');
        }
      }


  selectCurrency() {
    return new Promise(async resolve => {
      this.events.subscribe('select-currency', (data) => {
        this.purchaseForm.patchValue({
          currency: data,
          currency_exchange: data.exchange_rate,
          // cash_id: data._id,
        });
        this.purchaseForm.markAsDirty();
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

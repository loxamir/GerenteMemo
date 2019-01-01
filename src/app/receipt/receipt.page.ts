import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, NavParams, LoadingController,
  AlertController,  Events, ToastController,
  ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
//import { DecimalPipe } from '@angular/common';
import { Printer } from '@ionic-native/printer';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ReceiptService } from './receipt.service';
// import { ContactsPage } from '../contact/list/contacts';
//import { ReceiptItemPage } from '../receipt-item/receipt-item';
import { CashMovePage } from '../cash-move/cash-move.page';
import { CashMoveService } from '../cash-move/cash-move.service';
import { CashListPage } from '../cash-list/cash-list.page';
// import { ProductsPage } from '../product/list/products';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
// import { PlannedService } from '../planned/list/planned-list.service';
import { ConfigService } from '../config/config.service';
// import { HostListener } from '@angular/core';
// import { PlannedPage } from '../planned/planned';
import { FormatService } from '../services/format.service';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { InvoicePage } from '../invoice/invoice.page';
import { CheckListPage } from '../check-list/check-list.page';


@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
})
export class ReceiptPage implements OnInit {
  @ViewChild('Select') select;
  @ViewChild('input') myInput;
    receiptForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;

    languages: Array<LanguageModel>;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      public receiptService: ReceiptService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public navParams: NavParams,
      public alertCtrl: AlertController,
      // public productService: ProductService,
      // public plannedService: PlannedService,
      public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public cashMoveService: CashMoveService,
      public formatService: FormatService,
      public pouchdbService: PouchdbService,
      public events:Events,
      public modal: ModalController,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.avoidAlertMessage = false;
    }

    ngOnInit() {
      //var today = new Date().toISOString();
      setTimeout(() => {
        if(this.receiptForm.value.state == "DRAFT"){
          this.myInput.setFocus();
        }
      }, 200);
      this.receiptForm = this.formBuilder.group({
        contact: new FormControl(this.navParams.data.contact||{}, Validators.required),
        // account_id: new FormControl(this.navParams.data.account_id||""),
        // project_id: new FormControl(this.navParams.data.project_id||""),
        name: new FormControl(this.navParams.data.name||'Recibo'),
        // contact_name: new FormControl(this.navParams.data.contact && this.navParams.data.contact.name || ''),
        code: new FormControl(''),
        date: new FormControl(this.today),
        total: new FormControl(0),
        residual: new FormControl(0),
        change: new FormControl(0),
        paid: new FormControl(0),
        note: new FormControl(''),
        state: new FormControl('DRAFT'),
        items: new FormControl(this.navParams.data.items||[], Validators.required),
        origin_id: new FormControl(this.navParams.data.origin_id||''),
        payments: new FormControl([]),
        // origin_ids: new FormControl(this.navParams.data.origin_ids||[]),
        // paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        invoices: new FormControl([]),
        amount_unInvoiced: new FormControl(''),
        receipt: new FormControl(''),
        amount_paid: new FormControl(''),
        // createInvoice: new FormControl(false),
        payables: new FormControl([]),
        receivables: new FormControl([]),
        cash_paid: new FormControl({}),
        check: new FormControl({}),
        signal: new FormControl(this.navParams.data.signal||'+'),
        exchange_rate: new FormControl(this.navParams.data.exchange_rate||'1'),
        _id: new FormControl(''),
      });
      this.recomputeValues();
        this.configService.getConfig().then(async config => {
          this.receiptForm.patchValue({
            "cash_paid": config.cash,
            "exchange_rate": config.currency.sale_rate,
          });

          this.recomputeValues();
          if (this._id){
            this.receiptService.getReceipt(this._id).then((data) => {
              //console.log("data", data);
              this.receiptForm.patchValue(data);
              //this.loading.dismiss();
            });
          } else {
            //this.loading.dismiss();
          }
        });
    // }
    //
    // ionViewDidLoad() {
      //this.loading.present();

    }

    goNextStep() {
      if (this.receiptForm.value.state == 'DRAFT'){
        this.confirmReceipt();
      } else {
          this.navCtrl.navigateBack('/receipt-list');
      }
    }

    // ionViewDidEnter() {
    //   setTimeout(() => {
    //     if(this.receiptForm.value.state == "DRAFT"){
    //       this.myInput.setFocus();
    //     }
    //   }, 200);
    // }

    createInvoice() {
      // if (this.receiptForm.value.amount_unInvoiced > 0){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('create-invoice');
        this.events.subscribe('create-invoice', (data) => {
          this.receiptForm.value.invoices.push({
            'number': data.number,
            'date': data.date,
            'total': data.total,
            'tax': data.tax,
            'state': data.state,
            '_id': data._id,
          });
          this.avoidAlertMessage = false;
          this.buttonSave();
          console.log("toInvoice", data);
          let toInvoice = data.total;
          this.receiptForm.value.items.forEach(cashMove=>{
            // let cashMove = this.receiptForm.value.items[0];
            let amount_invoiced = 0;
            if (toInvoice > cashMove.amount_unInvoiced){
              toInvoice -= cashMove.amount_unInvoiced;
              amount_invoiced = cashMove.amount_unInvoiced;
            } else {
              amount_invoiced = toInvoice;
              toInvoice = 0;
            }
            cashMove.invoices.push({
              "_id": data._id,
              "amount": amount_invoiced,
            });
            cashMove.amount_unInvoiced -= amount_invoiced;
            this.pouchdbService.updateDoc(cashMove);
            if (cashMove.origin_id.split('.')[0] == 'sale'){
              this.pouchdbService.getDoc(cashMove.origin_id).then((sale: any)=>{
                sale.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
                sale.invoices.push({
                  'number': data.number,
                  'date': data.date,
                  'total': data.total,
                  'tax': data.tax,
                  'state': data.state,
                  '_id': data._id,
                });
                console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
                this.pouchdbService.updateDoc(sale);
              });
            }
            else if (cashMove.origin_id.split('.')[0] == 'purchase'){
              this.pouchdbService.getDoc(cashMove.origin_id).then((purchase: any)=>{
                purchase.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
                purchase.invoices.push({
                  'number': data.number,
                  'date': data.date,
                  'total': data.total,
                  'tax': data.tax,
                  'state': data.state,
                  '_id': data._id,
                });
                console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
                this.pouchdbService.updateDoc(purchase);
              });
            }
            else if (cashMove.origin_id.split('.')[0] == 'service'){
              this.pouchdbService.getDoc(cashMove.origin_id).then((service: any)=>{
                service.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
                service.invoices.push({
                  'number': data.number,
                  'date': data.date,
                  'total': data.total,
                  'tax': data.tax,
                  'state': data.state,
                  '_id': data._id,
                });
                console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
                this.pouchdbService.updateDoc(service);
              });
            }
          });
          // this.events.unsubscribe('create-invoice');
          this.receiptForm.patchValue({
             state: 'INVOICED',
          });
          this.events.publish('create-receipt', this.receiptForm.value);
          this.justSave();
        });
        this.configService.getConfig().then(async config => {
          let profileModal = await this.modal.create({
            component: InvoicePage,
            componentProps: {
              // "openPayment": true,
              "contact_id": this.receiptForm.value.contact._id,
              "contact": this.receiptForm.value.contact,
              "date": new Date(),
              "paymentCondition": "Contado",
              // "tab": "invoice",
              // "origin_id": [this.receiptForm.value._id],
              "origin_id": this.receiptForm.value.origin_id || this.receiptForm.value._id,
              "items": [{
                "product": config.input_product,
                "description": config.input_product.name,
                "quantity": 1,
                "price": this.receiptForm.value.amount_unInvoiced,
              }],
              'type': 'out',
            }
          });
          profileModal.present();
        });
      // }
    }

    async openInvoice(item) {
      this.events.unsubscribe('open-invoice');
      this.events.subscribe('open-invoice', (data) => {
        this.avoidAlertMessage = false;
        this.buttonSave();
        this.events.unsubscribe('open-invoice');
      });
      let profileModal = await this.modal.create({
        component: InvoicePage,
        componentProps: {
          "_id": item._id,
        }
      });
      profileModal.present();
    }

    ionViewCanLeave() {
        // if(this.receiptForm.dirty && ! this.avoidAlertMessage) {
        //     let alertPopup = this.alertCtrl.create({
        //         title: 'Exit',
        //         message: '¿Are you sure?',
        //         buttons: [{
        //                 text: 'Exit',
        //                 handler: () => {
        //                     alertPopup.dismiss().then(() => {
        //                         this.exitPage();
        //                     });
        //                 }
        //             },
        //             {
        //                 text: 'Stay',
        //                 handler: () => {
        //                     // need to do something if the user stays?
        //                 }
        //             }]
        //     });
        //
        //     // Show the alert
        //     alertPopup.present();
        //
        //     // Return false to avoid the page to be popped up
        //     return false;
        // }
    }

    exitPage() {
        this.receiptForm.markAsPristine();
        this.modal.dismiss();
    }

    beforeConfirm(){
      if(!this.receiptForm.value._id){
        this.justSave();
      }
      if (this.receiptForm.value.items.length == 0){
        // this.addItem();
      } else {
        this.receiptConfimation();
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
        this.receiptService.updateReceipt(this.receiptForm.value);
        this.receiptForm.markAsPristine();
        // this.navCtrl.navigateBack('/receipt-list').then(() => {
          this.events.publish('open-receipt', this.receiptForm.value);
        // });
      } else {
        //this.invoiceService.createInvoice(this.invoiceForm.value);
        this.receiptService.createReceipt(this.receiptForm.value).then((doc: any) => {
          this.receiptForm.patchValue({
            _id: doc['doc'].id,
            code: doc.code,
          });
          this._id = doc['doc'].id;
          this.receiptForm.markAsPristine();
          // this.navCtrl.navigateBack('/receipt-list').then(() => {
            this.events.publish('create-receipt', this.receiptForm.value);
          // });
        });
      }
    }

    justSave() {
      if (this._id){
        this.receiptService.updateReceipt(this.receiptForm.value);
        this.receiptForm.markAsPristine();
        //this.events.publish('open-receipt', this.receiptForm.value);
      } else {
        //this.invoiceService.createInvoice(this.invoiceForm.value);
        this.receiptService.createReceipt(this.receiptForm.value).then((doc: any) => {
          // console.log("docss receipt2", JSON.stringify(doc));
          this.receiptForm.patchValue({
            _id: doc['doc'].id,
            code: doc['receipt'].code,
          });
          this._id = doc['doc'].id;
          this.receiptForm.markAsPristine();
          //this.events.publish('create-receipt', this.receiptForm.value);
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
      if (this.receiptForm.value.state=='DRAFT'){
        let index = this.receiptForm.value.items.indexOf(item)
        this.receiptForm.value.items.splice(index, 1);
        this.recomputeValues();
      }
    }

    deletePayment(item){
      let index = this.receiptForm.value.payments.indexOf(item)
      this.receiptForm.value.payments.splice(index, 1);
      this.recomputePayment();
    }

    recomputeTotal(){
      if (this.receiptForm.value.state=='DRAFT'){
        let total = 0;
        console.log("items", this.receiptForm.value.items);
        let amount_unInvoiced = 0;
        this.receiptForm.value.items.forEach((item: any) => {
          if (item.currency_amount && this.receiptForm.value.cash_paid.currency){
            // if (item.currency._id == this.receiptForm.value.cash_paid.currency._id){
            //   total = total + parseFloat(item['currency_residual']);
            // } else {

              total = total + parseFloat(item['currency_residual'])*parseFloat(item.currency.sale_rate)/parseFloat(this.receiptForm.value.cash_paid.currency.sale_rate);
            // }
          } else {
            total = total + parseFloat(item['amount_residual'])/(this.receiptForm.value.cash_paid.currency && parseFloat(this.receiptForm.value.cash_paid.currency.sale_rate) || 1);
          }
          amount_unInvoiced += parseFloat(item['amount_unInvoiced']);
        });
        if (amount_unInvoiced > (this.receiptForm.value.amount_paid - this.receiptForm.value.change)){
          amount_unInvoiced = (this.receiptForm.value.amount_paid - this.receiptForm.value.change);
        }
        this.receiptForm.patchValue({
          total: total,
          amount_unInvoiced: amount_unInvoiced,
        });
      }
    }

    recomputePayment(){
      let paid = parseFloat(this.receiptForm.value.amount_paid||0);
      this.receiptForm.value.payments.forEach((item) => {
        paid += parseFloat(item.amount || 0);
      });
      // total = parseFloat(item['currency_residual'])*parseFloat(item.currency.sale_rate)/parseFloat(this.receiptForm.value.cash_paid.currency.sale_rate);
      // paid = paid*(parseFloat(this.receiptForm.value.exchange_rate) || 1);
      let change = paid - parseFloat(this.receiptForm.value.total||0);
      if (change < 0){
        change = 0;
      }
      let residual = parseFloat(this.receiptForm.value.total||0) - paid;
      if (residual < 0){
        residual = 0;
      }

      this.receiptForm.patchValue({
        residual: residual,
        paid: paid,
        change: change,
      });
    }

    // addItem(){
    //   if (this.receiptForm.value.state=='DRAFT'){
    //     this.avoidAlertMessage = true;
    //     this.events.subscribe('select-product', (data) => {
    //       //console.log("vars", data);
    //       this.receiptForm.value.items.push({
    //         'quantity': 1,
    //         'price': data.price,
    //         'product': data
    //       })
    //       this.recomputeValues();
    //       this.receiptForm.markAsDirty();
    //       this.avoidAlertMessage = false;
    //       this.events.unsubscribe('select-product');
    //     })
    //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
    //   }
    // }

    openItem(item) {
      return new Promise(async resolve => {
        // this.events.subscribe('select-account', (data) => {
        //   this.events.unsubscribe('select-account');
        //   resolve(data);
        // })
        let profileModal = await this.modal.create({
        component: CashMovePage,
        componentProps: {
          "_id": item.doc._id}
        });
        profileModal.present();
      });
    }

    // openItem(item) {
    //   if (this.receiptForm.value.state=='DRAFT'){
    //     this.avoidAlertMessage = true;
    //     this.events.subscribe('select-product', (data) => {
    //       //console.log("vars", data);
    //       item.price = data.price;
    //       item.product = data;
    //       this.recomputeValues();
    //       this.avoidAlertMessage = false;
    //       this.receiptForm.markAsDirty();
    //       this.events.unsubscribe('select-product');
    //     })
    //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
    //   }
    // }

    sumItem(item) {
      if (this.receiptForm.value.state=='DRAFT'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
      }
    }

    remItem(item) {
      if (this.receiptForm.value.state=='DRAFT'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
      }
    }

    async editItemPrice(item){
      if (this.receiptForm.value.state=='DRAFT'){
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

    async editPaymentAmount(item){
      if (this.receiptForm.value.state=='DRAFT'){
        let prompt = await this.alertCtrl.create({
          header: 'Valor',
          message: 'Cual es el monto cobrado?',
          inputs: [
            {
              type: 'number',
              name: 'amount',
              value: item.amount
          },

          ],
          buttons: [
            {
              text: 'Cancel'
            },
            {
              text: 'Confirmar',
              handler: data => {
                item.amount = data.amount;
                this.recomputeValues();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async selectCheck(){
      this.avoidAlertMessage = true;
      // if (default_amount != 0){
        this.events.subscribe('select-check',  (data: any) => {
          // this.receiptForm.value.cash = data;
          // console.log("selectCash", (await this.pouchdbService.getDoc(data.currency_id)))
          this.receiptForm.patchValue({
            "check": data,
            "amount_paid": data.amount,
          })
          this.events.unsubscribe('select-check');
          this.recomputeValues();
        });
        let profileModal = await this.modal.create({
          component: CheckListPage,
          componentProps: {"select": true,}});
        profileModal.present();
      // }
    }

    async selectCash(){
      this.avoidAlertMessage = true;
      // if (default_amount != 0){
        this.events.subscribe('select-cash',  (data: any) => {
          // this.receiptForm.value.cash = data;
          // console.log("selectCash", (await this.pouchdbService.getDoc(data.currency_id)))
          this.receiptForm.patchValue({
            "cash_paid": data,
            "exchange_rate": data.currency && data.currency.sale_rate || 1,
          })
          this.events.unsubscribe('select-cash');
          this.recomputeValues();
        });
        let profileModal = await this.modal.create({
          component: CashListPage,
          componentProps: {"select": true,}
        });
        profileModal.present();
      // }
    }

    async editPaymentCash(item){
      this.avoidAlertMessage = true;
      let default_amount = this.receiptForm.value.residual;
      if (default_amount != 0){
        this.events.subscribe('select-cash', (data) => {
          item.cash = data;
          this.events.unsubscribe('select-cash');
        });
        let profileModal = await this.modal.create({
          component: CashListPage,
          componentProps: {"select": true,}
        });
        profileModal.present();
      }
    }

    recomputeValues() {
      this.recomputeTotal();
      this.recomputePayment();
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmReceipt() {
      //console.log("confirmReceipt", this.receiptForm.value);
      if (this.receiptForm.value.state=='DRAFT'){
        this.beforeConfirm();
      }
    }

    async receiptConfimation(){
      let prompt = await this.alertCtrl.create({
        header: 'Confirmar Recibo?',
        message: 'Estas seguro que deseas confirmar la el recibo?',
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
              //console.log("Confirmar");
              this.afterConfirm();
            }
          }
        ]
      });
      prompt.present();
    }

    afterConfirm(){
    this.receiptForm.value.payments.push({
      'amount': this.receiptForm.value.amount_paid-this.receiptForm.value.change,
      'date': this.today,
      'cash': this.receiptForm.value.cash_paid,
      'state': 'done',
    });
    this.receiptForm.patchValue({
      "change": 0,
      "paid": this.receiptForm.value.paid-this.receiptForm.value.change,
    });
    let promise_ids = [];

    let amount_paid = this.receiptForm.value.amount_paid-this.receiptForm.value.change;
    this.receiptForm.value.payments.forEach((item) => {
      let payments = [];
      let toCreateCashMoves = {};
      let paymentAccount = {};
      this.receiptForm.value.items.forEach(ite=>{
        console.log("ite", ite);
        let item_paid = 0;
        let item_residual = 0;
        if (amount_paid > ite.amount_residual){
          item_paid = ite.amount_residual;
          item_residual = 0;
          amount_paid -= ite.amount_residual;
        } else {
          item_paid = amount_paid;
          item_residual = ite.amount_residual - amount_paid;
          amount_paid = 0;
        }
        payments.push({"_id": ite._id, "amount": item_paid});
        if (paymentAccount.hasOwnProperty(ite.accountTo_id)) {
          paymentAccount[ite.accountTo_id]['payments'].push({
            "_id": ite._id,
            "amount": item_paid,
          });
        } else {
          paymentAccount[ite.accountTo_id] = {
            "payments": [{
              "_id": ite._id,
              "amount": item_paid,
            }],
          }
        }
        if (this.receiptForm.value.signal == "+"){
          if (toCreateCashMoves.hasOwnProperty(ite.accountTo_id)) {
            toCreateCashMoves[ite.accountTo_id] += item_paid;
          } else {
            toCreateCashMoves[ite.accountTo_id] = item_paid;
          }
        } else {
          if (toCreateCashMoves.hasOwnProperty(ite.accountFrom_id)) {
            toCreateCashMoves[ite.accountFrom_id] += item_paid;
          } else {
            toCreateCashMoves[ite.accountFrom_id] = item_paid;
          }
        }
      })
      if (this.receiptForm.value.signal == "+"){
        Object.keys(toCreateCashMoves).forEach(account_id => {
          promise_ids.push(this.cashMoveService.createCashMove({
            "amount": toCreateCashMoves[account_id],
            "name": this.receiptForm.value.name,
            "date": this.today,
            // "project_id": this.receiptForm.value.project_id,
            "accountFrom_id": account_id,
            "contact_id": this.receiptForm.value.contact._id,
            "check_id": this.receiptForm.value.check._id,
            "accountTo_id": this.receiptForm.value.cash_paid._id,
            'signal': this.receiptForm.value.signal,
            "payments": paymentAccount[account_id],
            "origin_id": this.receiptForm.value.origin_id || this.receiptForm.value._id,
          }));

        });
      } else {
        Object.keys(toCreateCashMoves).forEach(account_id => {
          promise_ids.push(this.cashMoveService.createCashMove({
            // "amount": item.amount,
            "amount": toCreateCashMoves[account_id],
            "name": this.receiptForm.value.name,
            "date": this.today,
            // "accountFrom": item.cash,
            "check_id": this.receiptForm.value.check._id,
            // "project_id": this.receiptForm.value.project_id,
            "accountFrom_id": this.receiptForm.value.cash_paid._id,
            "contact_id": this.receiptForm.value.contact._id,
            "accountTo_id": account_id,
            'signal': this.receiptForm.value.signal,
            "origin_id": this.receiptForm.value.origin_id || this.receiptForm.value._id,
            "payments": payments,
          }));
        });
      }
    });
    this.receiptForm.patchValue({
      state: 'CONFIRMED',
    });
    Promise.all(promise_ids).then((promise_data) => {
      console.log("promise_data",promise_data);
      let amount_paid = this.receiptForm.value.amount_paid-this.receiptForm.value.change;
      // let amount_invoiced = amount_paid;
      let promise_ids2 = [];
      this.receiptForm.value.items.forEach((item1, index) => {
        let item_paid = 0;
        let item_residual = 0;
        if (amount_paid > item1.amount_residual){
          item_paid = item1.amount_residual;
          item_residual = 0;
          amount_paid -= item1.amount_residual;
        } else {
          item_paid = amount_paid;
          item_residual = item1.amount_residual - amount_paid;
          amount_paid = 0;
        }
        item1.amount_residual = item_residual;
        item1.payments.push({
          "_id": promise_data[0].id, //FIXME: It's not showing the right move for multi account payments
          "amount": item_paid
        });
        promise_ids2.push(this.pouchdbService.updateDoc(item1));
        console.log("item_residual1", item1.origin_id, item_residual);
        console.log("ORIGIN", item1.origin_id.split('.')[0]);
        if (item1.origin_id.split('.')[0] == 'sale'){
          console.log("findSale");
          this.pouchdbService.getDoc(item1.origin_id).then((sale: any)=>{
            console.log("sALE", JSON.stringify(sale))
            sale.residual = item1.amount_residual;
            console.log("item_residual2", item_residual);
            sale.payments.push({
              "paid": item_paid,
              "date": this.receiptForm.value.date,
              "state": "CONFIRMED",
              "_id": this.receiptForm.value._id,
            });
            if (item_residual == 0){
              sale.state = "PAID";
            }
            console.log("SALE RES", JSON.stringify(sale));
            this.pouchdbService.updateDoc(sale).then(res=>{
              console.log("RES", JSON.stringify(res));
            })
          })
        }
        else if (item1.origin_id.split('.')[0] == 'purchase'){
          this.pouchdbService.getDoc(item1.origin_id).then((purchase: any)=>{
            purchase.residual = item1.amount_residual;
            console.log("item_residual2", item_residual);
            purchase.payments.push({
              "paid": item_paid,
              "date": this.receiptForm.value.date,
              "state": "CONFIRMED",
              "_id": this.receiptForm.value._id,
            });
            if (item_residual == 0){
              purchase.state = "PAID";
            }
            this.pouchdbService.updateDoc(purchase);
          })
        }
        else if (item1.origin_id.split('.')[0] == 'service'){
          this.pouchdbService.getDoc(item1.origin_id).then((service: any)=>{
            service.residual = item1.amount_residual;
            service.payments.push({
              "paid": item_paid,
              "date": this.receiptForm.value.date,
              "state": "CONFIRMED",
              "_id": this.receiptForm.value._id,
            });
            if (item_residual == 0){
              service.state = "PAID";
            }
            this.pouchdbService.updateDoc(service);
          })
        }
      });
      Promise.all(promise_ids2).then(res=>{
        this.events.publish('create-receipt', this.receiptForm.value);
        this.justSave();
      });
    });
  }

    onSubmit(values){
      //console.log(values);
    }

    // openPayment(item) {
    //   this.events.subscribe('open-cash-move', (data) => {
    //     //console.log("Payment", data);
    //     this.events.unsubscribe('open-cash-move');
    //   });
    //   //console.log("item", item);
    //   this.navCtrl.navigateForward(CashMovePage, {
    //     "_id": item._id,
    //   });
    // }

    isEmpty(object){
      if (Object.keys(object).length == 0){
        return true;
      } else {
        return false;
      }
    }

    print() {
      this.configService.getConfig().then(async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.receiptForm.value.receipt || "";
        let date = this.receiptForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        // let payment_condition = this.receiptForm.value.paymentCondition.name || "";
        let contact_name = this.receiptForm.value.contact.name || "";
        let code = this.receiptForm.value.code || "";
        let doc = this.receiptForm.value.contact.document || "";
        //let direction = this.receiptForm.value.contact.city || "";
        //let phone = this.receiptForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        let totalAmount = totalIva10 + totalIva5 + totalExentas;
        totalAmount = this.formatService.string_pad(16, totalAmount, "right");
        let ticket=""
        ticket +=company_name+"\n";
        ticket += "Ruc: "+company_ruc+"\n";
        ticket += "Tel: "+company_phone+"\n";
        ticket += "\n";
        ticket += "RECIBO COD.: "+code+"\n";
        ticket += "Fecha: "+date+"\n";
        ticket += "Cliente: "+contact_name+"\n";
        ticket += "Ruc: "+doc+"\n";
        ticket += "\n";
        // ticket += "Condicion de pago: "+payment_condition+"\n";
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
}

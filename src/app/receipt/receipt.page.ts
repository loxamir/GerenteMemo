import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController, LoadingController,
  AlertController, Events, ToastController,
  ModalController, Platform, PopoverController
} from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { Printer } from '@ionic-native/printer/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ReceiptService } from './receipt.service';
import { CashMovePage } from '../cash-move/cash-move.page';
import { CashMoveService } from '../cash-move/cash-move.service';
import { CashListPage } from '../cash-list/cash-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ConfigService } from '../config/config.service';
import { FormatService } from '../services/format.service';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { InvoicePage } from '../invoice/invoice.page';
import { CheckListPage } from '../check-list/check-list.page';
import { CheckPage } from '../check/check.page';
import { ReceiptPopover } from './receipt.popover';
import { AccountListPage } from '../account-list/account-list.page';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
})
export class ReceiptPage implements OnInit {
  @ViewChild('amount_paid') amount_paid;
  receiptForm: FormGroup;
  loading: any;
  today: any;
  avoidAlertMessage: boolean;
  languages: Array<LanguageModel>;
  @Input() items: any;
  @Input() select: any;
  @Input() _id: any;
  @Input() contact: any;
  @Input() name: any;
  @Input() signal: any;
  @Input() currency_exchange: any;
  @Input() origin_id: any;
  currency_precision = 2;
  cash_precision = 2;
  user: any = {};
  company_currency_id = 'currency.PYG';
  confirming = false;
  exchangeDiff = 0;
  smallDiff = 0;
  change = 0;
  currencies:any = {};
  config;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public platform: Platform,
    public modalCtrl: ModalController,
    public receiptService: ReceiptService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public bluetoothSerial: BluetoothSerial,
    public toastCtrl: ToastController,
    public printer: Printer,
    public configService: ConfigService,
    public cashMoveService: CashMoveService,
    public formatService: FormatService,
    public pouchdbService: PouchdbService,
    public popoverCtrl: PopoverController,
    public events: Events,
  ) {
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.avoidAlertMessage = false;
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    this.receiptForm = this.formBuilder.group({
      contact: new FormControl(this.contact || {}, Validators.required),
      name: new FormControl(this.name || 'Recibo'),
      code: new FormControl(''),
      date: new FormControl(this.today),
      total: new FormControl(0),
      residual: new FormControl(0),
      change: new FormControl(0),
      paid: new FormControl(0),
      note: new FormControl(''),
      state: new FormControl('DRAFT'),
      items: new FormControl(this.items || [], Validators.required),
      items_details: new FormControl([]),
      origin_id: new FormControl(this.origin_id || ''),
      payments: new FormControl([]),
      payment_name: new FormControl(''),
      invoices: new FormControl([]),
      amount_unInvoiced: new FormControl(''),
      receipt: new FormControl(''),
      amount_paid: new FormControl(null),
      amount_paid_currency: new FormControl(''),
      currency_exchange: new FormControl(this.currency_exchange || '1'),
      // createInvoice: new FormControl(false),
      currency_id: new FormControl(this.company_currency_id || {}),
      difference_account: new FormControl({}),
      payables: new FormControl([]),
      receivables: new FormControl([]),
      cash_paid: new FormControl({}),
      check: new FormControl({}),
      signal: new FormControl(this.signal || '+'),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser());
    let config: any = await this.configService.getConfig();
    this.config = config;
    this.currency_precision = config.currency_precision;
    this.company_currency_id = config.currency_id || this.company_currency_id;
    let pyg = await this.pouchdbService.getDoc('currency.PYG')
    let usd = await this.pouchdbService.getDoc('currency.USD')
    this.currencies = {
      "currency.PYG": pyg,
      "currency.USD": usd,
    }
    this.recomputeValues();
    if (this._id) {
      this.receiptService.getReceipt(this._id).then((data) => {
        this.receiptForm.patchValue(data);
        this.loading.dismiss();
      });
    } else {
      let cashier: any;
      if (this.user.cash_id) {
        cashier = await this.pouchdbService.getDoc(this.user.cash_id);
      } else {
        cashier = config.cash;
      }
      let rate = cashier.currency && cashier.currency.sale_rate || 1;
      if (this.receiptForm.value.signal == '-'){
        rate =  cashier.currency && cashier.currency.purchase_rate || 1;
      }
      let cash_currency:any = await this.pouchdbService.getDoc(this.items[0] && this.items[0].currency_id || this.company_currency_id);
      this.receiptForm.patchValue({
        "cash_paid": cashier,
        "currency_exchange": cash_currency.purchase_rate,
      });
      await this.recomputeValues();
      await this.loading.dismiss();
      setTimeout(() => {
        this.amount_paid.setFocus();
      }, 200);
    }
  }

  async goNextStep() {
    if (this.receiptForm.value.amount_paid == null) {
      this.amount_paid.setFocus();
    } else if (this.receiptForm.value.amount_paid.toString() == "0" && this.receiptForm.value.total.toString() == "0") {
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      if (!this.confirming) {
        this.confirming = true;
        await this.confirmReceipt();
        this.confirming = false;
      }
    } else if (!this.receiptForm.value.amount_paid) {
      this.amount_paid.setFocus();
    }
    else if (this.receiptForm.value.state == 'DRAFT') {
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      // await this.confirmReceipt();
      if (!this.confirming) {
        this.confirming = true;
        await this.confirmReceipt();
        this.confirming = false;
      }
    }
    //  else {
    //     this.navCtrl.navigateBack('/receipt-list');
    // }
  }

  showDiffAccount(){
    return JSON.stringify(this.receiptForm.value.difference_account) != '{}';
  }

  hasCheck(){
    return JSON.stringify(this.receiptForm.value.check) != '{}';
  }

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
      let toInvoice = data.total;
      this.receiptForm.value.items.forEach(cashMove => {
        let amount_invoiced = 0;
        if (toInvoice > cashMove.amount_unInvoiced) {
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
        if (cashMove.origin_id.split('.')[0] == 'sale') {
          this.pouchdbService.getDoc(cashMove.origin_id).then((sale: any) => {
            sale.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
            sale.invoices.push({
              'number': data.number,
              'date': data.date,
              'total': data.total,
              'tax': data.tax,
              'state': data.state,
              '_id': data._id,
            });
            // console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
            this.pouchdbService.updateDoc(sale);
          });
        }
        else if (cashMove.origin_id.split('.')[0] == 'purchase') {
          this.pouchdbService.getDoc(cashMove.origin_id).then((purchase: any) => {
            purchase.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
            purchase.invoices.push({
              'number': data.number,
              'date': data.date,
              'total': data.total,
              'tax': data.tax,
              'state': data.state,
              '_id': data._id,
            });
            // console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
            this.pouchdbService.updateDoc(purchase);
          });
        }
        else if (cashMove.origin_id.split('.')[0] == 'service') {
          this.pouchdbService.getDoc(cashMove.origin_id).then((service: any) => {
            service.amount_unInvoiced = parseFloat(cashMove.amount_unInvoiced);
            service.invoices.push({
              'number': data.number,
              'date': data.date,
              'total': data.total,
              'tax': data.tax,
              'state': data.state,
              '_id': data._id,
            });
            // console.log("SALE NEW UNINVOICE", cashMove.amount_unInvoiced);
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
      let profileModal = await this.modalCtrl.create({
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


  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: ReceiptPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
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
      }
    });
    profileModal.present();
  }

  beforeConfirm() {
    return new Promise(async resolve => {
      if (!this.receiptForm.value._id) {
        this.justSave();
      }
      if (this.receiptForm.value.items.length == 0) {
        // this.addItem();
      } else {
        await this.receiptConfimation();
        resolve(true);
      }
    })
  }

  addDays(date, days) {
    days = parseInt(days);
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  async buttonSave() {
    if (this._id) {
      await this.receiptService.updateReceipt(this.receiptForm.value);
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
          create_time: doc.create_time,
          create_user: doc.create_user,
          write_time: doc.write_time,
          write_user: doc.write_user,
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
    if (this._id) {
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
          create_time: doc['receipt'].create_time,
          create_user: doc['receipt'].create_user,
          write_time: doc['receipt'].write_time,
          write_user: doc['receipt'].write_user,
        });
        this._id = doc['doc'].id;
        this.receiptForm.markAsPristine();
        //this.events.publish('create-receipt', this.receiptForm.value);
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

  deleteItem(item) {
    if (this.receiptForm.value.state == 'DRAFT') {
      let index = this.receiptForm.value.items.indexOf(item)
      this.receiptForm.value.items.splice(index, 1);
      this.recomputeValues();
    }
  }

  deletePayment(item) {
    let index = this.receiptForm.value.payments.indexOf(item)
    this.receiptForm.value.payments.splice(index, 1);
    this.recomputePayment();
  }

  async editCheck() {
    this.avoidAlertMessage = true;
    let profileModal = await this.modalCtrl.create({
      component: CheckPage,
      componentProps: {
        contact: this.receiptForm.value.contact,
        amount: this.receiptForm.value.total,
        "select": true,
        "_id": this.receiptForm.value.check._id,
        "signal": this.receiptForm.value.signal
      }
    });
    profileModal.present();
    // if (default_amount != 0){
    this.events.subscribe('open-check', (data: any) => {
      // this.receiptForm.value.cash = data;
      // console.log("selectCash", (await this.pouchdbService.getDoc(data.currency_id)))
      this.receiptForm.patchValue({
        "check": data,
        "amount_paid": data.amount,
      })
      profileModal.dismiss();
      this.events.unsubscribe('open-check');
      this.recomputeValues();
    });

    // }
  }

  async recomputeTotal() {
    return new Promise(async resolve => {
      if (this.receiptForm.value.state == 'DRAFT') {
        let total = 0;
        let exchangeDiff = 0;
        // console.log("items", this.receiptForm.value.items);
        let amount_unInvoiced = 0;
        // this.receiptForm.value.items.forEach(async (item: any) => {

        await this.formatService.asyncForEach(this.receiptForm.value.items, async (item: any) => {
          if (item.currency_residual) {
            // if (item.currency._id == this.receiptForm.value.cash_paid.currency._id){
            //   total = total + parseFloat(item['currency_residual']);
            // } else {
            if (this.receiptForm.value.cash_paid.currency_id == item.currency_id) {
              total += parseFloat(item['currency_residual']);// *parseFloat(item.currency.sale_rate)/parseFloat(this.receiptForm.value.cash_paid.currency.sale_rate);
              exchangeDiff += parseFloat(item.amount_residual) - parseFloat(item['currency_residual'])*parseFloat(this.receiptForm.value.currency_exchange);
              console.log("exchangeDiff1", exchangeDiff);
            } else {
              exchangeDiff += parseFloat(item.amount_residual) - parseFloat(item['currency_residual'])*parseFloat(this.receiptForm.value.currency_exchange);
              let item_currency: any = await this.pouchdbService.getDoc(item.currency_id);
              let rate = item_currency.sale_rate;
              if (this.receiptForm.value.signal == "-"){
                rate = item_currency.purchase_rate;
              }
              let cash_currency_exchange:any = 1;
              if (JSON.stringify(this.receiptForm.value.currency)=='{}') {
                  let cash_currency:any = await this.pouchdbService.getDoc(this.company_currency_id);
                 cash_currency_exchange = cash_currency.purchase_rate;

              }
              total += parseFloat(item['currency_residual']) * parseFloat(this.receiptForm.value.currency_exchange) / parseFloat(cash_currency_exchange);
              // exchangeDiff += parseFloat(item.amount_residual) - parseFloat(item['currency_residual']) * parseFloat(this.receiptForm.value.currency_exchange) / parseFloat(rate);
              console.log("exchangeDiff2", exchangeDiff);
            }
            // }
          } else {
            if (this.receiptForm.value.currency_exchange) {
              total += parseFloat(item['amount_residual']) / (parseFloat(this.receiptForm.value.currency_exchange) || 1);
            } else {
              total += parseFloat(item['amount_residual']);
            }
          }
          amount_unInvoiced += parseFloat(item['amount_unInvoiced']);
        });
        console.log("exchangeDiff3", exchangeDiff);
        this.exchangeDiff = exchangeDiff;
        if (amount_unInvoiced > (this.receiptForm.value.amount_paid - this.receiptForm.value.change)) {
          amount_unInvoiced = (this.receiptForm.value.amount_paid - this.receiptForm.value.change);
        }
        if ((total - Math.round(total)) > 0){
          this.smallDiff = 10**(-1*this.currencies[this.receiptForm.value.cash_paid.currency_id || this.company_currency_id].precision);
        }
        this.receiptForm.patchValue({
          total: total,
          amount_unInvoiced: amount_unInvoiced,
        });
        resolve(true);
      }
    })
  }

  recomputePayment() {
    return new Promise(async resolve => {
      let paid = parseFloat(this.receiptForm.value.amount_paid || 0);
      this.receiptForm.value.payments.forEach((item) => {
        paid += parseFloat(item.amount || 0);
      });
      // total = parseFloat(item['currency_residual'])*parseFloat(item.currency.sale_rate)/parseFloat(this.receiptForm.value.cash_paid.currency.sale_rate);
      // paid = paid*(parseFloat(this.receiptForm.value.currency_exchange) || 1);
      let change = paid - parseFloat(this.receiptForm.value.total || 0);
      if (change < 0) {
        change = 0;
      }
      let residual = parseFloat(this.receiptForm.value.total || 0) - paid;
      if (residual < 0) {
        residual = 0;
      }
      this.change = change;
      this.receiptForm.patchValue({
        residual: residual,
        paid: paid,
        change: change,
      });
      resolve(true)
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
      let profileModal = await this.modalCtrl.create({
        component: CashMovePage,
        componentProps: {
          "_id": item.doc._id
}
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
    if (this.receiptForm.value.state == 'DRAFT') {
      item.quantity = parseFloat(item.quantity) + 1;
      this.recomputeValues();
    }
  }

  remItem(item) {
    if (this.receiptForm.value.state == 'DRAFT') {
      item.quantity = parseFloat(item.quantity) - 1;
      this.recomputeValues();
    }
  }

  async editItemPrice(item) {
    if (this.receiptForm.value.state == 'DRAFT') {
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

  async editPaymentAmount(item) {
    if (this.receiptForm.value.state == 'DRAFT') {
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

  async selectAccount() {
    this.avoidAlertMessage = true;
    let profileModal = await this.modalCtrl.create({
      component: AccountListPage,
      componentProps: {
        "select": true,
      }
    });
    profileModal.present();
    this.events.subscribe('select-account', (data: any) => {
      this.receiptForm.patchValue({
        "difference_account": data,
      })
      profileModal.dismiss();
      this.events.unsubscribe('select-account');
      this.recomputeValues();
    });
  }


  async selectCheck() {
    this.avoidAlertMessage = true;
    let profileModal = await this.modalCtrl.create({
      component: CheckListPage,
      componentProps: {
        "select": true,
        "field": "state",
        "filter": "RECEIVED"
      }
    });
    profileModal.present();
    this.events.subscribe('select-check', (data: any) => {
      this.receiptForm.patchValue({
        "check": data,
        "amount_paid": data.currency_amount || data.amount,
        "currency_exchange": this.currencies[data.currency_id || this.company_currency_id].purchase_rate,
      })
      this.receiptForm.value.cash_paid['currency_id'] = data.currency_id;
      profileModal.dismiss();
      this.events.unsubscribe('select-check');
      this.recomputeValues();
    });
  }

  async createCheck() {
    this.avoidAlertMessage = true;
    let data = {
      "contact": this.receiptForm.value.contact,
      "amount": this.receiptForm.value.total,
      "select": true,
      "signal": this.receiptForm.value.signal,
    }
    if (this.receiptForm.value.cash_paid.type == 'bank'){
      data['bank'] = this.receiptForm.value.cash_paid;
      data['my_check'] = true;
    }
    let profileModal = await this.modalCtrl.create({
      component: CheckPage,
      componentProps: data,
    });
    profileModal.present();
    this.events.subscribe('create-check', (data: any) => {
      this.receiptForm.patchValue({
        "check": data,
        "amount_paid": data.currency_amount || data.amount,
        "currency_exchange": this.currencies[data.currency_id || this.company_currency_id].purchase_rate,
      })
      this.receiptForm.value.cash_paid['currency_id'] = data.currency_id;
      profileModal.dismiss();
      this.events.unsubscribe('create-check');
      this.recomputeValues();
    });
  }

  async selectCash() {
    this.avoidAlertMessage = true;
    this.events.subscribe('select-cash', async (data: any) => {
      let currency: any = await this.pouchdbService.getDoc(data.currency_id);
      let rate = currency.sale_rate || 1;
      if (this.receiptForm.value.signal == '-'){
        rate = currency.purchase_rate || 1;
      }
      if (this.items[0].currency_id){
        let cash_currency:any = await this.pouchdbService.getDoc(this.items[0].currency_id || this.company_currency_id);
        rate = cash_currency.purchase_rate;
      }
      this.receiptForm.patchValue({
        "cash_paid": data,
        "currency_exchange": rate,
      })
      this.events.unsubscribe('select-cash');
      if (this.receiptForm.value.signal == '+' && data.type == 'check'){
        this.createCheck();
      } else if (this.receiptForm.value.signal == '-' && data.type == 'check'){
        this.selectCheck();
      }
      await this.recomputeValues();
      if (data.type == 'bank' || data.type == 'cash'){
        this.receiptForm.patchValue({
          "check": {},
        })
        setTimeout(() => {
        console.log("select cash data", data)
          this.amount_paid.setFocus();
        }, 500);
      }
    });
    let profileModal = await this.modalCtrl.create({
      component: CashListPage,
      componentProps: { "select": true, }
    });
    profileModal.present();
  }

  async editPaymentCash(item) {
    this.avoidAlertMessage = true;
    let default_amount = this.receiptForm.value.residual;
    if (default_amount != 0) {
      this.events.subscribe('select-cash', (data) => {
        item.cash = data;
        this.events.unsubscribe('select-cash');
      });
      let profileModal = await this.modalCtrl.create({
        component: CashListPage,
        componentProps: { "select": true, }
      });
      profileModal.present();
    }
  }

  async recomputeValues() {
    return new Promise(async resolve => {
      await this.recomputeTotal();
      await this.recomputePayment();
      resolve(true);
    });
  }

  validation_messages = {
    'contact': [
      { type: 'required', message: 'Client is required.' }
    ]
  };

  confirmReceipt() {
    //console.log("confirmReceipt", this.receiptForm.value);
    return new Promise(async resolve => {
      if (this.receiptForm.value.state == 'DRAFT') {
        await this.beforeConfirm();
        resolve(true);
      } else {
        resolve(false)
      }
    })
  }

  async receiptConfimation() {
    return new Promise(async resolve => {
      let prompt = await this.alertCtrl.create({
        header: 'Confirmar Recibo?',
        message: 'Estas seguro que deseas confirmar la el recibo?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              //console.log("Cancelar");
              resolve(false);
            }
          },
          {
            text: 'Confirmar',
            handler: async data => {
              //console.log("Confirmar");
              this.loading = await this.loadingCtrl.create();
              await this.loading.present();
              await this.afterConfirm();
              await this.loading.dismiss();
              resolve(true);
            }
          }
        ]
      });
      await prompt.present();
      await this.loading.dismiss();
    });
  }

  async afterConfirm() {
    let savedResidual = 0;
    if (this.receiptForm.value.residual > 0
      && JSON.stringify(this.receiptForm.value.difference_account) != "{}"
    ) {
      // console.log("is retencion");
      savedResidual = this.receiptForm.value.residual;
      this.receiptForm.patchValue({
        "change": 0,
        "amount_paid": this.receiptForm.value.total*this.receiptForm.value.currency_exchange,
        "paid": this.receiptForm.value.total*this.receiptForm.value.currency_exchange,
        "residual": 0,
      });
    }
    return new Promise(async resolve => {
      let self = this;
      // self.loading = await self.loadingCtrl.create();
      // await self.loading.present();
      let details = {};
      this.receiptForm.value.items.forEach(variable => {
        details[variable._id] = {
          _id: variable._id,
          name: variable.name,
          date: variable.date,
          amount_dued: variable.amount_residual,
          amount_paid: 0,
        }
      });
      // console.log("details", details);
      this.receiptForm.value.payments.push({
        'amount': (this.receiptForm.value.amount_paid - this.receiptForm.value.change).toFixed(2),
        'date': this.today,
        'cash': this.receiptForm.value.cash_paid,
        'state': 'done',
        'accountTo_name': this.receiptForm.value.cash_paid.name,
        'accountFrom_name': this.receiptForm.value.cash_paid.name,
        // 'items_details': details,
      });

      // let amount_paid1 = this.receiptForm.value.amount_paid-this.receiptForm.value.change;

      let promise_ids = [];
      let credit = 0;
      this.receiptForm.value.items.forEach(ite => {
        if (ite.amount_residual < 0) {
          credit += Math.abs(ite.amount_residual)
        }
      })
      let amount_paid = (this.receiptForm.value.amount_paid - this.receiptForm.value.change + credit) * this.receiptForm.value.currency_exchange;
      let amount_paid2 = this.receiptForm.value.amount_paid - this.receiptForm.value.change + credit;
      let paid_real = this.receiptForm.value.paid - this.receiptForm.value.change;
      let paid_currency = (
        paid_real * this.receiptForm.value.currency_exchange
      ).toFixed(this.currency_precision);
      this.receiptForm.patchValue({
        "change": 0,
        "paid": paid_currency,
      });
      this.receiptForm.value.payments.forEach((item) => {
        let payments = [];
        let toCreateCashMoves = {};
        let paymentAccount = {};

        this.receiptForm.value.items.forEach(ite => {
          if (ite.currency_id && ite.currency_id != this.company_currency_id && ite.currency_id != this.receiptForm.value.cash_paid.currency_id){
            // let ex_rate = this.currencies[ite.currency_id].purchase_rate;
            let ex_rate = parseFloat(this.receiptForm.value.currency_exchange);
              paid_currency = (
                paid_real / ex_rate
              ).toFixed(this.currency_precision);
            this.receiptForm.patchValue({
              "change": 0,
              "paid": paid_currency,
            });
          } else if (ite.currency_id && ite.currency_id != this.company_currency_id && ite.currency_id == this.receiptForm.value.cash_paid.currency_id){
            let ex_rate = this.currencies[ite.currency_id].purchase_rate;
              paid_currency = (
                paid_real
              ).toFixed(this.currency_precision);
            this.receiptForm.patchValue({
              "change": 0,
              "paid": paid_currency,
            });
          }
          // console.log("ite", ite);
          let item_paid = 0;
          let item_residual = 0;
          if (amount_paid > ite.amount_residual) {
            item_paid = ite.amount_residual;
            item_residual = 0;
            amount_paid -= ite.amount_residual;
          } else {
            item_paid = amount_paid;
            item_residual = ite.amount_residual - amount_paid;
            amount_paid = 0;
          }
          details[ite._id]['amount_paid'] += item_paid;
          payments.push({ "_id": ite._id, "amount": item_paid });
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
          if (this.receiptForm.value.signal == "+") {
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
        if (this.receiptForm.value.signal == "+") {
          Object.keys(toCreateCashMoves).forEach(account_id => {
            let doc = {
              "amount": (amount_paid2 * this.receiptForm.value.currency_exchange).toFixed(this.currency_precision),
              "name": this.receiptForm.value.name,
              "date": this.today,
              "accountFrom_id": account_id,
              "contact_id": this.receiptForm.value.contact._id,
              "check_id": this.receiptForm.value.check._id,
              "accountTo_id": this.receiptForm.value.cash_paid._id,
              'signal': this.receiptForm.value.signal,
              "payments": paymentAccount[account_id],
              "origin_id": this.receiptForm.value._id,
            }
            if (this.receiptForm.value.cash_paid.currency_id && this.receiptForm.value.cash_paid.currency_id != this.company_currency_id) {
              doc['currency_amount'] = amount_paid2.toFixed(this.receiptForm.value.cash_paid.currency_id && this.currencies[this.receiptForm.value.cash_paid.currency_id].precision || 0);
              doc['currency_id'] = this.receiptForm.value.cash_paid.currency_id;
              doc['currency_exchange'] = this.receiptForm.value.currency_exchange;
            }
            if (this.receiptForm.value.cash_paid.type == 'check'){
              if (this.receiptForm.value.check.currency_id && this.receiptForm.value.check.currency_id != this.company_currency_id) {
                doc['amount'] = (this.receiptForm.value.check.currency_amount*this.receiptForm.value.currency_exchange).toFixed(this.currency_precision);
                doc['currency_amount'] = this.receiptForm.value.check.currency_amount;
                doc['currency_id'] = this.receiptForm.value.check.currency_id;
                doc['currency_exchange'] = this.receiptForm.value.check.currency_exchange;
              }
            }
            // console.log("Movimento", doc);
            promise_ids.push(this.cashMoveService.createCashMove(doc));





            //Get change from check
            if (this.receiptForm.value.cash_paid.type == 'check'
              && this.change > 0
            ) {

              let cashMoveDoc = {
                "amount": (this.change*this.receiptForm.value.check.currency_exchange).toFixed(this.currency_precision),
                "name": this.receiptForm.value.name,
                "date": this.today,
                "accountTo_id": account_id,
                "contact_id": this.receiptForm.value.contact._id,
                "check_id": this.receiptForm.value.check._id,
                "accountFrom_id": this.config.cash_id,
                'signal': this.receiptForm.value.signal,
                // "payments": paymentAccount[account_id],
                "origin_id": this.receiptForm.value._id,
              }
              console.log("Movimento", cashMoveDoc);
              promise_ids.push(this.cashMoveService.createCashMove(cashMoveDoc));
            }
            // Writeoff para retenciones
            if (savedResidual > 0) {
              let cashMoveDoc = {
                "amount": savedResidual.toFixed(this.currency_precision),
                "name": this.receiptForm.value.name,
                "date": this.today,
                "accountFrom_id": this.receiptForm.value.cash_paid._id,
                "contact_id": this.receiptForm.value.contact._id,
                "check_id": this.receiptForm.value.check._id,
                "accountTo_id": this.receiptForm.value.difference_account._id,
                'signal': this.receiptForm.value.signal,
                "origin_id": this.receiptForm.value._id,
              }
              promise_ids.push(this.cashMoveService.createCashMove(cashMoveDoc));
            }
            //Exchange Difference
            if (this.exchangeDiff != 0) {
              let cashMoveDoc = {
                "amount": this.exchangeDiff.toFixed(this.currency_precision),
                "name": this.receiptForm.value.name,
                "date": this.today,
                "accountFrom_id": this.receiptForm.value.cash_paid._id,
                "contact_id": this.receiptForm.value.contact._id,
                "check_id": this.receiptForm.value.check._id,
                "accountTo_id": this.receiptForm.value.difference_account._id,
                'signal': this.receiptForm.value.signal,
                // "payments": paymentAccount[account_id],
                "origin_id": this.receiptForm.value._id,
              }
              promise_ids.push(this.cashMoveService.createCashMove(cashMoveDoc));
            }

          });
        } else {
          console.log("ERR Movimento");
          Object.keys(toCreateCashMoves).forEach(account_id => {
            let doc = {
              "amount": toCreateCashMoves[account_id],
              "name": this.receiptForm.value.name,
              "date": this.today,
              "check_id": this.receiptForm.value.check._id,
              "accountFrom_id": this.receiptForm.value.cash_paid._id,
              "contact_id": this.receiptForm.value.contact._id,
              "accountTo_id": account_id,
              'signal': this.receiptForm.value.signal,
              "origin_id": this.receiptForm.value._id,
              "payments": payments,
            }
            if (this.receiptForm.value.cash_paid.currency_id != this.company_currency_id) {
              doc['currency_amount'] = amount_paid2.toFixed(this.receiptForm.value.cash_paid.currency_id && this.currencies[this.receiptForm.value.cash_paid.currency_id].precision || 0);
              doc['currency_id'] = this.receiptForm.value.cash_paid.currency_id;
              doc['currency_exchange'] = this.receiptForm.value.currency_exchange;
            }
            if (this.receiptForm.value.cash_paid.type == 'bank' && JSON.stringify(this.receiptForm.value.check) != '{}') {
              doc['state'] = 'WAITING';
            }
            if (this.receiptForm.value.cash_paid.type == 'check'){
              if (this.receiptForm.value.check.currency_id && this.receiptForm.value.check.currency_id != this.company_currency_id) {
                doc['amount'] = (this.receiptForm.value.check.currency_amount*this.receiptForm.value.currency_exchange).toFixed(this.currency_precision);
                doc['currency_amount'] = this.receiptForm.value.check.currency_amount;
                doc['currency_id'] = this.receiptForm.value.check.currency_id;
                doc['currency_exchange'] = this.receiptForm.value.check.currency_exchange;
              }
            }
            // console.log("Movimento", doc);
            promise_ids.push(this.cashMoveService.createCashMove(doc));

            //Get change from check
            if (this.receiptForm.value.cash_paid.type == 'check'
              && this.change > 0
            ) {

              let cashMoveDoc = {
                // "amount": this.change.toFixed(this.currency_precision),
                "amount": (this.change*this.receiptForm.value.check.currency_exchange).toFixed(this.currency_precision),
                "name": this.receiptForm.value.name,
                "date": this.today,
                "accountTo_id": this.config.cash_id,
                "contact_id": this.receiptForm.value.contact._id,
                "check_id": this.receiptForm.value.check._id,
                "accountFrom_id": account_id,
                'signal': this.receiptForm.value.signal,
                // "payments": paymentAccount[account_id],
                "origin_id": this.receiptForm.value._id,
              }
              // console.log("Movimento", cashMoveDoc);
              promise_ids.push(this.cashMoveService.createCashMove(cashMoveDoc));
            }
          });
          if (this.exchangeDiff != 0) {
            let cashMoveDoc = {
              "amount": this.exchangeDiff.toFixed(this.currency_precision),
              "name": this.receiptForm.value.name,
              "date": this.today,
              "accountFrom_id": this.receiptForm.value.cash_paid._id,
              "contact_id": this.receiptForm.value.contact._id,
              "check_id": this.receiptForm.value.check._id,
              "accountTo_id": 'account.payable.cash',
              'signal': this.receiptForm.value.signal,
              // "payments": paymentAccount[account_id],
              "origin_id": this.receiptForm.value._id,
            }
            promise_ids.push(this.cashMoveService.createCashMove(cashMoveDoc));
          }
        }
      });
      let details2 = [];
      Object.keys(details).forEach((detail: any) => {
        details2.push(details[detail]);
      })
      // console.log("details2", details2);
      this.receiptForm.patchValue({
        'state': 'CONFIRMED',
        'items_details': details2,
      });
      Promise.all(promise_ids).then((promise_data) => {
        // console.log("promise_data",promise_data);
        let amount_paid = 0;
        if (this.receiptForm.value.cash_paid.currency_id){
          amount_paid = (this.receiptForm.value.amount_paid - this.receiptForm.value.change + credit)*this.receiptForm.value.currency_exchange;;
        } else  {
          amount_paid = (this.receiptForm.value.amount_paid - this.receiptForm.value.change + credit);
        }
        // let amount_invoiced = amount_paid;
        let promise_ids2 = [];
        this.receiptForm.value.items.forEach(async (item1, index) => {
          let item_paid = 0;
          let item_residual = 0;
          if (item1.currency_id && item1.currency_id != this.company_currency_id){
            if (amount_paid > item1.currency_residual) {
              item_paid = item1.currency_residual;
              item_residual = 0;
              amount_paid -= item1.currency_residual;
            } else {
              item_paid = amount_paid;
              item_residual = item1.currency_residual - amount_paid;
              amount_paid = 0;
            }
            item1.currency_residual = item_residual;
            item1.amount_residual = item_residual*this.receiptForm.value.currency_exchange;
          } else {
            if (amount_paid > item1.amount_residual) {
              item_paid = item1.amount_residual;
              item_residual = 0;
              amount_paid -= item1.amount_residual;
            } else {
              item_paid = amount_paid;
              item_residual = item1.amount_residual - amount_paid;
              amount_paid = 0;
            }
            item1.amount_residual = item_residual;
          }
          item1.payments.push({
            "_id": promise_data[0].id, //FIXME: It's not showing the right move for multi account payments
            "amount": item_paid
          });
          if (JSON.stringify(this.receiptForm.value.check) != '{}') {
            let check:any = await this.pouchdbService.getDoc(this.receiptForm.value.check._id);
            if (this.receiptForm.value.signal == '+') {
              check.state = 'RECEIVED';
              check.account_id = this.receiptForm.value.cash_paid._id;
            } else {
              check.state = 'DELIVERED';
              check.account_id = 'account.payable.credit';
            }
            promise_ids2.push(this.pouchdbService.updateDoc(check));
          }

          promise_ids2.push(this.pouchdbService.updateDoc(item1));
          // console.log("item_residual1", item1.origin_id, item_residual);
          // console.log("ORIGIN", item1.origin_id.split('.')[0]);
          if (item1.origin_id.split('.')[0] == 'sale') {
            // console.log("findSale");
            let sale: any = await this.pouchdbService.getDoc(item1.origin_id);
            // console.log("sALE", JSON.stringify(sale))
            sale.residual = item1.amount_residual;
            // console.log("item_residual2", item_residual);
            sale.payments.push({
              "paid": item_paid,
              "date": this.receiptForm.value.date,
              "state": "CONFIRMED",
              "_id": this.receiptForm.value._id,
            });
            if (item_residual == 0) {
              // console.log("is Paid", sale._id);
              sale['state'] = "PAID";
            }
            // console.log("SALE RES", JSON.stringify(sale));
            await this.pouchdbService.updateDoc(sale);
          }
          else if (item1.origin_id.split('.')[0] == 'purchase') {
            this.pouchdbService.getDoc(item1.origin_id).then((purchase: any) => {
              purchase.residual = item1.amount_residual;
              // console.log("item_residual2", item_residual);
              purchase.payments.push({
                "paid": item_paid,
                "date": this.receiptForm.value.date,
                "state": "CONFIRMED",
                "_id": this.receiptForm.value._id,
              });
              if (item_residual == 0) {
                purchase.state = "PAID";
              }
              this.pouchdbService.updateDoc(purchase);
            })
          }
          else if (item1.origin_id.split('.')[0] == 'service') {
            this.pouchdbService.getDoc(item1.origin_id).then((service: any) => {
              service.residual = item1.amount_residual;
              service.payments.push({
                "paid": item_paid,
                "date": this.receiptForm.value.date,
                "state": "CONFIRMED",
                "_id": this.receiptForm.value._id,
              });
              if (item_residual == 0) {
                service.state = "PAID";
              }
              this.pouchdbService.updateDoc(service);
            })
          }
        });
        Promise.all(promise_ids2).then(res => {
          this.events.publish('create-receipt', this.receiptForm.value);
          this.justSave();
          // self.loading.dismiss();
          resolve(true);
        });
      });
    });
  }

  onSubmit(values) {
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

  isEmpty(object) {
    if (Object.keys(object).length == 0) {
      return true;
    } else {
      return false;
    }
  }

  print() {
    if (this.platform.is('cordova')) {
      this.printBluetooth();
    } else {
      this.printMatrix();
    }
  }

  async printBluetooth() {
    let data = await this.configService.getConfigDoc();

    let company_name = data.name || "";
    let company_ruc = data.doc || "";
    let company_phone = data.phone || "";
    let date = this.receiptForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
    date = date[2] + "/" + date[1] + "/" + date[0]
    // let payment_condition = this.receiptForm.value.paymentCondition.name || "";
    // let contact_name = this.receiptForm.value.contact.name || "";
    // let seller_name = this.receiptForm.value.seller.name || "";
    let code = this.receiptForm.value.code || "";
    // let doc = this.receiptForm.value.contact.document || "";
    //let direction = this.receiptForm.value.contact.city || "";
    //let phone = this.receiptForm.value.contact.phone || "";
    let lines = ""
    let ticket = "";

    ticket += this.formatService.string_pad(
      data.ticketPrint.receiptPaperWidth, " " +
      company_name.substring(0, data.ticketPrint.receiptPaperWidth / 3) +
      " - Tel: " + company_phone.substring(0, data.ticketPrint.receiptPaperWidth / 3) + " ",
      'center', '-') + "\n";
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Recibo: " + code).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5)) + "\n";
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Fecha: " + (new Date(this.receiptForm.value.date)).toLocaleDateString('es-PY')).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5)) + "\n";
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Cliente: " + this.receiptForm.value.contact.name).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5));
    ticket += "\n";
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
    ticket += this.formatService.string_pad(
      Math.floor(data.ticketPrint.receiptPaperWidth / 2), "Documento".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 2))) + "|" + this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 4) - 1, "Valor".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 4) - 1) + "|", 'right') + this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 4), "Cobrado".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 4)), 'right') + "\n";
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
    let new_items_details = [];
    await this.formatService.asyncForEach(this.receiptForm.value.items_details, async (move: any) => {
      let moveOriginal = await this.pouchdbService.getDoc(move._id);
      if (moveOriginal['invoices'].length > 0) {
        let invoice: any = await this.pouchdbService.getDoc(moveOriginal['invoices'][0]._id);
        move.name = invoice.code;
        new_items_details.push(move);
      }
      ticket += this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 2), move.name) +
        this.formatService.string_pad(
          Math.floor(data.ticketPrint.receiptPaperWidth / 4),
          move.amount_dued.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g,
            "."), 'right'
        ) +
        this.formatService.string_pad(
          Math.floor(data.ticketPrint.receiptPaperWidth / 4),
          move.amount_paid.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          'right'
        ) +
        "\n";
    })
    ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
    ticket += "Valor Total" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 11, "$ " + this.receiptForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
    ticket += "Valor Recebido" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 14, "$ " + this.receiptForm.value.payments[0].amount.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
    ticket += "Valor Vuelto" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 12, "$ " + this.receiptForm.value.change.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
    if (data.ticketPrint.showReceiptSignSeller) {
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
      ticket += "Firma del Cobrador\n";
    }
    if (data.ticketPrint.showReceiptSignClient) {
      ticket += "\n";
      ticket += "\n";
      ticket += "\n";
      ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
      ticket += "Firma del Cliente\n";
    }
    let i = data.ticketPrint.receiptMarginBottom;
    while (i > 0) {
      ticket += "\n";
      i--;
    }
    console.log("ticket", ticket);
    // let content = this.formatService.string_pad(40,"RECIBO DE DINERO", 'center', ' ')+"\n";
    // content += company_name+"\n";
    // content += "RUC: "+company_ruc+"\n";
    // content += "Cliente: "+this.receiptForm.value.contact.name+"\n";
    // content += "CI/RUC: "+this.receiptForm.value.contact.document+"\n";
    // content += "Fecha: "+(new Date(this.receiptForm.value.date)).toLocaleDateString('es-PY')+"\n";
    //
    // content += "Monto Total: $ "+this.receiptForm.value.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    // content += "Monto Recebido: $ "+this.receiptForm.value.payments[0].amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    // content += "Monto Vuelto: $ "+this.receiptForm.value.change.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
    // // content += "---------| Movimentos |---------\n";
    // content += this.formatService.string_pad(40, "| Movimentos |", 'center', '-')+"\n";
    // content += this.formatService.string_pad(20, "Documento")+this.formatService.string_pad(10,"Valor", 'right')+this.formatService.string_pad(10,"Cobrado", 'right')+"\n";
    // content += this.formatService.string_pad(40, "", 'center', '-')+"\n";
    // // this.receiptForm.value.items_details.forEach(async (move: any)=>{
    // let new_items_details = [];
    // await this.formatService.asyncForEach(this.receiptForm.value.items_details, async (move: any)=>{
    //   let moveOriginal = await this.pouchdbService.getDoc(move._id);
    //   if (moveOriginal['invoices'].length > 0){
    //     let invoice: any = await this.pouchdbService.getDoc(moveOriginal['invoices'][0]._id);
    //     move.name = invoice.code;
    //     new_items_details.push(move);
    //   }
    //   content += this.formatService.string_pad(20, move.name)+
    //   this.formatService.string_pad(
    //     10,
    //     move.amount_dued.toString().replace(/\B(?=(\d{3})+(?!\d))/g,
    //     "."), 'right'
    //   )+
    //   this.formatService.string_pad(
    //     10,
    //     move.amount_paid.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
    //     'right'
    //   )+
    //   "\n";
    // })
    // content += "\n";
    // content += "\n";
    // content += "\n";
    // content += "\n";
    // content += "\n";
    // content += this.formatService.string_pad(40, "", 'center', '-')+"\n";
    // content += "Firma del cobrador\n";
    // content += "\n";
    // content += "\n";
    // content += "\n";
    if (!this.receiptForm.value.items_details && new_items_details) {
      this.receiptForm.patchValue({
        items_details: new_items_details,
      })
      this.justSave();
    }
    // Print to bluetooth printer
    let toast = await this.toastCtrl.create({
      message: "Imprimiendo...",
      duration: 3000
    });
    toast.present();
    this.bluetoothSerial.isEnabled().then(res => {
      this.bluetoothSerial.list().then((data) => {
        this.bluetoothSerial.connect(data[0].id).subscribe((data) => {
          this.bluetoothSerial.isConnected().then(res => {
            // |---- 32 characteres ----|
            this.bluetoothSerial.write(ticket);
            this.bluetoothSerial.disconnect();
          }).catch(res => {
            //console.log("res1", res);
          });
        }, error => {
          //console.log("error", error);
        });
      })
    }).catch(res => {
      //console.log("res", res);
    });
  }

  printMatrix() {
    var prefix = "Recibo_";
    var extension = ".prt";
    this.configService.getConfigDoc().then(async (data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      let date = this.receiptForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2] + "/" + date[1] + "/" + date[0]
      // let payment_condition = this.receiptForm.value.paymentCondition.name || "";
      let contact_name = this.receiptForm.value.contact.name || "";
      // let seller_name = this.receiptForm.value.seller.name || "";
      let code = this.receiptForm.value.code || "";
      let doc = this.receiptForm.value.contact.document || "";
      //let direction = this.receiptForm.value.contact.city || "";
      //let phone = this.receiptForm.value.contact.phone || "";
      let lines = ""
      let ticket = "";
      if (data.ticketPrint.receiptPaperWidth >= 80) {
        ticket += this.formatService.string_pad(
          data.ticketPrint.receiptPaperWidth, " " +
          company_name.substring(0, data.ticketPrint.receiptPaperWidth / 3) +
          " - Tel: " + company_phone.substring(0, data.ticketPrint.receiptPaperWidth / 3) + " ",
          'center', '-') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Recibo: " + code).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5));
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Fecha: " + (new Date(this.receiptForm.value.date)).toLocaleString('es-PY')).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5)) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Cliente: " + this.receiptForm.value.contact.name).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5));
        ticket += "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2, "Documento") + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 4, "Valor", 'right') + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 4, "Cobrado", 'right') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        let new_items_details = [];
        await this.formatService.asyncForEach(this.receiptForm.value.items_details, async (move: any) => {
          let moveOriginal = await this.pouchdbService.getDoc(move._id);
          if (moveOriginal['invoices'].length > 0) {
            let invoice: any = await this.pouchdbService.getDoc(moveOriginal['invoices'][0]._id);
            move.name = invoice.code;
            new_items_details.push(move);
          }
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2, move.name) +
            this.formatService.string_pad(
              data.ticketPrint.receiptPaperWidth / 4,
              move.amount_dued.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g,
                "."), 'right'
            ) +
            this.formatService.string_pad(
              data.ticketPrint.receiptPaperWidth / 4,
              move.amount_paid.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
              'right'
            ) +
            "\n";
        })
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth,
          "Valor Total:" + this.formatService.string_pad(
            14, "$ " + this.receiptForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + " ",
          'right', ' '
        ) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "Valor Recebido: $ " + this.receiptForm.value.payments[0].amount.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "Vuelto: $ " + this.receiptForm.value.change.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")) + "\n";
        if (data.ticketPrint.showReceiptSignSeller || data.ticketPrint.showReceiptSignClient) {
          ticket += "\n";
          ticket += "\n";
        }
        if (data.ticketPrint.showReceiptSignSeller) {
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "", 'center', '_');
          ticket += "          ";
        }
        if (data.ticketPrint.showReceiptSignClient) {
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "", 'center', '_') + "\n";
        }
        if (data.ticketPrint.showReceiptSignSeller) {
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "Firma del Cobrador", 'center', ' ');
          ticket += "          ";
        }
        if (data.ticketPrint.showReceiptSignClient) {
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, "Firma del Cliente", 'center', ' ') + "\n";
        }
        let i = data.ticketPrint.receiptMarginBottom;
        while (i > 0) {
          ticket += "\n";
          i--;
        }
      } else {
        ticket += this.formatService.string_pad(
          data.ticketPrint.receiptPaperWidth, " " +
          company_name.substring(0, data.ticketPrint.receiptPaperWidth / 3) + " ",
          'center', '-') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Recibo: " + code).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5)) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Fecha: " + (new Date(this.receiptForm.value.date)).toLocaleDateString('es-PY')).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5)) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth / 2 - 5, ("Cliente: " + this.receiptForm.value.contact.name).substring(0, data.ticketPrint.receiptPaperWidth / 2 - 5));
        ticket += "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        ticket += this.formatService.string_pad(
          Math.floor(data.ticketPrint.receiptPaperWidth / 2), "Documento".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 2))) + "|" + this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 4) - 1, "Valor".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 4) - 1) + "|", 'right') + this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 4), "Cobrado".substring(0, Math.floor(data.ticketPrint.receiptPaperWidth / 4)), 'right') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        let new_items_details = [];
        await this.formatService.asyncForEach(this.receiptForm.value.items_details, async (move: any) => {
          let moveOriginal = await this.pouchdbService.getDoc(move._id);
          if (moveOriginal['invoices'].length > 0) {
            let invoice: any = await this.pouchdbService.getDoc(moveOriginal['invoices'][0]._id);
            move.name = invoice.code;
            new_items_details.push(move);
          }
          ticket += this.formatService.string_pad(Math.floor(data.ticketPrint.receiptPaperWidth / 2), move.name) +
            this.formatService.string_pad(
              Math.floor(data.ticketPrint.receiptPaperWidth / 4),
              move.amount_dued.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g,
                "."), 'right'
            ) +
            this.formatService.string_pad(
              Math.floor(data.ticketPrint.receiptPaperWidth / 4),
              move.amount_paid.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
              'right'
            ) +
            "\n";
        })
        ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
        ticket += "Valor Total" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 11, "$ " + this.receiptForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        ticket += "Valor Recebido" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 14, "$ " + this.receiptForm.value.payments[0].amount.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        ticket += "Valor Vuelto" + this.formatService.string_pad(data.ticketPrint.receiptPaperWidth - 12, "$ " + this.receiptForm.value.change.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        if (data.ticketPrint.showReceiptSignSeller) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Cobrador\n";
        }
        if (data.ticketPrint.showReceiptSignClient) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.receiptPaperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Cliente\n";
        }
        let i = data.ticketPrint.receiptMarginBottom;
        while (i > 0) {
          ticket += "\n";
          i--;
        }
      }
      // console.log("ticket", ticket);
      this.formatService.printMatrixClean(ticket, prefix + this.receiptForm.value.code + extension);
      let toast = await this.toastCtrl.create({
        message: "Imprimiendo...",
        duration: 3000
      });
      toast.present();
    });
  }

  showNextButton() {
    // console.log("stock",this.receiptForm.value.stock);
    if (this.receiptForm.value.amount_paid == null && this.receiptForm.value.state == 'DRAFT') {
      return true;
    }
    else if (this.receiptForm.value.state == 'DRAFT') {
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
    if (this.receiptForm.dirty) {
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
    if (this.select) {
      this.modalCtrl.dismiss();
    } else {
      this.receiptForm.markAsPristine();
      this.navCtrl.navigateBack('/receipt-list');
    }
  }

  async checkAllowCancel() {
    return new Promise(async resolve => {
      let result = true;
      await this.formatService.asyncForEach(this.receiptForm.value.items, async (payment: any) => {
        let cashMove: any = await this.pouchdbService.getDoc(payment._id);
        if (cashMove.close_id) {
          result = false;
        }
      })
      resolve(result);
    })
  }

  async receiptCancel() {
    let allow = await this.checkAllowCancel();
    if (allow) {
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas Cancelar el recibo?',
        message: 'Al cancelar el Recibo todos los registros asociados serán borrados',
        buttons: [
          {
            text: 'No',
            handler: data => {
            }
          },
          {
            text: 'Si',
            handler: async data => {
              await this.removeCashMoves();
              this.events.publish('cancel-receipt', this.receiptForm.value._id);
              if (this.select) {
                this.modalCtrl.dismiss();
              } else {
                this.navCtrl.navigateBack('/receipt-list');
              }
            }
          }
        ]
      });
      prompt.present();
    } else {
      let prompt = await this.alertCtrl.create({
        message: 'No se puede cancelar un recibo que ya tenga el caja cerrado',
        buttons: [
          {
            text: 'Ok',
            handler: data => {
            }
          },
        ]
      });
      prompt.present();
    }
  }

  async removeCashMoves() {
    return new Promise(async resolve => {

      // this.receiptForm.value.payments.forEach(payment => {
      await this.formatService.asyncForEach(this.receiptForm.value.payments, async (payment: any) => {
        let total = 0
        await this.formatService.asyncForEach(this.receiptForm.value.items, async (item: any) => {

          // })
          // this.receiptForm.value.items.forEach(async item => {
          let paidMove: any = await this.pouchdbService.getDoc(item._id);
          let payments = [];
          paidMove.payments.forEach((paid, index) => {
            if (paid._id != payment._id) {
              // paidMove.payments.slice(index, 1);
              payments.push(paid);
            } else {
              total += paid.amount;
            }
          })
          paidMove.payments = payments;
          paidMove.amount_residual += total;
          await this.pouchdbService.updateDoc(paidMove);
        });
        this.pouchdbService.deleteDoc(payment);
      });
      let doc = await this.pouchdbService.getDoc(this.receiptForm.value._id);
      this.pouchdbService.deleteDoc(doc);
      resolve(true);
    })
  }
}

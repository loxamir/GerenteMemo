import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
//import { DecimalPipe } from '@angular/common';
import { Printer } from '@ionic-native/printer/ngx';
// import { File } from '@ionic-native/file/ngx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { FutureContractService } from './future-contract.service';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CropsPage } from '../crops/crops.page';
//import { FutureContractItemPage } from '../future-contract-item/future-contract-item';
import { StockMovePage } from '../stock-move/stock-move.page';
import { ProductService } from '../product/product.service';
//import { FutureContractsPage } from '../future-contracts/future-contracts';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
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
import { FutureContractPopover } from './future-contract.popover';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CurrencyListPage } from '../currency-list/currency-list.page';
// declare var cordova:any;
// import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CashMovePage } from '../cash-move/cash-move.page';
import { ContactPage } from '../contact/contact.page';
import { WarehouseListPage } from '../warehouse-list/warehouse-list.page';
import { WorkPage } from '../work/work.page';
import { SalePage } from '../sale/sale.page';

@Component({
  selector: 'app-future-contract',
  templateUrl: './future-contract.page.html',
  styleUrls: ['./future-contract.page.scss'],
})
export class FutureContractPage implements OnInit {
  @ViewChild('note', { static: true }) note;
  @ViewChild('quantity', { static: true }) quantity;
  @ViewChild('price', { static: true }) price;
  @ViewChild('corpo', { static: true }) corpo;
  listenBarcode = true;
  timeStamp: any;
  barcode: string = "";
  futureContractForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  select;
  languages: Array<LanguageModel>;
  contact;
  crop;
  warehouse;
  contact_name;
  items;
  origin_id;
  return;
  currency_precision = 2;
  confirming = false;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    public platform: Platform,
    public futureContractService: FutureContractService,
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
    public events: Events,
    public pouchdbService: PouchdbService,
    public popoverCtrl: PopoverController,
    public socialSharing: SocialSharing,
    // public file: File,
  ) {
    this.today = new Date();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.avoidAlertMessage = false;

    this.contact = this.route.snapshot.paramMap.get('contact');
    this.crop = this.route.snapshot.paramMap.get('crop');
    this.warehouse = this.route.snapshot.paramMap.get('warehouse');
    this.contact_name = this.route.snapshot.paramMap.get('contact_name');
    this.items = this.route.snapshot.paramMap.get('items');
    this.origin_id = this.route.snapshot.paramMap.get('origin_id');
    this.return = this.route.snapshot.paramMap.get('return');
  }

  async ngOnInit() {
    this.futureContractForm = this.formBuilder.group({
      contact: new FormControl(this.contact || {}, Validators.required),
      contact_name: new FormControl(this.contact_name || ''),
      name: new FormControl(''),
      code: new FormControl(''),
      date: new FormControl(this.route.snapshot.paramMap.get('date') || this.today.toISOString()),
      // origin_id: new FormControl(this.origin_id),
      quantity: new FormControl(0),
      price: new FormControl(0),
      cost: new FormControl(0),
      residual: new FormControl(0),
      note: new FormControl(undefined),
      state: new FormControl('QUOTATION'),
      // discount: new FormControl({value: 0, discountProduct: true}),
      // items: new FormControl(this.items||[], Validators.required),
      // payments: new FormControl([]),
      // planned: new FormControl([]),
      product: new FormControl({}),
      product_name: new FormControl(''),
      // invoice: new FormControl(''),
      // invoices: new FormControl([]),
      deliveries: new FormControl([]),
      // amount_unInvoiced: new FormControl(0),
      // seller: new FormControl(this.route.snapshot.paramMap.get('seller')||{}, Validators.required),
      // seller_name: new FormControl(this.route.snapshot.paramMap.get('seller_name')||''),
      // currency: new FormControl(this.route.snapshot.paramMap.get('currency')||{}),
      _id: new FormControl(''),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      write_time: new FormControl(''),
      crop: new FormControl(this.crop || {}),
      date_delivery: new FormControl(this.crop && this.crop.date_end || this.today.toISOString()),
      delivered: new FormControl(0),
      warehouse: new FormControl(this.warehouse || {}),
      sales: new FormControl([]),
      sold: new FormControl(0),
      settlements: new FormControl([]),
      settled: new FormControl(0),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (config.default_contact_id) {
      let default_contact: any = await this.pouchdbService.getDoc(config.default_contact_id);
      this.futureContractForm.patchValue({
        'contact': default_contact
      })
    }
    // if (config.default_payment_id){
    //   let default_payment:any = await this.pouchdbService.getDoc(config.default_payment_id);
    //   this.futureContractForm.patchValue({
    //     'paymentCondition': default_payment
    //   })
    // }
    if (this._id) {
      this.futureContractService.getFutureContract(this._id).then((data) => {
        this.futureContractForm.patchValue(data);
        if (data.state != 'QUOTATION') {
          // this.futureContractForm.controls.date.disable();
        }
        this.loading.dismiss();
      });
    } else {
      this.loading.dismiss();
    }
    if (this.return) {
      this.recomputeValues();
    }
  }

  async addSettlement() {
    // if (this.saleForm.value.state=='QUOTATION'){
    let prompt = await this.alertCtrl.create({
      header: 'Cantidad acertada',
      message: 'Cual es la cantidad entregada',
      inputs: [
        {
          type: 'number',
          name: 'quantity',
          value: this.futureContractForm.value.quantity - this.futureContractForm.value.delivered - this.futureContractForm.value.settled,
        },

      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          handler: data => {
            // item.price = data.price;
            // this.recomputeValues();
            // this.saleForm.markAsDirty();
            this.futureContractForm.value.settlements.push({
              value: [parseFloat(data.quantity), { date: "2019-07-11T12:48:47.650Z" }]
            });
            this.futureContractForm.value.settled += parseFloat(data.quantity);
          }
        }
      ]
    });

    prompt.present();
    // }
  }

  async createSale() {
    this.events.unsubscribe('create-sale');
    this.events.subscribe('create-sale', (data) => {
      this.futureContractForm.patchValue({
        sold: data,
        sales: data,
      });
      this.futureContractForm.markAsDirty();
      this.events.unsubscribe('create-sale');
    })
    var items = [{
      'quantity': this.futureContractForm.value.delivered + this.futureContractForm.value.settled - this.futureContractForm.value.sold,
      'price': this.futureContractForm.value.price - this.futureContractForm.value.cost,
      'product': this.futureContractForm.value.product,
      'contract_id': this.futureContractForm.value._id,
    }];
    let profileModal = await this.modalCtrl.create({
      component: SalePage,
      componentProps: {
        "select": true,
        contact: this.futureContractForm.value.contact,
        crop: this.futureContractForm.value.crop,
        warehouse: this.futureContractForm.value.warehouse,
        items: items
      }
    })
    profileModal.present();
  }

  async editSettle(item) {
    // if (this.saleForm.value.state=='QUOTATION'){
    let prompt = await this.alertCtrl.create({
      header: 'Cantidad acertada',
      message: 'Cual es la cantidad entregada',
      inputs: [
        {
          type: 'number',
          name: 'quantity',
          value: item.value[0]
        },

      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          handler: data => {
            this.futureContractForm.value.settled += parseFloat(data.quantity) - parseFloat(item.value[0]);
            item.value[0] = data.quantity
          }
        }
      ]
    });

    prompt.present();
    // }
  }

  editContact() {
    return new Promise(async resolve => {
      this.events.unsubscribe('open-contact');
      this.events.subscribe('open-contact', (data) => {
        this.futureContractForm.patchValue({
          contact: data,
          // type: data.type,
          // cash_out: data.cash_out,
          // cash_in: data.cash_in,
          // transfer: data.transfer,
          // payable: data.payable,
          // receivable: data.receivable,
        });
        this.futureContractForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('open-contact');
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactPage,
        componentProps: {
          "select": true,
          "_id": this.futureContractForm.value.contact._id,
        }
      });
      profileModal.present();
    });
  }

  confirmState() {
    if (!this.futureContractForm.value.quantity) {
      this.quantity.setFocus();
    } else if (!this.futureContractForm.value.price) {
      this.price.setFocus();
    } else if (Object.keys(this.futureContractForm.value.contact).length === 0) {
      this.selectContact();
    } else {
      this.futureContractForm.patchValue({
        'state': 'CONFIRMED',
        'residual': this.futureContractForm.value.quantity
      })
      this.buttonSave();
    }
  }

  async selectCashMove(item) {
    this.listenBarcode = false;
    this.events.unsubscribe('open-cash-move');
    this.events.subscribe('open-cash-move', (data) => {
      this.events.unsubscribe('open-cash-move');
      // profileModal.dismiss();
    });
    // this.events.subscribe('cancel-receipt', (data) => {
    //   let newPayments = [];
    //   let residual = this.futureContractForm.value.residual;
    //   this.futureContractForm.value.payments.forEach((receipt, index)=>{
    //     if (receipt._id != data){
    //       this.futureContractForm.value.payments.slice(index, 1);
    //       newPayments.push(receipt);
    //     } else {
    //       residual += receipt.paid;
    //     }
    //   })
    //   this.pouchdbService.getRelated(
    //   "cash-move", "origin_id", this.futureContractForm.value._id).then((planned) => {
    //     this.futureContractForm.patchValue({
    //       payments: newPayments,
    //       residual: residual,
    //       state: 'CONFIRMED',
    //       planned: planned
    //     })
    //     this.buttonSave();
    //   });
    //   this.events.unsubscribe('cancel-receipt');
    // });
    let profileModal = await this.modalCtrl.create({
      component: CashMovePage,
      componentProps: {
        "select": true,
        "_id": item._id,
      }
    });
    await profileModal.present();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  async selectStockMove(item) {
    let activity: any = this.pouchdbService.getDoc('activity.loads');
    let args = Object.assign({}, item);
    let context = {
      data: args,
      list: true,
      go: true,
      activity: activity,
      select: true,
    }
    let profileModal = await this.modalCtrl.create({
      component: WorkPage,
      componentProps: context
    });
    await profileModal.present();
    await profileModal.onDidDismiss();
  }



  selectCurrency() {
    return new Promise(async resolve => {
      this.listenBarcode = false;
      this.events.subscribe('select-currency', (data) => {
        this.futureContractForm.patchValue({
          currency: data,
          // cash_id: data._id,
        });
        this.futureContractForm.markAsDirty();
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
      await profileModal.present();
      await profileModal.onDidDismiss();
      this.listenBarcode = true;
    });
  }

  async futureContractReturn() {
    this.listenBarcode = false;
    let formValues = Object.assign({}, this.futureContractForm.value);
    let items = [];
    formValues.items.forEach((item: any) => {
      items.push({
        'product_name': item.product_name,
        'product': item.product,
        'quantity': -item.quantity,
        'price': item.price,
        'cost': item.cost,
      });
    })
    let profileModal = await this.modalCtrl.create({
      component: FutureContractPage,
      componentProps: {
        "return": true,
        "select": true,
        "contact": this.futureContractForm.value.contact,
        "contact_name": this.futureContractForm.value.contact_name,
        "items": items,
        "origin_id": this.futureContractForm.value._id,
      }
    });
    await profileModal.present();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  buttonSave() {
    return new Promise(async resolve => {
      if (this._id) {
        await this.futureContractService.updateFutureContract(this.futureContractForm.value);
        this.futureContractForm.markAsPristine();
        this.events.publish('edit-future-contract', this.futureContractForm.value);
        resolve(true);
      } else {
        this.futureContractService.createFutureContract(this.futureContractForm.value).then(doc => {
          this.futureContractForm.patchValue({
            _id: doc['doc'].id,
            code: doc['futureContract'].code,
            create_time: doc['futureContract'].create_time,
            create_user: doc['futureContract'].create_user,
            write_time: doc['futureContract'].write_time,
            write_user: doc['futureContract'].write_user,
          });
          this._id = doc['doc'].id;
          this.futureContractForm.markAsPristine();
          this.events.publish('create-future-contract', this.futureContractForm.value);
          resolve(true);
        });
      }
    })
  }

  setLanguage(lang: LanguageModel) {
    let language_to_set = this.translate.getDefaultLang();

    if (lang) {
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }

  async deleteItem(slidingItem, item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      //console.log("delete item", item);
      slidingItem.close();
      let index = this.futureContractForm.value.items.indexOf(item)
      this.futureContractForm.value.items.splice(index, 1);
      this.futureContractForm.markAsDirty();
      this.recomputeValues();
    }
  }

  // deletePayment(item){
  //   let index = this.futureContractForm.value.payments.indexOf(item)
  //   this.futureContractForm.value.payments.splice(index, 1);
  //   this.recomputeResidual();
  // }

  recomputeTotal() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      let total = 0;
      this.futureContractForm.value.items.forEach((item) => {
        total = total + item.quantity * item.price;
      });
      // total -= this.futureContractForm.value.discount.value;
      //console.log("total", total);
      this.futureContractForm.patchValue({
        total: total,
      });
    }
  }

  recomputeDiscountLines() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      let discount_lines = 0;
      this.futureContractForm.value.items.forEach((item) => {
        if (item.product._id != "product.discount") {
          discount_lines += parseFloat(item.quantity) * (parseFloat(item.price_original || item.price) - parseFloat(item.price));
        }
      });
      //console.log("discount_lines", discount_lines);
      if (!discount_lines) {
        discount_lines = 0;
      }
      this.futureContractForm.value.discount['lines'] = discount_lines
      this.futureContractForm.patchValue({
        discount: this.futureContractForm.value.discount,
      });
    }
  }

  lineDiscountPercent(line) {
    return (
      100 * (
        1 - parseFloat(line.price) / parseFloat(line.price_original)
      )
    ).toFixed(0)
  }

  // recomputeUnInvoiced(){
  //   let amount_unInvoiced = 0;
  //   this.pouchdbService.getRelated(
  //     "cash-move", "origin_id", this.futureContractForm.value._id
  //   ).then((planned) => {
  //     planned.forEach((item) => {
  //       if (item.amount_unInvoiced){
  //         amount_unInvoiced += parseFloat(item.amount_unInvoiced);
  //       }
  //     });
  //     this.futureContractForm.patchValue({
  //       amount_unInvoiced: amount_unInvoiced,
  //     });
  //   });
  // }

  recomputeResidual() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      let residual = parseFloat(this.futureContractForm.value.total);
      this.futureContractForm.value.payments.forEach((item) => {
        residual -= parseFloat(item.paid || 0);
      });
      this.futureContractForm.patchValue({
        residual: residual,
      });
    }
  }

  async addItem() {
    let self = this;
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.avoidAlertMessage = true;
      this.listenBarcode = false;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', async (product) => {
        self.futureContractForm.value.items.unshift({
          'quantity': 1,
          'price': product.price,
          'cost': product.cost,
          'product': product,
          'description': product.name,
        })
        self.recomputeValues();
        self.futureContractForm.markAsDirty();
        self.avoidAlertMessage = false;
        self.events.unsubscribe('select-product');
        profileModal.dismiss();
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: {
          "select": true
        }
      });
      await profileModal.present();
      await this.loading.dismiss();
      await profileModal.onDidDismiss();
      this.listenBarcode = true;
    }
  }

  async openItem(item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.avoidAlertMessage = true;
      this.listenBarcode = false;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        //console.log("vars", data);
        item.price = data.price;
        item.product = data;
        item.description = data.name;
        this.recomputeValues();
        this.avoidAlertMessage = false;
        this.futureContractForm.markAsDirty();
        this.events.unsubscribe('select-product');
        profileModal.dismiss();
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: {
          "select": true,
        }
      });
      await profileModal.present();
      await profileModal.onDidDismiss();
      this.listenBarcode = true;
    }
  }

  sumItem(item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      item.quantity = parseFloat(item.quantity) + 1;
      this.recomputeValues();
      this.futureContractForm.markAsDirty();
    }
  }

  remItem(item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      item.quantity = parseFloat(item.quantity) - 1;
      this.recomputeValues();
      this.futureContractForm.markAsDirty();
    }
  }

  async editItemPrice(item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
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
              this.futureContractForm.markAsDirty();
            }
          }
        ]
      });

      prompt.present();
    }
  }

  async editItemQuantity(item) {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.listenBarcode = false;
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
              this.futureContractForm.markAsDirty();
            }
          }
        ]
      });

      await prompt.present();
      await prompt.onDidDismiss();
      this.listenBarcode = true;
    }
  }

  async openPayment(item) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.listenBarcode = false;
    this.events.unsubscribe('open-receipt');
    this.events.subscribe('open-receipt', (data) => {
      this.events.unsubscribe('open-receipt');
      // profileModal.dismiss();
    });
    this.events.subscribe('cancel-receipt', (data) => {
      let newPayments = [];
      let residual = this.futureContractForm.value.residual;
      this.futureContractForm.value.payments.forEach((receipt, index) => {
        if (receipt._id != data) {
          this.futureContractForm.value.payments.slice(index, 1);
          newPayments.push(receipt);
        } else {
          residual += receipt.paid;
        }
      })
      this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.futureContractForm.value._id).then((planned) => {
          this.futureContractForm.patchValue({
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
        "select": true,
        "_id": item._id,
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  recomputeValues() {
    this.recomputeTotal();
    // this.recomputeUnInvoiced();
    this.recomputeResidual();
    this.recomputeDiscountLines()
    if (this.futureContractForm.value.total != 0 && this.futureContractForm.value.residual == 0) {
      this.futureContractForm.patchValue({
        state: "PAID",
      });
    }
  }

  validation_messages = {
    'contact': [
      { type: 'required', message: 'Client is required.' }
    ]
  };

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: FutureContractPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
  }

  afterConfirm() {
    return new Promise(async resolve => {
      this.futureContractForm.patchValue({
        amount_unInvoiced: this.futureContractForm.value.total,
      });
      if (!this.futureContractForm.value._id) {
        await this.buttonSave();
      }
      let createList = [];
      this.configService.getConfigDoc().then((config: any) => {
        this.pouchdbService.getList([
          'warehouse.client',
          config.warehouse_id,
          'account.other.stock',
          'account.expense.soldGoodCost',
          'account.income.futureContract',
          this.futureContractForm.value.paymentCondition.accountTo_id
        ]).then((docList: any) => {
          let docDict = {}
          docList.forEach(item => {
            docDict[item.id] = item;
          })
          let warehouse = {
            _id: this.futureContractForm.value.warehouse && this.futureContractForm.value.warehouse._id || config.warehouse_id,
            name: this.futureContractForm.value.warehouse && this.futureContractForm.value.warehouse.name || docDict[config.warehouse_id].doc.name
          }
          this.futureContractForm.value.items.forEach(async (item) => {
            let product_id = item.product_id || item.product._id;
            let product_name = item.product_name || item.product.name;
            createList.push({
              'name': "Venta " + this.futureContractForm.value.code,
              'quantity': parseFloat(item.quantity),
              'origin_id': this.futureContractForm.value._id,
              'contact_id': this.futureContractForm.value.contact._id,
              'contact_name': this.futureContractForm.value.contact.name,
              'product_id': product_id,
              'product_name': product_name,
              'docType': "stock-move",
              'date': new Date(),
              'cost': parseFloat(item.cost) * parseFloat(item.quantity),
              'warehouseFrom_id': warehouse._id,
              'warehouseFrom_name': warehouse.name,
              'warehouseTo_id': 'warehouse.client',
              'warehouseTo_name': docDict['warehouse.client'].doc.name,
            })
            createList.push({
              'name': "Venta " + this.futureContractForm.value.code,
              'contact_id': this.futureContractForm.value.contact._id,
              'contact_name': this.futureContractForm.value.contact.name,
              'amount': item.quantity * item.cost,
              'origin_id': this.futureContractForm.value._id,
              'date': new Date(),
              'accountFrom_id': 'account.other.stock',
              'accountFrom_name': docDict['account.other.stock'].doc.name,
              'accountTo_id': 'account.expense.soldGoodCost',
              'accountTo_name': docDict['account.expense.soldGoodCost'].doc.name,
              'docType': "cash-move",
            })
            if (item.quantity < 0) {
              // let product = await this.productService.getProduct(product_id);
              let old_stock = item.product.stock || 0;
              let old_cost = item.product.cost || 0;
              await this.productService.updateStockAndCost(
                product_id,
                Math.abs(item.quantity),
                item.cost,
                old_stock,
                old_cost);
            }
          });
          this.futureContractForm.value.paymentCondition.items.forEach(item => {
            let dateDue = this.formatService.addDays(this.today.toISOString(), item.days);
            // console.log("dentro", this.futureContractForm.value);
            let amount = (item.percent / 100) * this.futureContractForm.value.total;
            let cashMoveTemplate = {
              '_return': true,
              'date': new Date(),
              'name': "Venta " + this.futureContractForm.value.code,
              'contact_id': this.futureContractForm.value.contact._id,
              'contact_name': this.futureContractForm.value.contact.name,
              'amount': amount,
              'amount_residual': amount,
              'amount_unInvoiced': amount,
              'docType': "cash-move",
              'payments': [],
              'invoices': [],
              'origin_id': this.futureContractForm.value._id,
              'dateDue': dateDue.toISOString(),
              'accountFrom_id': 'account.income.futureContract',
              'accountFrom_name': docDict['account.income.futureContract'].doc.name,
              'accountTo_id': this.futureContractForm.value.paymentCondition.accountTo_id,
              'accountTo_name': docDict[this.futureContractForm.value.paymentCondition.accountTo_id].doc.name,
            }
            if (this.futureContractForm.value.currency._id) {
              cashMoveTemplate['currency'] = this.futureContractForm.value.currency;
              cashMoveTemplate['currency_amount'] = amount;
              cashMoveTemplate['currency_residual'] = amount;
              cashMoveTemplate['amount'] = amount * this.futureContractForm.value.currency.exchange_rate;
              cashMoveTemplate['residual'] = amount * this.futureContractForm.value.currency.exchange_rate;
            }
            createList.push(cashMoveTemplate);
          });
          //console.log("createList", createList);
          this.pouchdbService.createDocList(createList).then(async (created: any) => {
            this.futureContractForm.patchValue({
              state: 'CONFIRMED',
              amount_unInvoiced: this.futureContractForm.value.total,
              planned: created.filter(word => typeof word.amount_residual !== 'undefined'),
            });
            //console.log("FutureContract created", created);
            await this.buttonSave();
            resolve(true);
          })
        })
      });
    });
  }

  async futureContractCancel() {
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
            this.futureContractForm.value.items.forEach((item) => {
              ////console.log("item", item);
              // let product_id = item.product_id || item.product._id;
              // this.productService.updateStock(product_id, item.quantity);
              //this.futureContractForm.value.step = 'chooseInvoice';
            });
            this.futureContractForm.patchValue({
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

  removeQuotes() {
    this.pouchdbService.getRelated(
      "cash-move", "origin_id", this.futureContractForm.value._id).then((docs) => {
        docs.forEach(doc => {
          this.pouchdbService.deleteDoc(doc);
        })
      });
    this.futureContractForm.patchValue({
      'planned': [],
    });
  }

  removeStockMoves() {
    this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.futureContractForm.value._id).then((docs) => {
        docs.forEach(doc => {
          this.futureContractService.deleteFutureContract(doc);
        })
      });
  }

  async addPayment() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.avoidAlertMessage = true;
    this.listenBarcode = false;
    this.events.unsubscribe('create-receipt');
    this.events.subscribe('create-receipt', (data) => {
      //console.log("DDDDDDDATA", data);
      this.futureContractForm.value.payments.push({
        'paid': data.paid,
        'date': data.date,
        'state': data.state,
        '_id': data._id,
      });
      this.futureContractForm.patchValue({
        'residual': this.futureContractForm.value.residual - data.paid,
      });
      this.recomputeValues();
      this.avoidAlertMessage = false;
      this.buttonSave();
      this.events.unsubscribe('create-receipt');
      // profileModal.dismiss();
    });
    let plannedItems = [];
    this.futureContractForm.value.planned.forEach(planned => {
      if (planned.amount_residual && planned.amount_residual != 0) {
        plannedItems.push(planned);
      }
    })

    // plannedItems = [this.futureContractForm.value.planned[this.futureContractForm.value.planned.length - 1]];

    //console.log("this.futureContractForm.value.planned", this.futureContractForm.value.planned);
    //console.log("plannedItems", JSON.stringify(plannedItems));
    let profileModal = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        "select": true,
        "addPayment": true,
        "contact": this.futureContractForm.value.contact,
        "account_id": "account.income.futureContract",
        // "project_id": this.futureContractForm.value.project_id
        // || this.futureContractForm.value.project
        // && this.futureContractForm.value.project._id,
        "origin_id": this.futureContractForm.value._id,
        "name": "Venta " + this.futureContractForm.value.code,
        "accountFrom_id": this.futureContractForm.value.paymentCondition.accountTo_id,
        "items": plannedItems,
        "signal": "+",
        // "origin_ids": origin_ids,
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  async addInvoice() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.avoidAlertMessage = true;
    this.listenBarcode = false;
    this.events.unsubscribe('create-invoice');
    this.events.subscribe('create-invoice', (data) => {
      this.futureContractForm.value.invoices.push({
        'code': data.code,
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
      this.futureContractForm.value.planned.forEach(planned => {
        if (planned.hasOwnProperty('amount_residual')) {
          plannedItems.push(planned);
        }
      })
      let cashMove = plannedItems[0];
      let amount_invoiced = data.total;
      if (data.total > cashMove.amount_unInvoiced) {
        amount_invoiced = cashMove.amount_unInvoiced;
      }
      cashMove.invoices.push({
        "_id": data._id,
        "amount": amount_invoiced,
      });
      cashMove.amount_unInvoiced -= amount_invoiced;
      this.pouchdbService.updateDoc(cashMove);
      this.futureContractForm.patchValue({
        amount_unInvoiced: cashMove.amount_unInvoiced,
      });
      this.buttonSave();
      // this.futureContractForm.value.amount_unInvoiced -= cashMove.amount_unInvoiced;
      // this.pouchdbService.getDoc(cashMove.origin_id).then(futureContract=>{
      //   future-contract.amount_unInvoiced = cashMove.amount_unInvoiced;
      //   this.pouchdbService.updateDoc(futureContract);
      // });

      this.events.unsubscribe('create-invoice');
      // profileModal.dismiss();
    });

    let paymentType = 'Credito';
    if (this.futureContractForm.value.paymentCondition._id == 'payment-condition.cash') {
      paymentType = 'Contado';
    }
    let discount = 0;
    let items = []
    if (this.futureContractForm.value.discount.discountProduct) {
      let discountItem;
      this.futureContractForm.value.items.forEach(item => {
        if (item.product._id != 'product.discount') {
          items.push(item);
        } else {
          discountItem = item;
        }
      })
      if (discountItem) {
        items.push(discountItem);
      }
    } else {
      discount = this.futureContractForm.value.discount.value;
      this.futureContractForm.value.items.forEach(item => {
        if (item.product._id != 'product.discount') {
          items.push(item);
        }
      })
    }
    let profileModal = await this.modalCtrl.create({
      component: InvoicePage,
      componentProps: {
        "openPayment": true,
        "select": true,
        "contact_id": this.futureContractForm.value.contact._id,
        "contact": this.futureContractForm.value.contact,
        "date": this.futureContractForm.value.date,
        "paymentCondition": paymentType,
        "origin_id": this.futureContractForm.value._id,
        "items": items,
        "note": this.futureContractForm.value.note,
        "discount": discount,
        'type': 'out',
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  async openInvoice(item) {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.listenBarcode = false;
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
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
    this.listenBarcode = true;
  }

  onSubmit(values) {
    //console.log(values);
  }

  async selectContact() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.listenBarcode = false;
      return new Promise(async resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.futureContractForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.futureContractForm.markAsDirty();
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
        await profileModal.present();
        await this.loading.dismiss();
        await profileModal.onDidDismiss();
        this.listenBarcode = true;
      });
    }
  }

  async selectCrop() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.listenBarcode = false;
      return new Promise(async resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-crop');
        this.events.subscribe('select-crop', async (data) => {
          let product: any = await this.pouchdbService.getDoc(data.product_id);
          this.futureContractForm.patchValue({
            crop: data,
            date_delivery: data.date_end,
            product: product,
            product_name: product.name,
          });
          this.futureContractForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-crop');
          profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: CropsPage,
          componentProps: {
            "select": true,
          }
        });
        await profileModal.present();
        await this.loading.dismiss();
        await profileModal.onDidDismiss();
        this.listenBarcode = true;
      });
    }
  }

  async selectWarehouse() {
    if (this.futureContractForm.value.state == 'QUOTATION') {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.listenBarcode = false;
      return new Promise(async resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-warehouse');
        this.events.subscribe('select-warehouse', (data) => {
          this.futureContractForm.patchValue({
            warehouse: data,
          });
          this.futureContractForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-warehouse');
          profileModal.dismiss();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: WarehouseListPage,
          componentProps: {
            "select": true,
          }
        });
        await profileModal.present();
        await this.loading.dismiss();
        await profileModal.onDidDismiss();
        this.listenBarcode = true;
      });
    }
  }

  // selectProject() {
  //   console.log("selectProject");
  //   if (this.futureContractForm.value.state=='QUOTATION'){
  //     return new Promise(resolve => {
  //       this.avoidAlertMessage = true;
  //       this.events.unsubscribe('select-project');
  //       this.events.subscribe('select-project', (data) => {
  //         this.futureContractForm.patchValue({
  //           project: data,
  //           project_name: data.name,
  //         });
  //         this.futureContractForm.markAsDirty();
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
    // if (this.futureContractForm.value.state=='QUOTATION'){
    return new Promise(async resolve => {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.avoidAlertMessage = true;
      this.listenBarcode = false;
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.futureContractForm.patchValue({
          seller: data,
          seller_name: data.name,
        });
        this.futureContractForm.markAsDirty();
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
      await profileModal.present();
      await this.loading.dismiss();
      await profileModal.onDidDismiss();
      this.listenBarcode = true;
    });
    // }
  }

  selectProduct() {
    return new Promise(async resolve => {
      if (this.futureContractForm.value.state == 'QUOTATION') {
        this.loading = await this.loadingCtrl.create({});
        await this.loading.present();
        this.avoidAlertMessage = true;
        this.listenBarcode = false;
        this.events.unsubscribe('select-product');
        this.events.subscribe('select-product', (data) => {
          this.futureContractForm.patchValue({
            product: data,
            product_name: data.name,
          });
          this.futureContractForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-product');
          profileModal.dismiss();
          resolve(data);
        })
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true
          }
        });
        await profileModal.present();
        await this.loading.dismiss();
        await profileModal.onDidDismiss();
        this.listenBarcode = true;
      }
    });
  }

  print() {
    if (this.platform.is('cordova')) {
      this.configService.getConfigDoc().then(async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        let date = this.futureContractForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2] + "/" + date[1] + "/" + date[0]
        let payment_condition = this.futureContractForm.value.paymentCondition.name || "";
        let contact_name = this.futureContractForm.value.contact.name || "";
        let seller_name = this.futureContractForm.value.seller.name || "";
        let code = this.futureContractForm.value.code || "";
        let doc = this.futureContractForm.value.contact.document || "";
        //let direction = this.futureContractForm.value.contact.city || "";
        //let phone = this.futureContractForm.value.contact.phone || "";
        let ticket = "";
        let lines = "";

        this.futureContractForm.value.items.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
          let price = parseFloat(item.price);
          let subtotal = quantity * price;
          code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 6 / 32), code).toString();
          quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 5 / 32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
          price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 9 / 32), price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 12 / 32), subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth, item.product.name.substring(0, data.ticketPrint.paperWidth));
          lines += product_name + "\n" + code + quantity + price + subtotal + "\n";
        });
        ticket += company_name + "\n";
        ticket += "Ruc: " + company_ruc + "\n";
        ticket += "Tel: " + company_phone + "\n";
        ticket += "\n";
        ticket += "VENTA COD.: " + code + "\n";
        ticket += "Fecha: " + date + "\n";
        ticket += "Cliente: " + contact_name + "\n";
        ticket += "Ruc: " + doc + "\n";
        ticket += "\n";
        ticket += "Condicion de pago: " + payment_condition + "\n";
        ticket += "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += "ARTICULOS DEL PEDIDO\n";
        ticket += "\n";
        let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 6 / 32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.paperWidth * 6 / 32) - 1)).toString();
        let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 5 / 32) - 1, "Cant.".substring(0, Math.floor(data.ticketPrint.paperWidth * 5 / 32) - 1));
        let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 9 / 32), "Precio".substring(0, Math.floor(data.ticketPrint.paperWidth * 9 / 32)), 'right');
        let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 12 / 32) - 1, "SubTotal".substring(0, Math.floor(data.ticketPrint.paperWidth * 12 / 32) - 1), "right");
        ticket += head_code + "|" + head_quantity + "|" + head_price + "|" + head_subtotal + "\n";
        ticket += lines;
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += "Descuento" + this.formatService.string_pad(data.ticketPrint.paperWidth - 9, "$ " + this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        ticket += "TOTAL" + this.formatService.string_pad(data.ticketPrint.paperWidth - 5, "$ " + this.futureContractForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth) + "\n";
        if (this.futureContractForm.value.note) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "| Anotacion |", 'center', '-') + "\n";
          ticket += this.formatService.breakString(this.futureContractForm.value.note, data.ticketPrint.paperWidth) + "\n";
        }
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        if (data.ticketPrint.showSignSeller) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Vendedor: " + seller_name + "\n";
        }
        if (data.ticketPrint.showSignClient) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Cliente: " + contact_name + "\n";
        }
        let i = data.ticketPrint.marginBottom;
        while (i > 0) {
          ticket += "\n";
          i--;
        }
        // console.log("ticket", ticket);
        // Print to bluetooth printer
        let toast = await this.toastCtrl.create({
          message: "Imprimiendo...",
          duration: 3000
        });
        //console.log("ticket", ticket);
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
      });
    } else {
      this.printMatrix();
    }
  }

  printMatrix() {
    var prefix = "venta_";
    var extension = ".prt";
    this.configService.getConfigDoc().then(async (data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      let date = this.futureContractForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2] + "/" + date[1] + "/" + date[0]
      let payment_condition = this.futureContractForm.value.paymentCondition.name || "";
      let contact_name = this.futureContractForm.value.contact.name || "";
      let seller_name = this.futureContractForm.value.seller.name || "";
      let code = this.futureContractForm.value.code || "";
      let doc = this.futureContractForm.value.contact.document || "";
      //let direction = this.futureContractForm.value.contact.city || "";
      //let phone = this.futureContractForm.value.contact.phone || "";
      let lines = ""
      let ticket = "";
      if (data.ticketPrint.paperWidth >= 80) {
        this.futureContractForm.value.items.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
          let price = parseFloat(item.price);
          let subtotal = quantity * price;
          code = this.formatService.string_pad(6, code).toString();
          quantity = this.formatService.string_pad(8, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          price = this.formatService.string_pad(11, price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(12, subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth - (6 + 8 + 11 + 12) - 6, item.product.name.substring(0, data.ticketPrint.paperWidth / 2));
          lines += "|" + code + "|" + quantity + "|" + product_name + "|" + price + "|" + subtotal + "|\n";
        });
        ticket += this.formatService.string_pad(
          data.ticketPrint.paperWidth, " " +
          company_name.substring(0, data.ticketPrint.paperWidth / 3) +
          " - Tel: " + company_phone.substring(0, data.ticketPrint.paperWidth / 3) + " ",
          'center', '-') + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, ("Presupuesto: " + code).substring(0, data.ticketPrint.paperWidth / 2 - 5));
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, ("Fecha: " + (new Date(this.futureContractForm.value.date)).toLocaleString('es-PY')).substring(0, data.ticketPrint.paperWidth / 2 - 5)) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, ("Cliente: " + this.futureContractForm.value.contact.name).substring(0, data.ticketPrint.paperWidth / 2 - 5));
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, ("Condicion de pago: " + payment_condition).substring(0, data.ticketPrint.paperWidth / 2 - 5)) + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        let product_description = this.formatService.string_pad(data.ticketPrint.paperWidth - (6 + 8 + 11 + 12) - 6, "Descripcion");
        ticket += "|Codigo|Cantidad|" + product_description + "|   Precio  |  Subtotal  |\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += lines;
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        if (this.computePercent()) {
          // ticket += "Descuento"+this.formatService.string_pad(data.ticketPrint.paperWidth-9, this.computePercent()+"%", "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth,
            "Descuento:" + this.formatService.string_pad(
              14, "$ " + this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + " ",
            'right', ' '
          ) + "\n";
        }
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth,
          "Valor Total:" + this.formatService.string_pad(
            14, "$ " + this.futureContractForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + " ",
          'right', ' '
        ) + "\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth) + "\n";
        if (this.futureContractForm.value.note) {
          ticket += this.formatService.breakString("Anotacion: " + this.futureContractForm.value.note, data.ticketPrint.paperWidth - 11) + "\n";
        }
        if (data.ticketPrint.showSignSeller || data.ticketPrint.showSignClient) {
          ticket += "\n";
          ticket += "\n";
        }
        if (data.ticketPrint.showSignSeller) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, "", 'center', '_');
          ticket += "          ";
        }
        if (data.ticketPrint.showSignClient) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, "", 'center', '_') + "\n";
        }
        if (data.ticketPrint.showSignSeller) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, "Firma del Vendedor: " + seller_name, 'center', ' ');
          ticket += "          ";
        }
        if (data.ticketPrint.showSignClient) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth / 2 - 5, "Firma del Cliente: " + contact_name, 'center', ' ') + "\n";
        }
        let i = data.ticketPrint.marginBottom;
        while (i > 0) {
          ticket += "\n";
          i--;
        }
      } else {
        this.futureContractForm.value.items.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
          let price = parseFloat(item.price);
          let subtotal = quantity * price;
          // console.log("quantity", quantity);
          // console.log("price", price);
          // console.log("subtotal", subtotal);
          // console.log("subtotal.toString().replace(/B(?=(d{3})+(?!d))/g, '.')", subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 6 / 32), code).toString();
          quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 5 / 32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
          price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 9 / 32), price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 12 / 32), subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth, item.product.name.substring(0, data.ticketPrint.paperWidth));
          lines += product_name + "\n" + code + quantity + price + subtotal + "\n";
        });
        ticket += company_name + "\n";
        ticket += "Ruc: " + company_ruc + "\n";
        ticket += "Tel: " + company_phone + "\n";
        ticket += "\n";
        ticket += "VENTA COD.: " + code + "\n";
        ticket += "Fecha: " + date + "\n";
        ticket += "Cliente: " + contact_name + "\n";
        ticket += "Ruc: " + doc + "\n";
        ticket += "\n";
        ticket += "Condicion de pago: " + payment_condition + "\n";
        ticket += "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += "ARTICULOS DEL PEDIDO\n";
        ticket += "\n";
        let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 6 / 32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.paperWidth * 6 / 32) - 1)).toString();
        let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 5 / 32) - 1, "Cant.".substring(0, Math.floor(data.ticketPrint.paperWidth * 5 / 32) - 1));
        let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 9 / 32), "Precio".substring(0, Math.floor(data.ticketPrint.paperWidth * 9 / 32)), 'right');
        let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth * 12 / 32) - 1, "SubTotal".substring(0, Math.floor(data.ticketPrint.paperWidth * 12 / 32) - 1), "right");
        ticket += head_code + "|" + head_quantity + "|" + head_price + "|" + head_subtotal + "\n";
        ticket += lines;
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        if (this.computePercent()) {
          ticket += "Descuento" + this.formatService.string_pad(data.ticketPrint.paperWidth - 9, "$ " + this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        }
        ticket += "TOTAL" + this.formatService.string_pad(data.ticketPrint.paperWidth - 5, "$ " + this.futureContractForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth) + "\n";
        if (this.futureContractForm.value.note) {
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "| Anotacion |", 'center', '-') + "\n";
          ticket += this.formatService.breakString(this.futureContractForm.value.note, data.ticketPrint.paperWidth) + "\n";
        }
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
        if (data.ticketPrint.showSignSeller) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Vendedor: " + seller_name + "\n";
        }
        if (data.ticketPrint.showSignClient) {
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-') + "\n";
          ticket += "Firma del Cliente: " + contact_name + "\n";
        }
        let i = data.ticketPrint.marginBottom;
        while (i > 0) {
          ticket += "\n";
          i--;
        }
      }
      // console.log("ticket", ticket);
      this.formatService.printMatrixClean(ticket, prefix + this.futureContractForm.value.code + extension);
      let toast = await this.toastCtrl.create({
        message: "Imprimiendo...",
        duration: 3000
      });
      toast.present();
    });
  }

  share() {
    this.configService.getConfigDoc().then((data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      //let number = this.futureContractForm.value.invoice || "";
      let date = this.futureContractForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2] + "/" + date[1] + "/" + date[0]
      let payment_condition = this.futureContractForm.value.paymentCondition.name || "";
      let contact_name = this.futureContractForm.value.contact.name || "";
      let seller_name = this.futureContractForm.value.seller.name || "";
      let code = this.futureContractForm.value.code || "";
      let doc = this.futureContractForm.value.contact.document || "";
      //let direction = this.futureContractForm.value.contact.city || "";
      //let phone = this.futureContractForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.futureContractForm.value.items.forEach(item => {
        let code = item.product.code;
        let quantity = item.quantity;
        //  let productName = item.product.name;
        let price = item.price;
        let subtotal = quantity * price;
        let exenta = 0;
        let iva5 = 0;
        let iva10 = 0;
        if (item.product.tax == "iva10") {
          iva10 = item.quantity * item.price;
          totalIva10 += iva10;
        } else if (item.product.tax == "exenta") {
          exenta = item.quantity * item.price;
          totalExentas += exenta;
        } else if (item.product.tax == "iva5") {
          iva5 = item.quantity * item.price;
          totalIva5 += iva5;
        }
        code = this.formatService.string_pad(6, code.toString());
        quantity = this.formatService.string_pad(5, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        price = this.formatService.string_pad(9, price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
        subtotal = this.formatService.string_pad(12, subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
        let product_name = this.formatService.string_pad(32, item.product.name);
        lines += product_name + "\n" + code + quantity + price + subtotal + "\n";
      });
      let totalAmount = totalIva10 + totalIva5 + totalExentas;
      totalAmount = this.formatService.string_pad(16, totalAmount, "right");

      let ticket = '<div style="font-family: monospace;width: 310px;background: #fffae3;word-break: break-all;"><pre>'
      ticket += company_name + "\n";
      ticket += "Ruc: " + company_ruc + "\n";
      ticket += "Tel: " + company_phone + "\n";
      ticket += "\n";
      ticket += "PRESUPUESTO COD.: " + code + "\n";
      ticket += "Fecha: " + date + "\n";
      ticket += "Vendedor: " + seller_name + "\n";
      ticket += "Cliente: " + contact_name + "\n";
      ticket += "Ruc: " + doc + "\n";
      ticket += "\n";
      ticket += "Condicion de pago: " + payment_condition + "\n";
      ticket += "\n";
      ticket += "--------------------------------\n";
      ticket += "ARTICULOS DEL PEDIDO\n";
      ticket += "\n";
      ticket += "Cod.  Cant.   Precio   Sub-total\n";
      ticket += lines;
      ticket += "--------------------------------\n";
      // ticket += "TOTAL Gs.:     "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+"\n";
      ticket += "TOTAL" + this.formatService.string_pad(27, "$ " + totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right") + "\n";
      ticket += "--------------------------------\n";
      // ticket += "AVISO LEGAL: Este presupuesto \n";
      // ticket += "no tiene valor fiscal.\n";
      ticket += this.formatService.breakString(data.ticketPrint.ticketComment, 32) + "\n";
      ticket += "--------------------------------\n";
      ticket += "\n</pre></div>";


      //console.log("ticket", ticket);

      const div = document.getElementById("htmltoimage");
      div.innerHTML = ticket;
      const options = { background: "white", height: div.clientHeight, width: 310 };


      // let teste = document.getElementById("htmltoimage");
      //console.log("teste element", div);
      html2canvas(div, options).then(canvas => {
        //console.log("canvas", canvas);
        if (this.platform.is('cordova')) {
          var contentType = "image/png";
          this.socialSharing.share(
            "Presupuesto Total " + totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            "Presupuesto " + code,
            canvas.toDataURL()
          )
        } else {
          let a = document.createElement('a');
          document.body.appendChild(a);
          a.download = "Venta-" + code + ".png";
          a.href = canvas.toDataURL();
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

  goBack() {
    this.navCtrl.navigateBack('/future-contract-list');
  }

  showNextButton() {
    // console.log("stock",this.futureContractForm.value.stock);
    if (this.futureContractForm.value.name == null) {
      return true;
    }
    else if (this.futureContractForm.value.price == null) {
      return true;
    }
    else if (this.futureContractForm.value.cost == null) {
      return true;
    }
    else if (this.futureContractForm.value.type == 'product' && this.futureContractForm.value.stock == null) {
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
    if (this.futureContractForm.dirty) {
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
          handler: () => { }
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
      this.futureContractForm.markAsPristine();
      this.navCtrl.navigateBack('/tabs/future-contract-list');
    }
  }
}

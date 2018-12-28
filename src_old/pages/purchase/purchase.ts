import { Component, ViewChild } from '@angular/core';
import { NavController, App,  LoadingController, AlertController, Select, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
//import { DecimalPipe } from '@angular/common';
import { Printer, PrintOptions } from '@ionic-native/printer';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { PurchaseService } from './purchase.service';
import { ContactsPage } from '../contact/list/contacts';
//import { PurchaseItemPage } from '../purchase-item/purchase-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { PurchasesPage } from '../purchases/purchases';
import { ProductsPage } from '../product/list/products';
import { ProductPage } from '../product/product';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PaymentConditionListPage } from '../payment-condition/list/payment-condition-list';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
import { ReceiptPage } from '../receipt/receipt';
import { ReceiptService } from '../receipt/receipt.service';
import { InvoicePage } from '../invoice/invoice';
import { FormatService } from '../services/format.service';
// import { CashMoveService } from '../cash/move/cash-move.service';
// import { StockMoveService } from '../stock/stock-move.service';
// import { ProjectsPage } from '../project/list/projects';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { PurchasePopover } from './purchase.popover';

@Component({
  selector: 'purchase-page',
  templateUrl: 'purchase.html'
})
export class PurchasePage {
@ViewChild(Select) select: Select;
@HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //this.key = event.key;
    ////console.log("key", event);
    let timeStamp = event.timeStamp - this.timeStamp;
    this.timeStamp = event.timeStamp;
    //console.log("key", event.key);
    if(event.which === 13){ //ignore returns
          //console.log("enter", this.barcode);
          let toast = this.toastCtrl.create({
          // message: "enter "+this.barcode,
          // duration: 1000
          });
          toast.present();
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
            this.productService.getProductByCode(this.barcode).then(data => {
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
                let alertPopup = this.alertCtrl.create({
                    title: 'Producto no Encontrado',
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
  purchaseForm: FormGroup;
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
    public purchaseService: PurchaseService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public productService: ProductService,
    // public cashMoveService: CashMoveService,
    // public stockMoveService: StockMoveService,
    public receiptService: ReceiptService,
    public bluetoothSerial: BluetoothSerial,
    public toastCtrl: ToastController,
    public printer: Printer,
    public configService: ConfigService,
    public formatService: FormatService,
    public events:Events,
    public pouchdbService: PouchdbService,
    public modal: ModalController,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.today = new Date().toISOString();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get(_id);
    this.avoidAlertMessage = false;
  }

  createBarcodeProduct(barcode){
    if(!this.purchaseForm.value._id){
      this.buttonSave();
    }
    if (this.purchaseForm.value.state=='QUOTATION'){

      this.avoidAlertMessage = true;
      this.events.unsubscribe('create-product');
      this.events.subscribe('create-product', (data) => {
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
        let toast = this.toastCtrl.create({
        // message: "entra ",
        // duration: 1000
        });
        toast.present();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('create-product');
      })
      console.log("barcode", barcode);
      let profileModal = this.modal.create(ProductPage, {
        "barcode": barcode,
        "stock": 0,
        // "cost": 0,
        "type": "product"
      });
      profileModal.present();
    }
  }

  ionViewWillLoad() {
    //var today = new Date().toISOString();
    this.purchaseForm = this.formBuilder.group({
      contact: new FormControl(this.navParams.data.contact||{}, Validators.required),
      contact_name: new FormControl(this.navParams.data.contact_name||''),

      project: new FormControl(this.navParams.data.project||{}),
      project_name: new FormControl(this.navParams.data.project_name||''),

      name: new FormControl(''),
      code: new FormControl(''),
      date: new FormControl(this.navParams.data.date||this.today),
      origin_id: new FormControl(this.navParams.data.origin_id),
      total: new FormControl(0),
      residual: new FormControl(0),
      note: new FormControl(''),
      state: new FormControl('QUOTATION'),
      // tab: new FormControl('products'),
      items: new FormControl(this.navParams.data.items||[], Validators.required),
      payments: new FormControl([]),
      planned: new FormControl([]),
      paymentCondition: new FormControl({}),
      payment_name: new FormControl(''),
      invoice: new FormControl(''),
      invoices: new FormControl([]),
      amount_unInvoiced: new FormControl(0),
      seller: new FormControl(this.navParams.data.seller||{}, Validators.required),
      seller_name: new FormControl(this.navParams.data.seller_name||''),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.purchaseService.getPurchase(this._id).then((data) => {
        //console.log("data", data);
        this.purchaseForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  ionViewCanLeave() {
      if(this.purchaseForm.dirty && ! this.avoidAlertMessage) {
          let alertPopup = this.alertCtrl.create({
              title: 'Descartar',
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
      }
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(PurchasePopover, {doc: this});
    popover.present({
      ev: myEvent
    });
  }

  private exitPage() {
      this.purchaseForm.markAsPristine();
      this.navCtrl.navigateBack();
  }

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
        this.navCtrl.navigateBack();
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
    if (this._id){
      this.purchaseService.updatePurchase(this.purchaseForm.value);
      // this.events.publish('open-purchase', this.purchaseForm.value);
      this.purchaseForm.markAsPristine();
    } else {
      this.purchaseService.createPurchase(this.purchaseForm.value).then(doc => {
        console.log("docss", doc);
        this.purchaseForm.patchValue({
          _id: doc['doc'].id,
          code: doc['purchase'].code,
        });
        this._id = doc['doc'].id;
        console.log("this.purchaseForm", this.purchaseForm.value);
        // this.events.publish('create-purchase', this.purchaseForm.value);
        this.purchaseForm.markAsPristine();
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

  addItem(){
    if(!this.purchaseForm.value._id){
      this.buttonSave();
    }
    if (this.purchaseForm.value.state=='QUOTATION'){
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
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
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-product');
      })
      let profileModal = this.modal.create(ProductsPage, {
        "select": true,
        'operation': 'purchase',
      });
      profileModal.present();
    }
  }

  openItem(item) {
    if (this.purchaseForm.value.state=='QUOTATION'){
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        //console.log("vars", data);
        item.price = data.price;
        item.product = data;
        item.description = data.name;
        this.recomputeValues();
        this.avoidAlertMessage = false;
        this.purchaseForm.markAsDirty();
        this.events.unsubscribe('select-product');
      })
      let profileModal = this.modal.create(ProductsPage, {
        "select": true,
        'operation': 'purchase',
      });
      profileModal.present();
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

  editItemPrice(item){
    if (this.purchaseForm.value.state=='QUOTATION'){
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
              this.purchaseForm.markAsDirty();
            }
          }
        ]
      });

      prompt.present();
    }
  }

  editItemQuantity(item){
    if (this.purchaseForm.value.state=='QUOTATION'){
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
              this.purchaseForm.markAsDirty();
            }
          }
        ]
      });

      prompt.present();
    }
  }

  openPayment(item) {
    this.events.unsubscribe('open-receipt');
    this.events.subscribe('open-receipt', (data) => {
      this.events.unsubscribe('open-receipt');
    });
    let profileModal = this.modal.create(ReceiptPage, {
      "_id": item._id,
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

  purchaseConfimation(){
    let prompt = this.alertCtrl.create({
      title: 'Estas seguro que deseas confirmar la venta?',
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
    return new Promise(resolve => {
      let createList = [];
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
              item.price,
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
              'cost': item.price*item.quantity,
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
              'amount': item.quantity*item.price,
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
            createList.push({
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
            });
          });

          this.pouchdbService.createDocList(createList).then((created: any)=>{
            this.purchaseForm.patchValue({
              state: 'CONFIRMED',
              amount_unInvoiced: this.purchaseForm.value.total,
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

  purchaseCancel(){
    let prompt = this.alertCtrl.create({
      title: 'Estas seguro que deseas Cancelar la Compra?',
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
    this.purchaseForm.value.planned.forEach(planned => {
      //console.log("removed planned", planned);
      this.purchaseService.deletePurchase(planned);
    });
    this.purchaseForm.patchValue({
      'planned': [],
    });
  }

  removeStockMoves(){
    this.pouchdbService.getRelated(
    "stock-move", "origin_id", this.purchaseForm.value._id).then((docs) => {
      docs.forEach(doc=>{
        this.purchaseService.deletePurchase(doc);
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

  addPayment() {
    this.avoidAlertMessage = true;
      this.events.unsubscribe('create-receipt');
      this.events.subscribe('create-receipt', (data) => {
          console.log("DDDDDDDATA", data);
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
      let profileModal = this.modal.create(ReceiptPage, {
        "addPayment": true,
        "contact": this.purchaseForm.value.contact,
        "account_id": "account.other.transitStock",
        "project_id": this.purchaseForm.value.project_id
        || this.purchaseForm.value.project
        && this.purchaseForm.value.project._id,
        "name": "Compra "+this.purchaseForm.value.code,
        "accountFrom_id": this.purchaseForm.value.paymentCondition.accountFrom_id,
        "items": plannedItems,
        "signal": "-",
        // "origin_ids": origin_ids,
      });
      profileModal.present();
  }

  addInvoice() {
    this.avoidAlertMessage = true;
    this.events.unsubscribe('create-invoice');
    this.events.subscribe('create-invoice', (data) => {
      this.purchaseForm.value.invoices.push({
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
    let profileModal = this.modal.create(InvoicePage, {
      "openPayment": true,
      "contact_id": this.purchaseForm.value.contact._id,
      "contact": this.purchaseForm.value.contact,
      "date": this.purchaseForm.value.date,
      "paymentCondition": paymentType,
      "origin_id": this.purchaseForm.value._id,
      "items": this.purchaseForm.value.items,
      'type': 'in',
    });
    profileModal.present();
  }

  openInvoice(item) {
    this.events.unsubscribe('open-invoice');
    this.events.subscribe('open-invoice', (data) => {
      this.avoidAlertMessage = false;
      this.buttonSave();
      this.events.unsubscribe('open-invoice');
    });
    let profileModal = this.modal.create(InvoicePage, {
      "_id": item._id,
    });
    profileModal.present();
  }

  onSubmit(values){
    //console.log(values);
  }

  selectContact() {
    // console.log("selectContact");
    if (this.purchaseForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.purchaseForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.purchaseForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {
          "select": true,
          "filter": "supplier",
          'supplier': true,
        });
        profileModal.present();
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
  //       let profileModal = this.modal.create(ProjectsPage, {"select": true});
  //       profileModal.present();
  //     });
  //   }
  // }

  selectSeller() {
    // if (this.purchaseForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.purchaseForm.patchValue({
            seller: data,
            seller_name: data.name,
          });
          this.purchaseForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = this.modal.create(ContactsPage, {"select": true, "filter": "seller"});
        profileModal.present();
      });
    // }
  }

  selectPaymentCondition() {
    return new Promise(resolve => {
    if (this.purchaseForm.value.state=='QUOTATION'){
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-payment-condition');
      this.events.subscribe('select-payment-condition', (data) => {
        this.purchaseForm.patchValue({
          paymentCondition: data,
          payment_name: data.name,
        });
        this.purchaseForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-payment-condition');
        resolve(data);
        //this.beforeAddPayment();
      })
      let profileModal = this.modal.create(PaymentConditionListPage, {"select": true});
      profileModal.present();
    }
  });
  }

  print() {
    this.configService.getConfigDoc().then((data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      //let number = this.purchaseForm.value.invoice || "";
      let date = this.purchaseForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      let payment_condition = this.purchaseForm.value.paymentCondition.name || "";
      let contact_name = this.purchaseForm.value.contact.name || "";
      let seller_name = this.purchaseForm.value.seller.name || "";
      let code = this.purchaseForm.value.code || "";
      let doc = this.purchaseForm.value.contact.document || "";
      //let direction = this.purchaseForm.value.contact.city || "";
      //let phone = this.purchaseForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.purchaseForm.value.items.forEach(item => {
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


      //console.log("ticket", ticket);


      // Print to bluetooth printer
      let toast = this.toastCtrl.create({
      message: "Imprimiendo... ",
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
    // this.printer.pick().then(printer => {
      let number = this.purchaseForm.value.invoice || "";
      let date = this.purchaseForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      //console.log("date", date);
      let payment_condition = this.purchaseForm.value.paymentCondition.name || "";
      let contact_name = this.purchaseForm.value.contact.name || "";
      let doc = this.purchaseForm.value.contact.document || "";
      let direction = this.purchaseForm.value.contact.city || "";
      let phone = this.purchaseForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.purchaseForm.value.items.forEach(item => {
        let quantity = item.quantity;
        let productName = item.product.name;
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
        lines += `<div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 47px;
          height: 14px;
          padding-left: 10px;">`+quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

          </div>
          <div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 350px;
          height: 14px;
          padding-left: 10px;">`+productName+`

          </div>
          <div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 70px;
          height: 14px;
          padding-left: 10px;">`+price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

          </div>
          <div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 89px;
          height: 14px;
          padding-left: 10px;">`+exenta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

          </div>
          <div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 87px;
          height: 14px;
          padding-left: 10px;">`+iva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

          </div>
          <div style="
          display: block;
          float: left;
          font-size: 14px;
          font-weight: normal;
          border: 1px solid white;
          width: 90px;
          height: 14px;
          padding-left: 10px;">`+iva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

          </div>`;
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

      this.printer.print(`<!-- <div style='
        background-image: url("invoice.jpeg");
        display:block;
        padding-left:55px;
        padding-top: 50px;
        height: 400px;
        width: 812px;'> -->
        <div style='
          display:block;
          padding-left:0px;
          padding-top: 20px;
          height: 580px;
          width: 812px;'>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 158px;
            height: 20px;
            padding-left: 650px;
            padding-top: 40px;">`+number+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 375px;
            height: 20px;
            padding-left: 94px;
            padding-top: 40px;">`+date+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 197px;
            height: 20px;
            padding-left: 140px;
            padding-top: 40px;">`+payment_condition+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 297px;
            height: 20px;
            padding-left: 94px;
            padding-top: 8px;">`+contact_name+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 281px;
            padding-top: 8px;">`+doc+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 95px;
            padding-top: 8px;">`+direction+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 149px;
            padding-top: 8px;">`+phone+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 809px;
            height: 214px;
            padding-left: 0;
            padding-top: 27px;">
                `+lines+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 493px;
            height: 27px;
            padding-left: 10px;">
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 89px;
            height: 27px;
            padding-left: 10px;">`+totalExentas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 87px;
            height: 27px;
            padding-left: 10px;">`+totalIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 90px;
            height: 27px;
            padding-left: 10px;">`+totalIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 650px;
            padding-top: 30px;
            padding-left: 12px;">`+totalInWords+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 28px;
            padding-left: 53px;
            padding-top: 18px;">`+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 229px;
            padding-top: 10px;">`+amountIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 25px;
            padding-left: 22px;
            padding-top: 8px;">`+amountIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 25px;
            padding-left: 100px;
            padding-top: 8px;">`+amountIva.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
      </div>
      <div style="
      display: block;
      float: left;
      font-size: 15px;
      font-weight: normal;
      border: 1px solid white;
      width: 809px;
      height: 40px;
      padding-left: 0;
      padding-top: 47px;">
      </div>
      <!-- <div style='
        background-image: url("invoice.jpeg");
        display:block;
        padding-left:55px;
        padding-top: 50px;
        height: 530px;
        width: 812px;'> -->
        <div style='
          display:block;
          padding-left:0px;
          padding-top: 50px;
          height: 580px;
          width: 812px;'>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 158px;
            height: 20px;
            padding-left: 650px;
            padding-top: 40px;">`+number+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 375px;
            height: 20px;
            padding-left: 94px;
            padding-top: 40px;">`+date+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 197px;
            height: 20px;
            padding-left: 140px;
            padding-top: 40px;">`+payment_condition+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 297px;
            height: 20px;
            padding-left: 94px;
            padding-top: 8px;">`+contact_name+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 281px;
            padding-top: 8px;">`+doc+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 95px;
            padding-top: 8px;">`+direction+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 149px;
            padding-top: 8px;">`+phone+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 809px;
            height: 214px;
            padding-left: 0;
            padding-top: 27px;">
                `+lines+`
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 493px;
            height: 27px;
            padding-left: 10px;">
            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 89px;
            height: 27px;
            padding-left: 10px;">`+totalExentas.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 87px;
            height: 27px;
            padding-left: 10px;">`+totalIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 90px;
            height: 27px;
            padding-left: 10px;">`+totalIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 14px;
            font-weight: normal;
            border: 1px solid white;
            width: 650px;
            padding-top: 30px;
            padding-left: 12px;">`+totalInWords+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 28px;
            padding-left: 53px;
            padding-top: 18px;">`+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 134px;
            height: 20px;
            padding-left: 229px;
            padding-top: 10px;">`+amountIva5.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 25px;
            padding-left: 22px;
            padding-top: 8px;">`+amountIva10.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
            <div style="
            display: block;
            float: left;
            font-size: 15px;
            font-weight: normal;
            border: 1px solid white;
            width: 78px;
            height: 25px;
            padding-left: 100px;
            padding-top: 8px;">`+amountIva.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")+`

            </div>
      </div>
`,
      options).then(onSuccess => {
        //console.log("onSuccess2", onSuccess);
      }, onError => {
        //console.log("onError2", onError);
      });
    //})

  }

}

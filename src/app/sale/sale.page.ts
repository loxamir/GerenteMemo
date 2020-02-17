import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  LoadingController, Platform, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
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
import { SaleService } from './sale.service';
// import { ContactListPage } from '../contact-list/contact-list.page';
//import { SaleItemPage } from '../sale-item/sale-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { SalesPage } from '../sales/sales';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { AddressListPage } from '../address-list/address-list.page';
// import { PlannedService } from '../planned/planned.service';
import { ConfigService } from '../config/config.service';
import { HostListener } from '@angular/core';
// import { ReceiptPage } from '../receipt/receipt.page';
// import { ReceiptService } from '../receipt/receipt.service';
// import { InvoicePage } from '../invoice/invoice.page';
import { FormatService } from '../services/format.service';
// import { CashMoveService } from '../cash/move/cash-move.service';
// import { StockMoveService } from '../stock/stock-move.service';
// import { ProjectsPage } from '../project/list/projects';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { SalePopover } from './sale.popover';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
// import { CurrencyListPage } from '../currency-list/currency-list.page';
// declare var cordova:any;
// import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import { DiscountPage } from '../discount/discount.page';
// import { CashMovePage } from '../cash-move/cash-move.page';
// import { ContactPage } from '../contact/contact.page';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-sale',
  templateUrl: './sale.page.html',
  styleUrls: ['./sale.page.scss'],
})
export class SalePage implements OnInit {
  @ViewChild('note', { static: false }) note;
  @ViewChild('corpo', { static: true }) corpo;
  @HostListener('document:keypress', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
      if (this.listenBarcode && this.saleForm.value.state == 'QUOTATION' && document.activeElement.tagName != "TEXTAREA"){
        this.corpo.setFocus();
        this.corpo.value = "";
        let timeStamp = event.timeStamp - this.timeStamp;
        this.timeStamp = event.timeStamp;
        if(event.which === 13){
          console.log("enter", this.barcode);
          let found = false;
          let list = this.saleForm.value.items.filter(item=>item.product.barcode == this.barcode);
          if (list.length){
            let index = this.saleForm.value.items.indexOf(list[0]);
            this.saleForm.value.items[index].quantity += 1;
            found = true;
          }
          if (found){
            this.recomputeTotal();
            this.recomputeResidual();
            this.saleForm.markAsDirty();
          } else {
            this.productService.getProductByCode(
              this.barcode
            ).then(data => {
              if (data){
                this.saleForm.value.items.unshift({
                  'quantity': 1,
                  'product': data,
                  'price': data.price,
                  'cost': data.cost,
                })
                this.recomputeTotal();
                this.recomputeResidual();
                this.saleForm.markAsDirty();
              }
            });
          }
          this.barcode = "";
        }
        if(!timeStamp || timeStamp < 20 || this.barcode == ""){
          this.barcode += event.key;
        }
        if( event.which < 48 || event.which >= 58 ){ // not a number
          this.barcode = "";
        }
        setTimeout(function(){
          this.barcode = ""
        }, 30);
      }
    }
    listenBarcode = true;
    timeStamp: any;
    barcode: string = "";
    saleForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;
    select;
    languages: Array<LanguageModel>;
    contact;
    contact_name;
    items;
    origin_id;
    return;
    currency_precision = 2;
    confirming = false;
    contact_id;

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
      public authService: AuthService,
    ) {
      this.today = new Date().toISOString();



      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      this.avoidAlertMessage = false;

      this.contact = this.route.snapshot.paramMap.get('contact');
      this.contact_name = this.route.snapshot.paramMap.get('contact_name');
      this.items = this.route.snapshot.paramMap.get('items');
      this.origin_id = this.route.snapshot.paramMap.get('origin_id');
      this.return = this.route.snapshot.paramMap.get('return');
    }

    async ngOnInit() {
      this.saleForm = this.formBuilder.group({
        contact: new FormControl(this.contact||{}, Validators.required),
        contact_name: new FormControl(this.contact_name||''),
        name: new FormControl(''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today),
        origin_id: new FormControl(this.origin_id),
        total: new FormControl(0),
        residual: new FormControl(0),
        note: new FormControl(undefined),
        state: new FormControl('QUOTATION'),
        discount: new FormControl({value: 0, discountProduct: true}),
        items: new FormControl(this.items||[], Validators.required),
        payments: new FormControl([]),
        planned: new FormControl([]),
        paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        address: new FormControl({}),
        address_name: new FormControl(''),
        invoice: new FormControl(''),
        invoices: new FormControl([]),
        amount_unInvoiced: new FormControl(0),
        seller: new FormControl(this.route.snapshot.paramMap.get('seller')||{}, Validators.required),
        seller_name: new FormControl(this.route.snapshot.paramMap.get('seller_name')||''),
        currency: new FormControl(this.route.snapshot.paramMap.get('currency')||{}),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
        status: new FormControl("WAITING"),
      });
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      let language:any = await this.languageService.getDefaultLanguage();
      this.translate.setDefaultLang(language);
      this.translate.use(language);
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;


      this.authService.loggedIn.subscribe(async status => {

        console.log("status", status);
        if (status) {
          // this.logged = true;
          let data = await this.authService.getData();
          this.contact_id = "contact."+data.currentUser.email;
          // if (config.default_contact_id){
            let default_contact:any = await this.pouchdbService.getDoc(this.contact_id);
            let default_address:any = await this.pouchdbService.getDoc(default_contact.address_id);
            this.saleForm.patchValue({
              'contact': default_contact,
              'address': default_address,
            })
          // }
        }
      })



      if (config.default_payment_id){
        let default_payment:any = await this.pouchdbService.getDoc(config.default_payment_id);
        this.saleForm.patchValue({
          'paymentCondition': default_payment
        })
      }
      if (this._id){
        this.saleService.getSale(this._id).then((data) => {
          this.saleForm.patchValue(data);
          if (data.state != 'QUOTATION'){
            // this.saleForm.controls.date.disable();
          }
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
      }
      if (this.return){
        this.recomputeValues();
      }
    }

  async saleReturn(){
    this.listenBarcode = false;
      let formValues = Object.assign({}, this.saleForm.value);
      let items = [];
      formValues.items.forEach((item: any)=>{
        items.push({
          'product_name': item.product_name,
          'product': item.product,
          'quantity': -item.quantity,
          'price': item.price,
          'cost': item.cost,
        });
      })
      let profileModal = await this.modalCtrl.create({
        component: SalePage,
        componentProps: {
          "return": true,
          "select": true,
          "contact": this.saleForm.value.contact,
          "contact_name": this.saleForm.value.contact_name,
          "items": items,
          "origin_id": this.saleForm.value._id,
        }
      });
      await profileModal.present();
      await profileModal.onDidDismiss();
      this.listenBarcode = true;
    }

    // async ionViewCanLeave() {
    //     if(this.saleForm.dirty && ! this.avoidAlertMessage) {
    //         let alertPopup = await this.alertCtrl.create({
    //             header: this.translate.instant('DISCARD'),
    //             message: this.translate.instant('SURE_DONT_SAVE'),
    //             buttons: [{
    //                     text: this.translate.instant('YES'),
    //                     handler: () => {
    //                         // alertPopup.dismiss().then(() => {
    //                             this.exitPage();
    //                         // });
    //                     }
    //                 },
    //                 {
    //                     text: this.translate.instant('NO'),
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

    async goNextStep() {
      // await this.loading.present();
      if(this.return){
        await this.buttonSave();
      }
      // if(!this.saleForm.value._id){
      //   await this.buttonSave();
      // }
      if (this.saleForm.value.state == 'QUOTATION'){
        if (! this.confirming){
          this.confirming = true;
          await this.beforeConfirm();
          this.confirming = false;
          // if (JSON.stringify(this.saleForm.value.paymentCondition) != '{}'
          // && this.saleForm.value.paymentCondition._id == 'payment-condition.cash'){
          //   this.addPayment();
          // }
          if (this.select){
            this.modalCtrl.dismiss();
          }
        }
      }
      // else if (this.saleForm.value.state == 'CONFIRMED'){
      //     // await this.loading.dismiss();
      //     this.addPayment();
      // } else if (this.saleForm.value.state == 'PAID'){
      //   if (this.saleForm.value.invoices.length){
      //     await this.navCtrl.navigateBack('/sale-list');
      //     // await this.loading.dismiss();
      //   } else {
      //     // await this.loading.dismiss();
      //     this.addInvoice();
      //   }
      // }
    }

    beforeConfirm(){
      return new Promise(async resolve =>{
        if (this.saleForm.value.items.length == 0){
          // await this.loading.dismiss();
          this.addItem();
          resolve(true);
        } else {
          if (Object.keys(this.saleForm.value.address).length === 0){
            // await this.loading.dismiss();
            this.selectAddress().then(async teste => {
              await this.loading.dismiss();
              if (Object.keys(this.saleForm.value.paymentCondition).length === 0){
                this.selectPaymentCondition().then(async ()=>{
                  this.loading = await this.loadingCtrl.create({});
                  await this.loading.present();
                  await this.afterConfirm();
                  await this.loading.dismiss();
                  resolve(true);
                });
              }
            });
          } else if (Object.keys(this.saleForm.value.paymentCondition).length === 0){
            // await this.loading.dismiss();
            this.selectPaymentCondition().then(async ()=>{
              this.loading = await this.loadingCtrl.create({});
              await this.loading.present();
              await this.afterConfirm();
              await this.loading.dismiss();
              resolve(true);
            });
          } else {
            // await this.loading.dismiss();
            this.loading = await this.loadingCtrl.create({});
            await this.loading.present();
            await this.afterConfirm();
            await this.loading.dismiss();
            resolve(true);
          }
        }
      })
    }



    buttonSave() {
      return new Promise(async resolve => {
        if (this._id){
          await this.saleService.updateSale(this.saleForm.value);
          this.saleForm.markAsPristine();
          resolve(true);
        } else {
          this.saleService.createSale(this.saleForm.value).then(doc => {
            this.saleForm.patchValue({
              _id: doc['doc'].id,
              code: doc['sale'].code,
              create_time: doc['sale'].create_time,
              create_user: doc['sale'].create_user,
              write_time: doc['sale'].write_time,
              write_user: doc['sale'].write_user,
            });
            this._id = doc['doc'].id;
            this.saleForm.markAsPristine();
            resolve(true);
          });
        }
      })
    }

    async deleteItem(slidingItem, item){
      if (this.saleForm.value.state=='QUOTATION'){
        //console.log("delete item", item);
        slidingItem.close();
        let index = this.saleForm.value.items.indexOf(item)
        this.saleForm.value.items.splice(index, 1);
        this.saleForm.markAsDirty();
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
        // total -= this.saleForm.value.discount.value;
        //console.log("total", total);
        this.saleForm.patchValue({
          total: total,
        });
      }
    }

    recomputeDiscountLines(){
      if (this.saleForm.value.state=='QUOTATION'){
        let discount_lines = 0;
        this.saleForm.value.items.forEach((item) => {
          if (item.product._id != "product.discount"){
            discount_lines += parseFloat(item.quantity)*(parseFloat(item.price_original || item.price)-parseFloat(item.price));
          }
        });
        //console.log("discount_lines", discount_lines);
        if (!discount_lines){
          discount_lines = 0;
        }
        this.saleForm.value.discount['lines'] = discount_lines
        this.saleForm.patchValue({
          discount: this.saleForm.value.discount,
        });
      }
    }

    lineDiscountPercent(line){
      return (
        100*(
          1 - parseFloat(line.price)/parseFloat(line.price_original)
        )
      ).toFixed(0)
    }

    // recomputeUnInvoiced(){
    //   let amount_unInvoiced = 0;
    //   this.pouchdbService.getRelated(
    //     "cash-move", "origin_id", this.saleForm.value._id
    //   ).then((planned) => {
    //     planned.forEach((item) => {
    //       if (item.amount_unInvoiced){
    //         amount_unInvoiced += parseFloat(item.amount_unInvoiced);
    //       }
    //     });
    //     this.saleForm.patchValue({
    //       amount_unInvoiced: amount_unInvoiced,
    //     });
    //   });
    // }

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
      let self = this;
      if (this.saleForm.value.state=='QUOTATION'){
        this.loading = await this.loadingCtrl.create({});
        await this.loading.present();
        this.avoidAlertMessage = true;
        this.listenBarcode = false;
        this.events.unsubscribe('select-product');
        this.events.subscribe('select-product', async (product) => {
          self.saleForm.value.items.unshift({
            'quantity': 1,
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
      if (this.saleForm.value.state=='QUOTATION'){
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
          this.saleForm.markAsDirty();
          this.events.unsubscribe('select-product');
          profileModal.dismiss();
        })
        let profileModal = await this.modalCtrl.create({
          component: ProductListPage,
          componentProps: {
            "select": true,
          }});
          await profileModal.present();
          await profileModal.onDidDismiss();
          this.listenBarcode = true;
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
          header: this.translate.instant('PRODUCT_PRICE'),
          // message: 'Cual es el precio de este producto?',
          message: this.translate.instant('WHAT_PRODUCT_PRICE'),
          inputs: [
            {
              type: 'number',
              name: 'price',
              value: item.price
          },

          ],
          buttons: [
            {
              text: this.translate.instant('CANCEL'),
            },
            {
              text: this.translate.instant('CONFIRM'),
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
        this.listenBarcode = false;
        let prompt = await this.alertCtrl.create({
          header: this.translate.instant('PRODUCT_QUANTITY'),
          message: this.translate.instant('WHAT_PRODUCT_QUANTITY'),
          inputs: [
            {
              type: 'number',
              name: 'quantity',
              value: item.quantity
          },

          ],
          buttons: [
            {
              text: this.translate.instant('CANCEL'),
            },
            {
              text: this.translate.instant('CONFIRM'),
              handler: data => {
                item.quantity = data.quantity;
                this.recomputeValues();
                this.saleForm.markAsDirty();
              }
            }
          ]
        });

        await prompt.present();
        await prompt.onDidDismiss();
        this.listenBarcode = true;
      }
    }

    recomputeValues() {
      this.recomputeTotal();
      // this.recomputeUnInvoiced();
      this.recomputeResidual();
      this.recomputeDiscountLines()
      if (this.saleForm.value.total != 0 && this.saleForm.value.residual == 0){
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

    async presentPopover(myEvent) {
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
      return new Promise(async resolve => {
        this.saleForm.patchValue({
          amount_unInvoiced: this.saleForm.value.total,
        });
        if(!this.saleForm.value._id){
          await this.buttonSave();
        }
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

            this.saleForm.value.items.forEach(async (item) => {
              let product_id = item.product_id || item.product._id;
              let product_name = item.product_name || item.product.name;
              item.cost = item.product.cost;
              if (item.product.type == 'product'){
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
              }
              if (item.quantity < 0){
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
                'dateDue': dateDue.toISOString(),
                'accountFrom_id': 'account.income.sale',
                'accountFrom_name': docDict['account.income.sale'].doc.name,
                'accountTo_id': this.saleForm.value.paymentCondition.accountTo_id,
                'accountTo_name': docDict[this.saleForm.value.paymentCondition.accountTo_id].doc.name,
              }
              if (this.saleForm.value.currency._id){
                cashMoveTemplate['currency'] = this.saleForm.value.currency;
                cashMoveTemplate['currency_amount'] = amount;
                cashMoveTemplate['currency_residual'] = amount;
                cashMoveTemplate['amount'] = amount*this.saleForm.value.currency.exchange_rate;
                cashMoveTemplate['residual'] = amount*this.saleForm.value.currency.exchange_rate;
              }
              createList.push(cashMoveTemplate);
            });
            //console.log("createList", createList);
            this.pouchdbService.createDocList(createList).then(async (created: any)=>{
              this.saleForm.patchValue({
                state: 'CONFIRMED',
                amount_unInvoiced: this.saleForm.value.total,
                planned: created.filter(word=>typeof word.amount_residual !== 'undefined'),
              });
              //console.log("Sale created", created);
              await this.buttonSave();
              resolve(true);
            })
          })
        });
      });
    }

    async saleCancel(){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('SURE_CANCEL_SALE'),
        // message: 'Al cancelar la Compra todos los registros asociados serán borrados',
        message: this.translate.instant('WARNING_CANCEL_SALE'),
        buttons: [
          {
            text: this.translate.instant('NO'),
            handler: data => {
              //console.log("Cancelar");
            }
          },
          {
            text: this.translate.instant('YES'),
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
      this.pouchdbService.getRelated(
      "cash-move", "origin_id", this.saleForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.pouchdbService.deleteDoc(doc);
        })
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

    onSubmit(values){
      //console.log(values);
    }

    selectPaymentCondition() {
      return new Promise(async resolve => {
      if (this.saleForm.value.state=='QUOTATION'){
        this.loading = await this.loadingCtrl.create({});
        await this.loading.present();
        this.avoidAlertMessage = true;
        this.listenBarcode = false;
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
        })
        let profileModal = await this.modalCtrl.create({
          component: PaymentConditionListPage,
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

    selectAddress() {
      return new Promise(async resolve => {
        if (this.saleForm.value.state=='QUOTATION'){
          this.loading = await this.loadingCtrl.create({});
          await this.loading.present();
          this.avoidAlertMessage = true;
          this.listenBarcode = false;
          this.events.unsubscribe('select-address');
          this.events.subscribe('select-address', (data) => {
            this.saleForm.patchValue({
              address: data,
              address_name: data.name,
            });
            this.saleForm.markAsDirty();
            this.avoidAlertMessage = false;
            this.events.unsubscribe('select-address');
            profileModal.dismiss();
            resolve(data);
          })
          let profileModal = await this.modalCtrl.create({
            component: AddressListPage,
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
              header: this.translate.instant('DISCARD'),
              // message: this.translate.instant('SURE_DONT_SAVE'),
              message: this.translate.instant('SURE_DONT_SAVE'),
                buttons: [{
                        text: this.translate.instant('YES'),
                        handler: () => {
                            // alertPopup.dismiss().then(() => {
                                this.exitPage();
                            // });
                        }
                    },
                    {
                        text: this.translate.instant('NO'),
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
        this.navCtrl.navigateBack('/sale-list');
      }
    }

    async cancelQuotation(){
      let alertPopup = await this.alertCtrl.create({
        header: this.translate.instant('CANCEL_ORDER'),
        message: this.translate.instant('SURE_CANCEL_ORDER'),
          buttons: [{
                  text: this.translate.instant('YES'),
                  handler: async () => {
                    alertPopup.present();
                    let doc:any = await this.pouchdbService.getDoc(this._id);
                    this.pouchdbService.deleteDoc(doc);
                    this.exitPage();
                  }
              },
              {
                  text: this.translate.instant('NO'),
                  handler: () => {
                      // need to do something if the user stays?
                  }
              }]
      });
      // Show the alert
      alertPopup.present();
    }
}

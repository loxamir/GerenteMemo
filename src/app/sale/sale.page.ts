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
import { ContactListPage } from '../contact-list/contact-list.page';
//import { SaleItemPage } from '../sale-item/sale-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { SalesPage } from '../sales/sales';
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
import { SalePopover } from './sale.popover';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { CurrencyListPage } from '../currency-list/currency-list.page';
// declare var cordova:any;
// import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiscountPage } from '../discount/discount.page';
import { CashMovePage } from '../cash-move/cash-move.page';
import { ContactPage } from '../contact/contact.page';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.page.html',
  styleUrls: ['./sale.page.scss'],
})
export class SalePage implements OnInit {
  @ViewChild('note') note;
  @ViewChild('corpo') corpo;
  @HostListener('document:keypress', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
      if (this.listenBarcode && this.saleForm.value.state == 'QUOTATION'){
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
      this.today = new Date().toISOString();
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
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
      });
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      if (config.default_contact_id){
        let default_contact:any = await this.pouchdbService.getDoc(config.default_contact_id);
        this.saleForm.patchValue({
          'contact': default_contact
        })
      }
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
        this.addItem();
      }
      if (this.return){
        this.recomputeValues();
      }
    }

    editContact() {
      return new Promise(async resolve => {
        this.events.unsubscribe('open-contact');
        this.events.subscribe('open-contact', (data) => {
          this.saleForm.patchValue({
            contact: data,
            // type: data.type,
            // cash_out: data.cash_out,
            // cash_in: data.cash_in,
            // transfer: data.transfer,
            // payable: data.payable,
            // receivable: data.receivable,
          });
          this.saleForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('open-contact');
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: ContactPage,
          componentProps: {
            "select": true,
            "_id": this.saleForm.value.contact._id,
          }
        });
        profileModal.present();
      });
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
      //   let residual = this.saleForm.value.residual;
      //   this.saleForm.value.payments.forEach((receipt, index)=>{
      //     if (receipt._id != data){
      //       this.saleForm.value.payments.slice(index, 1);
      //       newPayments.push(receipt);
      //     } else {
      //       residual += receipt.paid;
      //     }
      //   })
      //   this.pouchdbService.getRelated(
      //   "cash-move", "origin_id", this.saleForm.value._id).then((planned) => {
      //     this.saleForm.patchValue({
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

    computePercent(){
      return (
        (
          100*
          (
            parseFloat(this.saleForm.value.discount.value) +
            parseFloat(this.saleForm.value.discount.lines)
          )/
          (
            parseFloat(this.saleForm.value.discount.value) +
            parseFloat(this.saleForm.value.discount.lines) +
            this.saleForm.value.total
          )
        ).toFixed(0)
      )
    }

    computeDiscount(){
      return (
        parseFloat(this.saleForm.value.discount.value) +
        parseFloat(this.saleForm.value.discount.lines)
      )
    }

    computeDiscountPercent(){
      return (
        (100*(
          parseFloat(this.saleForm.value.discount.value)
        )/
        (
          parseFloat(this.saleForm.value.discount.value) +
          this.saleForm.value.total
        )).toFixed(0)
      )
    }

    setDiscount() {
      // if (this.saleForm.value.state == 'QUOTATION'){
        let self= this;
        this.listenBarcode = false;
        return new Promise(async resolve => {
          let previous = this.saleForm.value.discount.value;
          this.events.subscribe('set-discount', async (data) => {
            if (parseFloat(data.discount_amount) && ! previous){
              let product:any = await this.pouchdbService.getDoc('product.discount');
              self.saleForm.value.items.unshift({
                'quantity': 1,
                'price': -data.discount_amount,
                'cost': 0,
                'product': product,
                'description': product.name,
              })
            } else if (parseFloat(data.discount_amount) && previous){
              self.saleForm.value.items.forEach(item=>{
                if (item.product._id == 'product.discount'){
                  discountProduct = true;
                  item.price = -data.discount_amount;
                }
                return;
              })
            } else if (previous && !parseFloat(data.discount_amount)){
              self.saleForm.value.items.forEach((item, index)=>{
                if (item.product._id == 'product.discount'){
                  self.saleForm.value.items.splice(index, 1)
                }
                return;
              })
            }
            this.saleForm.patchValue({
              discount: {
                value: data.discount_amount,
                discountProduct: data.discountProduct
              }
            });
            self.recomputeValues();
            this.events.unsubscribe('set-discount');
            resolve(true);
          })
          let discountProduct = this.saleForm.value.discount.discountProduct;
          let amount_original = parseFloat(this.saleForm.value.total) + parseFloat(this.saleForm.value.discount.value || 0);
          let new_amount = parseFloat(this.saleForm.value.total);
          let profileModal = await this.modalCtrl.create({
            component: DiscountPage,
            componentProps: {
              "amount_original": amount_original,
              "new_amount": new_amount,
              "currency_precision": this.currency_precision,
              "showProduct": true,
              "discountProduct": discountProduct
            },
            cssClass: "discount-modal"
          });
          await profileModal.present();
          await profileModal.onDidDismiss();
          this.events.unsubscribe('set-discount');
          this.listenBarcode = true;
        });
      // }
    }

    setLineDiscount(line) {
      this.listenBarcode = false;
      return new Promise(async resolve => {
        this.events.subscribe('set-discount', (data) => {
          line.price_original = parseFloat(line.price_original) || line.price;
          line.price = parseFloat(data.new_amount);
          this.events.unsubscribe('set-discount');
          this.recomputeValues();
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: DiscountPage,
          componentProps: {
            "amount_original": line.price_original || line.price,
            "new_amount": line.price,
            "currency_precision": this.currency_precision,
          },
          cssClass: "discount-modal"
        });
        await profileModal.present();
        await profileModal.onDidDismiss();
        this.events.unsubscribe('set-discount');
        this.listenBarcode = true;
      });
    }

    selectCurrency() {
      return new Promise(async resolve => {
        this.listenBarcode = false;
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
        await profileModal.present();
        await profileModal.onDidDismiss();
        this.listenBarcode = true;
      });
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
        }
      } else if (this.saleForm.value.state == 'CONFIRMED'){
          // await this.loading.dismiss();
          this.addPayment();
      } else if (this.saleForm.value.state == 'PAID'){
        if (this.saleForm.value.invoices.length){
          await this.navCtrl.navigateBack('/sale-list');
          // await this.loading.dismiss();
        } else {
          // await this.loading.dismiss();
          this.addInvoice();
        }
      }
    }

    beforeConfirm(){
      return new Promise(async resolve =>{
        if (this.saleForm.value.items.length == 0){
          // await this.loading.dismiss();
          this.addItem();
          resolve(true);
        } else {
          if (Object.keys(this.saleForm.value.contact).length === 0){
            // await this.loading.dismiss();
            this.selectContact().then(async teste => {
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
        let residual = this.saleForm.value.residual;
        this.saleForm.value.payments.forEach((receipt, index)=>{
          if (receipt._id != data){
            this.saleForm.value.payments.slice(index, 1);
            newPayments.push(receipt);
          } else {
            residual += receipt.paid;
          }
        })
        this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.saleForm.value._id).then((planned) => {
          this.saleForm.patchValue({
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

    async addPayment() {
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      this.avoidAlertMessage = true;
      this.listenBarcode = false;
        this.events.unsubscribe('create-receipt');
        this.events.subscribe('create-receipt', (data) => {
            //console.log("DDDDDDDATA", data);
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
          if (planned.amount_residual && planned.amount_residual != 0){
            plannedItems.push(planned);
          }
        })

          // plannedItems = [this.saleForm.value.planned[this.saleForm.value.planned.length - 1]];

        //console.log("this.saleForm.value.planned", this.saleForm.value.planned);
        //console.log("plannedItems", JSON.stringify(plannedItems));
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
        this.saleForm.value.invoices.push({
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
      let discount = 0;
      let items = []
      if (this.saleForm.value.discount.discountProduct){
        let discountItem;
        this.saleForm.value.items.forEach(item=>{
          if (item.product._id != 'product.discount'){
            items.push(item);
          } else {
            discountItem = item;
          }
        })
        if (discountItem){
          items.push(discountItem);
        }
      } else {
        discount = this.saleForm.value.discount.value;
        this.saleForm.value.items.forEach(item=>{
          if (item.product._id != 'product.discount'){
            items.push(item);
          }
        })
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
          "items": items,
          "note": this.saleForm.value.note,
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

    onSubmit(values){
      //console.log(values);
    }

    async selectContact() {
      if (this.saleForm.value.state=='QUOTATION'){
        this.loading = await this.loadingCtrl.create({});
        await this.loading.present();
        this.listenBarcode = false;
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
          await profileModal.present();
          await this.loading.dismiss();
          await profileModal.onDidDismiss();
          this.listenBarcode = true;
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
          this.loading = await this.loadingCtrl.create({});
          await this.loading.present();
          this.avoidAlertMessage = true;
          this.listenBarcode = false;
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
          await profileModal.present();
          await this.loading.dismiss();
          await profileModal.onDidDismiss();
          this.listenBarcode = true;
        });
      // }
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

    print() {
      if (this.platform.is('cordova')){
        this.configService.getConfigDoc().then(async (data) => {
          let company_name = data.name || "";
          let company_ruc = data.doc || "";
          let company_phone = data.phone || "";
          let date = this.saleForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
          date = date[2]+"/"+date[1]+"/"+date[0]
          let payment_condition = this.saleForm.value.paymentCondition.name || "";
          let contact_name = this.saleForm.value.contact.name || "";
          let seller_name = this.saleForm.value.seller.name || "";
          let code = this.saleForm.value.code || "";
          let doc = this.saleForm.value.contact.document || "";
          //let direction = this.saleForm.value.contact.city || "";
          //let phone = this.saleForm.value.contact.phone || "";
          let ticket="";
          let lines = "";

          this.saleForm.value.items.forEach(item => {
            let code = item.product.code;
            let quantity = item.quantity;
            let price = parseFloat(item.price);
            let subtotal = quantity*price;
            code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*6/32), code).toString();
            quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*5/32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
            price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*9/32), price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
            subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*12/32), subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
            let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth, item.product.name.substring(0, data.ticketPrint.paperWidth));
            lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
          });
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
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          ticket += "ARTICULOS DEL PEDIDO\n";
          ticket += "\n";
          let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*6/32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.paperWidth*6/32) - 1)).toString();
          let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*5/32) -1, "Cant.".substring(0, Math.floor(data.ticketPrint.paperWidth*5/32) - 1));
          let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*9/32), "Precio".substring(0, Math.floor(data.ticketPrint.paperWidth*9/32)), 'right');
          let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*12/32) -1, "SubTotal".substring(0, Math.floor(data.ticketPrint.paperWidth*12/32) -1), "right");
          ticket += head_code+"|"+head_quantity+"|"+head_price+"|"+head_subtotal+"\n";
          ticket += lines;
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          ticket += "Descuento"+this.formatService.string_pad(data.ticketPrint.paperWidth-9, "$ "+this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          ticket += "TOTAL"+this.formatService.string_pad(data.ticketPrint.paperWidth-5, "$ "+this.saleForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth)+"\n";
          if (this.saleForm.value.note){
            ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "| Anotacion |", 'center', '-')+"\n";
            ticket += this.formatService.breakString(this.saleForm.value.note, data.ticketPrint.paperWidth)+"\n";
          }
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          if (data.ticketPrint.showSignSeller){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Vendedor: " +seller_name+"\n";
          }
          if (data.ticketPrint.showSignClient){
            ticket += "\n";
            ticket += "\n";
            ticket += "\n";
            ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
            ticket += "Firma del Cliente: "+contact_name+"\n";
          }
          let i = data.ticketPrint.marginBottom;
          while(i>0){
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
    var prefix = "venta_";
    var extension = ".prt";
    this.configService.getConfigDoc().then(async (data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
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
      let ticket="";
      if (data.ticketPrint.paperWidth >= 80){
        this.saleForm.value.items.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
          let price = parseFloat(item.price);
          let subtotal = quantity*price;
          code = this.formatService.string_pad(6, code).toString();
          quantity = this.formatService.string_pad(8, quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          price = this.formatService.string_pad(11, price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(12, subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth -(6+8+11+12)-6, item.product.name.substring(0, data.ticketPrint.paperWidth/2));
          lines += "|"+code+"|"+quantity+"|"+product_name+"|"+price+"|"+subtotal+"|\n";
        });
        ticket += this.formatService.string_pad(
          data.ticketPrint.paperWidth, " "+
          company_name.substring(0, data.ticketPrint.paperWidth/3)+
          " - Tel: "+company_phone.substring(0, data.ticketPrint.paperWidth/3)+" ",
          'center', '-')+"\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, ("Presupuesto: "+code).substring(0, data.ticketPrint.paperWidth/2-5));
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, ("Fecha: "+(new Date(this.saleForm.value.date)).toLocaleString('es-PY')).substring(0, data.ticketPrint.paperWidth/2-5))+"\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, ("Cliente: "+this.saleForm.value.contact.name).substring(0, data.ticketPrint.paperWidth/2-5));
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, ("Condicion de pago: "+payment_condition).substring(0, data.ticketPrint.paperWidth/2-5))+"\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        let product_description = this.formatService.string_pad(data.ticketPrint.paperWidth -(6+8+11+12)-6, "Descripcion");
        ticket += "|Codigo|Cantidad|"+product_description+"|   Precio  |  Subtotal  |\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        ticket += lines;
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        if (this.computePercent()){
          // ticket += "Descuento"+this.formatService.string_pad(data.ticketPrint.paperWidth-9, this.computePercent()+"%", "right")+"\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth,
            "Descuento:"+this.formatService.string_pad(
              14, "$ "+this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+" ",
             'right', ' '
          )+"\n";
        }
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth,
          "Valor Total:"+this.formatService.string_pad(
            14, "$ "+this.saleForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+" ",
           'right', ' '
        )+"\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth)+"\n";
        if (this.saleForm.value.note){
          ticket += this.formatService.breakString("Anotacion: "+this.saleForm.value.note, data.ticketPrint.paperWidth - 11)+"\n";
        }
        if (data.ticketPrint.showSignSeller || data.ticketPrint.showSignClient){
          ticket += "\n";
          ticket += "\n";
        }
        if (data.ticketPrint.showSignSeller){
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, "", 'center', '_');
          ticket += "          ";
        }
        if (data.ticketPrint.showSignClient){
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, "", 'center', '_')+"\n";
        }
        if (data.ticketPrint.showSignSeller){
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, "Firma del Vendedor: " +seller_name, 'center', ' ');
          ticket += "          ";
        }
        if (data.ticketPrint.showSignClient){
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth/2-5, "Firma del Cliente: " +contact_name, 'center', ' ')+"\n";
        }
        let i = data.ticketPrint.marginBottom;
        while(i>0){
          ticket += "\n";
          i--;
        }
      } else {
        this.saleForm.value.items.forEach(item => {
          let code = item.product.code;
          let quantity = item.quantity;
          let price = parseFloat(item.price);
          let subtotal = quantity*price;
          // console.log("quantity", quantity);
          // console.log("price", price);
          // console.log("subtotal", subtotal);
          // console.log("subtotal.toString().replace(/B(?=(d{3})+(?!d))/g, '.')", subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
          code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*6/32), code).toString();
          quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*5/32), quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'center');
          price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*9/32), price.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), 'right');
          subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*12/32), subtotal.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right");
          let product_name = this.formatService.string_pad(data.ticketPrint.paperWidth, item.product.name.substring(0, data.ticketPrint.paperWidth));
          lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
        });
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
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        ticket += "ARTICULOS DEL PEDIDO\n";
        ticket += "\n";
        let head_code = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*6/32) - 1, "Codigo".substring(0, Math.floor(data.ticketPrint.paperWidth*6/32) - 1)).toString();
        let head_quantity = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*5/32) -1, "Cant.".substring(0, Math.floor(data.ticketPrint.paperWidth*5/32) - 1));
        let head_price = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*9/32), "Precio".substring(0, Math.floor(data.ticketPrint.paperWidth*9/32)), 'right');
        let head_subtotal = this.formatService.string_pad(Math.floor(data.ticketPrint.paperWidth*12/32) -1, "SubTotal".substring(0, Math.floor(data.ticketPrint.paperWidth*12/32) -1), "right");
        ticket += head_code+"|"+head_quantity+"|"+head_price+"|"+head_subtotal+"\n";
        ticket += lines;
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        if (this.computePercent()){
          ticket += "Descuento"+this.formatService.string_pad(data.ticketPrint.paperWidth-9, "$ "+this.computeDiscount().toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        }
        ticket += "TOTAL"+this.formatService.string_pad(data.ticketPrint.paperWidth-5, "$ "+this.saleForm.value.total.toFixed(data.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, data.ticketPrint.paperWidth)+"\n";
        if (this.saleForm.value.note){
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "| Anotacion |", 'center', '-')+"\n";
          ticket += this.formatService.breakString(this.saleForm.value.note, data.ticketPrint.paperWidth)+"\n";
        }
        ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
        if (data.ticketPrint.showSignSeller){
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          ticket += "Firma del Vendedor: " +seller_name+"\n";
        }
        if (data.ticketPrint.showSignClient){
          ticket += "\n";
          ticket += "\n";
          ticket += "\n";
          ticket += this.formatService.string_pad(data.ticketPrint.paperWidth, "", 'center', '-')+"\n";
          ticket += "Firma del Cliente: "+contact_name+"\n";
        }
        let i = data.ticketPrint.marginBottom;
        while(i>0){
          ticket += "\n";
          i--;
        }
      }
      // console.log("ticket", ticket);
      this.formatService.printMatrixClean(ticket, prefix + this.saleForm.value.code + extension);
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
          lines += product_name+"\n"+code+quantity+price+subtotal+"\n";
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
        ticket += "TOTAL"+this.formatService.string_pad(27, "$ "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), "right")+"\n";
        ticket += "--------------------------------\n";
        // ticket += "AVISO LEGAL: Este presupuesto \n";
        // ticket += "no tiene valor fiscal.\n";
        ticket += this.formatService.breakString(data.ticketPrint.ticketComment, 32)+"\n";
        ticket += "--------------------------------\n";
        ticket += "\n</pre></div>";


        //console.log("ticket", ticket);

        const div = document.getElementById("htmltoimage");
        div.innerHTML = ticket;
        const options = {background:"white",height :div.clientHeight , width : 310  };


        // let teste = document.getElementById("htmltoimage");
        //console.log("teste element", div);
       html2canvas(div, options).then(canvas => {
         //console.log("canvas", canvas);
         if (this.platform.is('cordova')){
           var contentType = "image/png";
           this.socialSharing.share(
             "Presupuesto Total "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
             "Presupuesto "+code,
             canvas.toDataURL()
           )
         } else {
           let a = document.createElement('a');
           document.body.appendChild(a);
           a.download = "Venta-"+code+".png";
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

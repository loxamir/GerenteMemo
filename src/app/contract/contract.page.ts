import { Component, OnInit } from '@angular/core';
import { NavController,  LoadingController, Platform, AlertController, Events, ToastController, ModalController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
//import { DecimalPipe } from '@angular/common';
import { Printer } from '@ionic-native/printer/ngx';
// import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ContractService } from './contract.service';
import { ContactListPage } from '../contact-list/contact-list.page';
//import { ContractItemPage } from '../contract-item/contract-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { ContractsPage } from '../contracts/contracts';
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
import { ContractPopover } from './contract.popover';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CurrencyListPage } from '../currency-list/currency-list.page';
// declare var cordova:any;
// import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';


@Component({
  selector: 'app-contract',
  templateUrl: './contract.page.html',
  styleUrls: ['./contract.page.scss'],
})
export class ContractPage implements OnInit {
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
            // let toast = await this.toastCtrl.create({
            // message: "enter "+this.barcode,
            // duration: 1000
            // });
            // toast.present();
            let found = false;
            this.contractForm.value.items.forEach(item => {
              if (item.product.barcode == this.barcode){
                this.sumItem(item);
                //item.quantity += 1;
                found = true;
              }
            });
            if (found){
              this.contractForm.patchValue({
                "items": this.contractForm.value.items,
              });
            } else {
              this.productService.getProductByCode(
                this.barcode
              ).then(data => {
                if (data){
                  this.contractForm.value.items.unshift({
                    'quantity': 1,
                    'product': data,
                    'price': data.price,
                    'cost': data.cost,
                  })
                  this.recomputeValues();
                  this.contractForm.markAsDirty();
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
    contractForm: FormGroup;
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

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public modalCtrl: ModalController,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      public platform: Platform,
      public contractService: ContractService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      // public app: App,
      public alertCtrl: AlertController,
      public productService: ProductService,
      // public plannedService: PlannedService,
      // public cashMoveService: CashMoveService,
      // public stockMoveService: StockMoveService,
      // public receiptService: ReceiptService,
      // public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      public pouchdbService: PouchdbService,
      // public modal: ModalController,
      public popoverCtrl: PopoverController,
      // public socialSharing: SocialSharing,
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
      //var today = new Date().toISOString();
      this.contractForm = this.formBuilder.group({
        contact: new FormControl(this.contact||{}, Validators.required),
        contact_name: new FormControl(this.contact_name||''),

        // project: new FormControl(this.route.snapshot.paramMap.get('project||{}),
        // project_name: new FormControl(this.route.snapshot.paramMap.get('project_name||''),

        name: new FormControl(''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today),
        origin_id: new FormControl(this.origin_id),
        total: new FormControl(0),
        residual: new FormControl(0),
        note: new FormControl(''),
        state: new FormControl('QUOTATION'),
        // tab: new FormControl('products'),
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


        contact_id: new FormControl(this.route.snapshot.paramMap.get('contact_id')||''),

        frequency: new FormControl('montly'),
        interval: new FormControl(1),
        limit: new FormControl(-1),
        dateNext: new FormControl(''),

      });
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      if (this._id){
        this.contractService.getContract(this._id).then((data) => {
          //console.log("data", data);
          this.contractForm.patchValue(data);
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
      }
      if (this.return){
        this.recomputeValues();
      }
    }

    selectCurrency() {
      return new Promise(async resolve => {
        this.events.subscribe('select-currency', (data) => {
          this.contractForm.patchValue({
            currency: data,
            // cash_id: data._id,
          });
          this.contractForm.markAsDirty();
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

  async contractReturn(){
      let formValues = Object.assign({}, this.contractForm.value);
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
        component: ContractPage,
        componentProps: {
          "return": true,
          "select": true,
          "contact": this.contractForm.value.contact,
          "contact_name": this.contractForm.value.contact_name,
          "items": items,
          "origin_id": this.contractForm.value._id,
        }
      });
      profileModal.present();
    }

    // async ionViewCanLeave() {
    //     if(this.contractForm.dirty && ! this.avoidAlertMessage) {
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
    //     this.contractForm.markAsPristine();
    //     this.navCtrl.navigateBack('/contract-list');
    // }

    async goNextStep() {
      if(this.return){
        await this.buttonSave();
      }
      // if(!this.contractForm.value._id){
      //   await this.buttonSave();
      // }
      if (this.contractForm.value.state == 'QUOTATION'){
        this.confirmContract();
      } else if (this.contractForm.value.state == 'CONFIRMED'){
          this.beforeAddPayment();
      } else if (this.contractForm.value.state == 'PAID'){
        if (this.contractForm.value.invoices.length){
          this.navCtrl.navigateBack('/contract-list');
        } else {
          this.addInvoice();
        }
      }
    }

    beforeConfirm(){
      if (this.contractForm.value.items.length == 0){
        this.addItem();
      } else {
        if (Object.keys(this.contractForm.value.contact).length === 0){
          this.selectContact().then( teste => {
            if (Object.keys(this.contractForm.value.paymentCondition).length === 0){
              this.selectPaymentCondition().then(()=>{
                this.contractConfimation();
              });
            }
          });
        } else if (Object.keys(this.contractForm.value.paymentCondition).length === 0){
          this.selectPaymentCondition().then(()=>{
            this.contractConfimation();
          });
        } else {
          this.contractConfimation();
        }
      }
    }



    buttonSave() {
      return new Promise(resolve => {
        if (this._id){
          this.contractService.updateContract(this.contractForm.value);
          this.contractForm.markAsPristine();
          resolve(true);
        } else {
          this.contractService.createContract(this.contractForm.value).then(doc => {
            this.contractForm.patchValue({
              _id: doc['doc'].id,
              code: doc['contract'].code,
            });
            this._id = doc['doc'].id;
            this.contractForm.markAsPristine();
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
      if (this.contractForm.value.state=='QUOTATION'){
        console.log("delete item", item);
        slidingItem.close();
        let index = this.contractForm.value.items.indexOf(item)
        this.contractForm.value.items.splice(index, 1);
        this.contractForm.markAsDirty();
        this.recomputeValues();
      }
    }

    // deletePayment(item){
    //   let index = this.contractForm.value.payments.indexOf(item)
    //   this.contractForm.value.payments.splice(index, 1);
    //   this.recomputeResidual();
    // }

    recomputeTotal(){
      if (this.contractForm.value.state=='QUOTATION'){
        let total = 0;
        this.contractForm.value.items.forEach((item) => {
          total = total + item.quantity*item.price;
        });
        this.contractForm.patchValue({
          total: total,
        });
      }
    }

    recomputeUnInvoiced(){
      let amount_unInvoiced = 0;
      this.pouchdbService.getRelated(
        "cash-move", "origin_id", this.contractForm.value._id
      ).then((planned) => {
        planned.forEach((item) => {
          if (item.amount_unInvoiced){
            amount_unInvoiced += parseFloat(item.amount_unInvoiced);
          }
        });
        this.contractForm.patchValue({
          amount_unInvoiced: amount_unInvoiced,
        });
      });
    }

    recomputeResidual(){
      if (this.contractForm.value.state == 'QUOTATION'){
        let residual = parseFloat(this.contractForm.value.total);
        this.contractForm.value.payments.forEach((item) => {
          residual -= parseFloat(item.paid || 0);
        });
        this.contractForm.patchValue({
          residual: residual,
        });
      }
    }

    async addItem(){
      // if(!this.contractForm.value._id){
      //   this.buttonSave();
      // }
      let self = this;
      if (this.contractForm.value.state=='QUOTATION'){
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
                  self.contractForm.value.items.unshift({
                    'quantity': data.quantity,
                    'price': product.price,
                    'cost': product.cost,
                    'product': product,
                    'description': product.name,
                  })
                  self.recomputeValues();
                  self.contractForm.markAsDirty();
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
                      //   text: 'Concluir Contrato',
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
      if (this.contractForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-product');
        this.events.subscribe('select-product', (data) => {
          //console.log("vars", data);
          item.price = data.price;
          item.product = data;
          item.description = data.name;
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.contractForm.markAsDirty();
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
      if (this.contractForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)+1;
        this.recomputeValues();
        this.contractForm.markAsDirty();
      }
    }

    remItem(item) {
      if (this.contractForm.value.state=='QUOTATION'){
        item.quantity = parseFloat(item.quantity)-1;
        this.recomputeValues();
        this.contractForm.markAsDirty();
      }
    }

    async editItemPrice(item){
      if (this.contractForm.value.state=='QUOTATION'){
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
                this.contractForm.markAsDirty();
              }
            }
          ]
        });

        prompt.present();
      }
    }

    async editItemQuantity(item){
      if (this.contractForm.value.state=='QUOTATION'){
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
                this.contractForm.markAsDirty();
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
      if (this.contractForm.value.total != 0 && this.contractForm.value.residual == 0){
        this.contractForm.patchValue({
          state: "PAID",
        });
      }
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    confirmContract() {
      if (this.contractForm.value.state=='QUOTATION'){
        this.beforeConfirm();
      }
    }

    async contractConfimation(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas confirmar el contrato?',
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
    //   let popover = this.popoverCtrl.create(ContractPopover, {doc: this});
    //   popover.present({
    //     ev: myEvent
    //   });
    // }

    async presentPopover(myEvent) {
      console.log("teste my event");
      let popover = await this.popoverCtrl.create({
        component: ContractPopover,
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
        if(!this.contractForm.value._id){
          await this.buttonSave();
        }
        let createList = [];
        this.configService.getConfigDoc().then((config: any)=>{
          this.pouchdbService.getList([
            'warehouse.client',
            config.warehouse_id,
            'account.other.stock',
            'account.expense.soldGoodCost',
            'account.income.contract',
            this.contractForm.value.paymentCondition.accountTo_id
          ]).then((docList: any)=>{
            let docDict = {}
            docList.forEach(item=>{
              docDict[item.id] = item;
            })

            this.contractForm.value.items.forEach(async (item) => {
              let product_id = item.product_id || item.product._id;
              let product_name = item.product_name || item.product.name;
              createList.push({
                'name': "Contrato "+this.contractForm.value.code,
                'quantity': parseFloat(item.quantity),
                'origin_id': this.contractForm.value._id,
                'contact_id': this.contractForm.value.contact._id,
                'contact_name': this.contractForm.value.contact.name,
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
                'name': "Contrato "+this.contractForm.value.code,
                'contact_id': this.contractForm.value.contact._id,
                'contact_name': this.contractForm.value.contact.name,
                'amount': item.quantity*item.cost,
                'origin_id': this.contractForm.value._id,
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
            this.contractForm.value.paymentCondition.items.forEach(item => {
              let dateDue = this.formatService.addDays(this.today, item.days);
              // console.log("dentro", this.contractForm.value);
              let amount = (item.percent/100)*this.contractForm.value.total;
              let cashMoveTemplate = {
                '_return': true,
                'date': new Date(),
                'name': "Contrato "+this.contractForm.value.code,
                'contact_id': this.contractForm.value.contact._id,
                'contact_name': this.contractForm.value.contact.name,
                'amount': amount,
                'amount_residual': amount,
                'amount_unInvoiced': amount,
                'docType': "cash-move",
                'payments': [],
                'invoices': [],
                'origin_id': this.contractForm.value._id,
                'dateDue': dateDue,
                'accountFrom_id': 'account.income.contract',
                'accountFrom_name': docDict['account.income.contract'].doc.name,
                'accountTo_id': this.contractForm.value.paymentCondition.accountTo_id,
                'accountTo_name': docDict[this.contractForm.value.paymentCondition.accountTo_id].doc.name,
              }
              if (this.contractForm.value.currency._id){
                cashMoveTemplate['currency'] = this.contractForm.value.currency;
                cashMoveTemplate['currency_amount'] = amount;
                cashMoveTemplate['currency_residual'] = amount;
                cashMoveTemplate['amount'] = amount*this.contractForm.value.currency.contract_rate;
                cashMoveTemplate['residual'] = amount*this.contractForm.value.currency.contract_rate;
              }
              createList.push(cashMoveTemplate);
            });
            console.log("createList", createList);
            this.pouchdbService.createDocList(createList).then((created: any)=>{
              this.contractForm.patchValue({
                state: 'CONFIRMED',
                amount_unInvoiced: this.contractForm.value.total,
                planned: created,
              });
              console.log("Contract created", created);
              this.buttonSave();
              resolve(true);
            })
          })
        });
      });
    }

    async contractCancel(){
      let prompt = await this.alertCtrl.create({
        header: 'Estas seguro que deseas Cancelar el contrato?',
        message: 'Al cancelar el contrato todos los registros asociados serán borrados',
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
              this.contractForm.value.items.forEach((item) => {
                ////console.log("item", item);
                // let product_id = item.product_id || item.product._id;
                // this.productService.updateStock(product_id, item.quantity);
                //this.contractForm.value.step = 'chooseInvoice';
              });
              this.contractForm.patchValue({
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
      "cash-move", "origin_id", this.contractForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.pouchdbService.deleteDoc(doc);
        })
      });
      this.contractForm.patchValue({
        'planned': [],
      });
    }

    removeStockMoves(){
      this.pouchdbService.getRelated(
      "stock-move", "origin_id", this.contractForm.value._id).then((docs) => {
        docs.forEach(doc=>{
          this.contractService.deleteContract(doc);
        })
      });
    }

    beforeAddPayment(){
      if (this.contractForm.value.state == "QUOTATION"){
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
            this.contractForm.value.payments.push({
              'paid': data.paid,
              'date': data.date,
              'state': data.state,
              '_id': data._id,
            });
          this.contractForm.patchValue({
            'residual': this.contractForm.value.residual - data.paid,
          });
          this.recomputeValues();
          this.avoidAlertMessage = false;
          this.buttonSave();
          this.events.unsubscribe('create-receipt');
          // profileModal.dismiss();
        });
        let plannedItems = [];
        this.contractForm.value.planned.forEach(planned => {
          if (planned.amount_residual && planned.amount_residual != 0){
            plannedItems.push(planned);
          }
        })

          // plannedItems = [this.contractForm.value.planned[this.contractForm.value.planned.length - 1]];

        console.log("this.contractForm.value.planned", this.contractForm.value.planned);
        console.log("plannedItems", JSON.stringify(plannedItems));
        let profileModal = await this.modalCtrl.create({
          component: ReceiptPage,
          componentProps: {
            "select": true,
            "addPayment": true,
            "contact": this.contractForm.value.contact,
            "account_id": "account.income.contract",
            // "project_id": this.contractForm.value.project_id
            // || this.contractForm.value.project
            // && this.contractForm.value.project._id,
            "origin_id": this.contractForm.value._id,
            "name": "Contrato "+this.contractForm.value.code,
            "accountFrom_id": this.contractForm.value.paymentCondition.accountTo_id,
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
        this.contractForm.value.invoices.push({
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
        this.contractForm.value.planned.forEach(planned => {
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
        this.contractForm.patchValue({
           amount_unInvoiced: cashMove.amount_unInvoiced,
        });
        this.buttonSave();
        // this.contractForm.value.amount_unInvoiced -= cashMove.amount_unInvoiced;
        // this.pouchdbService.getDoc(cashMove.origin_id).then(contract=>{
        //   contract.amount_unInvoiced = cashMove.amount_unInvoiced;
        //   this.pouchdbService.updateDoc(contract);
        // });

        this.events.unsubscribe('create-invoice');
        // profileModal.dismiss();
      });

      let paymentType = 'Credito';
      if (this.contractForm.value.paymentCondition._id == 'payment-condition.cash'){
        paymentType = 'Contado';
      }
      let profileModal = await this.modalCtrl.create({
        component: InvoicePage,
        componentProps: {
          "openPayment": true,
          "select": true,
          "contact_id": this.contractForm.value.contact._id,
          "contact": this.contractForm.value.contact,
          "date": this.contractForm.value.date,
          "paymentCondition": paymentType,
          "origin_id": this.contractForm.value._id,
          "items": this.contractForm.value.items,
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
      if (this.contractForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          this.events.subscribe('select-contact', (data) => {
            this.contractForm.patchValue({
              contact: data,
              contact_name: data.name,
            });
            this.contractForm.markAsDirty();
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
    //   if (this.contractForm.value.state=='QUOTATION'){
    //     return new Promise(resolve => {
    //       this.avoidAlertMessage = true;
    //       this.events.unsubscribe('select-project');
    //       this.events.subscribe('select-project', (data) => {
    //         this.contractForm.patchValue({
    //           project: data,
    //           project_name: data.name,
    //         });
    //         this.contractForm.markAsDirty();
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
      // if (this.contractForm.value.state=='QUOTATION'){
        return new Promise(async resolve => {
          this.avoidAlertMessage = true;
          this.events.unsubscribe('select-contact');
          this.events.subscribe('select-contact', (data) => {
            this.contractForm.patchValue({
              seller: data,
              seller_name: data.name,
            });
            this.contractForm.markAsDirty();
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
      if (this.contractForm.value.state=='QUOTATION'){
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-payment-condition');
        this.events.subscribe('select-payment-condition', (data) => {
          this.contractForm.patchValue({
            paymentCondition: data,
            payment_name: data.name,
          });
          this.contractForm.markAsDirty();
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
      if (this.platform.is('cordova')){
        this.configService.getConfigDoc().then(async (data) => {
          let company_name = data.name || "";
          let company_ruc = data.doc || "";
          let company_phone = data.phone || "";
          //let number = this.contractForm.value.invoice || "";
          let date = this.contractForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
          date = date[2]+"/"+date[1]+"/"+date[0]
          let payment_condition = this.contractForm.value.paymentCondition.name || "";
          let contact_name = this.contractForm.value.contact.name || "";
          let seller_name = this.contractForm.value.seller.name || "";
          let code = this.contractForm.value.code || "";
          let doc = this.contractForm.value.contact.document || "";
          //let direction = this.contractForm.value.contact.city || "";
          //let phone = this.contractForm.value.contact.phone || "";
          let lines = ""
          let totalExentas = 0;
          let totalIva5 = 0;
          let totalIva10 = 0;
          this.contractForm.value.items.forEach(item => {
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
        // this.bluetoothSerial.isEnabled().then(res => {
        //   this.bluetoothSerial.list().then((data)=> {
        //     this.bluetoothSerial.connect(data[0].id).subscribe((data)=>{
        //       this.bluetoothSerial.isConnected().then(res => {
        //         // |---- 32 characteres ----|
        //         this.bluetoothSerial.write(ticket);
        //         this.bluetoothSerial.disconnect();
        //       }).catch(res => {
        //         //console.log("res1", res);
        //       });
        //     },error=>{
        //       //console.log("error", error);
        //     });
        //   })
        // }).catch(res => {
        //   //console.log("res", res);
        // });
      });
    } else {
      this.share();
    }
    }

    share() {
      this.configService.getConfigDoc().then((data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.contractForm.value.invoice || "";
        let date = this.contractForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        let payment_condition = this.contractForm.value.paymentCondition.name || "";
        let contact_name = this.contractForm.value.contact.name || "";
        let seller_name = this.contractForm.value.seller.name || "";
        let code = this.contractForm.value.code || "";
        let doc = this.contractForm.value.contact.document || "";
        //let direction = this.contractForm.value.contact.city || "";
        //let phone = this.contractForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.contractForm.value.items.forEach(item => {
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
      //  html2canvas(div, options).then(canvas => {
      //    console.log("canvas", canvas);
      //    if (this.platform.is('cordova')){
      //      var contentType = "image/png";
      //      this.socialSharing.share(
      //        "Presupuesto Total "+totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
      //        "Presupuesto "+code,
      //        canvas.toDataURL()
      //      )
      //    } else {
      //      let a = document.createElement('a');
      //      document.body.appendChild(a);
      //      a.download = "Contrato-"+code+".png";
      //      a.href =  canvas.toDataURL();
      //      a.click();
      //    }
      //
      //
      //   //console.log("share sucess");
      //   // if cordova.file is not available use instead :
      //   // var folderpath = "file:///storage/emulated/0/Download/";
      //   // var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
      //   //console.log("folderpath", folderpath);
      //   // this.formatService.savebase64AsPDF(
      //   // canvas.toDataURL(), "Presupuesto.png", canvas, contentType);
      // });


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
      this.navCtrl.navigateBack('/contract-list');
    }

    showNextButton(){
      // console.log("stock",this.contractForm.value.stock);
      if (this.contractForm.value.name==null){
        return true;
      }
      else if (this.contractForm.value.price==null){
        return true;
      }
      else if (this.contractForm.value.cost==null){
        return true;
      }
      else if (this.contractForm.value.type=='product'&&this.contractForm.value.stock==null){
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
        if(this.contractForm.dirty) {
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
        this.contractForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/contract-list');
      }
    }
}

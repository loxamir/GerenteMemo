import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController,  LoadingController,
   AlertController, Events, ToastController,
 ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
//import { DecimalPipe } from '@angular/common';
import { Printer, PrintOptions } from '@ionic-native/printer';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
// import { ResultService } from '../balance.service';
import { ContactListPage } from '../contact-list/contact-list.page';
//import { ResultItemPage } from '../balance-item/balance-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { ResultsPage } from '../balances/balances';
import { ProductListPage } from '../product-list/product-list.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
// import { PlannedService } from '../../planned/planned.service';
// import { SaleService } from '../../sale/sale.service';
// import { PurchaseService } from '../../purchase/purchase.service';
import { ConfigService } from '../config/config.service';
// import { HostListener } from '@angular/core';
import { ReceiptPage } from '../receipt/receipt.page';
// import { ReceiptService } from '../../receipt/receipt.service';
// import { InvoicePage } from '../../invoice/invoice';
import { FormatService } from '../services/format.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { ReportService } from '../report/report.service';
declare var cordova:any;
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TitlePage } from '../title/title.page';
import { AccountCategoryPage } from '../account-category/account-category.page';

@Component({
  selector: 'app-balance-report',
  templateUrl: './balance-report.page.html',
  styleUrls: ['./balance-report.page.scss'],
})
export class BalanceReportPage implements OnInit {
  @ViewChild('select') select;

    balanceForm: FormGroup;
    loading: any;
    today: any;
    _id: string;
    avoidAlertMessage: boolean;
    sold: number = 0;
    service: number = 0;
    return: number = 0;
    saleTax: number = 0;
    // liquid: number = 0;
    cmv: number = 0;
    // gross: number = 0;
    admin: number = 0;
    incomeFinance: number = 0;
    expenseFinance: number = 0;
    depre: number = 0;
    other: number = 0;
    balance: any[];

    accountCategories: any[];
    accounts: any[];
    // : number = 0;

    languages: Array<LanguageModel>;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public balanceService: BalanceService,
      public route: ActivatedRoute,
      public formBuilder: FormBuilder,
      public alertCtrl: AlertController,
      public productService: ProductService,
      // public plannedService: PlannedService,
      // public saleService: SaleService,
      // public purchaseService: PurchaseService,
      // public receiptService: ReceiptService,
      public reportService: ReportService,
      public bluetoothSerial: BluetoothSerial,
      public toastCtrl: ToastController,
      public printer: Printer,
      public configService: ConfigService,
      public formatService: FormatService,
      public events:Events,
      public socialSharing: SocialSharing,
      public file: File,
      public pouchdbService: PouchdbService,
      public modalCtrl: ModalController,
    ) {
      //this.loading = //this.loadingCtrl.create();
      this.today = new Date();
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
      this.avoidAlertMessage = false;
    }

    sortByCode(list=[]){
      let self= this;
      let list2 = list.sort(function(a, b) {
        return self.formatService.compareField(a, b, 'code', 'increase');
      });
      return list2;
      // list.sort(this.formatService.compareField('code'))
    }

    groupBySum(object, prop, sum) {
      return object.reduce(function(lines, item) {
        const val = item[prop]
        // groups[val] = groups[val] || []
        // groups[val].push(item)

        //lines[val] = lines[val] ||
        //console.log("")
        lines[val] = lines[val] || {}
        lines[val][sum] = lines[val][sum] || 0
        lines[val][sum] += item[sum]
        return lines
      }, {})
    }

    async openTitle(view) {
      let profileModal = await this.modalCtrl.create({
        component: TitlePage,
        componentProps: {
          select: true,
          '_id': view._id
        }
      });
      profileModal.present();
    }

    doRefresh(refresher) {
      setTimeout(() => {
        this.recomputeValues();
        refresher.target.complete();
      }, 500);
    }


    async openCategory(view) {
      let profileModal = await this.modalCtrl.create({
        component: AccountCategoryPage,
        componentProps: {
          select: true,
          '_id': view._id
        }
      });
      profileModal.present();
    }

    groupByName(object, prop, sum) {
        return object.reduce(function(lines, item) {
          const val = item[prop]
          lines[val] = lines[val] || {}
          lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
          if (item.signal== "-"){
            lines[val][sum] -= parseFloat(item[sum])
          } else {
            lines[val][sum] += parseFloat(item[sum])
          }

          lines[val]['list'] = lines[val]['list'] || []
          lines[val]['list'].push(item)
          return lines
        }, {})
      }

    groupByDate(object, prop, sum) {
      // return object.reduce(function(groups, item) {
      //     const val = item[prop].split("T")[0]
      //     groups[val] = groups[val] || []
      //     groups[val].push(item)
      //     return groups
      //   }, {})

        return object.reduce(function(lines, item) {
          const val = item[prop].split("T")[0]
          lines[val] = lines[val] || {}
          lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
          if (item.signal== "-"){
            lines[val][sum] -= parseFloat(item[sum])
          } else {
            lines[val][sum] += parseFloat(item[sum])
          }

          lines[val]['list'] = lines[val]['list'] || []
          lines[val]['list'].push(item)
          return lines
        }, {})
      }

    compare(a, b, field) {
      // Use toUpperCase() to ignore character casing
      const genreA = a[field];
      const genreB = b[field];

      if (genreA > genreB) {
        return -1;
      } else if (genreA < genreB) {
        return 1;
      }
      return 0;
    }


    ngOnInit() {
      //var today = new Date().toISOString();
      this.balanceForm = this.formBuilder.group({
        contact: new FormControl(this.route.snapshot.paramMap.get('contact')||{}, Validators.required),
        name: new FormControl(''),
        contact_name: new FormControl(this.route.snapshot.paramMap.get('contact_name')||''),
        code: new FormControl(''),
        date: new FormControl(this.route.snapshot.paramMap.get('date')||this.today),
        dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||this.getFirstDateOfMonth()),
        dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd')||this.today),
        origin_id: new FormControl(this.route.snapshot.paramMap.get('origin_id')),
        total: new FormControl(0),
        residual: new FormControl(0),
        note: new FormControl(''),
        state: new FormControl('QUOTATION'),
        tab: new FormControl('products'),
        items: new FormControl(this.route.snapshot.paramMap.get('items')||[], Validators.required),
        payments: new FormControl([]),
        planned: new FormControl([]),
        paymentCondition: new FormControl({}),
        payment_name: new FormControl(''),
        invoice: new FormControl(''),
        balanceType: new FormControl('cashFlow'),
        groupBy: new FormControl('date'),
        orderBy: new FormControl('quantity'),
        filterBy: new FormControl('contact'),
        filter: new FormControl(''),
        invoices: new FormControl([]),
        _id: new FormControl(''),
      });
      this.recomputeValues();
    }

    getFirstDateOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    recomputeSale() {
      // getBalance(keyword, reportView, level, startkey, endkey){
      //   return new Promise((resolve, reject)=>{
          // console.log("level, startkey, endkey", level, startkey, endkey);
          // this.pouchdbService.searchDocTypeData('title', '', false).then((titles: any[]) => {
          //   this.titles = titles;
          //   console.log("this.titles", this.titles);
          // });
        /*

        [{"name": activo, categories: [{name: "Caixa", }]}]
        */
        let balance = [];
        let dict = {};

        this.pouchdbService.searchDocTypeData(
          'title',
          ''
        ).then((titles: any[]) => {
          // titles.push({"_id": undefined, "code": 0, "name": "Indefinido"});


        this.pouchdbService.searchDocTypeData(
          'accountCategory',
          ''
        ).then((accountCategories: any[]) => {

          let teste = this.groupByName(accountCategories, 'title_id', '');
          titles.forEach(title=>{
            if (parseFloat(title.code)<5){
              balance.push({
                "name": title.name,
                "code": title.code,
                "formula": title.formula,
                "_id": title._id,
                "categories": teste[title._id] && teste[title._id]['list'] || []
              });
            }
          });

          this.pouchdbService.searchDocTypeData('account', '').then((accounts: any[]) => {
            this.accounts = accounts;
            let categArray = this.groupByName(accounts, 'category_id', '');
            // console.log("testsdf", teste);
            // let categs = Object.keys(categArray);
            // categs.forEach(categ=>{
            //   // balance[categ].forEach(category=>{
            //     // console.log("categoria", categ, categArray[categ]['list']);
            //     // balance[categ]['accounts'] = categArray[categ]['list'];
            //     // balance[categ]['accounts'] = teste[category._id]['list'];
            //   // })
            // })
            balance.forEach(title =>{
              title.categories.forEach(catego=>{
                catego['accounts'] = categArray[catego._id] && categArray[catego._id]['list'] || [];
              })
            })
            this.pouchdbService.getView(
              'stock/ResultadoDiario', 2,
              [this.balanceForm.value.dateStart.split("T")[0], '0'],
              [this.balanceForm.value.dateEnd.split("T")[0], 'z']
            ).then((view: any[]) => {
              console.log("viewww", view);
              balance.forEach(title=>{
                let titbalance = 0;
                title.categories.forEach(category=>{
                  let catbalance = 0
                  category.accounts && category.accounts.forEach(account=>{
                    let balance = 0;
                    view.forEach(viewData=>{
                      if(viewData.key[1] == account._id){
                        balance += viewData.value;
                      }
                    })
                    account.balance = balance;
                    catbalance += balance;
                  })
                  category.balance = catbalance;
                  titbalance += catbalance;
                })
                title.balance = titbalance;
              })
              // Calculate the formula titles
              balance.forEach(title=>{
                if (title.formula){
                  let calculo = title.formula;
                  balance.forEach(it=>{
                    calculo = calculo.replace(it._id, it.balance);
                    it.categories.forEach(categor=>{
                      calculo = calculo.replace(categor._id, categor.balance);
                      categor.accounts.forEach(account=>{
                        calculo = calculo.replace(account._id, account.balance);
                      })
                    })
                  })
                  title.balance = eval(calculo);
                }
              })
              this.balance = balance.reverse();
            });
          });
        });
      });




      //   });
      // }
      this.reportService.getSaleReport(this.balanceForm.value.dateStart, this.balanceForm.value.dateEnd).then((balance) => {
        console.log("RESULT", balance);
        this.sold = balance['total'];
        this.return = balance['returns'];
        this.cmv = balance['cost'];
      })
    }
    recomputeService() {
      this.reportService.getServiceReport(this.balanceForm.value.dateStart, this.balanceForm.value.dateEnd).then((balance) => {
        console.log("RESULT", balance);
        this.service = balance;
      })
    }
    recomputeSaleTax() {
      this.reportService.getInvoiceReport(this.balanceForm.value.dateStart, this.balanceForm.value.dateEnd, "out").then((balance) => {
        console.log("TAX", balance);
        this.saleTax = -balance;
      })
    }
    recomputeCashMove() {
      console.log("recomputeCashMove");
      this.reportService.getCashMoveReport(
        this.balanceForm.value.dateStart,
        this.balanceForm.value.dateEnd,
      ).then((balance) => {
        console.log("CASHMOVE", balance);
        this.admin = balance['admin'];
        this.incomeFinance = balance['incomeFinance'];
        this.expenseFinance = balance['expenseFinance'];
        this.depre = balance['depre'];
        this.other = balance['other'];
      })
    }

    // ionViewCanLeave() {
    //     if(this.balanceForm.dirty && ! this.avoidAlertMessage) {
    //         let alertPopup = this.alertCtrl.create({
    //             title: 'Exit',
    //             message: '¿Are you sure?',
    //             buttons: [{
    //                     text: 'Exit',
    //                     handler: () => {
    //                         alertPopup.dismiss().then(() => {
    //                             this.exitPage();
    //                         });
    //                     }
    //                 },
    //                 {
    //                     text: 'Stay',
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

    share(){
      //console.log("Ponto1");
      // var fileName = "myPdfFile.pdf";
      //
      // var options = {
      //     documentSize: 'A4',
      //     type: 'base64'
      // };
      // var pdfhtml = '<html><body style="font-size:120%">This is the pdf content</body></html>';
      // //console.log("Ponto2");
      // pdf.fromData(pdfhtml , options).then(function(base64){
      //     // To define the type of the Blob
      //     var contentType = "application/pdf";
      //
      //     // if cordova.file is not available use instead :
      //     // var folderpath = "file:///storage/emulated/0/Download/";
      //     var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
      //     //console.log("Ponto3");
      //     savebase64AsPDF(folderpath, fileName, base64, contentType);
      //     //console.log("Ponto4");
      // })
      // .catch((err)=>console.err(err));
      // this.socialSharing.share("message", "subject").then(data => {
      //   //console.log("share data", data);
      // });


      //
      // //console.log("Ponto2");
      // cordova.plugins.pdf.htmlToPDF({
      //   data: "<b>html</b>Template",
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
      //     savebase64AsPDF(folderpath, "myPdfFile.pdf", sucess, contentType);
      //     this.socialSharing.share("teste de message", "sunto", folderpath+"myPdfFile.pdf")
      // },
      // (error) => console.log('error:', error));
      //console.log("Ponto4");
    }

    // private exitPage() {
    //     this.balanceForm.markAsPristine();
    //     this.navCtrl.navigateBack();
    // }

    // goNextStep() {
    //   // this.getData().then(data => {
    //   //   //console.log("data", data);
    //   //   this.balanceForm.value.items = data;
    //   // })
    //   this.recomputeValues();
    // }

    // beforeConfirm(){
    //   if (this.balanceForm.value.items.length == 0){
    //     this.addItem();
    //   } else {
    //     this.balanceForm.patchValue({
    //       tab: "balance",
    //     });
    //     if (Object.keys(this.balanceForm.value.contact).length === 0){
    //       this.selectContact().then( teste => {
    //         if (Object.keys(this.balanceForm.value.paymentCondition).length === 0){
    //           this.selectPaymentCondition();
    //         }
    //       });
    //     } else if (Object.keys(this.balanceForm.value.paymentCondition).length === 0){
    //       this.selectPaymentCondition();
    //     } else {
    //       this.balanceConfimation();
    //     }
    //   }
    // }

    // addDays(date, days) {
    //   days = parseInt(days);
    //   var balance = new Date(date);
    //   balance.setDate(balance.getDate() + days);
    //   return balance;
    // }

    // createQuotes(){
    //   return new Promise(resolve => {
    //     let date = new Date();
    //     let promise_ids = [];
    //     this.balanceForm.value.paymentCondition.items.forEach(item => {
    //       date = this.addDays(this.today, item.days);
    //       let amount = (item.percent/100)*this.balanceForm.value.total;
    //       let data = {
    //         'name': "cuota",
    //         'contact_id': this.balanceForm.value.contact._id,
    //         'amount': amount,
    //         'amount_residual': amount,
    //         'origin_id': this._id,
    //         'date': date,
    //         'state': 'WAIT',
    //         'signal': '+',
    //       }
    //       promise_ids.push(
    //         this.plannedService.createPlanned(data).then(plan => {
    //           //console.log("Plan", plan);
    //           data['_id'] = plan.id;
    //           this.balanceForm.value.planned.push(data);
    //         })
    //       );
    //     });
    //     Promise.all(promise_ids).then(data => {
    //       //console.log("created quotes");
    //       resolve(data);
    //     })
    //   });
    //
    // }

    // showPayments() {
    //   this.balanceForm.patchValue({
    //     tab: "payment",
    //   });
    //   this.addPayment();
    // }

    ionViewWillLeave(){
      //console.log("ionViewWillLeave");
      //this.navCtrl.navigateBack().then(() => {
        this.events.publish('create-balance', this.balanceForm.value);
      //});
    }

    // buttonSave() {
    //   if (this._id){
    //     this.balanceService.updateResult(this.balanceForm.value);
    //     this.events.publish('open-balance', this.balanceForm.value);
    //     this.balanceForm.markAsPristine();
    //   } else {
    //     this.balanceService.createResult(this.balanceForm.value).then(doc => {
    //       //console.log("docss", doc);
    //       this.balanceForm.patchValue({
    //         _id: doc['doc'].id,
    //         code: doc['balance'].code,
    //       });
    //       this._id = doc['doc'].id;
    //       this.events.publish('create-balance', this.balanceForm.value);
    //       this.balanceForm.markAsPristine();
    //     });
    //   }
    // }

    setLanguage(lang: LanguageModel){
      let language_to_set = this.translate.getDefaultLang();

      if(lang){
        language_to_set = lang.code;
      }
      this.translate.setDefaultLang(language_to_set);
      this.translate.use(language_to_set);
    }

    deleteItem(item){
      if (this.balanceForm.value.state=='QUOTATION'){
        let index = this.balanceForm.value.items.indexOf(item)
        this.balanceForm.value.items.splice(index, 1);
        this.recomputeValues();
      }
    }

    // deletePayment(item){
    //   let index = this.balanceForm.value.payments.indexOf(item)
    //   this.balanceForm.value.payments.splice(index, 1);
    //   this.recomputeResidual();
    // }

    recomputeTotal(){
      if (this.balanceForm.value.state=='QUOTATION'){
        let total = 0;
        this.balanceForm.value.items.forEach((item) => {
          total = total + item.quantity*item.price;
        });
        this.balanceForm.patchValue({
          total: total,
        });
      }
    }

    recomputeResidual(){
      let residual = parseFloat(this.balanceForm.value.total);
      this.balanceForm.value.payments.forEach((item) => {
        residual -= parseFloat(item.total);
      });
      this.balanceForm.patchValue({
        residual: residual,
      });
    }

    // addItem(){
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     this.avoidAlertMessage = true;
    //     this.events.unsubscribe('select-product');
    //     this.events.subscribe('select-product', (data) => {
    //       //console.log("vars", data);
    //       this.balanceForm.value.items.unshift({
    //         'quantity': 1,
    //         'price': data.price,
    //         'product': data,
    //         'description': data.name,
    //       })
    //       this.recomputeValues();
    //       this.balanceForm.markAsDirty();
    //       this.avoidAlertMessage = false;
    //       this.events.unsubscribe('select-product');
    //     })
    //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
    //   }
    // }
    //
    // openItem(item) {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     this.avoidAlertMessage = true;
    //     this.events.unsubscribe('select-product');
    //     this.events.subscribe('select-product', (data) => {
    //       //console.log("vars", data);
    //       item.price = data.price;
    //       item.product = data;
    //       item.description = data.name;
    //       this.recomputeValues();
    //       this.avoidAlertMessage = false;
    //       this.balanceForm.markAsDirty();
    //       this.events.unsubscribe('select-product');
    //     })
    //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
    //   }
    // }
    //
    // sumItem(item) {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     item.quantity = parseFloat(item.quantity)+1;
    //     this.recomputeValues();
    //   }
    // }
    //
    // remItem(item) {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     item.quantity = parseFloat(item.quantity)-1;
    //     this.recomputeValues();
    //   }
    // }
    //
    // editItemPrice(item){
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     let prompt = this.alertCtrl.create({
    //       title: 'Precio del Producto',
    //       message: 'Cual es el precio de este producto?',
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
    //           }
    //         }
    //       ]
    //     });
    //
    //     prompt.present();
    //   }
    // }
    //
    // editItemQuantity(item){
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     let prompt = this.alertCtrl.create({
    //       title: 'Cantidad del Producto',
    //       message: 'Cual es el Cantidad de este producto?',
    //       inputs: [
    //         {
    //           type: 'number',
    //           name: 'quantity',
    //           value: item.quantity
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
    //             item.quantity = data.quantity;
    //             this.recomputeValues();
    //           }
    //         }
    //       ]
    //     });
    //
    //     prompt.present();
    //   }
    // }

    // openPayment(item) {
    //   this.events.unsubscribe('open-receipt');
    //   this.events.subscribe('open-receipt', (data) => {
    //     this.events.unsubscribe('open-receipt');
    //   });
    //   this.navCtrl.navigateForward(ReceiptPage, {
    //     "_id": item._id,
    //   });
    // }

    recomputeValues() {
      this.recomputeSale();
      this.recomputeService();
      this.recomputeSaleTax();
      this.recomputeCashMove();
    }

    validation_messages = {
      'contact': [
        { type: 'required', message: 'Client is required.' }
      ]
    };

    // confirmBalance() {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     this.beforeConfirm();
    //   }
    // }
    //
    // balanceConfimation(){
    //   let prompt = this.alertCtrl.create({
    //     title: 'Estas seguro que deseas confirmar la venta?',
    //     message: 'Si la confirmas no podras cambiar los productos ni el cliente',
    //     buttons: [
    //       {
    //         text: 'Cancelar',
    //         handler: data => {
    //           //console.log("Cancelar");
    //         }
    //       },
    //       {
    //         text: 'Confirmar',
    //         handler: data => {
    //           //console.log("Confirmar");
    //           this.afterConfirm();
    //           // this.balanceForm.value.items.forEach((item) => {
    //           //   ////console.log("item", item);
    //           //   let product_id = item.product_id || item.product._id;
    //           //   this.productService.updateStock(product_id, -item.quantity);
    //           //   //this.balanceForm.value.step = 'chooseInvoice';
    //           // });
    //           // this.balanceForm.patchValue({
    //           //    state: 'CONFIRMED',
    //           // });
    //           // this.createQuotes();
    //           // this.buttonSave();
    //         }
    //       }
    //     ]
    //   });
    //   prompt.present();
    // }

    // afterConfirm(){
    //   return new Promise(resolve => {
    //     this.balanceForm.value.items.forEach((item) => {
    //       ////console.log("item", item);
    //       let product_id = item.product_id || item.product._id;
    //       this.productService.updateStock(product_id, -item.quantity);
    //       //this.balanceForm.value.step = 'chooseInvoice';
    //     });
    //     this.balanceForm.patchValue({
    //        state: 'CONFIRMED',
    //     });
    //     this.createQuotes().then(data => {
    //       // this.buttonSave();
    //       resolve(true);
    //     });
    //   });
    // }
    //
    // balanceUnConfim(){
    //   let prompt = this.alertCtrl.create({
    //     title: 'Estas seguro que deseas DESconfirmar la venta?',
    //     message: 'Si la confirmas no podras cambiar los productos ni el cliente',
    //     buttons: [
    //       {
    //         text: 'Cancelar',
    //         handler: data => {
    //           //console.log("Cancelar");
    //         }
    //       },
    //       {
    //         text: 'Confirmar',
    //         handler: data => {
    //           //console.log("Confirmar");
    //           this.balanceForm.value.items.forEach((item) => {
    //             ////console.log("item", item);
    //             let product_id = item.product_id || item.product._id;
    //             this.productService.updateStock(product_id, item.quantity);
    //             //this.balanceForm.value.step = 'chooseInvoice';
    //           });
    //           this.balanceForm.patchValue({
    //              state: 'QUOTATION',
    //           });
    //           //this.removeQuotes();
    //           //this.buttonSave();
    //         }
    //       }
    //     ]
    //   });
    //   prompt.present();
    // }

    // removeQuotes(){
    //   this.balanceForm.value.planned.forEach(planned => {
    //     //console.log("removed planned", planned);
    //     this.balanceService.deleteResult(planned);
    //   });
    //   this.balanceForm.patchValue({
    //     'planned': [],
    //   });
    // }

    // changeTab() {
    //   ////console.log("changeTab", this.balanceForm);
    //   this.balanceForm.controls.tab.markAsPristine();
    // }
    //
    // beforeAddPayment(){
    //   if (this.balanceForm.value.state == "QUOTATION"){
    //     this.afterConfirm().then(data => {
    //       this.addPayment();
    //     });
    //   } else {
    //     this.addPayment();
    //   }
    // }
    //
    // addPayment() {
    //   this.balanceForm.patchValue({
    //     "tab": 'payment'
    //   });
    //   this.avoidAlertMessage = true;
    //     this.events.unsubscribe('create-receipt');
    //     this.events.subscribe('create-receipt', (data) => {
    //       //console.log("receipt", data);
    //       //if (data.amount > 0){
    //         this.balanceForm.value.payments.push({
    //           'total': data.total,
    //           'date': data.date,
    //           //'cash': data.cash,
    //           'state': data.state,
    //           '_id': data._id,
    //         });
    //       //}
    //       this.recomputeValues();
    //       this.avoidAlertMessage = false;
    //       //this.buttonSave();
    //
    //       // item.price = data.price;
    //       // item.product = data;
    //       // this.recomputeValues();
    //       // this.balanceForm.markAsDirty();
    //       this.events.unsubscribe('create-receipt');
    //     });
    //     //console.log("this.balanceForm.value.planned", this.balanceForm.value.planned);
    //     let plannedItems = [];
    //     //let planned.amount_paid = this.balanceForm.value.planned[0].amount;
    //
    //     this.balanceForm.value.planned.forEach(planned => {
    //       //planned.amount_paid = planned.amount;
    //       if (planned.state == 'WAIT'){
    //         plannedItems.push(planned);
    //       }
    //     })
    //     //plannedItems = [plannedItems[0]];
    //
    //     let origin_ids = [];
    //     if (this.balanceForm['invoices'] && this.balanceForm['invoices'].length == 1){
    //       // let origin_ids = [this.balanceForm.invoices[0]._id];
    //       // plannedItems = [this.balanceForm.invoices[0].planned[0]];
    //       plannedItems = [plannedItems[0]];
    //       origin_ids = [this.balanceForm.value._id];
    //     } else {
    //       plannedItems = [plannedItems[0]];
    //       origin_ids = [this.balanceForm.value._id];
    //     }
    //     this.navCtrl.navigateForward(ReceiptPage, {
    //       //"default_amount": default_amount,
    //       //"default_name": "Pago Compra",
    //       "addPayment": true,
    //       "contact": this.balanceForm.value.contact,
    //       "items": plannedItems,
    //       "signal": "+",
    //       "origin_ids": origin_ids,
    //     });
    //
    //
    //     // this.navCtrl.navigateForward(ReceiptPage, {
    //     //   //"default_amount": default_amount,
    //     //   //"default_name": "Pago Venta",
    //     //   "addPayment": true,
    //     //   "contact": this.balanceForm.value.contact,
    //     //   "items": plannedItems,
    //     //   "origin_ids": [this.balanceForm.value._id],
    //     // });
    //   //}
    // }
    //
    // addInvoice() {
    //   this.avoidAlertMessage = true;
    //   //let default_amount = this.balanceForm.value.total
    //   this.events.unsubscribe('create-invoice');
    //   this.events.subscribe('create-invoice', (data) => {
    //     //console.log("vars", data);
    //     //if (data.amount > 0){
    //       this.balanceForm.value.invoices.push({
    //         'number': data.number,
    //         'date': data.date,
    //         'residual': data.residual,
    //         'total': data.total,
    //         'state': data.state,
    //         '_id': data._id,
    //       });
    //     //}
    //     this.avoidAlertMessage = false;
    //     this.balanceForm.value.payments.forEach(payment => {
    //       payment['origin_ids'] = [data._id];
    //       this.receiptService.updateReceipt(payment).then(plan => {
    //         ////console.log("payment", plan);
    //       });
    //     });
    //     this.balanceForm.value.planned.forEach(planned => {
    //       planned['origin_id'] = [data._id];
    //       this.plannedService.updatePlanned(planned).then(plan => {
    //         ////console.log("payment", plan);
    //       });
    //     });
    //     //this.buttonSave();
    //
    //     // item.price = data.price;
    //     // item.product = data;
    //     // this.recomputeValues();
    //     // this.invoiceForm.markAsDirty();
    //     this.events.unsubscribe('create-invoice');
    //   });
    //   this.navCtrl.navigateForward(InvoicePage, {
    //     "openPayment": true,
    //     "contact_id": this.balanceForm.value.contact._id,
    //     "contact": this.balanceForm.value.contact,
    //     "date": this.balanceForm.value.date,
    //     "tab": "invoice",
    //     "origin_ids": [this.balanceForm.value._id],
    //     "items": this.balanceForm.value.items,
    //     "planned": this.balanceForm.value.planned,
    //     "payments": this.balanceForm.value.payments,
    //     'type': 'out',
    //   });
    // }
    //
    // openInvoice(item) {
    //   this.events.unsubscribe('open-invoice');
    //   this.events.subscribe('open-invoice', (data) => {
    //     ////console.log("vars", data);
    //     // if (data.amount > 0){
    //     //   this.balanceForm.value.payments.push({
    //     //     'amount': data.amount,
    //     //     'date': data.date,
    //     //     'cash': data.cash,
    //     //     'state': data.state,
    //     //   });
    //     // }
    //     //this.recomputeValues();
    //     this.avoidAlertMessage = false;
    //     //this.buttonSave();
    //     this.events.unsubscribe('open-invoice');
    //   });
    //   this.navCtrl.navigateForward(InvoicePage, {
    //     "_id": item._id,
    //   });
    // }

    onSubmit(values){
      //console.log(values);
    }

    // selectContact() {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     return new Promise(resolve => {
    //       this.avoidAlertMessage = true;
    //       this.events.unsubscribe('select-contact');
    //       this.events.subscribe('select-contact', (data) => {
    //         this.balanceForm.patchValue({
    //           contact: data,
    //           contact_name: data.name,
    //         });
    //         this.balanceForm.markAsDirty();
    //         this.avoidAlertMessage = false;
    //         this.events.unsubscribe('select-contact');
    //         resolve(true);
    //       })
    //       this.navCtrl.navigateForward(ContactsPage, {"select": true});
    //     });
    //   }
    // }
    //
    // selectPaymentCondition() {
    //   if (this.balanceForm.value.state=='QUOTATION'){
    //     this.avoidAlertMessage = true;
    //     this.events.unsubscribe('select-payment-condition');
    //     this.events.subscribe('select-payment-condition', (data) => {
    //       this.balanceForm.patchValue({
    //         paymentCondition: data,
    //         payment_name: data.name,
    //       });
    //       this.balanceForm.markAsDirty();
    //       this.avoidAlertMessage = false;
    //       this.events.unsubscribe('select-payment-condition');
    //       this.beforeAddPayment();
    //     })
    //     this.navCtrl.navigateForward(PaymentConditionListPage, {"select": true});
    //   }
    // }

    print() {
      this.configService.getConfigDoc().then(async (data) => {
        let company_name = data.name || "";
        let company_ruc = data.doc || "";
        let company_phone = data.phone || "";
        //let number = this.balanceForm.value.invoice || "";
        let date = this.balanceForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        let payment_condition = this.balanceForm.value.paymentCondition.name || "";
        let contact_name = this.balanceForm.value.contact.name || "";
        let code = this.balanceForm.value.code || "";
        let doc = this.balanceForm.value.contact.document || "";
        //let direction = this.balanceForm.value.contact.city || "";
        //let phone = this.balanceForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.balanceForm.value.items.forEach(item => {
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

    printAndroid(){
      // this.printer.pick().then(printer => {
        let number = this.balanceForm.value.invoice || "";
        let date = this.balanceForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
        date = date[2]+"/"+date[1]+"/"+date[0]
        //console.log("date", date);
        let payment_condition = this.balanceForm.value.paymentCondition.name || "";
        let contact_name = this.balanceForm.value.contact.name || "";
        let doc = this.balanceForm.value.contact.document || "";
        let direction = this.balanceForm.value.contact.city || "";
        let phone = this.balanceForm.value.contact.phone || "";
        let lines = ""
        let totalExentas = 0;
        let totalIva5 = 0;
        let totalIva10 = 0;
        this.balanceForm.value.items.forEach(item => {
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

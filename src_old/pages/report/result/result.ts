import { Component, ViewChild } from '@angular/core';
import { NavController, App, NavParams, LoadingController,
   AlertController, Select, Events, ToastController,
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
// import { ResultService } from '../result.service';
import { ContactsPage } from '../../contact/list/contacts';
//import { ResultItemPage } from '../result-item/result-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../../product/product.service';
//import { ResultsPage } from '../results/results';
import { ProductsPage } from '../../product/list/products';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PaymentConditionListPage } from '../../payment-condition/list/payment-condition-list';
// import { PlannedService } from '../../planned/planned.service';
import { SaleService } from '../../sale/sale.service';
import { PurchaseService } from '../../purchase/purchase.service';
import { ConfigService } from '../../config/config.service';
// import { HostListener } from '@angular/core';
import { ReceiptPage } from '../../receipt/receipt';
import { ReceiptService } from '../../receipt/receipt.service';
import { InvoicePage } from '../../invoice/invoice';
import { FormatService } from '../services/format.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';
import { ReportService } from '../report.service';
declare var cordova:any;
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TitlePage } from '../../cash/move/account/accountCategory/title/title';
import { AccountCategoryPage } from '../../cash/move/account/accountCategory/accountCategory';
/**
 * Convert a base64 string in a Blob according to the data and contentType.
 *
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (application/pdf - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
}

/**
 * Create a PDF file according to its database64 content only.
 *
 * @param folderpath {String} The folder where the file will be created
 * @param filename {String} The name of the file that will be created
 * @param content {Base64 String} Important : The content can't contain the following string (data:application/pdf;base64). Only the base64 string is expected.
 */
function savebase64AsPDF(folderpath,filename,content,contentType){
    // Convert the base64 string in a Blob
    var DataBlob = b64toBlob(content,contentType, 512);

    //console.log("Starting to write the file :3");

    this.file.resolveLocalFileSystemURL(folderpath, function(dir) {
        //console.log("Access to the directory granted succesfully");
        dir.getFile(filename, {create:true}, function(file) {
            //console.log("File created succesfully.");
            file.createWriter(function(fileWriter) {
                //console.log("Writing content to file");
                fileWriter.write(DataBlob);
            }, function(){
                alert('Unable to save file in path '+ folderpath);
            });
        });
    });
}

// Array.prototype.groupBy = function(prop) {
//   return this.reduce(function(groups, item) {
//     const val = item[prop]
//     groups[val] = groups[val] || []
//     groups[val].push(item)
//     return groups
//   }, {})
// }


@Component({
  selector: 'result-page',
  templateUrl: 'result.html'
})
export class ResultPage {
@ViewChild(Select) select: Select;

  resultForm: FormGroup;
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
  result: any[];

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
    // public resultService: ResultService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public productService: ProductService,
    // public plannedService: PlannedService,
    public saleService: SaleService,
    public purchaseService: PurchaseService,
    public receiptService: ReceiptService,
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
    public modal: ModalController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.today = new Date();
    this.languages = this.languageService.getLanguages();
    this._id = this.navParams.data._id;
    this.avoidAlertMessage = false;
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

  openTitle(view) {
    let profileModal = this.modal.create(TitlePage, {'_id': view._id});
    profileModal.present();
  }

  openCategory(view) {
    let profileModal = this.modal.create(AccountCategoryPage, {'_id': view._id});
    profileModal.present();
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.recomputeValues();
      refresher.target.complete();
    }, 500);
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


  ionViewWillLoad() {
    //var today = new Date().toISOString();
    this.resultForm = this.formBuilder.group({
      contact: new FormControl(this.navParams.data.contact||{}, Validators.required),
      name: new FormControl(''),
      contact_name: new FormControl(this.navParams.data.contact_name||''),
      code: new FormControl(''),
      date: new FormControl(this.navParams.data.date||this.today),
      dateStart: new FormControl(this.navParams.data.dateStart||this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.navParams.data.dateEnd||this.today),
      origin_id: new FormControl(this.navParams.data.origin_id),
      total: new FormControl(0),
      residual: new FormControl(0),
      note: new FormControl(''),
      state: new FormControl('QUOTATION'),
      tab: new FormControl('products'),
      items: new FormControl(this.navParams.data.items||[], Validators.required),
      payments: new FormControl([]),
      planned: new FormControl([]),
      paymentCondition: new FormControl({}),
      payment_name: new FormControl(''),
      invoice: new FormControl(''),
      resultType: new FormControl('cashFlow'),
      groupBy: new FormControl('date'),
      orderBy: new FormControl('quantity'),
      filterBy: new FormControl('contact'),
      filter: new FormControl(''),
      invoices: new FormControl([]),
      _id: new FormControl(''),
    });
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  ionViewDidLoad() {
    this.recomputeValues();
  }

  recomputeValues() {
    // getResult(keyword, reportView, level, startkey, endkey){
    //   return new Promise((resolve, reject)=>{
        // console.log("level, startkey, endkey", level, startkey, endkey);
        // this.pouchdbService.searchDocTypeData('title', '', false).then((titles: any[]) => {
        //   this.titles = titles;
        //   console.log("this.titles", this.titles);
        // });
      /*

      [{"name": activo, categories: [{name: "Caixa", }]}]
      */
      let result = [];
      let dict = {};

      this.pouchdbService.searchDocTypeData(
        'title',
        ''
      ).then((titles: any[]) => {
        titles.push({"_id": undefined, "code": 0, "name": "Indefinido"});


      this.pouchdbService.searchDocTypeData(
        'accountCategory',
        ''
      ).then((accountCategories: any[]) => {

        let teste = this.groupByName(accountCategories, 'title_id', '');
        titles.forEach(title=>{
          if (parseFloat(title.code)>=5){
            result.push({
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
          //   // result[categ].forEach(category=>{
          //     // console.log("categoria", categ, categArray[categ]['list']);
          //     // result[categ]['accounts'] = categArray[categ]['list'];
          //     // result[categ]['accounts'] = teste[category._id]['list'];
          //   // })
          // })
          result.forEach(title =>{
            title.categories.forEach(catego=>{
              catego['accounts'] = categArray[catego._id] && categArray[catego._id]['list'] || [];
            })
          })
          this.pouchdbService.getView(
            'stock/ResultadoDiario', 2,
            [this.resultForm.value.dateStart.split("T")[0], '0'],
            [this.resultForm.value.dateEnd.split("T")[0], 'z']
          ).then((view: any[]) => {
            console.log("viewww", view);
            result.forEach(title=>{
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
            result.forEach(title=>{
              if (title.formula){
                let calculo = title.formula;
                result.forEach(it=>{
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
            this.result = result.reverse();
          });
        });
      });
    });




    //   });
    // }
    // this.reportService.getSaleReport(this.resultForm.value.dateStart, this.resultForm.value.dateEnd).then((result) => {
    //   console.log("RESULT", result);
    //   this.sold = result['total'];
    //   this.return = result['returns'];
    //   this.cmv = result['cost'];
    // })
  }
  // recomputeService() {
  //   this.reportService.getServiceReport(this.resultForm.value.dateStart, this.resultForm.value.dateEnd).then((result) => {
  //     console.log("RESULT", result);
  //     this.service = result;
  //   })
  // }
  // recomputeSaleTax() {
  //   this.reportService.getInvoiceReport(this.resultForm.value.dateStart, this.resultForm.value.dateEnd, "out").then((result) => {
  //     console.log("TAX", result);
  //     this.saleTax = -result;
  //   })
  // }
  // recomputeCashMove() {
  //   console.log("recomputeCashMove");
  //   this.reportService.getCashMoveReport(
  //     this.resultForm.value.dateStart,
  //     this.resultForm.value.dateEnd,
  //   ).then((result) => {
  //     console.log("CASHMOVE", result);
  //     this.admin = result['admin'];
  //     this.incomeFinance = result['incomeFinance'];
  //     this.expenseFinance = result['expenseFinance'];
  //     this.depre = result['depre'];
  //     this.other = result['other'];
  //   })
  // }

  // ionViewCanLeave() {
  //     if(this.resultForm.dirty && ! this.avoidAlertMessage) {
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
    let number = this.resultForm.value.invoice || "";
    let date = this.resultForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
    date = date[2]+"/"+date[1]+"/"+date[0]
    //console.log("date", date);
    let payment_condition = this.resultForm.value.paymentCondition.name || "";
    let contact_name = this.resultForm.value.contact.name || "";
    let doc = this.resultForm.value.contact.document || "";
    let direction = this.resultForm.value.contact.city || "";
    let phone = this.resultForm.value.contact.phone || "";
    let lines = ""
    let totalExentas = 0;
    let totalIva5 = 0;
    let totalIva10 = 0;
    this.resultForm.value.items.forEach(item => {
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

    let htmlTemplate = `<!-- <div style='
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
`


    //console.log("Ponto2");
    cordova.plugins.pdf.htmlToPDF({
      data: htmlTemplate,
      documentSize: "A4",
      landscape: "portrait",
      type: "base64"
    },
    (sucess) => {
        // To define the type of the Blob
        //console.log("Ponto3");
        var contentType = "application/pdf";
        //console.log("share sucess");
        // if cordova.file is not available use instead :
        // var folderpath = "file:///storage/emulated/0/Download/";
        var folderpath = cordova.file.externalRootDirectory + "Download/"; //you can select other folders
        //console.log("folderpath", folderpath);
        savebase64AsPDF(folderpath, "myPdfFile.pdf", sucess, contentType);
        this.socialSharing.share("teste de message", "sunto", folderpath+"myPdfFile.pdf")
    },
    (error) => console.log('error:', error));
    //console.log("Ponto4");
  }

  // private exitPage() {
  //     this.resultForm.markAsPristine();
  //     this.navCtrl.navigateBack();
  // }

  // goNextStep() {
  //   // this.getData().then(data => {
  //   //   //console.log("data", data);
  //   //   this.resultForm.value.items = data;
  //   // })
  //   this.recomputeValues();
  // }

  // beforeConfirm(){
  //   if (this.resultForm.value.items.length == 0){
  //     this.addItem();
  //   } else {
  //     this.resultForm.patchValue({
  //       tab: "result",
  //     });
  //     if (Object.keys(this.resultForm.value.contact).length === 0){
  //       this.selectContact().then( teste => {
  //         if (Object.keys(this.resultForm.value.paymentCondition).length === 0){
  //           this.selectPaymentCondition();
  //         }
  //       });
  //     } else if (Object.keys(this.resultForm.value.paymentCondition).length === 0){
  //       this.selectPaymentCondition();
  //     } else {
  //       this.resultConfimation();
  //     }
  //   }
  // }

  // addDays(date, days) {
  //   days = parseInt(days);
  //   var result = new Date(date);
  //   result.setDate(result.getDate() + days);
  //   return result;
  // }
  //
  // createQuotes(){
  //   return new Promise(resolve => {
  //     let date = new Date();
  //     let promise_ids = [];
  //     this.resultForm.value.paymentCondition.items.forEach(item => {
  //       date = this.addDays(this.today, item.days);
  //       let amount = (item.percent/100)*this.resultForm.value.total;
  //       let data = {
  //         'name': "cuota",
  //         'contact_id': this.resultForm.value.contact._id,
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
  //           this.resultForm.value.planned.push(data);
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
  //
  // showPayments() {
  //   this.resultForm.patchValue({
  //     tab: "payment",
  //   });
  //   this.addPayment();
  // }

  ionViewWillLeave(){
    //console.log("ionViewWillLeave");
    //this.navCtrl.navigateBack().then(() => {
      this.events.publish('create-result', this.resultForm.value);
    //});
  }

  // buttonSave() {
  //   if (this._id){
  //     this.resultService.updateResult(this.resultForm.value);
  //     this.events.publish('open-result', this.resultForm.value);
  //     this.resultForm.markAsPristine();
  //   } else {
  //     this.resultService.createResult(this.resultForm.value).then(doc => {
  //       //console.log("docss", doc);
  //       this.resultForm.patchValue({
  //         _id: doc['doc'].id,
  //         code: doc['result'].code,
  //       });
  //       this._id = doc['doc'].id;
  //       this.events.publish('create-result', this.resultForm.value);
  //       this.resultForm.markAsPristine();
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

  // deleteItem(item){
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     let index = this.resultForm.value.items.indexOf(item)
  //     this.resultForm.value.items.splice(index, 1);
  //     this.recomputeValues();
  //   }
  // }

  // deletePayment(item){
  //   let index = this.resultForm.value.payments.indexOf(item)
  //   this.resultForm.value.payments.splice(index, 1);
  //   this.recomputeResidual();
  // }

  recomputeTotal(){
    if (this.resultForm.value.state=='QUOTATION'){
      let total = 0;
      this.resultForm.value.items.forEach((item) => {
        total = total + item.quantity*item.price;
      });
      this.resultForm.patchValue({
        total: total,
      });
    }
  }

  recomputeResidual(){
    let residual = parseFloat(this.resultForm.value.total);
    this.resultForm.value.payments.forEach((item) => {
      residual -= parseFloat(item.total);
    });
    this.resultForm.patchValue({
      residual: residual,
    });
  }

  // addItem(){
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-product');
  //     this.events.subscribe('select-product', (data) => {
  //       //console.log("vars", data);
  //       this.resultForm.value.items.unshift({
  //         'quantity': 1,
  //         'price': data.price,
  //         'product': data,
  //         'description': data.name,
  //       })
  //       this.recomputeValues();
  //       this.resultForm.markAsDirty();
  //       this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }
  //
  // openItem(item) {
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-product');
  //     this.events.subscribe('select-product', (data) => {
  //       //console.log("vars", data);
  //       item.price = data.price;
  //       item.product = data;
  //       item.description = data.name;
  //       this.recomputeValues();
  //       this.avoidAlertMessage = false;
  //       this.resultForm.markAsDirty();
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }
  //
  // sumItem(item) {
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     item.quantity = parseFloat(item.quantity)+1;
  //     this.recomputeValues();
  //   }
  // }
  //
  // remItem(item) {
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     item.quantity = parseFloat(item.quantity)-1;
  //     this.recomputeValues();
  //   }
  // }
  //
  // editItemPrice(item){
  //   if (this.resultForm.value.state=='QUOTATION'){
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
  //   if (this.resultForm.value.state=='QUOTATION'){
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
  //
  // openPayment(item) {
  //   this.events.unsubscribe('open-receipt');
  //   this.events.subscribe('open-receipt', (data) => {
  //     this.events.unsubscribe('open-receipt');
  //   });
  //   this.navCtrl.navigateForward(ReceiptPage, {
  //     "_id": item._id,
  //   });
  // }
  //
  // recomputeValues() {
  //   this.recomputeSale();
  //   // this.recomputeService();
  //   // this.recomputeSaleTax();
  //   // this.recomputeCashMove();
  // }

  // validation_messages = {
  //   'contact': [
  //     { type: 'required', message: 'Client is required.' }
  //   ]
  // };

  // confirmResult() {
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     this.beforeConfirm();
  //   }
  // }
  //
  // resultConfimation(){
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
  //           // this.resultForm.value.items.forEach((item) => {
  //           //   ////console.log("item", item);
  //           //   let product_id = item.product_id || item.product._id;
  //           //   this.productService.updateStock(product_id, -item.quantity);
  //           //   //this.resultForm.value.step = 'chooseInvoice';
  //           // });
  //           // this.resultForm.patchValue({
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
  //     this.resultForm.value.items.forEach((item) => {
  //       ////console.log("item", item);
  //       let product_id = item.product_id || item.product._id;
  //       this.productService.updateStock(product_id, -item.quantity);
  //       //this.resultForm.value.step = 'chooseInvoice';
  //     });
  //     this.resultForm.patchValue({
  //        state: 'CONFIRMED',
  //     });
  //     this.createQuotes().then(data => {
  //       // this.buttonSave();
  //       resolve(true);
  //     });
  //   });
  // }
  //
  // resultUnConfim(){
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
  //           this.resultForm.value.items.forEach((item) => {
  //             ////console.log("item", item);
  //             let product_id = item.product_id || item.product._id;
  //             this.productService.updateStock(product_id, item.quantity);
  //             //this.resultForm.value.step = 'chooseInvoice';
  //           });
  //           this.resultForm.patchValue({
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
  //   this.resultForm.value.planned.forEach(planned => {
  //     //console.log("removed planned", planned);
  //     this.resultService.deleteResult(planned);
  //   });
  //   this.resultForm.patchValue({
  //     'planned': [],
  //   });
  // }

  // changeTab() {
  //   ////console.log("changeTab", this.resultForm);
  //   this.resultForm.controls.tab.markAsPristine();
  // }
  //
  // beforeAddPayment(){
  //   if (this.resultForm.value.state == "QUOTATION"){
  //     this.afterConfirm().then(data => {
  //       this.addPayment();
  //     });
  //   } else {
  //     this.addPayment();
  //   }
  // }
  //
  // addPayment() {
  //   this.resultForm.patchValue({
  //     "tab": 'payment'
  //   });
  //   this.avoidAlertMessage = true;
  //     this.events.unsubscribe('create-receipt');
  //     this.events.subscribe('create-receipt', (data) => {
  //       //console.log("receipt", data);
  //       //if (data.amount > 0){
  //         this.resultForm.value.payments.push({
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
  //       // this.resultForm.markAsDirty();
  //       this.events.unsubscribe('create-receipt');
  //     });
  //     //console.log("this.resultForm.value.planned", this.resultForm.value.planned);
  //     let plannedItems = [];
  //     //let planned.amount_paid = this.resultForm.value.planned[0].amount;
  //
  //     this.resultForm.value.planned.forEach(planned => {
  //       //planned.amount_paid = planned.amount;
  //       if (planned.state == 'WAIT'){
  //         plannedItems.push(planned);
  //       }
  //     })
  //     //plannedItems = [plannedItems[0]];
  //
  //     let origin_ids = [];
  //     if (this.resultForm['invoices'] && this.resultForm['invoices'].length == 1){
  //       // let origin_ids = [this.resultForm.invoices[0]._id];
  //       // plannedItems = [this.resultForm.invoices[0].planned[0]];
  //       plannedItems = [plannedItems[0]];
  //       origin_ids = [this.resultForm.value._id];
  //     } else {
  //       plannedItems = [plannedItems[0]];
  //       origin_ids = [this.resultForm.value._id];
  //     }
  //     this.navCtrl.navigateForward(ReceiptPage, {
  //       //"default_amount": default_amount,
  //       //"default_name": "Pago Compra",
  //       "addPayment": true,
  //       "contact": this.resultForm.value.contact,
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
  //     //   "contact": this.resultForm.value.contact,
  //     //   "items": plannedItems,
  //     //   "origin_ids": [this.resultForm.value._id],
  //     // });
  //   //}
  // }
  //
  // addInvoice() {
  //   this.avoidAlertMessage = true;
  //   //let default_amount = this.resultForm.value.total
  //   this.events.unsubscribe('create-invoice');
  //   this.events.subscribe('create-invoice', (data) => {
  //     //console.log("vars", data);
  //     //if (data.amount > 0){
  //       this.resultForm.value.invoices.push({
  //         'number': data.number,
  //         'date': data.date,
  //         'residual': data.residual,
  //         'total': data.total,
  //         'state': data.state,
  //         '_id': data._id,
  //       });
  //     //}
  //     this.avoidAlertMessage = false;
  //     this.resultForm.value.payments.forEach(payment => {
  //       payment['origin_ids'] = [data._id];
  //       this.receiptService.updateReceipt(payment).then(plan => {
  //         ////console.log("payment", plan);
  //       });
  //     });
  //     this.resultForm.value.planned.forEach(planned => {
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
  //     "contact_id": this.resultForm.value.contact._id,
  //     "contact": this.resultForm.value.contact,
  //     "date": this.resultForm.value.date,
  //     "tab": "invoice",
  //     "origin_ids": [this.resultForm.value._id],
  //     "items": this.resultForm.value.items,
  //     "planned": this.resultForm.value.planned,
  //     "payments": this.resultForm.value.payments,
  //     'type': 'out',
  //   });
  // }
  //
  // openInvoice(item) {
  //   this.events.unsubscribe('open-invoice');
  //   this.events.subscribe('open-invoice', (data) => {
  //     ////console.log("vars", data);
  //     // if (data.amount > 0){
  //     //   this.resultForm.value.payments.push({
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
  //
  // selectContact() {
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     return new Promise(resolve => {
  //       this.avoidAlertMessage = true;
  //       this.events.unsubscribe('select-contact');
  //       this.events.subscribe('select-contact', (data) => {
  //         this.resultForm.patchValue({
  //           contact: data,
  //           contact_name: data.name,
  //         });
  //         this.resultForm.markAsDirty();
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
  //   if (this.resultForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-payment-condition');
  //     this.events.subscribe('select-payment-condition', (data) => {
  //       this.resultForm.patchValue({
  //         paymentCondition: data,
  //         payment_name: data.name,
  //       });
  //       this.resultForm.markAsDirty();
  //       this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-payment-condition');
  //       this.beforeAddPayment();
  //     })
  //     this.navCtrl.navigateForward(PaymentConditionListPage, {"select": true});
  //   }
  // }

  print() {
    this.configService.getConfigDoc().then((data) => {
      let company_name = data.name || "";
      let company_ruc = data.doc || "";
      let company_phone = data.phone || "";
      //let number = this.resultForm.value.invoice || "";
      let date = this.resultForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      let payment_condition = this.resultForm.value.paymentCondition.name || "";
      let contact_name = this.resultForm.value.contact.name || "";
      let code = this.resultForm.value.code || "";
      let doc = this.resultForm.value.contact.document || "";
      //let direction = this.resultForm.value.contact.city || "";
      //let phone = this.resultForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.resultForm.value.items.forEach(item => {
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
      let toast = this.toastCtrl.create({
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
      let number = this.resultForm.value.invoice || "";
      let date = this.resultForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      //console.log("date", date);
      let payment_condition = this.resultForm.value.paymentCondition.name || "";
      let contact_name = this.resultForm.value.contact.name || "";
      let doc = this.resultForm.value.contact.document || "";
      let direction = this.resultForm.value.contact.city || "";
      let phone = this.resultForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.resultForm.value.items.forEach(item => {
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

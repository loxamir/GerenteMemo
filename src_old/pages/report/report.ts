import { Component, ViewChild } from '@angular/core';
import { NavController, App, NavParams, LoadingController, AlertController, Select, Events, ToastController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
//import { DecimalPipe } from '@angular/common';
import { Printer, PrintOptions } from '@ionic-native/printer';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ReportService } from './report.service';
import { ContactsPage } from '../contact/list/contacts';
//import { ReportItemPage } from '../report-item/report-item';
//import { CashMovePage } from '../cash/move/cash-move';
import { ProductService } from '../product/product.service';
//import { ReportsPage } from '../reports/reports';
import { ProductsPage } from '../product/list/products';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PaymentConditionListPage } from '../payment-condition/list/payment-condition-list';
// import { PlannedService } from '../planned/planned.service';
import { SaleService } from '../sale/sale.service';
import { PurchaseService } from '../purchase/purchase.service';
import { ConfigService } from '../config/config.service';
// import { HostListener } from '@angular/core';
import { ReceiptPage } from '../receipt/receipt';
import { ReceiptService } from '../receipt/receipt.service';
import { InvoicePage } from '../invoice/invoice';
import { FormatService } from '../services/format.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { File } from '@ionic-native/file';

declare var cordova:any;
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

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
  selector: 'report-page',
  templateUrl: 'report.html'
})
export class ReportPage {
@ViewChild(Select) select: Select;

  reportForm: FormGroup;
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
    public reportService: ReportService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public app: App,
    public alertCtrl: AlertController,
    public productService: ProductService,
    // public plannedService: PlannedService,
    public saleService: SaleService,
    public purchaseService: PurchaseService,
    public receiptService: ReceiptService,
    public bluetoothSerial: BluetoothSerial,
    public toastCtrl: ToastController,
    public printer: Printer,
    public configService: ConfigService,
    public formatService: FormatService,
    public events:Events,
    public socialSharing: SocialSharing,
    public file: File,
    public pouchdbService: PouchdbService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.today = new Date().toISOString();
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

  getData(){
    return new Promise(resolve => {
      if (this.reportForm.value.reportType == 'sale'){
        this.pouchdbService.searchDocTypeData('sale', '', false).then((sales1: any[]) => {
          let sales = sales1
          .filter(word => word.date >= this.reportForm.value.dateStart)
          .filter(word => word.date <= this.reportForm.value.dateEnd);
          let items = [];
          let promise_ids = [];
          let result = {};


          if (this.reportForm.value.groupBy == 'category'){
            sales.forEach(data1 => {
              if (data1['lines']){
                data1['lines'].forEach(item => {
                  let quantity = parseFloat(item.quantity);
                  let price = parseFloat(item.price);
                  promise_ids.push(this.productService.getProduct(item.product_id).then(product => {
                    if (result.hasOwnProperty(product.category.name)) {
                      let current_value = result[product.category.name]['quantity']*result[product.category.name]['price'];
                      let new_value = quantity*price;
                      result[product.category.name]['quantity'] += quantity;
                      result[product.category.name]['price'] = (current_value+new_value)/result[product.category.name]['quantity'];
                      result[product.category.name]['total'] += price*quantity;
                    } else {
                      result[product.category.name] = {
                        'quantity': quantity,
                        'price': price,
                        'total': price*quantity,
                        'date': data1['date'],
                      }
                    }
                  }));
                });
              }
            });

            let self = this;
            Promise.all(promise_ids).then(products => {
              Object.keys(result).forEach(category => {
                  result[category]['name'] = category;
                  items.push(result[category]);
              });
              let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            });
          }

          else if (this.reportForm.value.groupBy == 'product'){
            sales.forEach(data1 => {
              if (data1['lines']){
                data1['lines'].forEach(item => {
                  let quantity = parseFloat(item.quantity);
                  let price = parseFloat(item.price);
                  if (result.hasOwnProperty(item.product_id)) {
                    let current_value = result[item.product_id]['quantity']*result[item.product_id]['price'];
                    let new_value = quantity*price;
                    result[item.product_id]['quantity'] += quantity;
                    result[item.product_id]['price'] = (current_value+new_value)/result[item.product_id]['quantity'];
                    result[item.product_id]['total'] += price*quantity;
                  } else {
                    result[item.product_id] = {
                      'quantity': quantity,
                      'price': price,
                      'total': price*quantity,
                      'date': data1['date'],
                    }
                  }
                });
              }
            });
            Object.keys(result).forEach(product_id => {
              promise_ids.push(this.productService.getProduct(product_id).then(data => {
                result[product_id]['product'] = data;
                result[product_id]['name'] = data.name;
                items.push(result[product_id]);
              }));
            });
            let self = this;
            Promise.all(promise_ids).then(item => {
              let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            });
          }
          else if (this.reportForm.value.groupBy == 'contact'){
            let array = this.groupBySum(sales, 'contact_name', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': array[key]['date']
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportForm.value.orderBy);
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'payment'){
            let array = this.groupBySum(sales, 'payment_name', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': array[key]['date']
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportForm.value.orderBy);
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'date'){
            //console.log("sales", sales);
            let array = this.groupByDate(sales, 'date', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': key,
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'seller'){
            let array = this.groupBySum(sales, 'seller_name', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': array[key]['date']
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportForm.value.orderBy);
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
        });
      }
      else if (this.reportForm.value.reportType == 'purchase'){
        this.pouchdbService.searchDocTypeData('purchase', '', false).then((sales1: any[]) => {
          let sales = sales1
          .filter(word => word.date >= this.reportForm.value.dateStart)
          .filter(word => word.date <= this.reportForm.value.dateEnd);
          let items = [];
          let promise_ids = [];
          let result = {};
          if (this.reportForm.value.groupBy == 'category'){
            sales.forEach(data1 => {
              if (data1['lines']){
                data1['lines'].forEach(item => {
                  let quantity = parseFloat(item.quantity);
                  let price = parseFloat(item.price);
                  promise_ids.push(this.productService.getProduct(item.product_id).then(product => {
                    if (result.hasOwnProperty(product.category.name)) {
                      let current_value = result[product.category.name]['quantity']*result[product.category.name]['price'];
                      let new_value = quantity*price;
                      result[product.category.name]['quantity'] += quantity;
                      result[product.category.name]['price'] = (current_value+new_value)/result[product.category.name]['quantity'];
                      result[product.category.name]['total'] += price*quantity;
                    } else {
                      result[product.category.name] = {
                        'quantity': quantity,
                        'price': price,
                        'total': price*quantity,
                        'date': data1['date'],
                      }
                    }
                  }));
                });
              }
            });

            let self = this;
            Promise.all(promise_ids).then(products => {
              Object.keys(result).forEach(category => {
                  result[category]['name'] = category;
                  items.push(result[category]);
              });
              let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            });
          }
          else if (this.reportForm.value.groupBy == 'product'){
            sales.forEach(data1 => {
              if (data1['lines']){
                data1['lines'].forEach(item => {
                  let quantity = parseFloat(item.quantity);
                  let price = parseFloat(item.price);
                  if (result.hasOwnProperty(item.product_id)) {
                    let current_value = result[item.product_id]['quantity']*result[item.product_id]['price'];
                    let new_value = quantity*price;
                    result[item.product_id]['quantity'] += quantity;
                    result[item.product_id]['price'] = (current_value+new_value)/result[item.product_id]['quantity'];
                    result[item.product_id]['total'] += price*quantity;
                  } else {
                    result[item.product_id] = {
                      'quantity': quantity,
                      'price': price,
                      'total': price*quantity,
                      'date': data1['date'],
                    }
                  }
                });
              }
            });
            Object.keys(result).forEach(product_id => {
              promise_ids.push(this.productService.getProduct(product_id).then(data => {
                result[product_id]['product'] = data;
                result[product_id]['name'] = data.name;
                items.push(result[product_id]);
              }));
            });
            let self = this;
            Promise.all(promise_ids).then(item => {
              let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            });
          }
          else if (this.reportForm.value.groupBy == 'contact'){
            let array = this.groupBySum(sales, 'contact_name', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': array[key]['date']
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportForm.value.orderBy);
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'payment'){
            let array = this.groupBySum(sales, 'payment_name', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': array[key]['date']
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportForm.value.orderBy);
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'date'){
            //console.log("sales", sales);
            let array = this.groupByDate(sales, 'date', 'total');
            //console.log("array", array);
            items = [];
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['total'],
                'date': key,
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
                return self.compare(a, b, self.reportForm.value.orderBy);
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
          }
        });
      }
      else if (this.reportForm.value.reportType == 'paid'){
        this.pouchdbService.getDocType('cash-move').then((sales1: any[]) => {
          let sales = sales1
          .filter(word => word.signal == "-")
          .filter(word => word.date >= this.reportForm.value.dateStart)
          .filter(word => word.date <= this.reportForm.value.dateEnd);
          let items = [];

          if (this.reportForm.value.groupBy == 'date'){
            let array = this.groupByDate(sales, 'date', 'amount');
            //console.log("array", array);
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['amount'],
                'date': key
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, 'amount');
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'contact'){
            let array = [];
            let promise_ids = [];
            //console.log("here");
            sales.forEach(cashMove => {
              if (cashMove['contact_id'] && cashMove['contact_id'] != ""){
                promise_ids.push(this.pouchdbService.getDoc(cashMove['contact_id']).then(receipt => {
                  // result['origin_id']['product'] = data;
                  // result['origin_id']['name'] = data.name;
                  // items.push(result[product_id]);
                  //console.log("receipt", receipt);
                  array.push({
                    "name": receipt && receipt['name'] || "Indefinido",
                    "amount": cashMove.amount || 0
                  });
                }));
              } else {
                array.push({
                  "name": "Indefinido",
                  "amount": cashMove.amount || 0
                });
              }
            });

            //console.log("there");
            Promise.all(promise_ids).then(data => {

              let items1 = this.groupByName(array, 'name', 'amount');
              //console.log("array", items1);

              items = [];
              Object.keys(items1).forEach(key => {
                items.push({
                  'name': key,
                  'total': items1[key]['amount'] || 0,
                });
              });

              let self = this;
              let output = items.sort(function(a, b) {
                return self.compare(a, b, 'total');
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            })
          }
          else if (this.reportForm.value.groupBy == 'category'){
            let array = [];
            let promise_ids = [];
            //console.log("here");
            sales.forEach(cashMove => {
              if (cashMove['account_id'] && cashMove['account_id'] != ""){
                promise_ids.push(this.pouchdbService.getDoc(cashMove['account_id']).then(receipt => {
                  // result['origin_id']['product'] = data;
                  // result['origin_id']['name'] = data.name;
                  // items.push(result[product_id]);
                  //console.log("receipt", receipt);
                  array.push({
                    "name": receipt && receipt['name'] || "Indefinido",
                    "amount": cashMove.amount || 0
                  });
                }));
              } else {
                array.push({
                  "name": "Indefinido",
                  "amount": cashMove.amount || 0
                });
              }
            });

            //console.log("there");
            Promise.all(promise_ids).then(data => {

              let items1 = this.groupByName(array, 'name', 'amount');
              //console.log("array", items1);

              items = [];
              Object.keys(items1).forEach(key => {
                items.push({
                  'name': key,
                  'total': items1[key]['amount'] || 0,
                });
              });

              let self = this;
              let output = items.sort(function(a, b) {
                return self.compare(a, b, 'total');
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            })
          }
        });
      }







      else if (this.reportForm.value.reportType == 'received'){
        this.pouchdbService.getDocType('cash-move').then((sales1: any[]) => {
          let sales = sales1
          .filter(word => word.signal == "+")
          .filter(word => word.date >= this.reportForm.value.dateStart)
          .filter(word => word.date <= this.reportForm.value.dateEnd);
          let items = [];

          if (this.reportForm.value.groupBy == 'date'){
            let array = this.groupByDate(sales, 'date', 'amount');
            //console.log("array", array);
            Object.keys(array).forEach(key => {
              items.push({
                'name': key,
                'total': array[key]['amount'],
                'date': key
              });
            });
            let self = this;
            //console.log("items", items);
            let output = items.sort(function(a, b) {
              return self.compare(a, b, 'amount');
            })
            let marker=false;
            output.forEach(item => {
              item['marker'] = marker,
              marker = !marker;
            });
            resolve(output);
          }
          else if (this.reportForm.value.groupBy == 'contact'){
            let array = [];
            let promise_ids = [];
            //console.log("here");
            sales.forEach(cashMove => {
              if (cashMove['contact_id'] && cashMove['contact_id'] != ""){
                promise_ids.push(this.pouchdbService.getDoc(cashMove['contact_id']).then(receipt => {
                  // result['origin_id']['product'] = data;
                  // result['origin_id']['name'] = data.name;
                  // items.push(result[product_id]);
                  //console.log("receipt", receipt);
                  array.push({
                    "name": receipt && receipt['name'] || "Indefinido",
                    "amount": cashMove.amount || 0
                  });
                }));
              } else {
                array.push({
                  "name": "Indefinido",
                  "amount": cashMove.amount || 0
                });
              }
            });

            //console.log("there");
            Promise.all(promise_ids).then(data => {

              let items1 = this.groupByName(array, 'name', 'amount');
              //console.log("array", items1);

              items = [];
              Object.keys(items1).forEach(key => {
                items.push({
                  'name': key,
                  'total': items1[key]['amount'] || 0,
                });
              });

              let self = this;
              let output = items.sort(function(a, b) {
                return self.compare(a, b, 'total');
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            })
          }
          else if (this.reportForm.value.groupBy == 'category'){
            let array = [];
            let promise_ids = [];
            //console.log("here");
            sales.forEach(cashMove => {
              if (cashMove['account_id'] && cashMove['account_id'] != ""){
                promise_ids.push(this.pouchdbService.getDoc(cashMove['account_id']).then(receipt => {
                  // result['origin_id']['product'] = data;
                  // result['origin_id']['name'] = data.name;
                  // items.push(result[product_id]);
                  //console.log("receipt", receipt);
                  array.push({
                    "name": receipt && receipt['name'] || "Indefinido",
                    "amount": cashMove.amount || 0
                  });
                }));
              } else {
                array.push({
                  "name": "Indefinido",
                  "amount": cashMove.amount || 0
                });
              }
            });

            //console.log("there");
            Promise.all(promise_ids).then(data => {

              let items1 = this.groupByName(array, 'name', 'amount');
              //console.log("array", items1);

              items = [];
              Object.keys(items1).forEach(key => {
                items.push({
                  'name': key,
                  'total': items1[key]['amount'] || 0,
                });
              });

              let self = this;
              let output = items.sort(function(a, b) {
                return self.compare(a, b, 'total');
              })
              let marker=false;
              output.forEach(item => {
                item['marker'] = marker,
                marker = !marker;
              });
              resolve(output);
            })
          }
        });
      }










    });
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

  orderByName() {
    this.reportForm.patchValue({
      'orderBy': "name",
    })
    this.goNextStep();
  }

  orderByPrice() {
    this.reportForm.patchValue({
      'orderBy': "price",
    })
    this.goNextStep();
  }

  orderByQuantity() {
    this.reportForm.patchValue({
      'orderBy': "quantity",
    })
    this.goNextStep();
  }

  orderByTotal() {
    this.reportForm.patchValue({
      'orderBy': "total",
    })
    this.goNextStep();
  }

  ionViewWillLoad() {
    //var today = new Date().toISOString();
    this.reportForm = this.formBuilder.group({
      contact: new FormControl(this.navParams.data.contact||{}, Validators.required),
      name: new FormControl(''),
      contact_name: new FormControl(this.navParams.data.contact_name||''),
      code: new FormControl(''),
      date: new FormControl(this.navParams.data.date||this.today),
      dateStart: new FormControl(this.navParams.data.dateEnd||this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.navParams.data.dateEnd||this.today),
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
      reportType: new FormControl(this.navParams.data.reportType||'paid'),
      groupBy: new FormControl(this.navParams.data.groupBy||'date'),
      orderBy: new FormControl(this.navParams.data.orderBy||'total'),
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
    //this.loading.present();
    if (this._id){
      this.reportService.getReport(this._id).then((data) => {
        //console.log("data", data);
        this.reportForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
    // if (this.navParams.data.compute){
      this.goNextStep();
    // }
  }

  // ionViewCanLeave() {
  //     if(this.reportForm.dirty && ! this.avoidAlertMessage) {
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
    let number = this.reportForm.value.invoice || "";
    let date = this.reportForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
    date = date[2]+"/"+date[1]+"/"+date[0]
    //console.log("date", date);
    let payment_condition = this.reportForm.value.paymentCondition.name || "";
    let contact_name = this.reportForm.value.contact.name || "";
    let doc = this.reportForm.value.contact.document || "";
    let direction = this.reportForm.value.contact.city || "";
    let phone = this.reportForm.value.contact.phone || "";
    let lines = ""
    let totalExentas = 0;
    let totalIva5 = 0;
    let totalIva10 = 0;
    this.reportForm.value.items.forEach(item => {
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
  //     this.reportForm.markAsPristine();
  //     this.navCtrl.navigateBack();
  // }

  goNextStep() {
    this.getData().then(data => {
      //console.log("data", data);
      this.reportForm.value.items = data;
    })
    this.recomputeValues();
  }

  // beforeConfirm(){
  //   if (this.reportForm.value.items.length == 0){
  //     this.addItem();
  //   } else {
  //     // this.reportForm.patchValue({
  //     //   tab: "report",
  //     // });
  //     if (Object.keys(this.reportForm.value.contact).length === 0){
  //       this.selectContact().then( teste => {
  //         if (Object.keys(this.reportForm.value.paymentCondition).length === 0){
  //           this.selectPaymentCondition();
  //         }
  //       });
  //     } else if (Object.keys(this.reportForm.value.paymentCondition).length === 0){
  //       this.selectPaymentCondition();
  //     } else {
  //       this.reportConfimation();
  //     }
  //   }
  // }
  //
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
  //     this.reportForm.value.paymentCondition.items.forEach(item => {
  //       date = this.addDays(this.today, item.days);
  //       let amount = (item.percent/100)*this.reportForm.value.total;
  //       let data = {
  //         'name': "cuota",
  //         'contact_id': this.reportForm.value.contact._id,
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
  //           this.reportForm.value.planned.push(data);
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
  //   this.reportForm.patchValue({
  //     tab: "payment",
  //   });
  //   this.addPayment();
  // }

  ionViewWillLeave(){
    //console.log("ionViewWillLeave");
    //this.navCtrl.navigateBack().then(() => {
      this.events.publish('create-report', this.reportForm.value);
    //});
  }

  buttonSave() {
    if (this._id){
      this.reportService.updateReport(this.reportForm.value);
      this.events.publish('open-report', this.reportForm.value);
      this.reportForm.markAsPristine();
    } else {
      this.reportService.createReport(this.reportForm.value).then(doc => {
        //console.log("docss", doc);
        this.reportForm.patchValue({
          _id: doc['doc'].id,
          code: doc['report'].code,
        });
        this._id = doc['doc'].id;
        this.events.publish('create-report', this.reportForm.value);
        this.reportForm.markAsPristine();
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
    if (this.reportForm.value.state=='QUOTATION'){
      let index = this.reportForm.value.items.indexOf(item)
      this.reportForm.value.items.splice(index, 1);
      this.recomputeValues();
    }
  }

  // deletePayment(item){
  //   let index = this.reportForm.value.payments.indexOf(item)
  //   this.reportForm.value.payments.splice(index, 1);
  //   this.recomputeResidual();
  // }

  recomputeTotal(){
    if (this.reportForm.value.state=='QUOTATION'){
      let total = 0;
      this.reportForm.value.items.forEach((item) => {
        total = total + item.quantity*item.price;
      });
      this.reportForm.patchValue({
        total: total,
      });
    }
  }

  recomputeResidual(){
    let residual = parseFloat(this.reportForm.value.total);
    this.reportForm.value.payments.forEach((item) => {
      residual -= parseFloat(item.total);
    });
    this.reportForm.patchValue({
      residual: residual,
    });
  }

  // addItem(){
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-product');
  //     this.events.subscribe('select-product', (data) => {
  //       //console.log("vars", data);
  //       this.reportForm.value.items.unshift({
  //         'quantity': 1,
  //         'price': data.price,
  //         'product': data,
  //         'description': data.name,
  //       })
  //       this.recomputeValues();
  //       this.reportForm.markAsDirty();
  //       this.avoidAlertMessage = false;
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }
  //
  // openItem(item) {
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-product');
  //     this.events.subscribe('select-product', (data) => {
  //       //console.log("vars", data);
  //       item.price = data.price;
  //       item.product = data;
  //       item.description = data.name;
  //       this.recomputeValues();
  //       this.avoidAlertMessage = false;
  //       this.reportForm.markAsDirty();
  //       this.events.unsubscribe('select-product');
  //     })
  //     this.navCtrl.navigateForward(ProductsPage, {"select": true});
  //   }
  // }
  //
  // sumItem(item) {
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     item.quantity = parseFloat(item.quantity)+1;
  //     this.recomputeValues();
  //   }
  // }
  //
  // remItem(item) {
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     item.quantity = parseFloat(item.quantity)-1;
  //     this.recomputeValues();
  //   }
  // }
  //
  // editItemPrice(item){
  //   if (this.reportForm.value.state=='QUOTATION'){
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
  //   if (this.reportForm.value.state=='QUOTATION'){
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
    this.recomputeTotal();
    this.recomputeResidual();
    if (this.reportForm.value.total > 0 && this.reportForm.value.residual == 0){
      this.reportForm.patchValue({
        state: "PAID",
      });
    }
  }

  validation_messages = {
    'contact': [
      { type: 'required', message: 'Client is required.' }
    ]
  };

  // confirmReport() {
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     this.beforeConfirm();
  //   }
  // }

  // reportConfimation(){
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
  //           // this.reportForm.value.items.forEach((item) => {
  //           //   ////console.log("item", item);
  //           //   let product_id = item.product_id || item.product._id;
  //           //   this.productService.updateStock(product_id, -item.quantity);
  //           //   //this.reportForm.value.step = 'chooseInvoice';
  //           // });
  //           // this.reportForm.patchValue({
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
  //     this.reportForm.value.items.forEach((item) => {
  //       ////console.log("item", item);
  //       let product_id = item.product_id || item.product._id;
  //       this.productService.updateStock(product_id, -item.quantity);
  //       //this.reportForm.value.step = 'chooseInvoice';
  //     });
  //     this.reportForm.patchValue({
  //        state: 'CONFIRMED',
  //     });
  //     this.createQuotes().then(data => {
  //       this.buttonSave();
  //       resolve(true);
  //     });
  //   });
  // }
  //
  // reportUnConfim(){
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
  //           this.reportForm.value.items.forEach((item) => {
  //             ////console.log("item", item);
  //             let product_id = item.product_id || item.product._id;
  //             this.productService.updateStock(product_id, item.quantity);
  //             //this.reportForm.value.step = 'chooseInvoice';
  //           });
  //           this.reportForm.patchValue({
  //              state: 'QUOTATION',
  //           });
  //           this.removeQuotes();
  //           this.buttonSave();
  //         }
  //       }
  //     ]
  //   });
  //   prompt.present();
  // }

  // removeQuotes(){
  //   this.reportForm.value.planned.forEach(planned => {
  //     //console.log("removed planned", planned);
  //     this.reportService.deleteReport(planned);
  //   });
  //   this.reportForm.patchValue({
  //     'planned': [],
  //   });
  // }
  //
  // // changeTab() {
  // //   ////console.log("changeTab", this.reportForm);
  // //   this.reportForm.controls.tab.markAsPristine();
  // // }
  //
  // // beforeAddPayment(){
  // //   if (this.reportForm.value.state == "QUOTATION"){
  // //     this.afterConfirm().then(data => {
  // //       this.addPayment();
  // //     });
  // //   } else {
  // //     this.addPayment();
  // //   }
  // // }
  //
  // addPayment() {
  //   // this.reportForm.patchValue({
  //   //   "tab": 'payment'
  //   // });
  //   this.avoidAlertMessage = true;
  //     this.events.unsubscribe('create-receipt');
  //     this.events.subscribe('create-receipt', (data) => {
  //       //console.log("receipt", data);
  //       //if (data.amount > 0){
  //         this.reportForm.value.payments.push({
  //           'total': data.total,
  //           'date': data.date,
  //           //'cash': data.cash,
  //           'state': data.state,
  //           '_id': data._id,
  //         });
  //       //}
  //       this.recomputeValues();
  //       this.avoidAlertMessage = false;
  //       this.buttonSave();
  //
  //       // item.price = data.price;
  //       // item.product = data;
  //       // this.recomputeValues();
  //       // this.reportForm.markAsDirty();
  //       this.events.unsubscribe('create-receipt');
  //     });
  //     //console.log("this.reportForm.value.planned", this.reportForm.value.planned);
  //     let plannedItems = [];
  //     //let planned.amount_paid = this.reportForm.value.planned[0].amount;
  //
  //     this.reportForm.value.planned.forEach(planned => {
  //       //planned.amount_paid = planned.amount;
  //       if (planned.state == 'WAIT'){
  //         plannedItems.push(planned);
  //       }
  //     })
  //     //plannedItems = [plannedItems[0]];
  //
  //     let origin_ids = [];
  //     if (this.reportForm['invoices'] && this.reportForm['invoices'].length == 1){
  //       // let origin_ids = [this.reportForm.invoices[0]._id];
  //       // plannedItems = [this.reportForm.invoices[0].planned[0]];
  //       plannedItems = [plannedItems[0]];
  //       origin_ids = [this.reportForm.value._id];
  //     } else {
  //       plannedItems = [plannedItems[0]];
  //       origin_ids = [this.reportForm.value._id];
  //     }
  //     this.navCtrl.navigateForward(ReceiptPage, {
  //       //"default_amount": default_amount,
  //       //"default_name": "Pago Compra",
  //       "addPayment": true,
  //       "contact": this.reportForm.value.contact,
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
  //     //   "contact": this.reportForm.value.contact,
  //     //   "items": plannedItems,
  //     //   "origin_ids": [this.reportForm.value._id],
  //     // });
  //   //}
  // }
  //
  // addInvoice() {
  //   this.avoidAlertMessage = true;
  //   //let default_amount = this.reportForm.value.total
  //   this.events.unsubscribe('create-invoice');
  //   this.events.subscribe('create-invoice', (data) => {
  //     //console.log("vars", data);
  //     //if (data.amount > 0){
  //       this.reportForm.value.invoices.push({
  //         'number': data.number,
  //         'date': data.date,
  //         'residual': data.residual,
  //         'total': data.total,
  //         'state': data.state,
  //         '_id': data._id,
  //       });
  //     //}
  //     this.avoidAlertMessage = false;
  //     this.reportForm.value.payments.forEach(payment => {
  //       payment['origin_ids'] = [data._id];
  //       this.receiptService.updateReceipt(payment).then(plan => {
  //         ////console.log("payment", plan);
  //       });
  //     });
  //     this.reportForm.value.planned.forEach(planned => {
  //       planned['origin_id'] = [data._id];
  //       this.plannedService.updatePlanned(planned).then(plan => {
  //         ////console.log("payment", plan);
  //       });
  //     });
  //     this.buttonSave();
  //
  //     // item.price = data.price;
  //     // item.product = data;
  //     // this.recomputeValues();
  //     // this.invoiceForm.markAsDirty();
  //     this.events.unsubscribe('create-invoice');
  //   });
  //   this.navCtrl.navigateForward(InvoicePage, {
  //     "openPayment": true,
  //     "contact_id": this.reportForm.value.contact._id,
  //     "contact": this.reportForm.value.contact,
  //     "date": this.reportForm.value.date,
  //     // "tab": "invoice",
  //     "origin_ids": [this.reportForm.value._id],
  //     "items": this.reportForm.value.items,
  //     "planned": this.reportForm.value.planned,
  //     "payments": this.reportForm.value.payments,
  //     'type': 'out',
  //   });
  // }
  //
  // openInvoice(item) {
  //   this.events.unsubscribe('open-invoice');
  //   this.events.subscribe('open-invoice', (data) => {
  //     ////console.log("vars", data);
  //     // if (data.amount > 0){
  //     //   this.reportForm.value.payments.push({
  //     //     'amount': data.amount,
  //     //     'date': data.date,
  //     //     'cash': data.cash,
  //     //     'state': data.state,
  //     //   });
  //     // }
  //     //this.recomputeValues();
  //     this.avoidAlertMessage = false;
  //     this.buttonSave();
  //     this.events.unsubscribe('open-invoice');
  //   });
  //   this.navCtrl.navigateForward(InvoicePage, {
  //     "_id": item._id,
  //   });
  // }

  onSubmit(values){
    //console.log(values);
  }

  selectContact() {
    if (this.reportForm.value.state=='QUOTATION'){
      return new Promise(resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.reportForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.reportForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        this.navCtrl.navigateForward(ContactsPage, {"select": true});
      });
    }
  }

  // selectPaymentCondition() {
  //   if (this.reportForm.value.state=='QUOTATION'){
  //     this.avoidAlertMessage = true;
  //     this.events.unsubscribe('select-payment-condition');
  //     this.events.subscribe('select-payment-condition', (data) => {
  //       this.reportForm.patchValue({
  //         paymentCondition: data,
  //         payment_name: data.name,
  //       });
  //       this.reportForm.markAsDirty();
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
      //let number = this.reportForm.value.invoice || "";
      let date = this.reportForm.value.date.split('T')[0].split("-"); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      let payment_condition = this.reportForm.value.paymentCondition.name || "";
      let contact_name = this.reportForm.value.contact.name || "";
      let code = this.reportForm.value.code || "";
      let doc = this.reportForm.value.contact.document || "";
      //let direction = this.reportForm.value.contact.city || "";
      //let phone = this.reportForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.reportForm.value.items.forEach(item => {
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
      let number = this.reportForm.value.invoice || "";
      let date = this.reportForm.value.date.split('T')[0].split('-'); //"25 de Abril de 2018";
      date = date[2]+"/"+date[1]+"/"+date[0]
      //console.log("date", date);
      let payment_condition = this.reportForm.value.paymentCondition.name || "";
      let contact_name = this.reportForm.value.contact.name || "";
      let doc = this.reportForm.value.contact.document || "";
      let direction = this.reportForm.value.contact.city || "";
      let phone = this.reportForm.value.contact.phone || "";
      let lines = ""
      let totalExentas = 0;
      let totalIva5 = 0;
      let totalIva10 = 0;
      this.reportForm.value.items.forEach(item => {
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

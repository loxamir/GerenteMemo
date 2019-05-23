import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, Events, ToastController, ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ReportService } from '../report/report.service';
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ContactListPage } from '../contact-list/contact-list.page';
import { ProductListPage } from '../product-list/product-list.page';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductCategoryListPage } from '../product-category-list/product-category-list.page';

import * as d3 from 'd3';

// import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
  selector: 'app-sale-report',
  templateUrl: './sale-report.page.html',
  styleUrls: ['./sale-report.page.scss'],
})
export class SaleReportPage implements OnInit {
  @ViewChild('select') select;

  reportSaleForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  items_product_total;
  items_margin;
  items_quantity;
  total;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  title: string = 'D3.js with Ionic 2!';
  margin = { top: 20, right: 20, bottom: 30, left: 50 };
  width: number;
  height: number;
  radius: number;
  arc: any;
  labelArc: any;
  pie: any;
  color: any;
  _current: any;
  svg: any;

  svg2: any;

  x: any;
  y: any;
  g: any;

  line: d3Shape.Line<[number, number]>;

  updating = false;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public reportService: ReportService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public productService: ProductService,
    public toastCtrl: ToastController,
    public formatService: FormatService,
    public events: Events,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
  ) {
    this.today = new Date();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
    this.avoidAlertMessage = false;
  }

  groupBySum(object, prop, sum) {
    return object.reduce(function(lines, item) {
      const val = item[prop]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] || 0
      lines[val][sum] += item[sum]
      return lines
    }, {})
  }

  groupBySum2(object, prop, sum, sum2, sum3, sum4) {
    return object.reduce(function(lines, item) {
      const val = item[prop]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] || 0
      lines[val][sum] += item[sum]
      lines[val][sum2] = lines[val][sum2] || 0
      item.lines.forEach(line=>{
        lines[val][sum2] += (line[sum3] - line[sum4])*line['quantity']
      })
      return lines
    }, {})
  }

  groupByDate2(object, prop, sum, sum2, sum3, sum4) {
    return object.reduce(function(lines, item) {
      const val = item[prop].split("T")[0]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
      if (item.signal == "-") {
        lines[val][sum] -= parseFloat(item[sum])
      } else {
        lines[val][sum] += parseFloat(item[sum])
      }
      lines[val][sum2] = lines[val][sum2] || 0
      item.lines.forEach(line=>{
        lines[val][sum2] += (line[sum3] - line[sum4])*line['quantity']
      })
      lines[val]['list'] = lines[val]['list'] || []
      lines[val]['list'].push(item)
      return lines
    }, {})
  }

  groupByName(object, prop, sum) {
    return object.reduce(function(lines, item) {
      const val = item[prop]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
      if (item.signal == "-") {
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
    return object.reduce(function(lines, item) {
      const val = item[prop].split("T")[0]
      lines[val] = lines[val] || {}
      lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
      if (item.signal == "-") {
        lines[val][sum] -= parseFloat(item[sum])
      } else {
        lines[val][sum] += parseFloat(item[sum])
      }

      lines[val]['list'] = lines[val]['list'] || []
      lines[val]['list'].push(item)
      return lines
    }, {})
  }

  goPeriodBack() {
    let start_date = new Date(this.reportSaleForm.value.dateStart).getTime();
    let end_date = new Date(this.reportSaleForm.value.dateEnd).getTime();
    console.log("start_date", new Date(start_date).toJSON());
    console.log("end_date", new Date(end_date).toJSON());
    let period = end_date - start_date + 1;
    console.log("period", period);
    this.updating = true;
    this.reportSaleForm.patchValue({
      dateStart: new Date(start_date - period).toISOString(),
      dateEnd: new Date(end_date - period).toISOString(),
    })
    setTimeout(() => {
      this.updating = false;
    }, 10);
    // this.recomputeValues();
    this.goNextStep();
    // this.loading.dismiss();
  }

  changeDateStart(){
    if (!this.updating){
      console.log("changeDateStart");
      this.goNextStep();
    }
  }

  changeDateEnd(){
    if (!this.updating){
      console.log("changeDateEnd");
      this.goNextStep();
    }
  }

  goPeriodForward() {
    let start_date = new Date(this.reportSaleForm.value.dateStart).getTime();
    let end_date = new Date(this.reportSaleForm.value.dateEnd).getTime();
    let period = end_date - start_date + 1;
    this.updating = true;
    this.reportSaleForm.patchValue({
      dateStart: new Date(start_date + period).toJSON(),
      dateEnd: new Date(end_date + period).toJSON(),
    })
    setTimeout(() => {
      this.updating = false;
    }, 10);
    // this.updating = false;
    // this.recomputeValues();
    this.goNextStep();
  }

  async getData() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    return new Promise(resolve => {
      if (this.reportSaleForm.value.reportType == 'sale') {
        let startkey=(new Date(this.reportSaleForm.value.dateStart)).toJSON();
        let endkey=(new Date(this.reportSaleForm.value.dateEnd)).toJSON();
        this.pouchdbService.getView(
          'Informes/ProductoDiario',
          20,
          [startkey, "0", "0"],
          [endkey, "z", "z"],
          true,
          true,
          undefined,
          undefined,
          false
        ).then(async (sales: any[]) => {
          console.log("sale lines", sales);

          if (Object.keys(this.reportSaleForm.value.contact).length > 0) {
            sales = sales.filter(word => word['key'][10] == this.reportSaleForm.value.contact._id);
          }
          if (Object.keys(this.reportSaleForm.value.product).length > 0) {
            sales = sales.filter(word => word['key'][9] == this.reportSaleForm.value.product._id);
          }
          if (Object.keys(this.reportSaleForm.value.paymentCondition).length > 0) {
            sales = sales.filter(word => word['key'][11] == this.reportSaleForm.value.paymentCondition._id);
          }
          if (Object.keys(this.reportSaleForm.value.seller).length > 0) {
            sales = sales.filter(word => word['key'][12] == this.reportSaleForm.value.seller._id);
          }

          if (Object.keys(this.reportSaleForm.value.category).length > 0) {
            let categoryProductList = await this.pouchdbService.getRelated("product", "category_id", this.reportSaleForm.value.category._id);
            let categProdList = [];
            categoryProductList.forEach(produ=>{
              categProdList.push(produ._id);
            })
            sales = sales.filter(word => categProdList.indexOf(word['key'][9]) >= 0);
          }
          console.log("sales2", sales);
          let items = [];
          let promise_ids = [];
          let result = {};
          if (this.reportSaleForm.value.groupBy == 'category') {
            items = [];
            let getList = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[9])) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[saleLine.key[9]]] = {
                  'name': items[result[saleLine.key[9]]].name,
                  'quantity': items[result[saleLine.key[9]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[9]]].margin + parseFloat(saleLine.key[3]),
                  'total': items[result[saleLine.key[9]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[9],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': parseFloat(saleLine.key[3]),
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                getList.push(saleLine.key[9]);
                result[saleLine.key[9]] = items.length-1;
              }
            });

            let products: any = await this.pouchdbService.getList(getList);
            var doc_dict = {};
            products.forEach(row=>{
              doc_dict[row.id] = row.doc;
            })
            let categories = {};
            let litems = [];
            items.forEach(item=>{
              if (categories.hasOwnProperty(doc_dict[item.name].category_name)) {
                litems[categories[doc_dict[item.name].category_name]] = {
                  'name': doc_dict[item.name].category_name,
                  'quantity': litems[categories[doc_dict[item.name].category_name]].quantity + parseFloat(item.quantity),
                  'margin': litems[categories[doc_dict[item.name].category_name]].margin + item.margin,
                  'total': litems[categories[doc_dict[item.name].category_name]].total + item.total,
                };
              } else {
                litems.push({
                  'name': doc_dict[item.name].category_name,
                  'quantity': item.quantity,
                  'margin': item.margin,
                  'total': item.total,
                });
                categories[doc_dict[item.name].category_name] = litems.length-1;
              }
            })
            let self = this;
            let output = litems.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportSaleForm.value.groupBy == 'brand') {
            items = [];
            let getList = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[9])) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[saleLine.key[9]]] = {
                  'name': items[result[saleLine.key[9]]].name,
                  'quantity': items[result[saleLine.key[9]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[9]]].margin + parseFloat(saleLine.key[3]),
                  'total': items[result[saleLine.key[9]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[9],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': parseFloat(saleLine.key[3]),
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                getList.push(saleLine.key[9]);
                result[saleLine.key[9]] = items.length-1;
              }
            });

            let products: any = await this.pouchdbService.getList(getList);
            var doc_dict = {};
            products.forEach(row=>{
              doc_dict[row.id] = row.doc;
            })
            let brands = {};
            let litems = [];
            items.forEach(item=>{
              if (brands.hasOwnProperty(doc_dict[item.name].brand_name)) {
                litems[brands[doc_dict[item.name].brand_name]] = {
                  'name': doc_dict[item.name].brand_name,
                  'quantity': litems[brands[doc_dict[item.name].brand_name]].quantity + parseFloat(item.quantity),
                  'margin': litems[brands[doc_dict[item.name].brand_name]].margin + item.margin,
                  'total': litems[brands[doc_dict[item.name].brand_name]].total + item.total,
                };
              } else {
                litems.push({
                  'name': doc_dict[item.name].brand_name,
                  'quantity': item.quantity,
                  'margin': item.margin,
                  'total': item.total,
                });
                brands[doc_dict[item.name].brand_name] = litems.length-1;
              }
            })
            let self = this;
            let output = litems.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportSaleForm.value.groupBy == 'product') {
            items = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[1])) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[saleLine.key[1]]] = {
                  'name': items[result[saleLine.key[1]]].name,
                  'quantity': items[result[saleLine.key[1]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[1]]].margin + parseFloat(saleLine.key[3]),
                  'total': items[result[saleLine.key[1]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[1],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': parseFloat(saleLine.key[3]),
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[saleLine.key[1]] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportSaleForm.value.groupBy == 'payment') {
            items = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[7])) {
                items[result[saleLine.key[7]]] = {
                  'name': items[result[saleLine.key[7]]].name,
                  'quantity': items[result[saleLine.key[7]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[7]]].margin + saleLine.key[3],
                  'total': items[result[saleLine.key[7]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[7],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[saleLine.key[7]] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportSaleForm.value.groupBy == 'contact') {
            items = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[2])) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[saleLine.key[2]]] = {
                  'name': items[result[saleLine.key[2]]].name,
                  'quantity': items[result[saleLine.key[2]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[2]]].margin + saleLine.key[3],
                  'total': items[result[saleLine.key[2]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[2],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[saleLine.key[2]] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportSaleForm.value.groupBy == 'date') {
            // let resultado = 0;
            // let acumulado = 0;
            // let tmpMoves = [];
            items = [];
            sales.forEach(saleLine => {
              // let date = saleLine.key[0].split("T")[0];
              let date:any = (new Date(saleLine.key[0])).toLocaleDateString();
              // if (date == '5/20/2019'){
              //   console.log("date", date, saleLine.key[4], saleLine.key[5], saleLine.value);
              //   resultado += parseFloat(saleLine.key[4])*parseFloat(saleLine.key[5]);
              //   console.log("resultado", resultado);
              //   console.log("acumulado", acumulado);
              //   if (tmpMoves.indexOf(saleLine.key[0])  < 0 ){
              //     acumulado += saleLine.value;
              //     tmpMoves.push(saleLine.key[0]);
              //   }
              // }
              if (result.hasOwnProperty(date)) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[date]] = {
                  'name': items[result[date]].name,
                  'quantity': items[result[date]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[date]].margin + saleLine.key[3],
                  'total': items[result[date]].total + parseFloat(saleLine.key[4])*parseFloat(saleLine.key[5]),
                };
              } else {
                items.push({
                  'name': date,
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*parseFloat(saleLine.key[5]),
                });
                result[date] = items.length-1;
              }
            });
            // console.log("result", result[1]);
            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(b, a, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);

          }
          else if (this.reportSaleForm.value.groupBy == 'month') {
            items = [];
            sales.forEach(saleLine => {
              let month:any = +(new Date(saleLine.key[0])).getMonth() + 1;
              let year = (new Date(saleLine.key[0])).getFullYear();
              if (month.toString().length == 1){
                month = "0"+month;
              }
              let date = year+"-"+month;
              let monthName = this.formatService.getMonth(month)+"-"+year;
              if (result.hasOwnProperty(date)) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[date]] = {
                  'name': items[result[date]].name,
                  'monthName': items[result[date]].monthName,
                  'quantity': items[result[date]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[date]].margin + saleLine.key[3],
                  'total': items[result[date]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                // let date = (new Date(saleLine.key[0])).getMonth();
                // console.log("date", date);
                items.push({
                  'name': date,
                  'monthName': monthName,
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[date] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(b, a, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);

          }

          else if (this.reportSaleForm.value.groupBy == 'week') {
            items = [];
            sales.forEach(saleLine => {
              let week:any = this.getNumberOfWeek(saleLine.key[0]);

              if (week.toString().length == 1){
                week = "0"+week;
              }
              let year = (new Date(saleLine.key[0])).getFullYear();
              let date = year+"-"+week;
              // let date = (new Date(saleLine.key[0])).getWeekYear();
              console.log("date", date);
              if (result.hasOwnProperty(date)) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[date]] = {
                  'name': items[result[date]].name,
                  'quantity': items[result[date]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[date]].margin + saleLine.key[3],
                  'total': items[result[date]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                // let date = (new Date(saleLine.key[0])).getMonth();
                // console.log("date", date);
                items.push({
                  'name': date,
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[date] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              // return self.compare(a, b, self.reportSaleForm.value.orderBy);
              return self.compare(b, a, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);

          }

          else if (this.reportSaleForm.value.groupBy == 'year') {
            items = [];
            sales.forEach(saleLine => {
              let date = (new Date(saleLine.key[0])).getFullYear();
              console.log("date", date);
              if (result.hasOwnProperty(date)) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[date]] = {
                  'name': items[result[date]].name,
                  'quantity': items[result[date]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[date]].margin + saleLine.key[3],
                  'total': items[result[date]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                // let date = (new Date(saleLine.key[0])).getMonth();
                // console.log("date", date);
                items.push({
                  'name': date,
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[date] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              // return self.compare(a, b, self.reportSaleForm.value.orderBy);
              return self.compare(b, a, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);

          }

          else if (this.reportSaleForm.value.groupBy == 'seller') {
            items = [];
            sales.forEach(saleLine => {
              if (result.hasOwnProperty(saleLine.key[8])) {
                // console.log("items[result[saleLine.key[1]]]", items[result[saleLine.key[1]]]);
                items[result[saleLine.key[8]]] = {
                  'name': items[result[saleLine.key[8]]].name,
                  'quantity': items[result[saleLine.key[8]]].quantity + parseFloat(saleLine.key[4]),
                  'margin': items[result[saleLine.key[8]]].margin + saleLine.key[3],
                  'total': items[result[saleLine.key[8]]].total + parseFloat(saleLine.key[4])*saleLine.key[5],
                };
              } else {
                items.push({
                  'name': saleLine.key[8],
                  'quantity': parseFloat(saleLine.key[4]),
                  'margin': saleLine.key[3],
                  'total': parseFloat(saleLine.key[4])*saleLine.key[5],
                });
                result[saleLine.key[8]] = items.length-1;
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportSaleForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
            });
            this.loading.dismiss();
            resolve(output);
          }
        });
      }
    });
  }

  compare(a, b, field) {
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
    this.reportSaleForm.patchValue({
      'orderBy': "name",
    })
    this.goNextStep();
  }

  orderByPrice() {
    this.reportSaleForm.patchValue({
      'orderBy': "price",
    })
    this.goNextStep();
  }

  orderByQuantity() {
    this.reportSaleForm.patchValue({
      'orderBy': "quantity",
    })
    this.goNextStep();
  }

  orderByTotal() {
    this.reportSaleForm.patchValue({
      'orderBy': "total",
    })
    this.goNextStep();
  }

  orderByMargin() {
    this.reportSaleForm.patchValue({
      'orderBy': "margin",
    })
    this.goNextStep();
  }

  async ngOnInit() {
    let today = new Date().toISOString();
    let timezone = new Date().toString().split(" ")[5].split('-')[1];
    let start_date = new Date(today.split("T")[0]+"T00:00:00.000"+timezone).toISOString();
    let end_date = new Date(today.split("T")[0]+"T23:59:59.999"+timezone).toISOString();
    this.reportSaleForm = this.formBuilder.group({
      // contact: new FormControl(this.route.snapshot.paramMap.get('contact') || {}, Validators.required),
      name: new FormControl(''),
      dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||start_date),
      dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd') || end_date),
      total: new FormControl(0),
      items: new FormControl(this.route.snapshot.paramMap.get('items') || [], Validators.required),
      reportType: new FormControl(this.route.snapshot.paramMap.get('reportType') || 'paid'),
      groupBy: new FormControl(this.route.snapshot.paramMap.get('groupBy') || 'product'),
      orderBy: new FormControl(this.route.snapshot.paramMap.get('orderBy') || 'total'),
      filterBy: new FormControl('contact'),
      showFilter: new FormControl(false),
      filter: new FormControl(''),
      contact: new FormControl({}),
      product: new FormControl({}),
      category: new FormControl({}),
      paymentCondition: new FormControl({}),
      seller: new FormControl({}),
    });
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    if (this._id) {
      this.reportService.getReport(this._id).then((data) => {
        //console.log("data", data);
        this.reportSaleForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
    // if (this.route.snapshot.paramMap.get('compute){
    this.goNextStep();
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  selectContact(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.reportSaleForm.patchValue({
          contact: data,
        });
        this.reportSaleForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-contact');
        resolve(true);
        this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectCategory(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-category');
      this.events.subscribe('select-category', (data) => {
        this.reportSaleForm.patchValue({
          category: data,
        });
        this.reportSaleForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-category');
        resolve(true);
        this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductCategoryListPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectProduct(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        this.reportSaleForm.patchValue({
          product: data,
        });
        this.reportSaleForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-product');
        resolve(true);
        this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectPaymentCondition(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-payment-condition');
      this.events.subscribe('select-payment-condition', (data) => {
        this.reportSaleForm.patchValue({
          paymentCondition: data,
        });
        this.reportSaleForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-payment-condition');
        resolve(true);
        this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: PaymentConditionListPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectSeller(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-contact');
      this.events.subscribe('select-contact', (data) => {
        this.reportSaleForm.patchValue({
          seller: data,
        });
        this.reportSaleForm.markAsDirty();
        this.avoidAlertMessage = false;
        this.events.unsubscribe('select-contact');
        resolve(true);
        this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: ContactListPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  goNextStep() {
    if (
      this.reportSaleForm.value.groupBy == 'date'
      || this.reportSaleForm.value.groupBy == 'month'
      || this.reportSaleForm.value.groupBy == 'week'
      || this.reportSaleForm.value.groupBy == 'year'
    ){
      this.reportSaleForm.patchValue({
        'orderBy': 'name'
      });
    } else {
      this.reportSaleForm.patchValue({
        'orderBy': 'total'
      });
    }

    this.getData().then(data => {
      let self = this;
      new Promise((resolve, reject) => {
        self.reportSaleForm.patchValue({
          "items": data,
        });
        resolve(true);
      }).then(() => {
        this.recomputeValues();
      });
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

  onSubmit(values) {
    //console.log(values);
  }

  recomputeValues() {
    let total = 0;
    let items_product_total = 0;
    let items_margin = 0;
    let items_quantity = 0;
    this.reportSaleForm.value.items.forEach((item) => {
      total += parseFloat(item.total);
      items_product_total += 1;
      items_margin += parseFloat(item.margin);
      items_quantity += parseFloat(item.quantity);
    });
    this.items_product_total = items_product_total;
    this.items_margin = items_margin;
    this.items_quantity = items_quantity;
    this.total = total;
    this.reportSaleForm.patchValue({
      "total": total,
    });
    this.drawPie();
    this.drawNewBar();
    // this.drawNewLine();
  }

  drawNewBar() {
    let self = this;
    var dataset = this.reportSaleForm.value.items;
    var width = 320;
    var height = 200;
    var color:any = d3Scale.scaleOrdinal()
      .range(d3.schemeCategory10);


    var legendRectSize = 10; // defines the size of the colored squares in legend
    var legendSpacing = 10;

    if (d3.select("#barChart").select('svg').nodes()[0]) {
      let node: any = d3.select("#barChart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select("#barChart")
      .append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      .append('g')
      .attr('transform', 'translate(' + (width / 3.5) + ',' + (height / 2) + ')');

    //Init axis
    this.x = d3Scale.scaleBand().rangeRound([0, 220]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([200, 0]);
    this.x.domain(dataset.map((d: any) => d.name));
    this.y.domain([0, d3Array.max(dataset, (d: any) => d.total)]);

    //Draw Axis
    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3Axis.axisBottom(this.x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
        return "rotate(-45)"
      });
    svg.append("g")
        .attr("class", "axis axis--y")
        // .call(d3Axis.axisLeft(this.y).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("dy", "-5em")
        .style("text-anchor", "middle")
        .text("Valor Vendido");

      svg.append("g")
          .attr("class", "axis axis--y")
          .call(d3Axis.axisLeft(this.y).ticks(10))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height/2)
          .attr("dy", "-3em")
          .style("text-anchor", "middle");
          // .text("Amount Dispensed");

    // define tooltip
    var tooltip = d3.select('#barChart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'count'); // add class 'count' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'percent'); // add class 'percent' on the selection

    var path = svg.selectAll(".bar")
      .data(this.reportSaleForm.value.items)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => this.x(d.name))
      .attr("y", (d: any) => this.y(d.total))
      .attr("width", this.x.bandwidth())
      .style("fill", (d: any) => color(d['name']))
      .attr("height", (d:any) => height - this.y(d.total))
      .each(function(d:any) { self._current - d; });

    path.on('mouseover', function(d:any) {  // when mouse enters div
      d3.sum(dataset.map(function(d:any) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      tooltip.select('.label').html(d.monthName || d.name); // set current label
      tooltip.select('.count').html('$' + d.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")); // set current count
      tooltip.style('display', 'block'); // set display
    });

    path.on('mouseout', function() { // when mouse leaves div
      tooltip.style('display', 'none'); // hide tooltip for that element
    });

    path.on('mousemove', function(d) { // when mouse moves
      tooltip.style('top', (d3.event.layerY - 80) + 'px') // always 10px below the cursor
        .style('left', (d3.event.layerX - 65) + 'px'); // always 10px to the right of the mouse
    });
  }

  drawPie() {
    let self = this;
    var dataset = this.reportSaleForm.value.items;
    var width = 320;
    var height = 200;

    var radius = 80;

    var legendRectSize = 10; // defines the size of the colored squares in legend
    var legendSpacing = 10;
    var color:any = d3Scale.scaleOrdinal()
      .range(d3.schemeCategory10);

    if (d3.select("#chart").select('svg').nodes()[0]) {
      let node:any = d3.select("#chart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select('#chart')
      .append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .append('g')
      .attr('transform', 'translate(' + (width / 3.5) + ',' + (height / 2) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

    var arc:any = d3Shape.arc()
      .innerRadius(0) // none for pie chart
      .outerRadius(radius); // size of overall chart

    var pie = d3Shape.pie() // start and end angles of the segments
      .value(function(d:any) { return d.total; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // define tooltip
    var tooltip = d3.select('#chart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'count'); // add class 'count' on the selection
    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'percent'); // add class 'percent' on the selection

    dataset.forEach(function(d) {
      d.total = +d.total; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
    });

    // creating the chart
    var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', function(d:any) { return color(d['data'].name); }) // use color scale to define fill of each label in dataset
      .each(function(d:any) { self._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', function(d:any) {  // when mouse enters div
      var total = d3.sum(dataset.map(function(d:any) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      var percent = Math.round(1000 * d.data.total / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.name); // set current label
      tooltip.select('.count').html('$' + d.data.total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")); // set current count
      tooltip.select('.percent').html(percent + '%'); // set percent calculated above
      tooltip.style('display', 'block'); // set display
    });

    path.on('mouseout', function() { // when mouse leaves div
      tooltip.style('display', 'none'); // hide tooltip for that element
    });

    path.on('mousemove', function(d) { // when mouse moves
      tooltip.style('top', (d3.event.layerY - 80) + 'px') // always 10px below the cursor
        .style('left', (d3.event.layerX - 65) + 'px'); // always 10px to the right of the mouse
    });

    // define legend
    // console.log("color.domain()", color.domain());
    var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing
        var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
        var horz = 100; // the legend is shifted to the left to make room for the text
        var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'
        return 'translate(' + horz + ',' + vert + ')'; //return translation
      });

    // adding colored squares to legend
    legend.append('rect') // append rectangle squares to legend
      .attr('width', legendRectSize) // width of rect size is defined above
      .attr('height', legendRectSize) // height of rect size is defined above
      .style('fill', color) // each fill is passed a color
      .style('stroke', color) // each stroke is passed a color
      .on('click', function(label) {
        var rect = d3.select(this); // this refers to the colored squared just clicked
        var enabled = true; // set enabled true to default
        var totalEnabled = d3.sum(dataset.map(function(d:any) { // can't disable all options
          return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
        }));

        if (rect.attr('class') === 'disabled') { // if class is disabled
          rect.attr('class', ''); // remove class disabled
        } else { // else
          if (totalEnabled < 2) return; // if less than two labels are flagged, exit
          rect.attr('class', 'disabled'); // otherwise flag the square disabled
          enabled = false; // set enabled to false
        }

        pie.value(function(d:any) {
          if (d.name === label) d.enabled = enabled; // if entry label matches legend label
          return (d.enabled) ? d.total : 0; // update enabled property and return count or 0 based on the entry's status
        });

        path = path.data(pie(dataset)); // update pie with new data

        path.transition() // transition of redrawn pie
          .duration(750) //
          .attrTween('d', function(d) { // 'd' specifies the d attribute that we'll be animating
            var interpolate = d3.interpolate(self._current, d); // this = current path element
            self._current = interpolate(0); // interpolate between current value and the new value of 'd'
            return function(t) {
              return arc(interpolate(t));
            };
          });
      });

    // adding text to legend
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing + 8)
      .attr('font-size', '12')
      .text(function(d: any) { return d; }); // return label
  }

  drawNewLine() {
    let states = [
      {
        "name": "Ventas",
        "color": d3.schemeCategory10[1],
        "current": 30,
        "history": [
          { 'date': '2018-07-01', 'total': 1 },
          { 'date': '2018-07-02', 'total': 2 },
          { 'date': '2018-07-03', 'total': 3 },
          { 'date': '2018-07-04', 'total': 4 },
          { 'date': '2018-07-05', 'total': 5 },
          { 'date': '2018-07-06', 'total': 6 },
          { 'date': '2018-07-07', 'total': 7 },
          { 'date': '2018-07-08', 'total': 8 },
          { 'date': '2018-07-09', 'total': 9 },
          { 'date': '2018-07-10', 'total': 10 },
          { 'date': '2018-07-11', 'total': 11 },
          { 'date': '2018-07-12', 'total': 12 },
          { 'date': '2018-07-13', 'total': 13 },
          { 'date': '2018-07-14', 'total': 14 },
          { 'date': '2018-07-15', 'total': 15 },
          { 'date': '2018-07-16', 'total': 16 },
          { 'date': '2018-07-17', 'total': 17 },
          { 'date': '2018-07-18', 'total': 18 },
          { 'date': '2018-07-19', 'total': 19 },
          { 'date': '2018-07-20', 'total': 20 },
          { 'date': '2018-07-21', 'total': 21 },
          { 'date': '2018-07-22', 'total': 22 },
          { 'date': '2018-07-23', 'total': 23 },
          { 'date': '2018-07-24', 'total': 24 },
          { 'date': '2018-07-25', 'total': 25 },
          { 'date': '2018-07-26', 'total': 26 },
          { 'date': '2018-07-27', 'total': 27 },
          { 'date': '2018-07-28', 'total': 28 },
          { 'date': '2018-07-29', 'total': 29 },
          { 'date': '2018-07-30', 'total': 30 },
        ]
      },
      {
        "name": "Compras",
        "color": d3.schemeCategory10[0],
        "current": 36,
        "history": [
          { 'date': '2018-07-01', 'total': 1 + 6 },
          { 'date': '2018-07-02', 'total': 2 + 6 },
          { 'date': '2018-07-03', 'total': 3 + 6 },
          { 'date': '2018-07-04', 'total': 4 + 6 },
          { 'date': '2018-07-05', 'total': 5 + 6 },
          { 'date': '2018-07-06', 'total': 6 + 6 },
          { 'date': '2018-07-07', 'total': 7 + 6 },
          { 'date': '2018-07-08', 'total': 8 + 6 },
          { 'date': '2018-07-09', 'total': 9 + 6 },
          { 'date': '2018-07-10', 'total': 10 + 8 },
          { 'date': '2018-07-11', 'total': 11 + 10 },
          { 'date': '2018-07-12', 'total': 12 + 12 },
          { 'date': '2018-07-13', 'total': 13 + 10 },
          { 'date': '2018-07-14', 'total': 14 + 8 },
          { 'date': '2018-07-15', 'total': 15 + 6 },
          { 'date': '2018-07-16', 'total': 16 + 6 },
          { 'date': '2018-07-17', 'total': 17 + 6 },
          { 'date': '2018-07-18', 'total': 18 + 6 },
          { 'date': '2018-07-19', 'total': 19 + 6 },
          { 'date': '2018-07-20', 'total': 20 + 6 },
          { 'date': '2018-07-21', 'total': 21 + 6 },
          { 'date': '2018-07-22', 'total': 22 + 6 },
          { 'date': '2018-07-23', 'total': 23 + 6 },
          { 'date': '2018-07-24', 'total': 24 + 6 },
          { 'date': '2018-07-25', 'total': 25 + 6 },
          { 'date': '2018-07-26', 'total': 26 + 6 },
          { 'date': '2018-07-27', 'total': 27 + 6 },
          { 'date': '2018-07-28', 'total': 28 + 6 },
          { 'date': '2018-07-29', 'total': 29 + 6 },
          { 'date': '2018-07-30', 'total': 30 + 6 },
        ]
      },
      {
        "name": "Cobranzas",
        "color": d3.schemeCategory10[2],
        "current": 24,
        "history": [
          { 'date': '2018-07-01', 'total': 0 },
          { 'date': '2018-07-02', 'total': 0 },
          { 'date': '2018-07-03', 'total': 0 },
          { 'date': '2018-07-04', 'total': 0 },
          { 'date': '2018-07-05', 'total': 0 },
          { 'date': '2018-07-06', 'total': 0 },
          { 'date': '2018-07-07', 'total': 7 - 6 },
          { 'date': '2018-07-08', 'total': 8 - 6 },
          { 'date': '2018-07-09', 'total': 9 - 6 },
          { 'date': '2018-07-10', 'total': 10 - 8 },
          { 'date': '2018-07-11', 'total': 11 - 10 },
          { 'date': '2018-07-12', 'total': 12 - 12 },
          { 'date': '2018-07-13', 'total': 13 - 10 },
          { 'date': '2018-07-14', 'total': 14 - 8 },
          { 'date': '2018-07-15', 'total': 15 - 6 },
          { 'date': '2018-07-16', 'total': 16 - 6 },
          { 'date': '2018-07-17', 'total': 17 - 6 },
          { 'date': '2018-07-18', 'total': 18 - 6 },
          { 'date': '2018-07-19', 'total': 19 - 6 },
          { 'date': '2018-07-20', 'total': 20 - 6 },
          { 'date': '2018-07-21', 'total': 21 - 6 },
          { 'date': '2018-07-22', 'total': 22 - 6 },
          { 'date': '2018-07-23', 'total': 23 - 6 },
          { 'date': '2018-07-24', 'total': 24 - 6 },
          { 'date': '2018-07-25', 'total': 25 - 6 },
          { 'date': '2018-07-26', 'total': 26 - 6 },
          { 'date': '2018-07-27', 'total': 27 - 6 },
          { 'date': '2018-07-28', 'total': 28 - 6 },
          { 'date': '2018-07-29', 'total': 29 - 6 },
          { 'date': '2018-07-30', 'total': 30 - 6 },
        ]
      }
    ];

    const margin = { top: 40, right: 5, bottom: 30, left: 30 };
    const width = 330 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;


    var bisectDate = d3.bisector(function(d: any) { return new Date(d.date); }).right,
      dateFormatter = d3.timeFormat("%d/%m/%y");

    let x = d3.scaleTime()
      .domain([new Date(2018, 6, 1), new Date(2018, 7, 1)])
      .range([0, width]);

    const y = d3.scaleLinear().domain([0, 30]).range([height, 0]);
    const line:any = d3.line().x((d: any) => x(new Date(d.date))).y((d:any) => y(d.total));
    if (d3.select("#svg").select('g').nodes()[0]) {
      let node:any = d3.select("#svg").select('g').nodes()[0];
      node.remove();
    }
    const chart = d3.select('#svg').append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const tooltip = d3.select('#tooltip');
    const tooltipLine = chart.append('line');

    // Add the axes and a title
    const xAxis = d3.axisBottom(x).ticks(8).tickFormat(dateFormatter);
    const yAxis = d3.axisLeft(y).tickFormat(d3.format('.2s'));
    chart.append('g').call(yAxis);
    chart.append('g').attr('transform', 'translate(0,' + height + ')').call(xAxis).selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", function(d) {
        return "rotate(-45)"
      });
    // chart.append('text').html('State Population Over Time').attr('x', 50);

    // Load the data and draw a chart
    let tipBox;
    chart.selectAll()
      .data(states)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('y', 2)
      .datum(d => d.history)
      .attr('d', line);

    let self = this;
    tipBox = chart.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .on('touchstart', (nana) => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(states[0].history, x0, 1),
          d0 = states[0].history[i - 1];
          // d1 = states[0].history[i];
        let date: any = new Date(d0.date);

        states.sort((a, b) => {
          return self.compare(a, b, "date");
        })
        console.log("d3.event.pageX", d3.event.pageX);
        tooltip.html(date)
          .style('display', 'block')
          .style('left', d3.event.pageX + 20)
          .style('top', d3.event.pageY - 20)
          .selectAll()
          .data(states).enter()
          .append('div')
          .style('color', d => d.color)
          .html(d => d.name + ': ' + d.history[i - 1].total)
      })
      .on('touchmove', (nana) => {
        var x0 = x.invert(d3.mouse(d3.event.currentTarget)[0]),
          i = bisectDate(states[0].history, x0, 1),
          d0 = states[0].history[i - 1];
          // d1 = states[0].history[i];
        let date:any = new Date(d0.date);

        states.sort((a, b) => {
          return self.compare(a, b, "date");
        })
        console.log("d3.event.pageX", d3.event.pageX);
        tooltip.html(date)
          .style('display', 'block')
          .style('left', d3.event.pageX + 20)
          .style('top', d3.event.pageY - 20)
          .selectAll()
          .data(states).enter()
          .append('div')
          .style('color', d => d.color)
          .html(d => d.name + ': ' + d.history[i - 1].total)
      })
      .on('mouseout', () => {
        if (tooltip) tooltip.style('display', 'none');
        if (tooltipLine) tooltipLine.attr('stroke', 'none');
      });
    console.log("fim");
  }

  getNumberOfWeek(date) {
    const today:any = new Date(date);
    const firstDayOfYear:any = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

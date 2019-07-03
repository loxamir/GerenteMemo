import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, Events, ToastController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ReportService } from '../report/report.service';
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

import * as d3 from 'd3';

// import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.page.html',
  styleUrls: ['./cash-flow.page.scss'],
})
export class CashFlowPage implements OnInit {
  @ViewChild('select') select;

  cashFlowForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  currency_precision = 2;
  items_product_total;
  items_income;
  items_expense;
  total;
  languages: Array<LanguageModel>;

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
  ) {
    this.today = new Date().toISOString();
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

  async getData() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    return new Promise(resolve => {
      this.pouchdbService.getView(
        'stock/Fluxo',
        5,
        [this.cashFlowForm.value.dateStart.split("T")[0], "0"],
        [this.cashFlowForm.value.dateEnd.split("T")[0], "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then(async (cashFlowList: any[]) => {
        // console.log("cashFlow lines", cashFlowList);
        let items = [];
        let promise_ids = [];
        let result = {};
        if (this.cashFlowForm.value.groupBy == 'contact') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            let income = 0;
            let expense = 0;
            if (cashFlowLine.value > 0){
              income += cashFlowLine.value
            }
            if (cashFlowLine.value < 0){
              expense -= cashFlowLine.value
            }

            if (result.hasOwnProperty(cashFlowLine.key[2])) {
              items[result[cashFlowLine.key[2]]] = {
                'name': items[result[cashFlowLine.key[2]]].name,
                'income': items[result[cashFlowLine.key[2]]].income + income,
                'expense': items[result[cashFlowLine.key[2]]].expense - expense,
                'total': items[result[cashFlowLine.key[2]]].total + cashFlowLine.value,
              };
            } else {
              items.push({
                'name': cashFlowLine.key[2],
                'income': income,
                'expense': expense,
                'total': cashFlowLine.value,
              });
              result[cashFlowLine.key[2]] = items.length-1;
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.cashFlowForm.value.orderBy);
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

        else if (this.cashFlowForm.value.groupBy == 'date') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            let income = 0;
            let expense = 0;
            if (cashFlowLine.value > 0){
              income += cashFlowLine.value
            }
            if (cashFlowLine.value < 0){
              expense -= cashFlowLine.value
            }

            if (result.hasOwnProperty(cashFlowLine.key[0])) {
              items[result[cashFlowLine.key[0]]] = {
                'name': items[result[cashFlowLine.key[0]]].name,
                'income': items[result[cashFlowLine.key[0]]].income + income,
                'expense': items[result[cashFlowLine.key[0]]].expense + expense,
                'total': items[result[cashFlowLine.key[0]]].total + cashFlowLine.value,
              };
            } else {
              items.push({
                'name': cashFlowLine.key[0],
                'income': income,
                'expense': expense,
                'total': cashFlowLine.value,
              });
              result[cashFlowLine.key[0]] = items.length-1;
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.cashFlowForm.value.orderBy);
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

        else if (this.cashFlowForm.value.groupBy == 'account') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            let income = 0;
            let expense = 0;
            if (cashFlowLine.value > 0){
              income += cashFlowLine.value
            }
            if (cashFlowLine.value < 0){
              expense -= cashFlowLine.value
            }

            if (result.hasOwnProperty(cashFlowLine.key[1])) {
              items[result[cashFlowLine.key[1]]] = {
                'name': items[result[cashFlowLine.key[1]]].name,
                'income': items[result[cashFlowLine.key[1]]].income + income,
                'expense': items[result[cashFlowLine.key[1]]].expense + expense,
                'total': items[result[cashFlowLine.key[1]]].total + cashFlowLine.value,
              };
            } else {
              items.push({
                'name': cashFlowLine.key[1],
                'income': income,
                'expense': expense,
                'total': cashFlowLine.value,
              });
              result[cashFlowLine.key[1]] = items.length-1;
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.cashFlowForm.value.orderBy);
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
    this.cashFlowForm.patchValue({
      'orderBy': "name",
    })
    this.goNextStep();
  }

  orderByPrice() {
    this.cashFlowForm.patchValue({
      'orderBy': "price",
    })
    this.goNextStep();
  }

  orderByTotal() {
    this.cashFlowForm.patchValue({
      'orderBy': "total",
    })
    this.goNextStep();
  }

  async ngOnInit() {
    this.cashFlowForm = this.formBuilder.group({
      contact: new FormControl(this.route.snapshot.paramMap.get('contact') || {}, Validators.required),
      name: new FormControl(''),
      dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||this.today),
      dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd') || this.today),
      total: new FormControl(0),
      items: new FormControl(this.route.snapshot.paramMap.get('items') || [], Validators.required),
      reportType: new FormControl(this.route.snapshot.paramMap.get('reportType') || 'paid'),
      groupBy: new FormControl(this.route.snapshot.paramMap.get('groupBy') || 'account'),
      orderBy: new FormControl(this.route.snapshot.paramMap.get('orderBy') || 'total'),
      filterBy: new FormControl('contact'),
      filter: new FormControl(''),
    });
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.goNextStep();
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  goNextStep() {
    this.getData().then(data => {
      let self = this;
      new Promise((resolve, reject) => {
        self.cashFlowForm.patchValue({
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
    let items_income = 0;
    let items_expense = 0;
    this.cashFlowForm.value.items.forEach((item) => {
      total += parseFloat(item.total);
      items_product_total += 1;
      items_income += parseFloat(item.income);
      items_expense += parseFloat(item.expense);
    });
    this.items_product_total = items_product_total;
    this.items_income = items_income;
    this.items_expense = items_expense;
    this.total = total;
    this.cashFlowForm.patchValue({
      "total": total,
    });
  }
}

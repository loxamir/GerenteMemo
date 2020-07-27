import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, Events,
  ToastController, ModalController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ContactListPage } from '../contact-list/contact-list.page';
import * as d3 from 'd3';

// import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-receivable-report',
  templateUrl: './receivable-report.page.html',
  styleUrls: ['./receivable-report.page.scss'],
})
export class ReceivableReportPage implements OnInit {
  @ViewChild('select', { static: false }) select;

  receivableReportForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  items_product_total;
  items_income;
  items_expense;
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
  config;

  line: d3Shape.Line<[number, number]>;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
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
        'Informes/A Cobrar',
        5,
        [this.receivableReportForm.value.dateStart.split("T")[0], "0"],
        [this.receivableReportForm.value.dateEnd.split("T")[0], "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then(async (cashFlowList: any[]) => {
        let items = [];
        let promise_ids = [];
        let result = {};
        if (this.receivableReportForm.value.groupBy == 'contact') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            if (! this.receivableReportForm.value.contact
              || this.receivableReportForm.value.contact._id == cashFlowLine.key[4]
            ){
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
                  'expense': items[result[cashFlowLine.key[1]]].expense - expense,
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
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.receivableReportForm.value.orderBy);
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

        else if (this.receivableReportForm.value.groupBy == 'date') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            if (! this.receivableReportForm.value.contact
              || this.receivableReportForm.value.contact._id == cashFlowLine.key[4]
            ){
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
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.receivableReportForm.value.orderBy);
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

        else if (this.receivableReportForm.value.groupBy == 'account') {
          items = [];
          cashFlowList.forEach(cashFlowLine => {
            if (! this.receivableReportForm.value.contact
              || this.receivableReportForm.value.contact._id == cashFlowLine.key[4]
            ){
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
                  'expense': items[result[cashFlowLine.key[2]]].expense + expense,
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
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.receivableReportForm.value.orderBy);
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
    this.receivableReportForm.patchValue({
      'orderBy': "name",
    })
    this.goNextStep();
  }

  orderByPrice() {
    this.receivableReportForm.patchValue({
      'orderBy': "price",
    })
    this.goNextStep();
  }

  // orderByQuantity() {
  //   this.receivableReportForm.patchValue({
  //     'orderBy': "quantity",
  //   })
  //   this.goNextStep();
  // }

  orderByTotal() {
    this.receivableReportForm.patchValue({
      'orderBy': "total",
    })
    this.goNextStep();
  }

  // orderByMargin() {
  //   this.receivableReportForm.patchValue({
  //     'orderBy': "margin",
  //   })
  //   this.goNextStep();
  // }

  async ngOnInit() {
    this.receivableReportForm = this.formBuilder.group({
      contact: new FormControl(this.route.snapshot.paramMap.get('contact') || undefined, Validators.required),
      name: new FormControl(''),
      dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd') || this.today.toISOString()),
      total: new FormControl(0),
      items: new FormControl(this.route.snapshot.paramMap.get('items') || [], Validators.required),
      reportType: new FormControl(this.route.snapshot.paramMap.get('reportType') || 'paid'),
      groupBy: new FormControl(this.route.snapshot.paramMap.get('groupBy') || 'date'),
      orderBy: new FormControl(this.route.snapshot.paramMap.get('orderBy') || 'total'),
      filterBy: new FormControl('contact'),
      filter: new FormControl(''),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.config = config;
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
        self.receivableReportForm.patchValue({
          "items": data,
        });
        resolve(true);
      }).then(() => {
        this.recomputeValues();
      });
    })
  }

  selectContact() {
      return new Promise(async resolve => {
        this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.receivableReportForm.patchValue({
            contact: data,
            contact_name: data.name,
          });
          this.receivableReportForm.markAsDirty();
          this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          profileModal.dismiss();
          this.goNextStep();
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
    this.receivableReportForm.value.items.forEach((item) => {
      total += parseFloat(item.total);
      items_product_total += 1;
      items_income += parseFloat(item.income);
      items_expense += parseFloat(item.expense);
    });
    this.items_product_total = items_product_total;
    this.items_income = items_income;
    this.items_expense = items_expense;
    this.total = total;
    this.receivableReportForm.patchValue({
      "total": total,
    });
  }

  getHeader(docPdf, topo, col1, col2, col3, col4){
    if (this.receivableReportForm.value.groupBy == 'date'){
      docPdf.text("Fecha", col1, topo);
      docPdf.text("Valor a Cobrar", col4, topo, 'right');
    } if (this.receivableReportForm.value.groupBy == 'contact'){
      docPdf.text("Contacto", col1, topo);
      docPdf.text("Valor a Cobrar", col4, topo, 'right');
    } else if (this.receivableReportForm.value.groupBy == 'account'){
      docPdf.text("Cuenta", col1, topo);
      docPdf.text("Valor a Cobrar", col4, topo, 'right');
    }
  }

  printPDF(){
    var docPdf = new jsPDF('portrait', 'mm', 'a4');
    let pageHeight= docPdf.internal.pageSize.height;
    docPdf.setFontSize(7);
    let topo = 10;
    let col1 = 10;
    let col2 = 150;
    let col3 = 170;
    let col4 = 190;
    let now = new Date().toISOString();
    docPdf.setFontSize(20);
    docPdf.text("Cuentas a Cobrar", 80, topo);
    docPdf.setFontSize(7);
    topo += 5;
    docPdf.text("Empresa: "+this.config.name, 10, topo);
    topo += 5;
    let day = now.split('-')[2].split('T')[0];
    let month = now.split('-')[1];
    let year = now.split('-')[0];
    let hour = now.split(':')[0].split('T')[1];
    let minute = now.split(':')[1];
    let rightNow = day+"/"+month+"/"+year;//+" "+hour+":"+minute;
    docPdf.text("Fecha: "+rightNow, 10, topo);
    topo += 5;
    docPdf.setFontType("bold");
    docPdf.text("Valor total a cobrar: "+this.total.toFixed(this.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " G$", 10, topo);
    docPdf.setFontType("normal");
    topo+=10;
    this.getHeader(docPdf, topo, col1, col2, col3, col4);
    topo+=5;
    this.receivableReportForm.value.items.forEach((line)=>{
      if (topo >= pageHeight){
        docPdf.addPage();
        topo=10;
        this.getHeader(docPdf, topo, col1, col2, col3, col4);
        topo+=5;
      }
      docPdf.text(line.name || "No Informado", col1, topo);
      if (this.receivableReportForm.value.groupBy == "date"){
        docPdf.text(line.total.toFixed(this.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), col4, topo, 'right');
      } else if (this.receivableReportForm.value.groupBy == "account"){
        docPdf.text(line.total.toFixed(this.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), col4, topo, 'right');
      } else if (this.receivableReportForm.value.groupBy == "contact"){
        docPdf.text(line.total.toFixed(this.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), col4, topo, 'right');
      }
      topo+=5;
    })
    docPdf.setFontType("bold");
    docPdf.text("Total:", col1, topo);
    docPdf.text(this.total.toFixed(this.currency_precision).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."), col4, topo, 'right');
    topo+=5;
    docPdf.save('Cuentas por Cobrar-'+day+"-"+month+"-"+year+'.pdf')
  }
}

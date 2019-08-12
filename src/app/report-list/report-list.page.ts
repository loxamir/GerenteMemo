import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, PopoverController, NavParams } from '@ionic/angular';
// import { ReportPage } from '../report/report.page';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ResultReportPage } from '../result-report/result-report.page';
import { ViewReportPage } from '../view-report/view-report.page';
import { BalanceReportPage } from '../balance-report/balance-report.page';
import { AccountsReportPage } from '../accounts-report/accounts-report.page';
import 'rxjs/Rx';
import { ReportListService } from './report-list.service';
import { PlannedListPage } from '../planned-list/planned-list.page';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { SaleReportPage } from '../sale-report/sale-report.page';
import { PurchaseReportPage } from '../purchase-report/purchase-report.page';
import { ProductService } from '../product/product.service';
import { CashFlowPage } from '../cash-flow/cash-flow.page';
import * as d3 from 'd3';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { FormatService } from '../services/format.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.page.html',
  styleUrls: ['./report-list.page.scss'],
})
export class ReportListPage implements OnInit {
  reports: any;
  loading: any;
  reportsForm: FormGroup;
  searchTerm: string = '';
  items = [];
  page = 0;
  has_search = false;
  select;
  today: any;

  stocked_cost = 0;
  stocked_price = 0;
  stocked_quantity = 0;

  service_sold = 0;
  service_margin = 0;
  service_margin_percent = 0;
  service_cash = 0;
  service_credit = 0;
  produced = 0;
  production_material = 0;
  production_labour = 0;
  production_cost = 0;
  production_cost_percent = 0;
  sold = 0;
  sale_margin = 0;
  sale_margin_percent = 0;
  sale_cash = 0;
  sale_credit = 0;
  sale_pie_payments = [];
  sale_pie_products = [];
  toReceive = 0;
  received = 0;
  purchased = 0;
  purchased_pie_payments = [];
  purchase_cash = 0;
  purchase_credit = 0;
  ToPay = 0;
  ToPayDued = 0;
  ToPayWillDue = 0;
  ToPayDefault = 0;
  paid = 0;
  service_total = 0;
  receivedTable = [];
  cashflowIncome = 0;
  cashflowExpense = 0;
  paidTable = [];
  resultIncome = 0;
  resultExpense = 0;
  balanceAtive = 0;
  balancePassive = 0;
  _current: any;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public reportsService: ReportListService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public languageService: LanguageService,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public formatService: FormatService,
  ) {



    this.select = this.route.snapshot.paramMap.get('select');
    this.today = new Date();
  }

  async ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    let today = new Date().toISOString();
    // console.log("today", today);
    let timezone = new Date().toString().split(" ")[5].split('-')[1];
    let start_date = new Date(today.split("T")[0]+"T00:00:00.000"+timezone).toISOString();
    let end_date = new Date(today.split("T")[0]+"T23:59:59.999"+timezone).toISOString();
    this.reportsForm = this.formBuilder.group({
      dateStart: new FormControl(
        this.route.snapshot.paramMap.get('dateStart')
        || start_date),
      dateEnd: new FormControl(
        this.route.snapshot.paramMap.get('dateEnd')
        || end_date),
      // sales: new FormControl(0),
      // purchases: new FormControl(0),
    });
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.recomputeValues();
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  getEndOfMonth() {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
  }

  computeResultValues() {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/ResultadoDiario',
        4,
        [this.reportsForm.value.dateStart.split("T")[0], "0", "0"],
        [this.reportsForm.value.dateEnd.split("T")[0], "z", "z"]
      ).then((result: any[]) => {
        let prom = [];
        let resultIncome = 0;
        let resultExpense = 0;
        let cashflowIncome = 0;
        let cashflowExpense = 0;
        result.forEach((item, index) => {
          if (!
            ((
              item.key[1].split('.')[1] == 'cash'
              || item.key[1].split('.')[1] == 'bank'
              || item.key[1].split('.')[1] == 'check'
            ) && (
              item.key[3].split('.')[1] == 'cash'
              || item.key[3].split('.')[1] == 'bank'
              || item.key[3].split('.')[1] == 'check'
            ))
          ) {
            if (item.key[1].split('.')[1] == 'cash'
              || item.key[1].split('.')[1] == 'bank'
              || item.key[1].split('.')[1] == 'check') {
              if (result[index].value > 0) {
                cashflowIncome += result[index].value;
              } else {
                cashflowExpense -= result[index].value;
              }
            }
          }
          if (item.key[1].split('.')[1] == 'income') {

            // if (result[index].value > 0) {
              // console.log("value+", result[index]);
              resultIncome -= result[index].value;
            // } else {
            //   console.log("value-", result[index]);
              // resultIncome += result[index].value;
            // }
            // console.log("resultIncome", resultIncome);
          }
          if (item.key[1].split('.')[1] == 'expense') {
            // if (result[index].value > 0) {
            //   resultExpense += result[index].value;
            // } else {
              resultExpense += result[index].value;
            // }
          }
        })
        this.resultIncome = resultIncome;
        this.resultExpense = resultExpense;
        this.cashflowIncome = cashflowIncome;
        this.cashflowExpense = cashflowExpense;
        resolve(true);
      })
    })
  }

  computeSaleValues() {
    let self = this;
    return new Promise((resolve, reject)=>{
      let startkey=this.reportsForm.value.dateStart.split("T")[0];
      let endkey=this.reportsForm.value.dateEnd.split("T")[0];
      this.pouchdbService.getView(
        'Informes/VentaDiaria',
        4,
        [startkey, "0", "0"],
        [endkey, "z", "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then((sales: any[]) => {
        let sold = 0;
        let sale_margin = 0;
        let cash_payment = 0;
        let credit_payment = 0;
        sales.forEach(sale => {
          sold += parseFloat(sale.value);
          if (sale.key[1] == "payment-condition.cash") {
            cash_payment += parseFloat(sale.value);
          } else {
            credit_payment += parseFloat(sale.value);
          }
          sale_margin += sale.key[3];
        });
        this.sold = sold;
        this.sale_margin = sale_margin;
        this.sale_margin_percent = (sale_margin / sold) * 100;
        this.sale_cash = cash_payment;
        this.sale_credit = credit_payment;
        resolve(true);
      });
    })
  }

  computeServiceValues() {
    let self = this;
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'Informes/ServicioDiario',
        4,
        [this.reportsForm.value.dateStart.split("T")[0], "0", "0"],
        [this.reportsForm.value.dateEnd.split("T")[0], "z", "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then((sales: any[]) => {
        let sold = 0;
        let sale_margin = 0;
        let cash_payment = 0;
        let credit_payment = 0;
        sales.forEach(sale => {
          sold += parseFloat(sale.value);
          if (sale.key[1] == "payment-condition.cash") {
            cash_payment += parseFloat(sale.value);
          } else {
            credit_payment += parseFloat(sale.value);
          }
          sale_margin += sale.key[3];
        });
        this.service_sold = sold;
        this.service_margin = sale_margin;
        this.service_margin_percent = (sale_margin / sold) * 100;
        this.service_cash = cash_payment;
        this.service_credit = credit_payment;
        resolve(true);
      });
    })
  }

  computeProductionValues() {
    return new Promise((resolve, reject)=>{
      let self = this;
      this.pouchdbService.getView(
        'Informes/ProduccionDiaria',
        10,
        [this.reportsForm.value.dateStart.split("T")[0], "0", "0"],
        [this.reportsForm.value.dateEnd.split("T")[0], "z", "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then((sales: any[]) => {
        // console.log("produciones", sales);
        let produced = 0;
        let production_material = 0;
        let production_labour = 0;
        let production_cost = 0;
        let production_cost_percent = 0;
        sales.forEach(sale => {
          produced += parseFloat(sale.key[4]);
          production_material += parseFloat(sale.key[5]);
          production_labour += parseFloat(sale.key[6]);
          production_cost += parseFloat(sale.value);
        });
        this.produced = produced;
        this.production_material = production_material;
        this.production_labour = production_labour;
        this.production_cost = production_cost;
        this.production_cost_percent = (produced / production_cost) * 100;
        resolve(true);
      });
    })
  }

  computeStockValues() {
    return new Promise((resolve, reject)=>{
      let self = this;
      this.pouchdbService.getView(
        'stock/Depositos',
        3,
        ["warehouse.physical.my" ,"0", "0"],
        ["warehouse.physical.my", "z", "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then(async (products: any[]) => {
        // console.log("Stock", products);
        let stocked_cost = 0;
        let stocked_price = 0;
        let stocked_quantity = 0;
        let getList = [];
        products = products.slice(0, 999);
        products.forEach(sale => {
          if (getList.indexOf(sale.key[1]) < 0){
            getList.push(sale.key[1])
          }
        });
        // console.log("productGetList", getList);
        let productList:any = await this.pouchdbService.getList(getList);
        var doc_dict = {};
        productList.forEach(row=>{
          doc_dict[row.id] = row.doc;
        })
        products.forEach(product => {
          // if (doc_dict[product.key[1]] && product.value > 0){
            stocked_quantity += parseFloat(product.value);
            if (!doc_dict[product.key[1]]){
              //console.log("product.key[1]", product.key[1]);
            } else {
              stocked_cost += product.value * doc_dict[product.key[1]].cost;
              stocked_price += product.value * doc_dict[product.key[1]].price;;
            }
          // }
        })
        this.stocked_quantity = stocked_quantity;
        this.stocked_cost = stocked_cost;
        this.stocked_price = stocked_price;
        resolve(true);
      });
    })
  }

  computeToReceiveValues() {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/A Cobrar', 0,
        ['0', '0'],
        ['z', 'z']
      ).then((view: any[]) => {
        let total = 0;
        view.forEach(data => {
          total += data.value;
        });
        this.toReceive = total;
        resolve(true);
      });
    })
  }

  computePurchaseValues() {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'Informes/CompraDiaria',
        3,
        [this.reportsForm.value.dateStart.split("T")[0], "0", "0"],
        [this.reportsForm.value.dateEnd.split("T")[0], "z", "z"],
        true,
        true,
        undefined,
        undefined,
        false
      ).then((sales: any[]) => {
        let sold = 0;
        let cash_payment = 0;
        let credit_payment = 0;
        sales.forEach(sale => {
          sold += parseFloat(sale.value);
          if (sale.key[1] == "payment-condition.cash") {
            cash_payment += parseFloat(sale.value);
          } else {
            credit_payment += parseFloat(sale.value);
          }
        });
        this.purchased = sold;
        this.purchase_cash = cash_payment;
        this.purchase_credit = credit_payment;
        resolve(true);
      });
    })
  }

  computeToPayValues() {
    return new Promise((resolve, reject)=>{
      this.pouchdbService.getView(
        'stock/A Pagar', 0,
        ['0', '0'],
        ['z', 'z']
      ).then((view: any[]) => {
        let total = 0;
        view.forEach(data => {
          total += data.value;
        });
        this.ToPay = total;
        resolve(true);
      });
    })
  }

  async recomputeValues() {
    await this.computeSaleValues();
    await this.computeServiceValues();
    await this.computeProductionValues();
    await this.computeStockValues();
    await this.computeToReceiveValues();
    await this.computePurchaseValues();
    await this.computeToPayValues();
    await this.computeResultValues();
    await this.loading.dismiss();
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

  // setFilteredItems() {
  //   this.reportsService.getReportsPage(
  //     this.searchTerm, this.page
  //   ).then((reports) => {
  //     this.reports = reports;
  //     this.page = 0;
  //     this.recomputeValues();
  //   });
  // }

  doRefreshList() {
    setTimeout(() => {
      this.reportsService.getReportsPage(
        this.searchTerm, 0
      ).then((reports: any[]) => {
        this.reports = reports;
        this.page = 0;
        this.recomputeValues();
      });
    }, 200);
  }

  showReportSale() {
    this.navCtrl.navigateForward(['/sale-report', {
      'reportType': "sale",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportService() {
    this.navCtrl.navigateForward(['/service-report', {
      'reportType': "service",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportProduction() {
    this.navCtrl.navigateForward(['/production-report', {
      'reportType': "production",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportStock() {
    this.navCtrl.navigateForward(['/stock-report', {
      'reportType': "stock",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportBalancete() {
    this.navCtrl.navigateForward(['/view-report', {
      reportView: 'stock/Contas'
    }]);
  }

  showReportPurchase() {
    this.navCtrl.navigateForward(['/purchase-report', {
      'reportType': "purchase",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportToPay() {
    this.navCtrl.navigateForward(['/payable-report', {
      "signal": "-",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportToReceive() {
    this.navCtrl.navigateForward(['/receivable-report', {
      "signal": "+",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportPaid() {
    this.navCtrl.navigateForward(['/report', {
      'reportType': "paid",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportReceived() {
    this.navCtrl.navigateForward(['/report', {
      'reportType': "received",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportCashFlow() {
    this.navCtrl.navigateForward(['/cash-flow', {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd
    }]);
  }

  showReportResult() {
    this.navCtrl.navigateForward(['/result-report', {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportBalance() {
    this.navCtrl.navigateForward(['/balance-report', {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
  }

  showReportAccounts() {
    this.navCtrl.navigateForward(['/accounts-report', {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    }]);
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
    let start_date = new Date(this.reportsForm.value.dateStart).getTime();
    let end_date = new Date(this.reportsForm.value.dateEnd).getTime();
    //console.log("start_date", new Date(start_date).toJSON());
    //console.log("end_date", new Date(end_date).toJSON());
    let period = end_date - start_date + 1;
    //console.log("period", period);
    this.reportsForm.patchValue({
      dateStart: new Date(start_date - period).toJSON(),
      dateEnd: new Date(end_date - period).toJSON(),
    })
    this.recomputeValues();
  }

  goPeriodForward() {
    let start_date = new Date(this.reportsForm.value.dateStart).getTime();
    let end_date = new Date(this.reportsForm.value.dateEnd).getTime();
    let period = end_date - start_date + 1;
    this.reportsForm.patchValue({
      dateStart: new Date(start_date + period).toJSON(),
      dateEnd: new Date(end_date + period).toJSON(),
    })
    this.recomputeValues();
  }
}

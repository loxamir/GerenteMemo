import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, PopoverController, Events, NavParams } from '@ionic/angular';
import { ReportPage } from '../report/report.page';
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
import { ReportService } from '../report/report.service';
import { CashFlowPage } from '../cash-flow/cash-flow.page';
import * as d3 from 'd3';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

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

  service_sold = 0;
  service_margin = 0;
  service_margin_percent = 0;
  service_cash = 0;
  service_credit = 0;

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

  constructor(
    public navCtrl: NavController,
    public reportsService: ReportListService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events: Events,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public translate: TranslateService,
    public languageService: LanguageService,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public reportService: ReportService,
  ) {
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.select = this.route.snapshot.paramMap.get('select');
    this.today = new Date().toISOString();
  }

  async ngOnInit() {
    this.reportsForm = this.formBuilder.group({
      dateStart: new FormControl(
        this.route.snapshot.paramMap.get('dateStart')
        || this.getFirstDateOfMonth()),
      dateEnd: new FormControl(
        this.route.snapshot.paramMap.get('dateEnd')
        || this.getEndOfMonth()),
      sales: new FormControl(0),
      purchases: new FormControl(0),
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    setTimeout(() => {
      this.recomputeValues();
    }, 500);
    this.setFilteredItems();
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
    this.pouchdbService.getView(
      'stock/ResultadoDiario',
      3,
      [this.reportsForm.value.dateStart.split("T")[0], "0", "0"],
      [this.reportsForm.value.dateEnd.split("T")[0], "z", "z"]
    ).then((result: any[]) => {
      let prom = [];
      let resultIncome = 0;
      let resultExpense = 0;
      let cashflowIncome = 0;
      let cashflowExpense = 0;
      result.forEach((item, index) => {
        if (item.key[1].split('.')[1] == 'cash'
          || item.key[1].split('.')[1] == 'bank'
          || item.key[1].split('.')[1] == 'check') {
          if (result[index].value > 0) {
            cashflowIncome += result[index].value;
          } else {
            cashflowExpense -= result[index].value;
          }
        }
        if (item.key[1].split('.')[1] == 'income') {

          // if (result[index].value > 0) {
            console.log("value+", result[index]);
            resultIncome -= result[index].value;
          // } else {
          //   console.log("value-", result[index]);
            // resultIncome += result[index].value;
          // }
          console.log("resultIncome", resultIncome);
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
    })
  }

  computeSaleValues() {
    let self = this;
    this.pouchdbService.getView(
      'Informes/VentaDiaria',
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
      this.sold = sold;
      this.sale_margin = sale_margin;
      this.sale_margin_percent = (sale_margin / sold) * 100;
      this.sale_cash = cash_payment;
      this.sale_credit = credit_payment;
    });
  }

  computeServiceValues() {
    let self = this;
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
    });
  }

  computeToReceiveValues() {
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
    });
  }

  computePurchaseValues() {
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
    });
  }

  computeToPayValues() {
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
    });
  }

  recomputeValues() {
    this.computeSaleValues();
    this.computeServiceValues();
    this.computeToReceiveValues();
    this.computePurchaseValues();
    this.computeToPayValues();
    this.computeResultValues();
    this.loading.dismiss();
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

  setFilteredItems() {
    this.reportsService.getReportsPage(
      this.searchTerm, this.page
    ).then((reports) => {
      this.reports = reports;
      this.page = 0;
      this.recomputeValues();
    });
  }

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
      'startkey': [this.reportsForm.value.dateStart.split('T')[0], '0'],
      'endkey': [this.reportsForm.value.dateEnd.split('T')[0], 'z']
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
    let period = end_date - start_date;
    this.reportsForm.patchValue({
      dateStart: new Date(start_date - period).toJSON(),
      dateEnd: new Date(end_date - period).toJSON(),
    })
    this.recomputeValues();
  }

  goPeriodForward() {
    let start_date = new Date(this.reportsForm.value.dateStart).getTime();
    let end_date = new Date(this.reportsForm.value.dateEnd).getTime();
    let period = end_date - start_date;
    this.reportsForm.patchValue({
      dateStart: new Date(start_date + period).toJSON(),
      dateEnd: new Date(end_date + period).toJSON(),
    })
    this.recomputeValues();
  }
}

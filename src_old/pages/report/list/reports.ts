import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController , Events, NavParams  } from '@ionic/angular';
import { ReportPage } from '../report';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ResultPage } from '../result/result';
import { ViewPage } from '../view/view';
import { BalancePage } from '../balance/balance';
import { AccountsReportPage } from '../accounts/accounts';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { ReportsService } from './reports.service';
import { ReportsPopover } from './reports.popover';

import { PlannedListPage } from '../../planned/list/planned-list';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

import { ReportSalePage } from '../sale/report-sale';
import { ReportPurchasePage } from '../purchase/report-purchase';
import { ProductService } from '../../product/product.service';
import { ReportService } from '../report.service';
import { CashFlowPage } from '../cashflow/cashflow';
import * as d3 from 'd3';

@Component({
  selector: 'reports-page',
  templateUrl: 'reports.html'
})
export class ReportsPage {
  reports: any;
  loading: any;
  reportsForm: FormGroup;
  searchTerm: string = '';
  items = [];
  page = 0;
  has_search = false;
  select: boolean;
  today: any;
  sold = 0;
  sale_margin = 0;
  sale_margin_percent = 0;
  sale_pie_payments = [];
  sale_pie_products = [];
  toReceive = 0;
  // toReceiveDued = 0;
  // toReceiveWillDue = 0;
  // toReceiveDefault = 0;
  received = 0;
  purchased = 0;
  purchased_pie_payments = [];
  ToPay = 0;
  ToPayDued = 0;
  ToPayWillDue = 0;
  ToPayDefault = 0;
  paid = 0;
  service_total = 0;
  service_margin = 0;
  service_margin_percent = 0;
  receivedTable = [];
  cashflowIncome = 0;
  cashflowExpense = 0;
  paidTable = [];
  resultIncome = 0;
  resultExpense = 0;
  balanceAtive = 0;
  balancePassive = 0;
  _current: any;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public reportsService: ReportsService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public pouchdbService: PouchdbService,
    public productService: ProductService,
    public reportService: ReportService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select')  ;
    this.today = new Date().toISOString();
  }

  drawPurchasePie() {

    let self = this;
    var dataset = this.purchased_pie_payments;
    var width = 80;
    var height = 50;

    var radius = 40;

    var legendRectSize = 10; // defines the size of the colored squares in legend
    var legendSpacing = 10;

    let color:any = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

    if (d3.select("#purchaseChart").select('svg').nodes()[0]) {
      let node: any = d3.select("#purchaseChart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select('#purchaseChart')
      .append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 1) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

    var arc: any = d3.arc().innerRadius(0).outerRadius(radius);

    var pie = d3.pie() // start and end angles of the segments
      .value((d: any) => { return d.total; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // define tooltip
    var tooltip = d3.select('#purchaseChart') // select element in the DOM with id 'chart'
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
      .attr('fill', function(d:any) { return color(d.data.name); }) // use color scale to define fill of each label in dataset
      .each(function(d:any) { self._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', function(d:any) {  // when mouse enters div
      var total = d3.sum(dataset.map(function(d) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      var percent = Math.round(1000 * d.data.total / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.name); // set current label
      tooltip.select('.count').html('$' + d.data.total); // set current count
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
    var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing
        var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
        var horz = 50; // the legend is shifted to the left to make room for the text
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
        var totalEnabled = d3.sum(dataset.map(function(d) { // can't disable all options
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
          .attrTween('d', function(d:any) { // 'd' specifies the d attribute that we'll be animating
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
      .text(function(d:any) { return d; }); // return label
  }

  drawPie() {

    let self = this;
    var dataset = this.sale_pie_payments;
    var width = 80;
    var height = 50;

    var radius = 40;

    var legendRectSize = 10; // defines the size of the colored squares in legend
    var legendSpacing = 10;

    let color:any = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

    if (d3.select("#reportsSalePieChart").select('svg').nodes()[0]) {
      let node: any = d3.select("#reportsSalePieChart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select('#reportsSalePieChart')
      .append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 1) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

    var arc:any = d3.arc()
      .innerRadius(0) // none for pie chart
      .outerRadius(radius); // size of overall chart

    var pie = d3.pie() // start and end angles of the segments
      .value(function(d:any) { return d.total; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // define tooltip
    var tooltip = d3.select('#reportsSalePieChart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'count'); // add class 'count' on the selection
    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'percent'); // add class 'percent' on the selection

    dataset.forEach(function(d:any) {
      d.total = +d.total; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
    });

    // creating the chart
    var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', function(d:any) { return color(d.data.name); }) // use color scale to define fill of each label in dataset
      .each(function(d:any) { self._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', function(d:any) {  // when mouse enters div
      var total = d3.sum(dataset.map(function(d) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      var percent = Math.round(1000 * d.data.total / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.name); // set current label
      tooltip.select('.count').html('$' + d.data.total); // set current count
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
    var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing
        var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
        var horz = 50; // the legend is shifted to the left to make room for the text
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
        var totalEnabled = d3.sum(dataset.map(function(d) { // can't disable all options
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
          .attrTween('d', function(d:any) { // 'd' specifies the d attribute that we'll be animating
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
      .text(function(d:any) { return d; }); // return label
  }

  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }

  doInfinite(infiniteScroll) {
    //console.log('Begin async operation');
    setTimeout(() => {
      this.reportsService.getReportsPage(this.searchTerm, this.page).then((reports: any[]) => {
        //console.log("reports", reports);
        reports.forEach(report => {
          this.reports.push(report);
        });
        this.page += 1;
      });
      //console.log('Async operation has ended');
      infiniteScroll.target.complete();
    }, 200);
  }

  // doRefresh(refresher) {
  //   //console.log('Begin async operation', refresher);
  //   setTimeout(() => {
  //     //console.log('Async operation has ended');
  //     this.reportsService.getReportsPage(this.searchTerm, 0).then((reports: any[]) => {
  //       //console.log("reports", reports);
  //       this.reports = reports;
  //       this.page = 0;
  //       this.recomputeValues();
  //       refresher.target.complete();
  //     });
  //   }, 500);
  // }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(ReportsPopover);
    popover.present({
      ev: myEvent
    });
  }

  getMonth(month) {
    if (month == '01'){
      return "Enero";
    } else if (month == '02'){
      return "Febrero";
    } else if (month == '03'){
      return "Marzo";
    } else if (month == '04'){
      return "Abril";
    } else if (month == '05'){
      return "Mayo";
    } else if (month == '06'){
      return "Junio";
    } else if (month == '07'){
      return "Julio";
    } else if (month == '08'){
      return "Agosto";
    } else if (month == '09'){
      return "Septiembre";
    } else if (month == '10'){
      return "Octubre";
    } else if (month == '11'){
      return "Noviembre";
    } else if (month == '12'){
      return "Diciembre";
    }
  }

  ionViewWillLoad() {
    //var today = new Date().toISOString();
    this.reportsForm = this.formBuilder.group({
      dateStart: new FormControl(this.navParams.data.dateStart||this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.navParams.data.dateEnd||this.getEndOfMonth()),
      sales: new FormControl(0),
      purchases: new FormControl(0),
    });
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  getEndOfMonth() {
    var today = new Date();
    // var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
    return new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString();
  }

  ionViewDidLoad() {
    //this.loading.present();
    setTimeout(() => {
      this.recomputeValues();
    }, 500);
    this.startFilteredItems();
  }

  computeResultValues() {
    this.pouchdbService.getView('stock/ResultadoDiario', 3, [this.reportsForm.value.dateStart.split("T")[0],"0","0"], [this.reportsForm.value.dateEnd.split("T")[0],"z","z"]).then((result: any[]) => {
      console.log("resultado1", result);
      let prom = [];
      // console.log("resultDay", result);
      result.forEach(item =>{
        prom.push(this.pouchdbService.getDoc(item.key[1]));
        // console.log("id", item.key[1], item.value);
      })
      Promise.all(prom).then(items=>{
        let resultIncome = 0;
        let resultExpense = 0;
        let cashflowIncome = 0;
        let cashflowExpense = 0;
        items.forEach((item, index)=>{
          // console.log("type", item.type, result[index].value, result[index].key, item);
          if (item.type == 'liquidity'){
            console.log("Conta", item.name, result[index].value);
            if (result[index].value > 0){
              cashflowIncome += result[index].value;
            } else {
              cashflowExpense -= result[index].value;
            }
          }
          if (item.type == 'income'){
            console.log("Income", item.name, result[index].value);
            // resultIncome += result[index].value;
            if (result[index].value < 0){
              resultIncome -= result[index].value;
            } else {
              resultIncome += result[index].value;
            }
          }
          if (item.type == 'expense'){
            // console.log("Expense", item.name, result[index].value);
            // console.log("Conta", item.name, result[index].value);
            if (result[index].value > 0){
              resultExpense += result[index].value;
            } else {
              resultExpense -= result[index].value;
            }
          }
        })
        this.resultIncome = resultIncome;
        this.resultExpense = resultExpense;

        this.cashflowIncome = cashflowIncome;
        this.cashflowExpense = cashflowExpense;

      })
    });
    //
    // let promise_ids = [];
    // promise_ids.push(
    //   this.reportService.getSaleReport(
    //     this.reportsForm.value.dateStart,
    //     this.reportsForm.value.dateEnd
    //   )
    // );
    // promise_ids.push(
    //   this.reportService.getServiceReport(
    //     this.reportsForm.value.dateStart,
    //     this.reportsForm.value.dateEnd
    //   )
    // );
    // promise_ids.push(
    //   this.reportService.getCashMoveReport(
    //     this.reportsForm.value.dateStart,
    //     this.reportsForm.value.dateEnd
    //   )
    // );
    // promise_ids.push(
    //   this.reportService.getInvoiceReport(
    //     this.reportsForm.value.dateStart,
    //     this.reportsForm.value.dateEnd,
    //     "out"
    //   )
    // );
    //
    // Promise.all(promise_ids).then(data => {
    //   this.resultIncome = data[0]['total'] + data[1] + data[2]['incomeFinance'];
    //   devoluciones + cmv +
    //   this.resultExpense = data[0]['returns'] +
    //   data[0]['cost'] + data[2]['expenseFinance'] +
    //   data[2]['admin'] + data[2]['depre'] + data[2]['other'] - data[3];
    // });
  }

  // computeBalanceValues() {
  //   let promise_ids = [];
  //   promise_ids.push(this.reportService.getCashReport());
  //   promise_ids.push(this.reportService.getStockReport());
  //   promise_ids.push(this.reportService.getPlannedReport());
  //   promise_ids.push(this.reportService.getAssetReport());
  //
  //   Promise.all(promise_ids).then(data => {
  //     this.balanceAtive = data[0]['cash'] + data[0]['bank'] +
  //     data[0]['check'] + data[3]['vehicle']+ data[3]['furniture'] +
  //     data[2]['income'] + data[1]['inventory'];
  //     this.balancePassive = data[2]['expense'];
  //   });
  // }

  computeSaleValues(){
    let self = this;
    this.pouchdbService.searchDocTypeAllData('sale', '', false).then((sales1: any[]) => {
      let sales = sales1
      .filter(word => word.date >= this.reportsForm.value.dateStart)
      .filter(word => word.date <= this.reportsForm.value.dateEnd);
      let sold = 0;
      let sale_margin = 0;
      let cash_payment = 0;
      let credit_payment = 0;
      let products = {}
      sales.forEach(sale => {
        sold += parseFloat(sale.total);
        if (sale.pay_cond_id == "payment-condition.cash"){
          cash_payment += parseFloat(sale.total);
        } else {
          credit_payment += parseFloat(sale.total);
        }
        // console.log("sale", sale);
        sale['lines'].forEach((line:any) => {
          sale_margin += (parseFloat(line.price||0)-parseFloat(line.cost||0))*parseFloat(line.quantity);
          if (products.hasOwnProperty(line.product_id)) {
            products[line.product_id]['total'] += line.price * line.quantity;
          } else {
            products[line.product_id] = {
              'product_id': line.product_id,
              'total': line.price * line.quantity,
            }
          }
        })
      });
      this.sold = sold;
      this.sale_margin = sale_margin;
      this.sale_margin_percent = (sale_margin/sold)*100;
      this.sale_pie_payments = [
        {"name": "Al Contado", "total": cash_payment},
        {"name": "Credito", "total": credit_payment},
      ]
      // let items = [];
      let promise_ids = [];
      Object.keys(products).forEach(product_id => {
        promise_ids.push(this.productService.getProduct(product_id));
      });



      Promise.all(promise_ids).then(products_data => {
        let aoutput = []
        products_data.forEach(product => {
          if (products[product._id].total > 0){
            aoutput.push({
              'name': product.name,
              'total': products[product._id].total,
            })
          }
        });
        let output = aoutput.sort(function(a, b) {
          return self.compare(a, b, 'total');
        })
        this.sale_pie_products = output;
        this.drawSaleBars();

      });

      this.drawPie();
      this.drawServicePie();
    });
  }
  computeToReceiveValues(){
    this.pouchdbService.getView(
      'stock/A Cobrar', 0,
      ['0', '0'],
      ['z', 'z']
    ).then((view: any[]) => {
      console.log("A Cobrar111", view);
      let total = 0;
      view.forEach(data=>{
        total += data.value;
      });
      this.toReceive = total;
    });
  }

  computeReceivedValues(){
    this.pouchdbService.getDocType('cash-move').then((sales1: any[]) => {
      let sales = sales1
      // .filter(word => word.signal == "+")
      .filter(word => word.date >= this.reportsForm.value.dateStart)
      .filter(word => word.date <= this.reportsForm.value.dateEnd);
      // let items = [];

      let array = [];
      let promise_ids = [];
      let income = 0;
      let expense = 0;
      //console.log("here");
      sales.forEach(cashMove => {
        if (cashMove.signal == "+"){
          income += parseFloat(cashMove.amount);
        } else {
          expense += parseFloat(cashMove.amount);
        }
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

        let items = [];
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
        this.receivedTable = output;
        console.log("output", output);
        // this.cashflowIncome = income;
        // this.cashflowExpense = expense;
        // resolve(output);
      })
    })
  }
  computePurchaseValues(){
    this.pouchdbService.searchDocTypeAllData('purchase', '', false).then((sales1: any[]) => {
      let sales = sales1
      .filter(word => word.date >= this.reportsForm.value.dateStart)
      .filter(word => word.date <= this.reportsForm.value.dateEnd);
      let sold = 0;
      let cash_payment = 0;
      let credit_payment = 0;
      // let products = {}
      sales.forEach(sale => {
        sold += parseFloat(sale.total);
        if (sale.pay_cond_id == "payment-condition.cash"){
          cash_payment += parseFloat(sale.total);
        } else {
          credit_payment += parseFloat(sale.total);
        }
      });
      this.purchased = sold;
      this.purchased_pie_payments = [
        {"name": "Al Contado", "total": cash_payment},
        {"name": "Credito", "total": credit_payment},
      ]
      this.drawPurchasePie();
    });
  }
  // computeToPayValues(){
  //   this.pouchdbService.searchDocTypeAllData('planned', '', false).then((sales1: any[]) => {
  //     //console.log("planned", sales1);
  //     let sales = sales1
  //     // .filter(word => word.date >= this.reportsForm.value.dateStart)
  //     // .filter(word => word.date <= this.reportsForm.value.dateEnd)
  //     .filter(word => word.state != "PAID")
  //     .filter(word => word.signal == "-");
  //     let ToPay = 0;
  //     let ToPayDued = 0;
  //     let ToPayWillDue = 0;
  //     sales.forEach(sale => {
  //       ToPay += parseFloat(sale.amount_residual);
  //       if (sale.date < this.today){
  //         ToPay += parseFloat(sale.amount_residual);
  //         ToPayDued += parseFloat(sale.amount_residual);
  //       } else {
  //         ToPayWillDue += parseFloat(sale.amount_residual);
  //       }
  //     });
  //     this.ToPay = ToPay;
  //     this.ToPayDued = ToPayDued;
  //     this.ToPayWillDue = ToPayWillDue;
  //     this.ToPayDefault = 100*ToPayDued/ToPay;
  //   });
  // }
  computeToPayValues(){
    this.pouchdbService.getView(
      'stock/A Pagar', 0,
      ['0', '0'],
      ['z', 'z']
    ).then((view: any[]) => {
      console.log("A Pagar", view);
      // this.ToPay = view[0] && view[0].value || 0;
      let total = 0;
      view.forEach(data=>{
        total += data.value;
      });
      this.ToPay = total;
    });
  }
  computePaidValues(){
    this.pouchdbService.getDocType('cash-move').then((sales1: any[]) => {
      let sales = sales1
      .filter(word => word.signal == "-")
      .filter(word => word.date >= this.reportsForm.value.dateStart)
      .filter(word => word.date <= this.reportsForm.value.dateEnd);
      // let items = [];

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

        let items = [];
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
        this.paidTable = output;
        console.log("output", output);
        // resolve(output);
      })
    })
  }
  computeServiceValues(){
    this.pouchdbService.searchDocTypeAllData('service', '', false).then((sales1: any[]) => {
      //console.log("cashMove", sales1);
      let sales = sales1
      .filter(word => word.date >= this.reportsForm.value.dateStart)
      .filter(word => word.date <= this.reportsForm.value.dateEnd);
      let toReceive = 0;
      sales.forEach(sale => {
        toReceive += parseFloat(sale.total);
      });
      this.paid = toReceive;
      this.service_total = toReceive;
    });
  }
  recomputeValues() {
    this.computeSaleValues();
    this.computeServiceValues();
    this.computeToReceiveValues();
    this.computeReceivedValues();
    this.computePurchaseValues();
    this.computeToPayValues();
    this.computePaidValues();
    this.computeResultValues();
    // this.computeBalanceValues();
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

  startFilteredItems() {
    //console.log("setFilteredItems");
    this.reportsService.getReportsPage(this.searchTerm, 0).then((reports) => {
      //console.log("reports", reports);
      this.reports = reports;
      this.page = 0;
      this.recomputeValues();
      //this.loading.dismiss();
    });
  }

  setFilteredItems() {
    //console.log("setFilteredItems");
    this.reportsService.getReportsPage(this.searchTerm, this.page).then((reports) => {
      //console.log("reports", reports);
      this.reports = reports;
      //this.page += 1;
    });
  }

  doRefreshList() {
    ////console.log('Begin async operation', refresher);
    setTimeout(() => {
      //console.log('Async operation has ended');
      this.reportsService.getReportsPage(this.searchTerm, 0).then((reports: any[]) => {
        //console.log("reports", reports);
        this.reports = reports;
        this.page = 0;
        this.recomputeValues();
      });
      //refresher.target.complete();
    }, 200);
  }

  showReportSale(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportSalePage, {
      'reportType': "sale",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportBalancete(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ViewPage, {reportView: 'stock/Contas'});
  }

  // showReportPurchase(){
  //   let newRootNav = <NavController>this.app.getRootNavById('n4');
  //   newRootNav.push(ReportPurchasePage, {
  //     'reportType': "purchase",
  //     'dateStart': this.reportsForm.value.dateStart,
  //     'dateEnd': this.reportsForm.value.dateEnd,
  //   });
  // }
  showReportPurchase(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportPurchasePage, {
      'reportType': "purchase",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportToPay(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PlannedListPage, {
      "signal": "-",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportToReceive(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(PlannedListPage, {
      "signal": "+",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportPaid(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportPage, {
      'reportType': "paid",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportReceived(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportPage, {
      'reportType': "received",
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportCashFlow(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CashFlowPage, {'reportType': "received"});
    newRootNav.push(ViewPage, {reportView: 'stock/Fluxo'});

  }

  showReportResult(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ResultPage, {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportBalance(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(BalancePage, {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  showReportAccounts(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(AccountsReportPage, {
      'dateStart': this.reportsForm.value.dateStart,
      'dateEnd': this.reportsForm.value.dateEnd,
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.recomputeValues();
      refresher.target.complete();
    }, 500);
  }

  openReport(report) {
    this.events.subscribe('open-report', (data) => {
      this.events.unsubscribe('open-report');
      this.doRefreshList();
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportPage,{'_id': report._id});
  }

  createReport(){
    this.events.subscribe('create-report', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-report', data);
        });
      }
      this.events.unsubscribe('create-report');
      this.doRefreshList();
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ReportPage, {});
  }

  deleteReport(report){
    this.reportsService.deleteReport(report);
    this.doRefreshList();
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


  drawServicePie() {

    let self = this;
    var dataset = [
      {"name": "Al Contado", "total": 2000},
      {"name": "Credito", "total": 3000},
    ];
    var width = 80;
    var height = 50;

    var radius = 40;

    var legendRectSize = 10; // defines the size of the colored squares in legend
    var legendSpacing = 10;

    let color:any = d3.scaleOrdinal()
      .range(d3.schemeCategory10);

    if (d3.select("#serviceChart").select('svg').nodes()[0]) {
      let node: any = d3.select("#serviceChart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select('#serviceChart')
      .append('svg')
      .attr('width', "100%")
      .attr('height', "100%")
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 1) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

    var arc:any = d3.arc()
      .innerRadius(0) // none for pie chart
      .outerRadius(radius); // size of overall chart

    var pie:any = d3.pie() // start and end angles of the segments
      .value(function(d: any) { return d.total; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

    // define tooltip
    var tooltip = d3.select('#serviceChart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'count'); // add class 'count' on the selection
    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'percent'); // add class 'percent' on the selection

    dataset.forEach(function(d:any) {
      d.total = +d.total; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
    });

    // creating the chart
    var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', function(d:any) { return color(d.data.name); }) // use color scale to define fill of each label in dataset
      .each(function(d:any) { self._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', function(d:any) {  // when mouse enters div
      var total = d3.sum(dataset.map(function(d:any) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      var percent = Math.round(1000 * d.data.total / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.name); // set current label
      tooltip.select('.count').html('$' + d.data.total); // set current count
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
    var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing
        var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements
        var horz = 50; // the legend is shifted to the left to make room for the text
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

        pie.value(function(d) {
          if (d.name === label) d.enabled = enabled; // if entry label matches legend label
          return (d.enabled) ? d.total : 0; // update enabled property and return count or 0 based on the entry's status
        });

        path = path.data(pie(dataset)); // update pie with new data

        path.transition() // transition of redrawn pie
          .duration(750) //
          .attrTween('d', function(d:any) { // 'd' specifies the d attribute that we'll be animating
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
      .text(function(d:any) { return d; }); // return label
  }

  drawSaleBars() {
    // let self = this;
    let color:any = d3.scaleOrdinal()
      .range(d3.schemeCategory10);
    var dataset = this.sale_pie_products.slice(0, 5);
    // var dataset = [
    //   {"name": "Rebinboca", "total": 8000},
    //   {"name": "Parafuseta", "total": 7000},
    //   {"name": "Maquina Fotografica", "total": 5000},
    //   {"name": "Tenis", "total": 3000},
    //   {"name": "Oculos", "total": 2000},
    // ];
    var width = 80;
    var height = 50;


    // var legendRectSize = 5; // defines the size of the colored squares in legend
    // var legendSpacing = 4;

    if (d3.select("#reportsSaleBarChart").select('svg').nodes()[0]) {
      let node: any = d3.select("#reportsSaleBarChart").select('svg').nodes()[0];
      node.remove();
    }
    var svg = d3.select("#reportsSaleBarChart")
      .append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      // .attr("transform", function(d) {
      //   return "rotate(90)"
      // })
      .append('g')
      .attr('transform', 'translate(' + -50 + ',' + (height / 2) + ')');

    //Init axis
    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    let y = d3.scaleLinear().rangeRound([height, 0]);
    x.domain(dataset.map((d: any) => d.name));
    y.domain([0, d3.max(dataset, (d: any) => d.total)]);

    // define tooltip
    var tooltip = d3.select('#reportsSaleBarChart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'count'); // add class 'count' on the selection

    tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'percent'); // add class 'percent' on the selection

    var path = svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("g");
      // .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")";

    path.append("rect")
      .attr("class", "bar")
      .attr("y", (d) => x(d.name)-25)
      .attr("x", (d) => y(0))
      .attr("height", x.bandwidth())
      .style("fill", (d: any) => color(d.name))
      .attr("width", (d) => width - y(d.total));

    path.append("text")
    .attr("y", (d) => x(d.name)-25)
    .attr("x", (d) => y(0))
    .attr("dy", "1em")
    .attr("dx", "1em")
    .attr("font-size", 10)
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text(function(d) { return d.total; });

    path.append("text")
    .attr("y", (d) => x(d.name)-25)
    .attr("x", (d) => y(-d.total)+35)
    .attr("dy", ".9em")
    .attr("font-size", 12)
    .text(function(d) { return d.name; });

    path.on('mouseover', function(d) {  // when mouse enters div
      d3.sum(dataset.map(function(d) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      tooltip.select('.label').html(d.name); // set current label
      tooltip.select('.count').html('$' + d.total); // set current count
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

  goPeriodBack(){
    let start_date = new Date(this.reportsForm.value.dateStart).getTime();
    let end_date = new Date(this.reportsForm.value.dateEnd).getTime();
    let period = end_date - start_date;
    this.reportsForm.patchValue({
      dateStart: new Date(start_date - period).toJSON(),
      dateEnd: new Date(end_date - period).toJSON(),
    })
    this.recomputeValues();
  }

  goPeriodForward(){
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

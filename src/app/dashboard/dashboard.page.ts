import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { DashboardService } from './dashboard.service';
import { RestProvider } from "../services/rest/rest";
// import { CurrencyListPage } from '../currency/list/currency-list';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
// import { AdvancePage } from '../advance/advance';
// import { SalaryPage } from '../salary/salary';
import { DashboardFilterPage} from '../dashboard-filter/dashboard-filter.page';
// import { DashboardGroupPage} from './group/group';
import { FormatService } from '../services/format.service';

import * as d3 from 'd3';

// import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";

import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild('name') name;
  @ViewChild('view') view;

    dashboardForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    _id: string;
    opened: boolean = false;
    value: number = 0;
    list: any[] = [];
    line_show: boolean = false;
    bar_show: boolean = false;
    pie_show: boolean = false;
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
    viewList: any[] = [];

    fields: any[] = [];
    field_value: any = {};

    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public dashboardService: DashboardService,
      public restProvider: RestProvider,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
      public pouchdbService: PouchdbService,
      public formatService: FormatService,
      public events: Events,
    ) {
      this.languages = this.languageService.getLanguages();
      this._id = this.route.snapshot.paramMap.get('_id');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
    }

    async ngOnInit() {
      this.dashboardForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        view: new FormControl(''),
        section: new FormControl('table'),
        filters: new FormControl([]),
        groupBy: new FormControl(''),
        sortBy: new FormControl('value_decrease'),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      let config:any = (await this.pouchdbService.getDoc('config.profile'));
      this.currency_precision = config.currency_precision;
      this.pouchdbService.getIntervalList('_design', '_design0').then((docs: any) =>{
        // console.log("docs", docs);
        docs.forEach((item: any)=>{
          Object.keys(item.doc.views).forEach((view)=>{
            // console.log("item.doc", view);
            this.viewList.push(item.key.split('/')[1]+'/'+view);
          })
        })
        // console.log("viewList", this.viewList);
      })
      //this.loading.present();
      if (this._id){
        this.dashboardService.getDashboard(this._id).then((data) => {
          this.dashboardForm.patchValue(data);
          if (this.dashboardForm.value.view){
            this.getReport();
          }
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
    }

    changeSection(){
      // console.log("form", this.dashboardForm.value.section);
      let tab = this.dashboardForm.value.section;
      if (tab == 'line'){
        setTimeout(() => {
          this.drawNewLine(this.list);
          this.line_show = true;
        }, 50);
      }
      else if (tab == 'bar'){
        setTimeout(() => {
          this.drawNewBar(this.list);
          this.bar_show = true;
        }, 50);
      }
      else if (tab == 'pie'){
        setTimeout(() => {
          this.drawPie(this.list);
          this.pie_show = true;
        }, 50);
      }

    }

    goNextStep() {
      // if (!this.dashboardForm.value.name){
      //   this.name.setFocus();
      // }
      // else if (!this.dashboardForm.value.view){
      //   this.view.setFocus();
      // }
      // else {
        // this.justSave();
        this.getReport();

      // }
    }

    getFields(list){
      this.fields = [];
      this.field_value = {};
      list.forEach((item: any)=>{
        Object.keys(item.doc).forEach((field)=>{
          if (this.fields.indexOf(field) == -1){
            this.fields.push(field);
            this.field_value[field] = {'list': [item.doc[field]]};
          } else {
            if (this.field_value[field]['list'].indexOf(item.doc[field]) == -1){
              this.field_value[field]['list'].push(item.doc[field]);
            }
          }
        })
      })
    }

    justSave() {
      if (this._id){
        this.dashboardService.updateDashboard(this.dashboardForm.value);
        this.dashboardForm.markAsPristine();
      } else {
        this.dashboardService.createDashboard(this.dashboardForm.value).then((doc: any) => {
          this.dashboardForm.patchValue({
            _id: doc.id,
          });
          this._id = doc.id;
          this.dashboardForm.markAsPristine();
        });
      }
    }

    buttonSave() {
      if (this._id){
        this.dashboardService.updateDashboard(this.dashboardForm.value);
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('open-dashboard', this.dashboardForm.value);
        // });
      } else {
        this.dashboardService.createDashboard(this.dashboardForm.value).then((doc: any) => {
          this.dashboardForm.patchValue({
            _id: doc.id,
          });
          this._id = doc.id;
          // this.navCtrl.navigateBack().then(() => {
            this.events.publish('create-dashboard', this.dashboardForm.value);
          // });
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

    getReport(){
      this.pouchdbService.getView(
        this.dashboardForm.value.view,
        1,
        undefined,
        undefined,
        false,
        false,
        undefined,
        undefined,
        true,
        undefined
      ).then((result: any[]) => {
        result.forEach((item:any)=>{
          item.doc.date = item.doc.date.split("T")[0];
        })
        this.list = result;
        this.getFields(this.list);
        this.dashboardForm.value.filters.forEach((filter: any)=>{
            let list = this.filter(this.list, filter.field, filter.comparation, filter.value)
            this.list = list;
        })
        if (this.dashboardForm.value.groupBy != ''){
         let dict = this.groupBy(this.list, this.dashboardForm.value.groupBy, 'value');
         let list = [];
         Object.keys(dict).forEach((item: any)=>{
           list.push({
              key: item,
              value: dict[item].value,
            })
          })
          this.list = list;
        }
        this.value = this.sum(this.list);
        this.list = this.sortBy(this.list, this.dashboardForm.value.sortBy);
        this.drawNewLine(this.list);
        this.drawNewBar(this.list);
        this.drawPie(this.list);

      });
    }

    sortBy(result, prop){
      let list = [];
      let self = this;
      switch(prop){
        case 'value_decrease':
          list = result.sort(function(a, b) {
            return self.formatService.compareField(a, b, 'value', 'decrease');
          });
        break;
        case 'value_increase':
          list = result.sort(function(a, b) {
            return self.formatService.compareField(a, b, 'value', 'increase');
          });
        break;
        case 'key_decrease':
          list = result.sort(function(a, b) {
            return self.formatService.compareField(a, b, 'key', 'decrease');
          });
        break;
        case 'key_increase':
          list = result.sort(function(a, b) {
            return self.formatService.compareField(a, b, 'key', 'increase');
          });
        break;
      }
      return list;
    }

    onSubmit(values){
      //console.log("teste", values);
    }

    sum(result){
      let list = result.reduce((accumulator, item) => {
         return accumulator + parseFloat(item.value)
      }, 0);
      return list
    }

    groupBy(result, prop, sum) {
      return result.reduce((lines, item) => {
        let val = item.doc[prop]
        lines[val] = lines[val] || {}
        lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
        lines[val][sum] += parseFloat(item[sum])
        // lines[val]['list'] = lines[val]['list'] || []
        // lines[val]['list'].push(item)
        return lines
      }, {})
    }

    // groupBy1(result, prop, sum) {
    //   return result.reduce((lines, item) => {
    //     const val = item.doc[prop]
    //     lines[val] = lines[val] || {}
    //     lines[val][sum] = lines[val][sum] && parseFloat(lines[val][sum]) || 0
    //     lines[val][sum] += parseFloat(item[sum])
    //     lines[val]['list'] = lines[val]['list'] || []
    //     lines[val]['list'].push(item)
    //     return lines
    //   }, {})
    // }

    filter(result, prop, comparation, value) {
      let list = [];
      switch(comparation){
        case '==':
          list = result.filter(item=> item.doc[prop] == value);
        break;
        case '!=':
          list = result.filter(item=> item.doc[prop] != value);
        break;
        case '>=':
          list = result.filter(item=> item.doc[prop] >= value);
        break;
        case '<=':
          list = result.filter(item=> item.doc[prop] <= value);
        break;
        case '>':
          list = result.filter(item=> item.doc[prop] > value);
        break;
        case '<':
          list = result.filter(item=> item.doc[prop] < value);
        break;
        case 'contains':
          list = result.filter(item => item.doc[prop].toString().search(new RegExp(value, "i")) != -1);
        break;
      }
      return list;
    }


    async addFilter(){
      // if (this.serviceForm.value.state=='QUOTATION'){
        let profileModal = await this.modalCtrl.create({
          component: DashboardFilterPage,
          componentProps: {fields: this.fields, field_value: this.field_value}
        });
        profileModal.present();
        let data = profileModal.onDidDismiss();
          //console.log(data);
          if (data) {
            this.dashboardForm.value.filters.push(data)
            this.getReport()
          }
        // });
      // }
    }

    async openFilter(item){
      let fie = Object.assign({}, item);
      fie.fields = this.fields;
      fie.field_value = this.field_value;

      let profileModal = await this.modalCtrl.create({
        component: DashboardFilterPage,
        componentProps: fie
      });
      profileModal.present();
      let data: any = profileModal.onDidDismiss()
        if (data) {
          // this.dashboardForm.value.filters.unshift(data)
          item.field = data.field;
          item.comparation = data.comparation;
          item.value = data.value;
          // item = data;
          this.getReport()
        }
      // });
    }

    deleteFilter(item){
      let index = this.dashboardForm.value.filters.indexOf(item)
      this.dashboardForm.value.filters.splice(index, 1);
      this.goNextStep();
    }

    drawNewLine(list) {

      let states = [
        {
          "name": "Ventas",
          "color": d3.schemeCategory10[1],
          "current": 30,
          "history": []
        }
      ];
      let start_date = list[0].key;
      let end_date = start_date;
      let max = 0;
      list.forEach((item: any)=>{
        states[0].history.push({
          'date': item.key,
          'total': item.value,
        })
        end_date = item.key
        if (item.value > max){
          max = item.value;
        }
      })
      let start_year = parseInt(start_date.split('-')[0]);
      let start_month = parseInt(start_date.split('-')[1]);
      let start_day = parseInt(start_date.split('-')[2]);
      let end_year = parseInt(end_date.split('-')[0]);
      let end_month = parseInt(end_date.split('-')[1]);
      let end_day = parseInt(end_date.split('-')[2]);

      const margin = { top: 40, right: 5, bottom: 30, left: 30 };
      const width = 330 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;


      var bisectDate = d3.bisector(function(d: any) { return new Date(d.date); }).right,
        dateFormatter = d3.timeFormat("%d/%m/%y");

      let x = d3.scaleTime()
        .domain([
          new Date(start_year, start_month - 1, start_day),
          new Date(end_year, end_month - 1, end_day)
        ])
        .range([0, width]);

      const y = d3.scaleLinear().domain([0, max]).range([height, 0]);
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
            return self.formatService.compareField(a, b, "date");
          })
          // console.log("d3.event.pageX", d3.event.pageX);
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
            return self.formatService.compareField(a, b, "date");
          })
          // console.log("d3.event.pageX", d3.event.pageX);
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
    }

    drawNewBar(list) {
      let self = this;
      var dataset = [];
      let max = 0;
      list.forEach((item: any)=>{
        dataset.push({
          'name': item.key,
          'total': item.value,
        })
        if (item.value > max){
          max = item.value;
        }
      })
      var width = 420;
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
        .attr('transform', 'translate(' + 50 + ',' + 10 + ')');

      //Init axis
      this.x = d3Scale.scaleBand().rangeRound([0, 400]).padding(0.1);
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
        .data(dataset)
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

    drawPie(list) {
      let self = this;
      var dataset = [];
      let max = 0;
      list.forEach((item: any)=>{
        dataset.push({
          'name': item.key,
          'total': item.value,
        })
        if (item.value > max){
          max = item.value;
        }
      })
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

}

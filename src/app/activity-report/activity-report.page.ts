import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController, Events,
  ModalController, ToastController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from '../product/product.service';
import { FormatService } from '../services/format.service';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CropsPage } from '../crops/crops.page';
import { AreasPage } from '../areas/areas.page';
import { InputsPage } from '../inputs/inputs.page';
import { MachinesPage } from '../machines/machines.page';
import { ActivitysPage } from '../activitys/activitys.page';
import { ActivityReportPopover } from './activity-report.popover';

import * as d3 from 'd3';
// import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Shape from "d3-shape";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";

@Component({
  selector: 'app-activity-report',
  templateUrl: './activity-report.page.html',
  styleUrls: ['./activity-report.page.scss'],
})
export class ActivityReportPage implements OnInit {
  @ViewChild('select', { static: false }) select;

  reportActivityForm: FormGroup;
  loading: any;
  today: any;
  _id: string;
  avoidAlertMessage: boolean;
  items_product_total;
  items_margin;
  crop_area;
  full_area;
  items_quantity;
  total;
  planned;
  planned_yield;
  languages: Array<LanguageModel>;
  filter = {};

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
  areaMeasure = "ha";
  filterClean = true;

  line: d3Shape.Line<[number, number]>;
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public popoverCtrl: PopoverController,
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
      // if (this.reportActivityForm.value.reportType == 'activity') {
        this.pouchdbService.getView(
          'Informes/Agro',
          10,
        ).then(async (activitys1: any[]) => {
          console.log("activity1", Object.keys(this.reportActivityForm.value.crop).length, activitys1);
          let activitys = activitys1;
          if (Object.keys(this.reportActivityForm.value.crop).length > 0) {
            activitys = activitys.filter(word => word['key'][0] == this.reportActivityForm.value.crop.name);
          }
          if (Object.keys(this.reportActivityForm.value.area).length > 0) {
            activitys = activitys.filter(word => word['key'][1] == this.reportActivityForm.value.area.name);
          }
          if (Object.keys(this.reportActivityForm.value.activity).length > 0) {
            activitys = activitys.filter(word => word['key'][2] == this.reportActivityForm.value.activity.name);
          }
          if (Object.keys(this.reportActivityForm.value.input).length > 0) {
            activitys = activitys.filter(word => word['key'][6] == this.reportActivityForm.value.input._id);
          }
          if (Object.keys(this.reportActivityForm.value.machine).length > 0) {
            activitys = activitys.filter(word => word['key'][6] == this.reportActivityForm.value.input._id);
          }
          console.log("activity lines", this.reportActivityForm.value.crop, activitys);

          let items = [];
          let promise_ids = [];
          let result = {};
          if (this.reportActivityForm.value.groupBy == 'category') {
            items = [];
            let getList = [];
            activitys.forEach(activityLine => {
              if (activityLine.key[11]){
                if (result.hasOwnProperty(activityLine.key[9])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[9]]] = {
                    'name': items[result[activityLine.key[9]]].name,
                    'quantity': items[result[activityLine.key[9]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[9]]].margin + parseFloat(activityLine.key[3]),
                    'planned': items[result[activityLine.key[9]]].planned,
                    'total': items[result[activityLine.key[9]]].total + parseFloat(activityLine.key[4])*activityLine.key[5],
                  };
                } else {
                  items.push({
                    'name': activityLine.key[9],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': parseFloat(activityLine.key[3]),
                    'planned': 0,
                    'total': parseFloat(activityLine.key[4])*activityLine.key[5],
                  });
                  getList.push(activityLine.key[9]);
                  result[activityLine.key[9]] = items.length-1;
                }
              } else {
                if (result.hasOwnProperty(activityLine.key[7])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[7]]] = {
                    'name': items[result[activityLine.key[7]]].name,
                    'quantity': items[result[activityLine.key[7]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[7]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[7]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': items[result[activityLine.key[7]]].total,
                  };
                } else {
                  items.push({
                    'name': activityLine.key[7],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': 0,
                  });
                  result[activityLine.key[7]] = items.length-1;
                }
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
                  'planned': litems[categories[doc_dict[item.name].category_name]].planned + item.planned,
                  'total': litems[categories[doc_dict[item.name].category_name]].total + item.total,
                };
              } else {
                litems.push({
                  'name': doc_dict[item.name].category_name,
                  'quantity': item.quantity,
                  'margin': item.margin,
                  'planned': item.planned,
                  'total': item.total,
                });
                categories[doc_dict[item.name].category_name] = litems.length-1;
              }
            })
            let self = this;
            let output = litems.sort(function(a, b) {
              return self.compare(a, b, self.reportActivityForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            let planned = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
              planned += parseFloat(item['planned']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportActivityForm.value.groupBy == 'brand') {
            items = [];
            let getList = [];
            activitys.forEach(activityLine => {
              if (activityLine.key[11]){
                if (result.hasOwnProperty(activityLine.key[9])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[9]]] = {
                    'name': items[result[activityLine.key[9]]].name,
                    'quantity': items[result[activityLine.key[9]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[9]]].margin + parseFloat(activityLine.key[3]),
                    'planned': items[result[activityLine.key[9]]].planned,
                    'total': items[result[activityLine.key[9]]].total + parseFloat(activityLine.key[4])*activityLine.key[5],
                  };
                } else {
                  items.push({
                    'name': activityLine.key[9],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': parseFloat(activityLine.key[3]),
                    'planned': 0,
                    'total': parseFloat(activityLine.key[4])*activityLine.key[5],
                  });
                  getList.push(activityLine.key[9]);
                  result[activityLine.key[9]] = items.length-1;
                }
              } else {
                if (result.hasOwnProperty(activityLine.key[7])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[7]]] = {
                    'name': items[result[activityLine.key[7]]].name,
                    'quantity': items[result[activityLine.key[7]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[7]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[7]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': items[result[activityLine.key[7]]].total,
                  };
                } else {
                  items.push({
                    'name': activityLine.key[7],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': 0,
                  });
                  result[activityLine.key[7]] = items.length-1;
                }
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
                  'planned': litems[brands[doc_dict[item.name].brand_name]].planned + item.planned,
                  'total': litems[brands[doc_dict[item.name].brand_name]].total + item.total,
                };
              } else {
                litems.push({
                  'name': doc_dict[item.name].brand_name,
                  'quantity': item.quantity,
                  'margin': item.margin,
                  'planned': item.planned,
                  'total': item.total,
                });
                brands[doc_dict[item.name].brand_name] = litems.length-1;
              }
            })
            let self = this;
            let output = litems.sort(function(a, b) {
              return self.compare(a, b, self.reportActivityForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            let planned = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
              planned += parseFloat(item['planned']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportActivityForm.value.groupBy == 'name') {
            items = [];
            activitys.forEach(activityLine => {
              if (activityLine.key[11]){
                if (result.hasOwnProperty(activityLine.key[3])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[3]]] = {
                    'name': items[result[activityLine.key[3]]].name,
                    'quantity': items[result[activityLine.key[3]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[3]]].margin + parseFloat(activityLine.key[3]),
                    'planned': items[result[activityLine.key[3]]].planned,
                    'total': items[result[activityLine.key[3]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  };
                } else {
                  items.push({
                    'name': activityLine.key[3],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': parseFloat(activityLine.key[5]),
                    'planned': 0,
                    'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  });
                  result[activityLine.key[3]] = items.length-1;
                }
              } else {
                if (result.hasOwnProperty(activityLine.key[3])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[3]]] = {
                    'name': items[result[activityLine.key[3]]].name,
                    'quantity': items[result[activityLine.key[3]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[3]]].margin + parseFloat(activityLine.key[3]),
                    'planned': items[result[activityLine.key[3]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': items[result[activityLine.key[3]]].total,
                  };
                } else {
                  items.push({
                    'name': activityLine.key[3],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': parseFloat(activityLine.key[5]),
                    'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': 0,
                  });
                  result[activityLine.key[3]] = items.length-1;
                }
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportActivityForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            let planned = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
              planned += parseFloat(item['planned']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (
            this.reportActivityForm.value.groupBy == 'yieldCrop'
            || this.reportActivityForm.value.groupBy == 'yieldCropkg'
          ) {
            // console.log("crop", );
          items = [];
          activitys.forEach(activityLine => {
            if (activityLine.key[11]){
              if (result.hasOwnProperty(activityLine.key[0])) {
                items[result[activityLine.key[0]]] = {
                  'name': items[result[activityLine.key[0]]].name,
                  'quantity': items[result[activityLine.key[0]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[0]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[0]]].planned,
                  'total': items[result[activityLine.key[0]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                };
              } else {
                items.push({
                  'name': activityLine.key[0],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': 0,
                  'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                });
                result[activityLine.key[0]] = items.length-1;
              }
            } else {
              if (result.hasOwnProperty(activityLine.key[0])) {
                items[result[activityLine.key[0]]] = {
                  'name': items[result[activityLine.key[0]]].name,
                  'quantity': items[result[activityLine.key[0]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[0]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[0]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': items[result[activityLine.key[0]]].total,
                };
              } else {
                items.push({
                  'name': activityLine.key[0],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': 0,
                });
                result[activityLine.key[0]] = items.length-1;
              }
            }
          });

          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.reportActivityForm.value.orderBy);
          })
          let marker = false;
          let total = 0;
          let planned = 0;
          let planned_yield = 0;
          output.forEach(item => {
            item['marker'] = marker,
              marker = !marker;
            total += parseFloat(item['total']);
            planned += parseFloat(item['planned']);
            planned_yield += parseFloat(item['planned']);
          });
          this.loading.dismiss();
          console.log("output", output);
          let yields:any = await this.pouchdbService.getView('Informes/AgroRend',11);
          // if (Object.keys(this.reportActivityForm.value.crop).length > 0) {
          //   yields = yields.filter(word => word['key'][0] == this.reportActivityForm.value.crop.name);
          // }
          // if (Object.keys(this.reportActivityForm.value.area).length > 0) {
          //   yields = yields.filter(word => word['key'][1] == this.reportActivityForm.value.area.name);
          // }
          // if (Object.keys(this.reportActivityForm.value.activity).length > 0) {
          //   yields = yields.filter(word => word['key'][2] == this.reportActivityForm.value.activity.name);
          // }
          console.log("yields", yields);
          let listas = [];
          // let otro = output
          output.forEach((doc: any, index)=>{
            doc['margin'] = 0;
            doc['planned_yield'] = 0;
            yields.forEach((yie: any)=>{
              if (doc.name == yie.key[0]){
                if (yie.key[8]){
                  doc['margin'] += yie.value;
                } else {
                  doc['planned_yield'] += yie.value;
                }
              }
            })
          })
          console.log("output", output);
          resolve(output);
        }
        else if (
          this.reportActivityForm.value.groupBy == 'yieldArea'
          || this.reportActivityForm.value.groupBy == 'yieldAreakg'
        ) {
          // console.log("crop", );
        items = [];
        activitys.forEach(activityLine => {
          if (activityLine.key[11]){
            if (result.hasOwnProperty(activityLine.key[1])) {
              items[result[activityLine.key[1]]] = {
                'name': items[result[activityLine.key[1]]].name,
                'id': items[result[activityLine.key[1]]].id,
                'quantity': items[result[activityLine.key[1]]].quantity + parseFloat(activityLine.key[4]),
                'margin': items[result[activityLine.key[1]]].margin + parseFloat(activityLine.key[5]),
                'planned': items[result[activityLine.key[1]]].planned,
                'total': items[result[activityLine.key[1]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
              };
            } else {
              items.push({
                'name': activityLine.key[1],
                'id': activityLine.key[10],
                'quantity': parseFloat(activityLine.key[4]),
                'margin': parseFloat(activityLine.key[5]),
                'planned': 0,
                'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
              });
              result[activityLine.key[1]] = items.length-1;
            }
          } else {
            if (result.hasOwnProperty(activityLine.key[1])) {
              items[result[activityLine.key[1]]] = {
                'name': items[result[activityLine.key[1]]].name,
                'id': items[result[activityLine.key[1]]].id,
                'quantity': items[result[activityLine.key[1]]].quantity + parseFloat(activityLine.key[4]),
                'margin': items[result[activityLine.key[1]]].margin + parseFloat(activityLine.key[5]),
                'planned': items[result[activityLine.key[1]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                'total': items[result[activityLine.key[1]]].total,
              };
            } else {
              items.push({
                'name': activityLine.key[1],
                'id': activityLine.key[10],
                'quantity': parseFloat(activityLine.key[4]),
                'margin': parseFloat(activityLine.key[5]),
                'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                'total': 0,
              });
              result[activityLine.key[1]] = items.length-1;
            }
          }
        });

        let self = this;
        let output = items.sort(function(a, b) {
          return self.compare(a, b, self.reportActivityForm.value.orderBy);
        })
        let marker = false;
        let total = 0;

        let planned = 0;
        let planned_yield = 0;
        output.forEach(item => {
          item['marker'] = marker,
            marker = !marker;
          total += parseFloat(item['total']);
          planned += parseFloat(item['planned']);
          planned_yield += parseFloat(item['planned']);
        });
        this.loading.dismiss();
        let areas:any = await this.pouchdbService.getView('Informes/areaCropReport',2);
        output.forEach(saida=>{
          let areaSize = areas.filter(fil=>fil.key[0] == saida.id && fil.key[1] == this.reportActivityForm.value.crop._id)
          saida.area = areaSize[0].value;
        })
        let yields:any = await this.pouchdbService.getView('Informes/AgroRend',11);
        if (Object.keys(this.reportActivityForm.value.crop).length > 0) {
          yields = yields.filter(word => word['key'][0] == this.reportActivityForm.value.crop.name);
        }
        if (Object.keys(this.reportActivityForm.value.area).length > 0) {
          yields = yields.filter(word => word['key'][1] == this.reportActivityForm.value.area.name);
        }
        if (Object.keys(this.reportActivityForm.value.activity).length > 0) {
          yields = yields.filter(word => word['key'][2] == this.reportActivityForm.value.activity.name);
        }
        console.log("yields", yields);
        let listas = [];
        // let otro = output
        output.forEach((doc: any, index)=>{
          doc['margin'] = 0;
          doc['planned_yield'] = 0;
          yields.forEach((yie: any)=>{
            // if (doc.name == yie.key[1]){
            //   doc['margin'] += yie.value;
            // }
            if (doc.name == yie.key[1]){
              if (yie.key[8]){
                doc['margin'] += yie.value;
              } else {
                doc['planned_yield'] += yie.value;
              }
            }
          })
        })
        console.log("output", output);
        resolve(output);
      }
        else if (this.reportActivityForm.value.groupBy == 'crop') {
            console.log("crop", );
          items = [];
          let getList = [];
          let crops = {};
          activitys.forEach(activityLine => {
            if (getList.indexOf(activityLine.key[10]) == -1){
              getList.push(activityLine.key[10]);
            }
            if (activityLine.key[11]){
              if (result.hasOwnProperty(activityLine.key[0])) {
                items[result[activityLine.key[0]]] = {
                  'name': items[result[activityLine.key[0]]].name,
                  'quantity': items[result[activityLine.key[0]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[0]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[0]]].planned,
                  'total': items[result[activityLine.key[0]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                };
                crops
              } else {
                items.push({
                  'name': activityLine.key[0],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': 0,
                  'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                });
                result[activityLine.key[0]] = items.length-1;
              }
            } else {
              if (result.hasOwnProperty(activityLine.key[0])) {
                items[result[activityLine.key[0]]] = {
                  'name': items[result[activityLine.key[0]]].name,
                  'quantity': items[result[activityLine.key[0]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[0]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[0]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': items[result[activityLine.key[0]]].total,
                };
              } else {
                items.push({
                  'name': activityLine.key[0],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': 0,
                });
                result[activityLine.key[0]] = items.length-1;
              }
            }

            if (crops.hasOwnProperty(activityLine.key[0])){
              if (crops[activityLine.key[0]].hasOwnProperty(activityLine.key[1])) {
                // crops[activityLine.key[0]][activityLine.key[10]] = 0;
              } else {
                crops[activityLine.key[0]][activityLine.key[10]] = 0;
              }
            } else {
              crops[activityLine.key[0]] = [];
              crops[activityLine.key[0]][activityLine.key[10]] = 0;
            }
          });
          console.log("crops", crops);
          let products: any = await this.pouchdbService.getList(getList);
          var doc_dict = {};
          products.forEach(row=>{
            doc_dict[row.doc._id] = row.doc;
          })
          console.log("doc_dict", doc_dict);
          let categories = {};
          let litems = [];
          let cropList = {};
          Object.keys(crops).forEach(item=>{
            console.log("item", item, doc_dict, crops[item]);
            Object.keys(crops[item]).forEach(are=>{
              console.log("doc_dict[are]", are, doc_dict[are]);
              if (categories.hasOwnProperty(doc_dict[are].name)) {
                litems[categories[doc_dict[are].name]] = {
                  // 'name': doc_dict[are].name,
                  'name': doc_dict[are].name,
                  // 'quantity': litems[categories[doc_dict[item.name].name]].quantity + parseFloat(item.quantity),
                  'quantity': doc_dict[are].surface,
                  'planned': litems[categories[doc_dict[are].name]].planned,
                };
                cropList[item] += doc_dict[are].surface;
              } else {
                litems.push({
                  'name': doc_dict[are].name,
                  'quantity': doc_dict[are].surface,
                  // 'area': doc_dict[item.name].surface,
                  // 'total': 0,
                  'planned': 1,
                });
                categories[doc_dict[are].name] = litems.length-1;
                cropList[item] = doc_dict[are].surface;
              }
            })
          })
          console.log("litens", items);
          items.forEach(item=>{
            item.quantity = cropList[item.name];
          })
          let self = this;
          let output = items.sort(function(a, b) {
            return self.compare(a, b, self.reportActivityForm.value.orderBy);
          })
          let marker = false;
          let total = 0;
          let planned = 0;
          output.forEach(item => {
            item['marker'] = marker,
              marker = !marker;
            total += parseFloat(item['total']);
            planned += parseFloat(item['planned']);
          });
          this.loading.dismiss();
          resolve(output);
        }

        else if (this.reportActivityForm.value.groupBy == 'area') {
          console.log("area", );
          let getList = [];
          items = [];
          activitys.forEach(activityLine => {
            if (getList.indexOf(activityLine.key[10]) == -1){
              getList.push(activityLine.key[10]);
            }

            if (activityLine.key[11]){
              if (result.hasOwnProperty(activityLine.key[1])) {
                items[result[activityLine.key[1]]] = {
                  'name': items[result[activityLine.key[1]]].name,
                  'quantity': items[result[activityLine.key[1]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[1]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[1]]].planned,
                  'total': items[result[activityLine.key[1]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                };
              } else {
                items.push({
                  'name': activityLine.key[1],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': 0,
                  'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                });
                result[activityLine.key[1]] = items.length-1;
              }
            } else {
              if (result.hasOwnProperty(activityLine.key[1])) {
                items[result[activityLine.key[1]]] = {
                  'name': items[result[activityLine.key[1]]].name,
                  'quantity': items[result[activityLine.key[1]]].quantity + parseFloat(activityLine.key[4]),
                  'margin': items[result[activityLine.key[1]]].margin + parseFloat(activityLine.key[5]),
                  'planned': items[result[activityLine.key[1]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': items[result[activityLine.key[1]]].total,
                };
              } else {
                items.push({
                  'name': activityLine.key[1],
                  'quantity': parseFloat(activityLine.key[4]),
                  'margin': parseFloat(activityLine.key[5]),
                  'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                  'total': 0,
                });
                result[activityLine.key[1]] = items.length-1;
              }
            }
          });
          let products: any = await this.pouchdbService.getList(getList);
          var doc_dict = {};
          products.forEach((row, index)=>{
            if (row.doc){
              doc_dict[row.doc.name] = row.doc;
            }
            else {
              products = products.slice(index, 1);
            }
          })
          let categories = {};
          let litems = [];
          items.forEach(item=>{
            console.log("item", item.name,doc_dict,  doc_dict[item.name]);
            if (doc_dict[item.name]){
              if (categories.hasOwnProperty(doc_dict[item.name].name)) {
                litems[categories[doc_dict[item.name].name]] = {
                  'name': doc_dict[item.name].name,
                  // 'quantity': litems[categories[doc_dict[item.name].name]].quantity + parseFloat(item.quantity),
                  'quantity': doc_dict[item.name].surface,
                  'planned': litems[categories[doc_dict[item.name].name]].planned + item.planned,
                  'total': litems[categories[doc_dict[item.name].name]].total + item.total,
                };
              } else {
                litems.push({
                  'name': doc_dict[item.name].name,
                  'quantity': doc_dict[item.name].surface,
                  // 'area': doc_dict[item.name].surface,
                  'planned': item.planned,
                  'total': item.total,
                });
                categories[doc_dict[item.name].name] = litems.length-1;
              }
            }
          })
          let self = this;
          // let output = items.sort(function(a, b) {
          //   return self.compare(a, b, self.reportActivityForm.value.orderBy);
          // })
          let output = litems.sort(function(a, b) {
            return self.compare(a, b, self.reportActivityForm.value.orderBy);
          })
          let marker = false;
          let total = 0;
          let planned = 0;
          output.forEach(item => {
            item['marker'] = marker,
              marker = !marker;
            total += parseFloat(item['total']);
            planned += parseFloat(item['planned']);
          });
          this.loading.dismiss();
          console.log("ouch put", output);
          resolve(output);
      }

      else if (this.reportActivityForm.value.groupBy == 'activity') {
        console.log("area", );
      items = [];
      let getList = [];
      let activityArea = {};
      activitys.forEach(activityLine => {
        if (activityLine.key[11]){
          if (result.hasOwnProperty(activityLine.key[2])) {
            items[result[activityLine.key[2]]] = {
              'name': items[result[activityLine.key[2]]].name,
              'quantity': items[result[activityLine.key[2]]].quantity + parseFloat(activityLine.key[4]),
              'margin': items[result[activityLine.key[2]]].margin + parseFloat(activityLine.key[5]),
              'planned': items[result[activityLine.key[2]]].planned,
              'total': items[result[activityLine.key[2]]].total + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
            };
            if (activityArea.hasOwnProperty(activityLine.key[1])) {
              activityArea[activityLine.key[2]][activityLine.key[1]] += 1;
            } else {
              activityArea[activityLine.key[2]][activityLine.key[1]] = 1;
            }
          } else {
            items.push({
              'name': activityLine.key[2],
              'quantity': parseFloat(activityLine.key[4]),
              'margin': parseFloat(activityLine.key[5]),
              'planned': 0,
              'total': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
            });
            result[activityLine.key[2]] = items.length-1;
            activityArea[activityLine.key[2]] = {}
            activityArea[activityLine.key[2]][activityLine.key[1]] = 1;
          }
        } else {
          if (result.hasOwnProperty(activityLine.key[2])) {
            items[result[activityLine.key[2]]] = {
              'name': items[result[activityLine.key[2]]].name,
              'quantity': items[result[activityLine.key[2]]].quantity + parseFloat(activityLine.key[4]),
              'margin': items[result[activityLine.key[2]]].margin + parseFloat(activityLine.key[5]),
              'planned': items[result[activityLine.key[2]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
              'total': items[result[activityLine.key[2]]].total,
            };
            if (activityArea.hasOwnProperty(activityLine.key[1])) {
              activityArea[activityLine.key[2]][activityLine.key[1]] += 1;
            } else {
              activityArea[activityLine.key[2]][activityLine.key[1]] = 1;
            }
          } else {
            items.push({
              'name': activityLine.key[2],
              'quantity': parseFloat(activityLine.key[4]),
              'margin': parseFloat(activityLine.key[5]),
              'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
              'total': 0,
            });
            result[activityLine.key[2]] = items.length-1;
            activityArea[activityLine.key[2]] = {}
            activityArea[activityLine.key[2]][activityLine.key[1]] = 1;
          }
        }
        if (getList.indexOf(activityLine.key[10]) == -1){
          getList.push(activityLine.key[10]);
        }
      });
      if (this.reportActivityForm.value.crop._id){
        getList.push(this.reportActivityForm.value.crop._id);
      }
      let products: any = await this.pouchdbService.getList(getList);
      var doc_dict = {};
      products.forEach(row=>{
        doc_dict[row.doc.name] = row.doc;
      })
      this.full_area = parseFloat(doc_dict[this.reportActivityForm.value.crop.name].area);
      // Object.keys(activityArea).forEach((item)=>{
      //   let counter = 0;
      //   Object.keys(activityArea[item]).forEach((area)=>{
      //     counter += activityArea[item][area]*doc_dict[area].surface;
      //     activityArea[item][area] = activityArea[item][area]*doc_dict[area].surface;
      //   })
      //   activityArea[item] = counter;
      // })
      // console.log("activityArea2", activityArea);

      let self = this;
      let output = items.sort(function(a, b) {
        return self.compare(a, b, self.reportActivityForm.value.orderBy);
      })
      let marker = false;
      let total = 0;
      let planned = 0;
      output.forEach(item => {
        item['marker'] = marker,
          marker = !marker;
        total += parseFloat(item['total']);
        item['quantity'] = 0;
        planned += parseFloat(item['planned']);
      });
      this.loading.dismiss();
      resolve(output);
    }
          else if (this.reportActivityForm.value.groupBy == 'contact') {
            items = [];
            activitys.forEach(activityLine => {
              if (activityLine.key[11]){
                if (result.hasOwnProperty(activityLine.key[2])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[2]]] = {
                    'name': items[result[activityLine.key[2]]].name,
                    'quantity': items[result[activityLine.key[2]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[2]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[2]]].planned,
                    'total': items[result[activityLine.key[2]]].total + parseFloat(activityLine.key[4])*activityLine.key[5],
                  };
                } else {
                  items.push({
                    'name': activityLine.key[2],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': 0,
                    'total': parseFloat(activityLine.key[4])*activityLine.key[5],
                  });
                  result[activityLine.key[2]] = items.length-1;
                }
              } else {
                if (result.hasOwnProperty(activityLine.key[2])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[2]]] = {
                    'name': items[result[activityLine.key[2]]].name,
                    'quantity': items[result[activityLine.key[2]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[2]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[2]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': items[result[activityLine.key[2]]].total,
                  };
                } else {
                  items.push({
                    'name': activityLine.key[2],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': 0,
                  });
                  result[activityLine.key[2]] = items.length-1;
                }
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportActivityForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            let planned = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
              planned += parseFloat(item['planned']);
            });
            this.loading.dismiss();
            resolve(output);
          }
          else if (this.reportActivityForm.value.groupBy == 'date') {
            items = [];
            activitys.forEach(activityLine => {
              if (activityLine.key[11]){
                if (result.hasOwnProperty(activityLine.key[7])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[7]]] = {
                    'name': items[result[activityLine.key[7]]].name,
                    'quantity': items[result[activityLine.key[7]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[7]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[7]]].planned,
                    'total': items[result[activityLine.key[7]]].total + parseFloat(activityLine.key[4])*activityLine.key[5],
                  };
                } else {
                  items.push({
                    'name': activityLine.key[7],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': 0,
                    'total': parseFloat(activityLine.key[4])*activityLine.key[5],
                  });
                  result[activityLine.key[7]] = items.length-1;
                }
              } else {
                if (result.hasOwnProperty(activityLine.key[7])) {
                  // console.log("items[result[activityLine.key[1]]]", items[result[activityLine.key[1]]]);
                  items[result[activityLine.key[7]]] = {
                    'name': items[result[activityLine.key[7]]].name,
                    'quantity': items[result[activityLine.key[7]]].quantity + parseFloat(activityLine.key[4]),
                    'margin': items[result[activityLine.key[7]]].margin + activityLine.key[5],
                    'planned': items[result[activityLine.key[7]]].planned + parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': items[result[activityLine.key[7]]].total,
                  };
                } else {
                  items.push({
                    'name': activityLine.key[7],
                    'quantity': parseFloat(activityLine.key[4]),
                    'margin': activityLine.key[5],
                    'planned': parseFloat(activityLine.key[4])*parseFloat(activityLine.key[5]),
                    'total': 0,
                  });
                  result[activityLine.key[7]] = items.length-1;
                }
              }
            });

            let self = this;
            let output = items.sort(function(a, b) {
              return self.compare(a, b, self.reportActivityForm.value.orderBy);
            })
            let marker = false;
            let total = 0;
            let planned = 0;
            output.forEach(item => {
              item['marker'] = marker,
                marker = !marker;
              total += parseFloat(item['total']);
              planned += parseFloat(item['planned']);
            });
            this.loading.dismiss();
            resolve(output);
          }
        });
      // }
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
    this.reportActivityForm.patchValue({
      'orderBy': "name",
    })
    this.goNextStep();
  }

  orderByPrice() {
    this.reportActivityForm.patchValue({
      'orderBy': "price",
    })
    this.goNextStep();
  }

  orderByQuantity() {
    this.reportActivityForm.patchValue({
      'orderBy': "quantity",
    })
    this.goNextStep();
  }

  orderByTotal() {
    this.reportActivityForm.patchValue({
      'orderBy': "total",
    })
    this.goNextStep();
  }

  orderByMargin() {
    this.reportActivityForm.patchValue({
      'orderBy': "margin",
    })
    this.goNextStep();
  }

  selectCrop(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-crop');
      this.events.subscribe('select-crop', async (data) => {
        this.reportActivityForm.value.crop = data;
        this.filter['crop'] = data;
        // this.reportActivityForm.patchValue({
        //   crop: data,
        // });
        // this.reportActivityForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-crop');
        // this.goNextStep();
        this.filterClean = false;
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: CropsPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectArea(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-area');
      this.events.subscribe('select-area', (data) => {
        this.reportActivityForm.value.area = data;
        this.filter['area'] = data;
        // this.reportActivityForm.patchValue({
        //   area: data,
        //   // contact_name: data.name,
        // });
        // this.reportActivityForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-area');
        this.filterClean = false;
        resolve(true);
        // this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: AreasPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }
  selectInput(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-input');
      this.events.subscribe('select-input', (data) => {
        this.reportActivityForm.value.input = data;
        this.filter['input'] = data;
        // this.reportActivityForm.patchValue({
        //   input: data,
        //   // contact_name: data.name,
        // });
        // this.reportActivityForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-input');
        this.filterClean = false;
        resolve(true);
        // this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: InputsPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  filterReport(){
    this.reportActivityForm.patchValue(this.filter);
    this.reportActivityForm.markAsDirty();
    // this.avoidAlertMessage = false;
    // this.events.unsubscribe('select-machine');
    // resolve(true);
    this.goNextStep();
  }

  cleanFilter(){
    this.filter = {
       machine: {},
       area: {},
       crop: {},
       input: {},
       activity: {},
     }
    this.reportActivityForm.value.machine = {};
    this.reportActivityForm.value.area = {};
    this.reportActivityForm.value.crop = {};
    this.reportActivityForm.value.input = {};
    this.reportActivityForm.value.activity = {};
    this.filterClean = true;
  }

  selectMachine(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-machine');
      this.events.subscribe('select-machine', (data) => {
        this.filter['machine'] = data;
        // this.reportActivityForm.patchValue({
        //   machine: data,
        // });
        this.reportActivityForm.value.machine = data;
        // this.reportActivityForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-machine');
        this.filterClean = false;
        resolve(true);
        // this.goNextStep();
      })
      let profileModal = await this.modalCtrl.create({
        component: MachinesPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  selectActivity(){
    return new Promise(async resolve => {
      this.avoidAlertMessage = true;
      this.events.unsubscribe('select-activity');
      this.events.subscribe('select-activity', (data) => {
        this.reportActivityForm.value.activity = data;
        this.filter['activity'] = data;
        // this.reportActivityForm.patchValue({
        //   activity: data,
        //   // contact_name: data.name,
        // });
        // // this.reportActivityForm.markAsDirty();
        // this.avoidAlertMessage = false;
        this.events.unsubscribe('select-activity');
        this.filterClean = false;
        // this.goNextStep();
        resolve(true);
      })
      let profileModal = await this.modalCtrl.create({
        component: ActivitysPage,
        componentProps: {
          "select": true,
        }
      });
      profileModal.present();
    });
  }

  async ngOnInit() {
    this.reportActivityForm = this.formBuilder.group({
      contact: new FormControl(this.route.snapshot.paramMap.get('contact') || {}, Validators.required),
      name: new FormControl(''),
      dateStart: new FormControl(this.route.snapshot.paramMap.get('dateStart')||this.getFirstDateOfMonth()),
      dateEnd: new FormControl(this.route.snapshot.paramMap.get('dateEnd') || this.today),
      total: new FormControl(0),
      area: new FormControl({}),
      machine: new FormControl({}),
      input: new FormControl({}),
      showFilter: new FormControl(false),
      activity: new FormControl({}),
      crop: new FormControl({}),
      items: new FormControl(this.route.snapshot.paramMap.get('items') || [], Validators.required),
      reportType: new FormControl(this.route.snapshot.paramMap.get('reportType') || 'paid'),
      groupBy: new FormControl(this.route.snapshot.paramMap.get('groupBy') || 'area'),
      orderBy: new FormControl(this.route.snapshot.paramMap.get('orderBy') || 'total'),
      filterBy: new FormControl('contact'),
      filter: new FormControl(''),
    });
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.areaMeasure = config.areaMeasure;
    if (this.route.snapshot.paramMap.get('crop_id')){
      let crop = await this.pouchdbService.getDoc(this.route.snapshot.paramMap.get('crop_id'));
      await this.reportActivityForm.patchValue({
        crop: crop
      })
    }
    await this.goNextStep();
    await this.loading.dismiss();
  }

  getFirstDateOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  goNextStep() {
    this.getData().then(data => {
      let self = this;
      new Promise((resolve, reject) => {
        self.reportActivityForm.patchValue({
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
    let crop_area = 0;
    let items_quantity = 0;
    let planned = 0;
    let planned_yield = 0;
    this.reportActivityForm.value.items.forEach((item) => {
      total += parseFloat(item.total);
      items_product_total += 1;
      items_margin += parseFloat(item.margin);
      crop_area += parseFloat(item.area);
      items_quantity += parseFloat(item.quantity);
      planned += parseFloat(item.planned);
      planned_yield += parseFloat(item.planned_yield);
    });
    this.items_product_total = items_product_total;
    this.items_margin = items_margin;
    this.crop_area = crop_area;
    this.items_quantity = items_quantity;
    this.total = total;
    this.planned = planned;
    this.planned_yield = planned_yield;
    this.reportActivityForm.patchValue({
      "total": total,
    });
    this.drawPie();
    this.drawNewBar();
    // this.drawNewLine();
  }

  drawNewBar() {
    let self = this;
    var dataset = this.reportActivityForm.value.items;
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
    this.y = d3Scale.scaleLinear().rangeRound([height, -80]);
    this.x.domain(dataset.map((d: any) => this.translate.instant(d.name)));
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
        .style("text-anchor", "middle");
        // .text("Grafico de Barras");

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
      .data(this.reportActivityForm.value.items)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => this.x(this.translate.instant(d.name)))
      .attr("y", (d: any) => this.y(d.total))
      .attr("width", this.x.bandwidth())
      .style("fill", (d: any) => color(d['name']))
      .attr("height", (d:any) => height - this.y(d.total))
      .each(function(d:any) { self._current - d; });

    path.on('mouseover', (d:any) =>{  // when mouse enters div
      d3.sum(dataset.map(function(d:any) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      tooltip.select('.label').html(this.translate.instant(d.name)); // set current label
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
    var dataset = this.reportActivityForm.value.items;
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
      .attr('fill', (d:any) => { return color(this.translate.instant(d['data'].name)); }) // use color scale to define fill of each label in dataset
      .each(function(d:any) { self._current - d; }); // creates a smooth animation for each track

    // mouse event handlers are attached to path so they need to come after its definition
    path.on('mouseover', (d:any) => {  // when mouse enters div
      var total = d3.sum(dataset.map(function(d:any) { // calculate the total number of tickets in the dataset
        return (d.enabled) ? d.total : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase
      }));
      var percent = Math.round(1000 * d.data.total / total) / 10; // calculate percent
      tooltip.select('.label').html(this.translate.instant(d.data.name)); // set current label
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

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: ActivityReportPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
  }
}

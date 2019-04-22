import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, PopoverController, Events,
  NavParams
} from '@ionic/angular';
import 'rxjs/Rx';
import { File } from '@ionic-native/file/ngx';
import { SalePage } from '../sale/sale.page';
// import { SalesService } from './sales.service';
import { SalesPopover } from './sale-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.page.html',
  styleUrls: ['./sale-list.page.scss'],
})
export class SaleListPage implements OnInit {
  sales: any = [];
  loading: any;
  searchTerm: string = '';
  page = 0;
  languages: Array<LanguageModel>;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    // public salesService: SalesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public file: File,
    public pouchdbService: PouchdbService,
    public languageService: LanguageService,
    public translate: TranslateService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.events.subscribe('changed-sale', (change)=>{
      this.handleChange(this.sales, change);
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getSalesPage(
        this.searchTerm,
        this.page
      ).then((sales: any[]) => {
        sales.forEach(sale => {
          this.sales.push(sale);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: SalesPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async ngOnInit() {
    //this.loading.present();
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getSalesPage(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openSale(sale) {
    this.events.subscribe('open-sale', (data) => {
      this.events.unsubscribe('open-sale');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(SalePage, {'_id': sale._id});
    this.navCtrl.navigateForward(['/sale', {'_id': sale._id}]);
  }

  createSale(){
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(SalePage, {});
    this.navCtrl.navigateForward(['/sale', {}]);
  }

  saveAsCsv() {
    console.log("Save CSV");
    var csv: any = this.convertToCSV(this.sales)
    console.log("Save CSV2", csv);
    var fileName: any = "sales.csv"
    this.file.writeFile(this.file.externalRootDirectory, fileName, csv, {replace:true})
      .then(
      _ => {
        alert('Success ;-)')
      }
      )
      .catch(
      err => {

           this.file.writeExistingFile(this.file.externalRootDirectory, fileName, csv)
          .then(
          _ => {
        alert('Success ;-)')
          }
          )
          .catch(
          err => {
            alert('Failure')
          }
          )
      }
      )

  }

  convertToCSV(sales) {
    var csv: any = 'Codigo,Cliente,Condicion de Pago,Fecha\r\n';

    sales.forEach((sale, index) => {
      // if (sale.code){
      console.log("sale", sale);
        csv += sale.code + "," +
        (sale.contact && sale.contact.name|| sale.contact_name) + "," +
        sale.payment_name + "," +
        sale.date + "," +
        '\r\n';
        // console.log("sss", sale.code+"," + sale.name+"," + sale.price+"," + sale.cost+"," + sale.stock+"," + sale.tax+"," + sale.category_id+","+ sale.stock_min + "," + sale.type+",");
      // }
    });
    return csv
  }

  saveLinesAsCsv() {
    var csv: any = this.convertLinesToCSV(this.sales)
    var fileName: any = "sales.csv"
  }

  convertLinesToCSV(sales) {
    var csv: any = 'Venta,Producto,Precio,Cantidad\r\n';
    sales.forEach((sale, index) => {
      sale.items.forEach(line => {
          csv += sale.code + "," +
          line.product.name + "," +
          line.price + "," +
          line.quantity + "," +
          '\r\n';
      });
    });
    return csv
  }

  getSalesPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'sale',
        keyword,
        page,
        "contact_name"
      ).then((sales: any[]) => {
        resolve(sales);
      });
    });
  }

  deleteSale(slidingItem, sale){
    slidingItem.close();
    return this.pouchdbService.deleteDoc(sale);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'sale',
      keyword,
      page,
      "contact_name"
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

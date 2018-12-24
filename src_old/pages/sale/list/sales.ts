import { Component } from '@angular/core';
import {
  NavController, App, LoadingController, PopoverController, Events,
  NavParams
} from '@ionic/angular';
import 'rxjs/Rx';
import { File } from '@ionic-native/file';
import { SalePage } from '../sale';
import { SalesService } from './sales.service';
import { SalesPopover } from './sales.popover';

@Component({
  selector: 'sales-page',
  templateUrl: 'sales.html'
})
export class SalesPage {
  sales: any;
  loading: any;
  searchTerm: string = '';
  page = 0;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public salesService: SalesService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public file: File,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.events.subscribe('changed-sale', (change)=>{
      this.salesService.handleChange(this.sales, change);
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.salesService.getSalesPage(
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

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(SalesPopover);
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.salesService.getSalesPage(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  searchItems() {
    this.salesService.searchItems(
      this.searchTerm, 0
    ).then((sales) => {
      this.sales = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  openSale(sale) {
    this.events.subscribe('open-sale', (data) => {
      this.events.unsubscribe('open-sale');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(SalePage, {'_id': sale._id});
  }

  createSale(){
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(SalePage, {});
  }

  deleteSale(sale){
    let index = this.sales.indexOf(sale);
    this.sales.splice(index, 1);
    this.salesService.deleteSale(sale);
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
}

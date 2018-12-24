import { Component, Input, ViewChild } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events, PopoverController } from '@ionic/angular';
import { ProductPage } from '../product';
import 'rxjs/Rx';
import { ProductsService } from './products.service';
import { ProductsPopover } from './products.popover';
import { File } from '@ionic-native/file';


@Component({
  selector: 'products-page',
  templateUrl: 'products.html'
})
export class ProductsPage {
  products: any;
  loading: any;
  select: boolean;
  type: string = 'all';
  page = 0;
  operation = "sale";
  searchTerm: string = '';

  constructor(
    public navCtrl: NavController,
    public app: App,
    public productsService: ProductsService,
    public loadingCtrl: LoadingController,
    
    public modal: ModalController,
    public events: Events,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public file: File,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.operation = this.route.snapshot.paramMap.get('operation') || this.operation;
    this.type = this.route.snapshot.paramMap.get('type') || 'all';
    this.events.subscribe('changed-product', (change) => {
      this.productsService.handleChange(this.products, change);
    })
    this.events.subscribe('changed-stock-move', (change) => {
      this.productsService.handleViewChange(this.products, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  saveAsCsv() {
    var csv: any = this.convertToCSV(this.products)
    var fileName: any = "products.csv"
    this.file.writeFile(
      this.file.externalRootDirectory, fileName, csv, { replace: true }
    ).then(_ => {
      alert('Success ;-)')
    }).catch(err => {
      this.file.writeExistingFile(
        this.file.externalRootDirectory, fileName, csv
      ).then(_ => {
        alert('Success ;-)')
      }).catch(err => {
        alert('Failure')
      })
    })
  }

  convertToCSV(products) {
    var csv: any = 'Codigo,Nombre,Precio,Costo,Stock Actual,Impuesto,ID de Categoria,Stock Minimo,Tipo,Anotación\r\n';
    products.forEach(product => {
      csv += product.code + "," +
        product.name + "," +
        product.price + "," +
        product.cost + "," +
        product.stock + "," +
        product.tax + "," +
        product.category_id + "," +
        product.stock_min + "," +
        product.type + "," +
        '"' + product.note + '"' +
        '\r\n';
    });
    return csv
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.productsService.getProductsPage(
      this.searchTerm, 0, this.type
    ).then((products: any[]) => {
      if (this.type == 'all') {
        this.products = products;
      }
      else {
        this.products = products.filter(word => word.type == this.type);
      }
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  searchItems() {
    this.productsService.searchItems(
      this.searchTerm, 0
    ).then((items) => {
      this.products = items;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.productsService.getProductsPage(
        this.searchTerm, this.page, this.type
      ).then((products: any[]) => {
        products.forEach(product => {
          this.products.push(product);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.productsService.getProductsPage(
        this.searchTerm, 0, this.type
      ).then((products: any[]) => {
        this.products = products;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(ProductsPopover);
    popover.present({
      ev: myEvent
    });
  }

  selectProduct(product) {
    if (this.select) {
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-product', product);
      });
    } else {
      this.gotoProduct(product);
    }
  }

  gotoProduct(product) {
    this.events.subscribe('open-product', (data) => {
      this.events.unsubscribe('open-product');
    })
    if (this.select) {
      this.navCtrl.navigateForward(ProductPage, { '_id': product._id });
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(ProductPage, { '_id': product._id });
    }
  }

  closeModal(){
    this.navCtrl.navigateBack();
  }

  createProduct() {
    this.events.subscribe('create-product', (data) => {
      if (this.select) {
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-product', data);
        });
      }
      this.events.unsubscribe('create-product');
    })
    if (this.select) {
      this.navCtrl.navigateForward(ProductPage, {});
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(ProductPage, {});
    }
  }

  deleteProduct(product) {
    let index = this.products.indexOf(product)
    this.products.splice(index, 1);
    this.productsService.deleteProduct(product);
  }
}

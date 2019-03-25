import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, PopoverController } from '@ionic/angular';
import { ProductPage } from '../product/product.page';
import 'rxjs/Rx';
// import { ProductsService } from './products.service';
// import { ProductsPopover } from './products.popover';
import { File } from '@ionic-native/file';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductListPopover} from './product-list.popover';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
})
export class ProductListPage implements OnInit {
  @ViewChild('searchBar') searchBar;

  products: any = [];
  loading: any;
  select;
  type: string = 'all';
  page = 0;
  operation = "sale";
  searchTerm: string = '';

  constructor(
    public navCtrl: NavController,
    public router: Router,
    // public productsService: ProductsService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    // public modal: ModalController,
    public events: Events,
    public route: ActivatedRoute,
    public popoverCtrl: PopoverController,
    public file: File,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.operation = this.route.snapshot.paramMap.get('operation') || this.operation;
    this.type = this.route.snapshot.paramMap.get('type') || 'all';
    this.events.subscribe('changed-product', (change) => {
      this.handleChange(this.products, change);
    })
    this.events.subscribe('changed-stock-move', (change) => {
      this.handleViewChange(this.products, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
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

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
    setTimeout(() => {
      if(this.select){
        this.searchBar.setFocus();
      }
    }, 500);
  }

  setFilteredItems() {
    this.getProductsPage(
      this.searchTerm, 0, this.type
    ).then((products: any[]) => {
      this.products = products;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  searchItems() {
    this.setFilteredItems();
    // this.searchItemsS(
    //   this.searchTerm, 0
    // ).then((items) => {
    //   this.products = items;
    //   this.page = 1;
    //   this.loading.dismiss();
    // });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getProductsPage(
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
      this.getProductsPage(
        this.searchTerm, 0, this.type
      ).then((products: any[]) => {
        this.products = products;
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: ProductListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  selectProduct(product) {
    if (this.select) {
      // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-product', product);
      // });
    } else {
      this.openProduct(product);
    }
  }

  async openProduct(product) {
    this.events.subscribe('open-product', (data) => {
      this.events.unsubscribe('open-product');
    })
    if (this.select) {
      // this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
      let profileModal = await this.modalCtrl.create({
        component: ProductPage,
        componentProps: {
          "select": true,
          "_id": product._id,
        }
      })
      profileModal.present();
    } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // this.navCtrl.navigateForward(['contact', {'_id': contact._id}]);
      this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
    }
  }

  closeModal(){
    this.navCtrl.navigateBack('');
  }

  async createProduct() {
    this.events.subscribe('create-product', (data) => {
      if (this.select) {
        // this.navCtrl.navigateBack('').then(() => {
          this.events.publish('select-product', data);
        // });
      }
      this.events.unsubscribe('create-product');
    })
    if (this.select) {
      let profileModal = await this.modalCtrl.create({
        component: ProductPage,
        componentProps: {
          "select": true,
        }
      })
      profileModal.present();
      // this.navCtrl.navigateForward('/product', {});
    } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // newRootNav.push(ProductPage, {});
      this.navCtrl.navigateForward('/product', {});
    }
  }

  // deleteProduct(product) {
  //   let index = this.products.indexOf(product)
  //   this.products.splice(index, 1);
  //   this.productsService.deleteProduct(product);
  // }

  getProductsPage(keyword, page, type='all'){
    return new Promise((resolve, reject)=>{
      let promise_ids = [];
      if (type=='all') {
        promise_ids.push(this.pouchdbService.searchDocTypeData('product', keyword, page, null, null, 'name', 'increase'));
      } else {
        console.log('type', type);
        promise_ids.push(this.pouchdbService.searchDocTypeDataField('product', keyword, page, 'category_name', type, 'name', 'increase'));
      }
      promise_ids.push(this.pouchdbService.getView('stock/Depositos', 2));
      Promise.all(promise_ids).then((resList: any[]) => {
        console.log("rresList", resList);
        let data: any[] = resList[0];
        let viewList: any[] = resList[1];
        data.forEach(product=>{
          //Get stock value from cash moves report
          let stock = 0;
          viewList.forEach(view=>{
            if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id){
              stock += view.value;
            }
          })
          product.stock = stock;
        })
        resolve(data);
        console.log("data", data);
      })
    })
  }

  // searchItemsS(keyword, page) {
  //   return new Promise(resolve => {
  //   this.pouchdbService.searchDocs(
  //     'product',
  //     keyword,
  //     page,
  //     'type',
  //     undefined,
  //     'name',
  //     'increase'
  //   ).then((items) => {
  //       resolve(items);
  //     })
  //   })
  // }

  deleteProduct(product) {
    return this.pouchdbService.deleteDoc(product);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Depositos', 2
    ).then((stocks: any[]) => {
      let data: any[] = list;
      let viewList: any[] = stocks;
      data.forEach(product=>{
        //Get stock value from cash moves report
        let stock = 0;
        viewList.forEach(view=>{
          if (view.key[0].split(".")[1] == 'physical' && view.key[1] == product._id){
            stock += view.value;
          }
        })
        product.stock = stock;
      })
    });
  }

}

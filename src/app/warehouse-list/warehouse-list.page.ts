import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,  Events, PopoverController, ModalController } from '@ionic/angular';
import { WarehousePage } from '../warehouse/warehouse.page';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

import 'rxjs/Rx';

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.page.html',
  styleUrls: ['./warehouse-list.page.scss'],
})
export class WarehouseListPage implements OnInit {
  warehouses: any;
  loading: any;
  searchTerm: string = '';
  has_search = false;
  select;
  page = 0;
  currency_precision = 2;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public pouchdbService: PouchdbService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
  }

  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }

  async ngOnInit() {
    //this.loading.present();
    let config:any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getWarehouses(this.searchTerm, this.page, this.select).then((warehouses: any[]) => {
        warehouses.forEach(warehouse => {
          this.warehouses.push(warehouse);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 200);
  }


  doRefresh(refresher) {
    //console.log('Begin async operation', refresher);
    setTimeout(() => {
      //console.log('Async operation has ended');
      this.getWarehouses(this.searchTerm, 0, this.select).then((warehouses: any[]) => {
        //console.log("warehouses", warehouses);
        this.warehouses = warehouses;
        this.page = 1;
      });
      refresher.target.complete();
    }, 500);
  }


  setFilteredItems() {
    this.getWarehouses(this.searchTerm, 0, this.select).then((warehouses) => {
      // //console.log("warehouses", warehouses);
      this.warehouses = warehouses;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(WarehousesPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  // openWarehouse(warehouse) {
  //   if (!this.select){
  //     this.events.subscribe('open-warehouse', (data) => {
  //       this.events.unsubscribe('open-warehouse');
  //       // this.doRefreshList();
  //     });
  //     console.log("openWarehouse", warehouse);
  //     // let newRootNav = <NavController>this.app.getRootNavById('n4');
  //     // newRootNav.push(WarehousePage, {'_id': warehouse._id});
  //     this.navCtrl.navigateForward(WarehousePage, {'_id': warehouse._id});
  //   } else {
  //     this.selectWarehouse(warehouse);
  //   }
  // }

  openWarehouse(warehouse) {
    this.events.subscribe('open-warehouse', (data) => {
      this.events.unsubscribe('open-warehouse');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(WarehousePage, {'_id': warehouse._id});
    this.navCtrl.navigateForward(['/warehouse', { '_id': warehouse._id }]);
  }

  selectWarehouse(warehouse) {
    console.log("this.select", this.select);
    if (this.select){
      // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-warehouse', warehouse);
      // });
    } else {
      this.openWarehouse(warehouse);
    }
  }

  createWarehouse(){
    this.events.subscribe('create-warehouse', (data) => {
      if (this.select){
        this.navCtrl.navigateBack('/product-list');
        // .then(() => {
          this.events.publish('select-warehouse', data);
        // });
      }
      this.events.unsubscribe('create-warehouse');
      // this.doRefreshList();
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(WarehousePage, {});
    this.navCtrl.navigateForward(['/warehouse', {'create': true}]);
  }

  deleteWarehouse(Warehouse) {
    return this.pouchdbService.deleteDoc(Warehouse);
  }

  getWarehouses(keyword, page, select){
    return new Promise((resolve, reject)=>{
      ////console.log("getPlanned");
      // let payableList = [];
      this.pouchdbService.getView(
        'stock/Depositos', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        //console.log("Caixas", planneds);
        let warehouses = [];
        this.pouchdbService.searchDocTypeData('warehouse', keyword).then((warehouseList: any[]) => {
          //console.log("warehouseList", warehouseList);
          warehouseList.forEach(warehouse=>{
            warehouse.balance = 0;
            // if (warehouse._id == 'warehouse.my'){
            if (warehouse._id.split('.')[1] == 'physical'){
              // planneds.filter(x => x._id=='account.cash.USD')
              // console.log("index", planneds.filter(x => x.key[0]==warehouse._id)[0]);
              let warehouseReport = planneds.filter(x => x.key[0]==warehouse._id)[0]
              warehouse.balance = warehouseReport && warehouseReport.value || 0;
              //console.log("identificado", warehouse);
              warehouses.push(warehouse);
            } else if (select){
              let warehouseReport = planneds.filter(x => x.key[0]==warehouse._id)[0]
              warehouse.balance = warehouseReport && warehouseReport.value || 0;
              //console.log("identificado", warehouse);
              warehouses.push(warehouse);
            }
          })
          resolve(warehouses);
        });
      });
    });
  }

}

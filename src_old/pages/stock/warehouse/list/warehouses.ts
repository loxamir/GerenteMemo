import { Component } from '@angular/core';
import { NavController, App, NavParams, LoadingController,  Events, PopoverController } from '@ionic/angular';
import { WarehousePage } from '../warehouse';

import 'rxjs/Rx';
import { WarehousesService } from './warehouses.service';
import { WarehousesPopover } from './warehouses.popover';

@Component({
  selector: 'warehouses-page',
  templateUrl: 'warehouses.html',
  providers: [WarehousesService]
})
export class WarehousesPage {
  warehouses: any;
  loading: any;
  searchTerm: string = '';
  has_search = false;
  select: boolean;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public warehousesService: WarehousesService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.warehousesService.getWarehouses(this.searchTerm, this.page, this.select).then((warehouses: any[]) => {
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
      this.warehousesService.getWarehouses(this.searchTerm, 0, this.select).then((warehouses: any[]) => {
        //console.log("warehouses", warehouses);
        this.warehouses = warehouses;
        this.page = 1;
      });
      refresher.target.complete();
    }, 500);
  }


  setFilteredItems() {
    this.warehousesService.getWarehouses(this.searchTerm, 0, this.select).then((warehouses) => {
      // //console.log("warehouses", warehouses);
      this.warehouses = warehouses;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(WarehousesPopover);
    popover.present({
      ev: myEvent
    });
  }

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
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(WarehousePage, {'_id': warehouse._id});
  }

  selectWarehouse(warehouse) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-warehouse', warehouse);
      });
    } else {
      this.openWarehouse(warehouse);
    }
  }

  createWarehouse(){
    this.events.subscribe('create-warehouse', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-warehouse', data);
        });
      }
      this.events.unsubscribe('create-warehouse');
      // this.doRefreshList();
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(WarehousePage, {});
    this.navCtrl.navigateForward(WarehousePage, {'create': true});
  }

  // createWarehouse() {
  //   this.events.subscribe('create-warehouse', (data) => {
  //     if (this.select){
  //       this.navCtrl.navigateBack().then(() => {
  //         this.events.publish('select-warehouse', data);
  //       });
  //     }
  //     this.events.unsubscribe('create-warehouse');
  //   })
  //   let newRootNav = <NavController>this.app.getRootNavById('n4');
  //   newRootNav.push(WarehousePage, {});
  // }

  // doRefreshList() {
  //   setTimeout(() => {
  //     this.warehousesService.getWarehouses(this.searchTerm, 0, this.select).then((warehouses: any[]) => {
  //       //console.log("warehouses", warehouses);
  //       this.warehouses = warehouses;
  //       this.page = 1;
  //     });
  //   }, 100);
  // }

  deleteWarehouse(warehouse){
    let index = this.warehouses.indexOf(warehouse);
    this.warehouses.splice(index, 1);
    this.warehousesService.deleteWarehouse(warehouse);
  }

}

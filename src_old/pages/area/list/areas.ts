import { Component } from '@angular/core';
import { NavController, App, NavParams, LoadingController,  Events, PopoverController, AlertController } from '@ionic/angular';
import { AreaPage } from '../area';

import 'rxjs/Rx';
import { AreasService } from './areas.service';
import { AreasPopover } from './areas.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { AreaService } from '../area.service';
import { WorkService } from '../../work/work.service';
import { ProductPage } from '../../product/product';

@Component({
  selector: 'areas-page',
  templateUrl: 'areas.html',
  providers: [AreasService]
})
export class AreasPage {
  areas: any;
  loading: any;
  searchTerm: string = '';
  select: boolean;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public areasService: AreasService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public areaService: AreaService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.areasService.handleViewChange(this.areas, change);
    })
    this.events.subscribe('changed-product', (change)=>{
      // this.areasService.handleChange(this.areas, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.areasService.getAreas(
        this.searchTerm, this.page
      ).then((areas: any[]) => {
        areas.forEach(area => {
          this.areas.push(area);
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
    }, 50);
  }

  setFilteredItems() {
    this.areasService.getAreas(
      this.searchTerm, 0
    ).then((areas) => {
      this.areas = areas;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(AreasPopover);
    popover.present({
      ev: myEvent
    });
  }

  openArea(area) {
    this.events.subscribe('open-area', (data) => {
      this.events.unsubscribe('open-area');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(AreaPage, {'_id': area._id});
  }

  selectArea(area) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-area', area);
      });
    } else {
      this.openArea(area);
    }
  }

  createArea() {
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ProductPage, {'type': 'rural_area'});
  }

  deleteArea(area){
    let index = this.areas.indexOf(area);
    if (area.balance == 0){
      this.areas.splice(index, 1);
      this.areasService.deleteArea(area);
    }
  }

}

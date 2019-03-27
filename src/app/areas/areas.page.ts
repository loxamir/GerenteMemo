import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { AreaPage } from '../area/area.page';

import 'rxjs/Rx';
import { AreasService } from './areas.service';
import { AreaService } from '../area/area.service';
import { WorkService } from '../work/work.service';
import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.page.html',
  styleUrls: ['./areas.page.scss'],
})
export class AreasPage implements OnInit {
  @ViewChild('searchBar') searchBar;
  showSearch = false;
  areas: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public areasService: AreasService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public areaService: AreaService,
    public alertCtrl: AlertController,
  ) {}

  changeSearch(){
    this.showSearch = !this.showSearch;
    this.searchTerm = '';
    if (this.showSearch){
      setTimeout(() => {
        this.searchBar.setFocus();
      }, 500);
    }
  }

  async ngOnInit() {
    this.select = this.route.snapshot.paramMap.get('select');
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
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

  async showFilter() {
    this.events.subscribe('get-filter', (data) => {
      //Do your stuff
      this.events.unsubscribe('get-filter');
    });
    let profileModal = await this.modalCtrl.create({
      component: FilterPage,
      componentProps: {
      }
    });
    profileModal.present();
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
      this.loading.dismiss();
    });
  }

  openArea(area) {
    this.events.subscribe('open-area', (data) => {
      this.events.unsubscribe('open-area');
    })
    this.navCtrl.navigateForward(['/area', {'_id': area._id}]);
  }

  selectArea(area) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-area', area);
    } else {
      this.openArea(area);
    }
  }

  createArea() {
    this.navCtrl.navigateForward(['/area', {'create': true}]);
  }

  deleteArea(area){
    let index = this.areas.indexOf(area);
    if (area.balance == 0){
      this.areas.splice(index, 1);
      this.areasService.deleteArea(area);
    }
  }

}

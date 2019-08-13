import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { AreaPage } from '../area/area.page';

import 'rxjs/Rx';
import { AreasService } from './areas.service';
import { AreaService } from '../area/area.service';
import { WorkService } from '../work/work.service';
import { LanguageService } from "../services/language/language.service";
import { FilterPage } from '../filter/filter.page';
import { AreasPopover } from './areas.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.page.html',
  styleUrls: ['./areas.page.scss'],
})
export class AreasPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar;
  showSearch = false;
  areas: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  section = "moves";

  today: any;
  constructor(
    public navCtrl: NavController,
    public areasService: AreasService,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public areaService: AreaService,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public formatService: FormatService,
  ) {
    this.today = new Date().toISOString();
    this.select = this.route.snapshot.paramMap.get('select');
    // this.events.subscribe('changed-work', (change)=>{
    //   TODO: Should get the last event and update the view
    //   this.areasService.handleViewChange(this.areas, change);
    // })
    this.events.subscribe('changed-area', (change)=>{
      // this.areasService.handleChange(this.areas, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  changeSearch(){
    this.showSearch = !this.showSearch;
    this.searchTerm = '';
    if (this.showSearch){
      setTimeout(() => {
        this.searchBar.setFocus();
      }, 500);
    }
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: AreasPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
  }

  isToday(date){
    let itemDate = new Date(date).toLocaleDateString();
    let todayDate = new Date().toLocaleDateString();
    if (itemDate == todayDate){
      return true;
    }
    return false;
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.setFilteredItems();
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
    let self = this;
    this.areasService.getAreas(
      this.searchTerm, 0
    ).then(async (areas: any) => {
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

  // createArea() {
  //   this.navCtrl.navigateForward(['/area', {'create': true}]);
  // }

  async createArea(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AreaPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/area', {}]);
    }
    this.events.subscribe('create-area', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-area', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-area');
    })
  }

  deleteArea(area){
    let index = this.areas.indexOf(area);
    this.areas.splice(index, 1);
    this.areasService.deleteArea(area);
  }

}

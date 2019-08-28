import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { AnimalPage } from '../animal/animal.page';

import 'rxjs/Rx';
import { AnimalsService } from './animals.service';
import { AnimalService } from '../animal/animal.service';
import { WorkService } from '../work/work.service';
// import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';
import { AnimalsPopover } from './animals.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-animals',
  templateUrl: './animals.page.html',
  styleUrls: ['./animals.page.scss'],
})
export class AnimalsPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar;
  showSearch = false;
  animals: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  section = "moves";

  today: any;
  constructor(
    public navCtrl: NavController,
    public animalsService: AnimalsService,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public animalService: AnimalService,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public formatService: FormatService,
  ) {
    this.today = new Date().toISOString();
    this.select = this.route.snapshot.paramMap.get('select');
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    // this.events.subscribe('changed-work', (change)=>{
    //   TODO: Should get the last event and update the view
    //   this.animalsService.handleViewChange(this.animals, change);
    // })
    this.events.subscribe('changed-animal', (change)=>{
      // this.animalsService.handleChange(this.animals, change);
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
      component: AnimalsPopover,
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
      this.animalsService.getAnimals(
        this.searchTerm, this.page
      ).then((animals: any[]) => {
        animals.forEach(animal => {
          this.animals.push(animal);
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
    this.animalsService.getAnimals(
      this.searchTerm, 0
    ).then(async (animals: any) => {
      this.animals = animals;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openAnimal(animal) {
    this.events.subscribe('open-animal', (data) => {
      this.events.unsubscribe('open-animal');
    })
    this.navCtrl.navigateForward(['/animal', {'_id': animal._id}]);
  }

  selectAnimal(animal) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-animal', animal);
    } else {
      this.openAnimal(animal);
    }
  }

  // createAnimal() {
  //   this.navCtrl.navigateForward(['/animal', {'create': true}]);
  // }

  async createAnimal(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AnimalPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/animal', {}]);
    }
    this.events.subscribe('create-animal', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-animal', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-animal');
    })
  }

  deleteAnimal(animal){
    let index = this.animals.indexOf(animal);
    this.animals.splice(index, 1);
    this.animalsService.deleteAnimal(animal);
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { PersonPage } from '../person/person.page';

import 'rxjs/Rx';
import { PersonsService } from './persons.service';
import { PersonService } from '../person/person.service';
import { WorkService } from '../work/work.service';
// import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';
import { PersonsPopover } from './persons.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.page.html',
  styleUrls: ['./persons.page.scss'],
})
export class PersonsPage implements OnInit {
  @ViewChild('searchBar') searchBar;
  showSearch = false;
  persons: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  section = "moves";

  today: any;
  constructor(
    public navCtrl: NavController,
    public personsService: PersonsService,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public personService: PersonService,
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
    //   this.personsService.handleViewChange(this.persons, change);
    // })
    this.events.subscribe('changed-person', (change)=>{
      // this.personsService.handleChange(this.persons, change);
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
      component: PersonsPopover,
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
      this.personsService.getPersons(
        this.searchTerm, this.page
      ).then((persons: any[]) => {
        persons.forEach(person => {
          this.persons.push(person);
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
    this.personsService.getPersons(
      this.searchTerm, 0
    ).then(async (persons: any) => {
      this.persons = persons;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openPerson(person) {
    this.events.subscribe('open-person', (data) => {
      this.events.unsubscribe('open-person');
    })
    this.navCtrl.navigateForward(['/person', {'_id': person._id}]);
  }

  selectPerson(person) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-person', person);
    } else {
      this.openPerson(person);
    }
  }

  // createPerson() {
  //   this.navCtrl.navigateForward(['/person', {'create': true}]);
  // }

  async createPerson(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: PersonPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/person', {}]);
    }
    this.events.subscribe('create-person', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-person', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-person');
    })
  }

  deletePerson(person){
    let index = this.persons.indexOf(person);
    this.persons.splice(index, 1);
    this.personsService.deletePerson(person);
  }

}

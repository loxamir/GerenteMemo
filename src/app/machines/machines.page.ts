import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { MachinePage } from '../machine/machine.page';
import { TranslateService } from '@ngx-translate/core';
import 'rxjs/Rx';
import { MachinesService } from './machines.service';
import { MachineService } from '../machine/machine.service';
import { WorkService } from '../work/work.service';
import { LanguageService } from "../services/language/language.service";
import { FilterPage } from '../filter/filter.page';
import { MachinesPopover } from './machines.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";

@Component({
  selector: 'app-machines',
  templateUrl: './machines.page.html',
  styleUrls: ['./machines.page.scss'],
})
export class MachinesPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar;
  showSearch = false;
  machines: any = [];
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  section = "moves";

  today: any;
  constructor(
    public navCtrl: NavController,
    public machinesService: MachinesService,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public machineService: MachineService,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public languageService: LanguageService,
  ) {
    this.today = new Date().toISOString();
    this.select = this.route.snapshot.paramMap.get('select');
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
      component: MachinesPopover,
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
    // this.events.subscribe('changed-work', (change)=>{
    //   TODO: Should get the last event and update the view
    //   this.machinesService.handleViewChange(this.machines, change);
    // })
    this.events.subscribe('changed-machine', (change)=>{
      // this.machinesService.handleChange(this.machines, change);
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
      this.machinesService.getMachines(
        this.searchTerm, this.page
      ).then((machines: any[]) => {
        machines.forEach(machine => {
          this.machines.push(machine);
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
    this.machinesService.getMachines(
      this.searchTerm, 0
    ).then(async (machines) => {
      this.machines = machines;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openMachine(machine) {
    this.events.subscribe('open-machine', (data) => {
      this.events.unsubscribe('open-machine');
    })
    this.navCtrl.navigateForward(['/machine', {'_id': machine._id}]);
  }

  selectMachine(machine) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-machine', machine);
    } else {
      this.openMachine(machine);
    }
  }

  // createMachine() {
  //   this.navCtrl.navigateForward(['/machine', {'create': true}]);
  // }

  async createMachine(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: MachinePage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/machine', {}]);
    }
    this.events.subscribe('create-machine', (data) => {
      if (this.select){
        this.events.publish('select-machine', data);
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-machine');
    })
  }

  deleteMachine(machine){
    let index = this.machines.indexOf(machine);
    this.machines.splice(index, 1);
    this.machinesService.deleteMachine(machine);
  }

}

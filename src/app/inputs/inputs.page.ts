import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { InputPage } from '../input/input.page';

import 'rxjs/Rx';
import { InputsService } from './inputs.service';
import { InputService } from '../input/input.service';
import { WorkService } from '../work/work.service';
// import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';
// import { InputsPopover } from './inputs.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";
import { FormatService } from "../services/format.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.page.html',
  styleUrls: ['./inputs.page.scss'],
})
export class InputsPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar;
  showSearch = false;
  inputs: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  section = "moves";

  today: any;
  constructor(
    public navCtrl: NavController,
    public inputsService: InputsService,
    public pouchdbService: PouchdbService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    // public popoverCtrl: PopoverController,
    public workService: WorkService,
    public inputService: InputService,
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
    //   this.inputsService.handleViewChange(this.inputs, change);
    // })
    this.events.subscribe('changed-input', (change)=>{
      // this.inputsService.handleChange(this.inputs, change);
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

  // async presentPopover(myEvent) {
  //   let popover = await this.popoverCtrl.create({
  //     component: InputsPopover,
  //     event: myEvent,
  //     componentProps: {
  //       popoverController: this.popoverCtrl,
  //       doc: this
  //     }
  //   });
  //   popover.present();
  // }

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
      this.inputsService.getInputs(
        this.searchTerm, this.page
      ).then((inputs: any[]) => {
        inputs.forEach(input => {
          this.inputs.push(input);
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
    this.inputsService.getInputs(
      this.searchTerm, 0
    ).then(async (inputs: any) => {
      this.inputs = inputs;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openInput(input) {
    this.events.subscribe('open-input', (data) => {
      this.events.unsubscribe('open-input');
    })
    this.navCtrl.navigateForward(['/input', {'_id': input._id}]);
  }

  selectInput(input) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-input', input);
    } else {
      this.openInput(input);
    }
  }

  // createInput() {
  //   this.navCtrl.navigateForward(['/input', {'create': true}]);
  // }

  async createInput(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: InputPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/input', {}]);
    }
    this.events.subscribe('create-input', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-input', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-input');
    })
  }

  deleteInput(input){
    let index = this.inputs.indexOf(input);
    this.inputs.splice(index, 1);
    this.inputsService.deleteInput(input);
  }

}

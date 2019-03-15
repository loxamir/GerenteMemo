import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { InputPage } from '../input/input.page';

import 'rxjs/Rx';
import { InputsService } from './inputs.service';
// import { InputsPopover } from './inputs.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { InputService } from '../input/input.service';
import { WorkService } from '../work/work.service';
import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-inputs',
  templateUrl: './inputs.page.html',
  styleUrls: ['./inputs.page.scss'],
})
export class InputsPage implements OnInit {
  inputs: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public inputsService: InputsService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public inputService: InputService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.inputsService.handleViewChange(this.inputs, change);
    })
    this.events.subscribe('changed-product', (change)=>{
      // this.inputsService.handleChange(this.inputs, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
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
    this.inputsService.getInputs(
      this.searchTerm, 0
    ).then((inputs) => {
      this.inputs = inputs;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(InputsPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openInput(input) {
    this.events.subscribe('open-input', (data) => {
      this.events.unsubscribe('open-input');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(InputPage, {'_id': input._id});
    this.navCtrl.navigateForward(['/input', {'_id': input._id}]);
  }

  selectInput(input) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-input', input);
      // });
    } else {
      this.openInput(input);
    }
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

  createInput() {
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ProductPage, {'type': 'input'});
    this.navCtrl.navigateForward(['/product', {"type": 'input'}]);
  }

  deleteInput(input){
    let index = this.inputs.indexOf(input);
    if (input.balance == 0){
      this.inputs.splice(index, 1);
      this.inputsService.deleteInput(input);
    }
  }

}

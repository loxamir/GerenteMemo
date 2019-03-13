import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { MachinePage } from '../machine/machine.page';

import 'rxjs/Rx';
import { MachinesService } from './machines.service';
// import { MachinesPopover } from './machines.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { MachineService } from '../machine/machine.service';
import { WorkService } from '../work/work.service';
import { ProductPage } from '../product/product.page';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.page.html',
  styleUrls: ['./machines.page.scss'],
})
export class MachinesPage implements OnInit {
  machines: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public machinesService: MachinesService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public machineService: MachineService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.machinesService.handleViewChange(this.machines, change);
    })
    this.events.subscribe('changed-product', (change)=>{
      // this.machinesService.handleChange(this.machines, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
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
    ).then((machines) => {
      this.machines = machines;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(MachinesPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openMachine(machine) {
    this.events.subscribe('open-machine', (data) => {
      this.events.unsubscribe('open-machine');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(MachinePage, {'_id': machine._id});
    this.navCtrl.navigateForward(['/crop', {'_id': machine._id}]);
  }

  selectMachine(machine) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-machine', machine);
      // });
    } else {
      this.openMachine(machine);
    }
  }

  createMachine() {
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ProductPage, {'type': 'machine'});
    this.navCtrl.navigateForward(['/product', {'type': 'machine'}]);
  }

  deleteMachine(machine){
    let index = this.machines.indexOf(machine);
    if (machine.balance == 0){
      this.machines.splice(index, 1);
      this.machinesService.deleteMachine(machine);
    }
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { MachinePage } from '../machine/machine.page';

import 'rxjs/Rx';
import { MachinesService } from './machines.service';
import { MachineService } from '../machine/machine.service';
import { WorkService } from '../work/work.service';
// import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';
import { MachinesPopover } from './machines.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";

@Component({
  selector: 'app-machines',
  templateUrl: './machines.page.html',
  styleUrls: ['./machines.page.scss'],
})
export class MachinesPage implements OnInit {
  @ViewChild('searchBar') searchBar;
  showSearch = false;
  machines: any;
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
    console.log("teste my event");
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


    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
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

  private firstFileToBase64(fileImage): Promise<{}> {
    return new Promise((resolve, reject) => {
      let fileReader: FileReader = new FileReader();
      if (fileReader && fileImage != null) {
        fileReader.readAsDataURL(fileImage);
        fileReader.onload = () => {
          let resultado = fileReader.result.toString().split(',')[1];
          console.log("to64", fileImage);
          // this.pouchdbService.attachFile(this._id, 'avatar.png', resultado);
          resolve(fileReader.result);
        };

        fileReader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject(new Error('No file found'));
      }
    });
  }

  selectMachine(machine) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-machine', machine);
    } else {
      this.openMachine(machine);
    }
  }

  createMachine() {
    this.navCtrl.navigateForward(['/machine', {'create': true}]);
  }

  deleteMachine(machine){
    let index = this.machines.indexOf(machine);
    this.machines.splice(index, 1);
    this.machinesService.deleteMachine(machine);
  }

}

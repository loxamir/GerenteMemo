import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController,  LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';

import 'rxjs/Rx';
import { CropsService } from './crops.service';
// import { CropsPopover } from './crops.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CropService } from '../crop/crop.service';
import { CropPage } from '../crop/crop.page';
import { WorkService } from '../work/work.service';
// import { ProjectPage } from '../../project/project';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-crops',
  templateUrl: './crops.page.html',
  styleUrls: ['./crops.page.scss'],
})
export class CropsPage implements OnInit {
  @ViewChild('searchBar', { static: false }) searchBar;
  showSearch = false;
  crops: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public cropsService: CropsService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public cropService: CropService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create({});
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

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.cropsService.handleViewChange(this.crops, change);
    })
    this.events.subscribe('changed-project', (change)=>{
      // this.cropsService.handleChange(this.crops, change);
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
      this.cropsService.getCrops(
        this.searchTerm, this.page
      ).then((crops: any[]) => {
        crops.forEach(crop => {
          this.crops.push(crop);
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
    this.cropsService.getCrops(
      this.searchTerm, 0
    ).then((crops) => {
      this.crops = crops;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(CropsPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openCrop(crop) {
    this.events.subscribe('open-crop', (data) => {
      this.events.unsubscribe('open-crop');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CropPage, {'_id': crop._id});
    this.navCtrl.navigateForward(['/crop', {'_id': crop._id}]);
  }

  selectCrop(crop) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
      this.modalCtrl.dismiss();
        this.events.publish('select-crop', crop);
      // });
    } else {
      this.openCrop(crop);
    }
  }

  // createCrop() {
  //   this.navCtrl.navigateForward(['/crop', {"create": true}]);
  // }

  async createCrop(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CropPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/crop', {}]);
    }
    this.events.subscribe('create-crop', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-crop', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-crop');
    })
  }

  deleteCrop(crop){
    let index = this.crops.indexOf(crop);
    if (crop.balance == 0){
      this.crops.splice(index, 1);
      this.cropsService.deleteCrop(crop);
    }
  }

}

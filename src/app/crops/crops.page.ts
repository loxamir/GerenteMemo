import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController,  LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { CropPage } from '../crop/crop.page';

import 'rxjs/Rx';
import { CropsService } from './crops.service';
// import { CropsPopover } from './crops.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CropService } from '../crop/crop.service';
import { WorkService } from '../work/work.service';
// import { ProjectPage } from '../../project/project';

@Component({
  selector: 'app-crops',
  templateUrl: './crops.page.html',
  styleUrls: ['./crops.page.scss'],
})
export class CropsPage implements OnInit {
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
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
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

  createCrop() {
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CropPage, {});
    this.navCtrl.navigateForward(['/crop', {}]);
  }

  deleteCrop(crop){
    let index = this.crops.indexOf(crop);
    if (crop.balance == 0){
      this.crops.splice(index, 1);
      this.cropsService.deleteCrop(crop);
    }
  }

}

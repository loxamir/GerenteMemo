import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NavController, LoadingController,  Events, PopoverController,
  AlertController, ModalController } from '@ionic/angular';
import { AreaPage } from '../area/area.page';

import 'rxjs/Rx';
import { AreasService } from './areas.service';
import { AreaService } from '../area/area.service';
import { WorkService } from '../work/work.service';
// import { ProductPage } from '../product/product.page';
import { FilterPage } from '../filter/filter.page';
import { AreasPopover } from './areas.popover';
import { PouchdbService } from "../services/pouchdb/pouchdb-service";

@Component({
  selector: 'app-areas',
  templateUrl: './areas.page.html',
  styleUrls: ['./areas.page.scss'],
})
export class AreasPage implements OnInit {
  @ViewChild('searchBar') searchBar;
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
    public modalCtrl: ModalController,
    public events: Events,
    public popoverCtrl: PopoverController,
    public workService: WorkService,
    public areaService: AreaService,
    public alertCtrl: AlertController,
  ) {
    this.today = new Date().toISOString();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  changeSearch(){
    this.putImages();
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


    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-work', (change)=>{
      this.areasService.handleViewChange(this.areas, change);
    })
    this.events.subscribe('changed-product', (change)=>{
      // this.areasService.handleChange(this.areas, change);
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
    this.areasService.getAreas(
      this.searchTerm, 0
    ).then(async (areas) => {
      this.areas = areas;
      this.page = 1;
      await this.loading.dismiss();
      setTimeout(() => {
        this.putImages();
      }, 500);
    });
  }

  putImages(){
    // return new Promise(async (resolve, reject) => {
      this.areas.forEach(async (area:any)=>{
        // area.image = './assets/icons/harvest.png';
        if (!area.image){
          let avatar = await this.pouchdbService.getAttachment(area._id, 'avatar.png');
          console.log("avatar", avatar);

          if (avatar){
            area.image = await this.firstFileToBase64(avatar);
          } else {
            area.image = './assets/icons/harvest.png';
          }
        }
      })
    //   setTimeout(() => {
    //     resolve(true)
    //   }, 500);
    // })
  }

  openArea(area) {
    this.events.subscribe('open-area', (data) => {
      this.events.unsubscribe('open-area');
    })
    this.navCtrl.navigateForward(['/area', {'_id': area._id}]);
  }

  async getImage(docId){
    return new Promise(async (resolve, reject) => {
      let avatar = await this.pouchdbService.getAttachment(docId, 'avatar.png');
      // console.log("avatar", avatar);
      let url = await this.firstFileToBase64(avatar);
      console.log("UUURL", url);
        // console.log("result", result);
        // this.imgURI = result;
        resolve(url);
        // item.image = result;
      // });
    })
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

  selectArea(area) {
    if (this.select){
      this.modalCtrl.dismiss();
        this.events.publish('select-area', area);
    } else {
      this.openArea(area);
    }
  }

  createArea() {
    this.navCtrl.navigateForward(['/area', {'create': true}]);
  }

  deleteArea(area){
    let index = this.areas.indexOf(area);
    this.areas.splice(index, 1);
    this.areasService.deleteArea(area);
  }

}

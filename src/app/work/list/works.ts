import { Component } from '@angular/core';
import { NavController, App, LoadingController, PopoverController , Events, NavParams  } from '@ionic/angular';
import { WorkPage } from '../work';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { WorksService } from './works.service';
import { WorksPopover } from './works.popover';

@Component({
  selector: 'works-page',
  templateUrl: 'works.html'
})
export class WorksPage {
  works: any;
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select: boolean;
  // has_search = false;
  // let total = 0;
  // this.workForm.deliveries.forEach((delivery)=>{
  //   total += delivery.total;
  // })
  // return total;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public worksService: WorksService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public navParams: NavParams,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    this.events.subscribe('changed-work', (change)=>{
      this.worksService.handleChange(this.works, change);
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.worksService.searchItems(
      this.searchTerm, 0
    ).then((works) => {
      this.works = works;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.worksService.getWorksPage(
        this.searchTerm, this.page
      ).then((works: any[]) => {
        works.forEach(work => {
          this.works.push(work);
        });
        this.page += 1;
      });
      infiniteScroll.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.worksService.getWorksPage(
        this.searchTerm, 0
      ).then((works: any[]) => {
        this.works = works;
        this.page = 1;
      });
      refresher.complete();
    }, 200);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(WorksPopover);
    popover.present({
      ev: myEvent
    });
  }


  ionViewDidLoad() {
    this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.worksService.getWorksPage(
      this.searchTerm, 0
    ).then((works) => {
      this.works = works;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openWork(work) {
    this.events.subscribe('open-work', (data) => {
      this.events.unsubscribe('open-work');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(WorkPage, {'_id': work._id});
  }

  createWork(){
    this.events.subscribe('create-work', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-work', data);
        });
      }
      this.events.unsubscribe('create-work');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(WorkPage, {});
  }

  deleteWork(work){
    let index = this.works.indexOf(work);
    // this.works.splice(index, 1);
    this.worksService.deleteWork(work);
  }
}

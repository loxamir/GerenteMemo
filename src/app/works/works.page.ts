import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, PopoverController , Events,
   NavParams, ModalController  } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
//import { DecimalPipe } from '@angular/common';
import 'rxjs/Rx';
import { WorksService } from './works.service';
import { RestProvider } from '../services/rest/rest';
// import { WorksPopover } from './works.popover';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessListPage } from '../process-list/process-list.page';
@Component({
  selector: 'app-works',
  templateUrl: './works.page.html',
  styleUrls: ['./works.page.scss'],
})
export class WorksPage implements OnInit {
  @ViewChild('searchBar') searchBar;
  works: any;
  loading: any;
  searchTerm: string = '';
  items = [];
  page = 0;
  select;
  changes = {};
  // has_search = false;
  // let total = 0;
  // this.workForm.deliveries.forEach((delivery)=>{
  //   total += delivery.total;
  // })
  // return total;
  showSearch = false;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public worksService: WorksService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    public restProvider: RestProvider,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.unsubscribe('changed-work');
    this.events.subscribe('changed-work', (change)=>{
      if (!this.changes.hasOwnProperty(change.seq)){
        console.log("handle ", change);
        this.worksService.handleChange(this.works, change);
        this.changes[change.seq] = true;
      }
    })
    // this.events.unsubscribe('got-database');
    // this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    // })
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

  async ngOnInit(){
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
  }

  searchItems() {
    this.worksService.searchItems(
      this.searchTerm, 0
    ).then((works) => {
      this.works = works;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      // this.worksService.getWorksPage(
      //   this.searchTerm, this.page
      // ).then((works: any[]) => {
      //   works.forEach(work => {
      //     this.works.push(work);
      //   });
      //   this.page += 1;
      // });
      this.setFilteredItems();
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      // this.worksService.getWorksPage(
      //   this.searchTerm, 0
      // ).then((works: any[]) => {
      //   this.works = works;
      //   this.page = 1;
      // });
      this.setFilteredItems();
      refresher.target.complete();
    }, 200);
  }

  setFilteredItems() {
    this.worksService.getWorksPage(
      this.searchTerm, 0
    ).then((works) => {
      console.log("works", works);
      this.works = works;
      this.page = 1;
      if (this.loading){
        this.loading.dismiss();
      }
    });
  }


  openWork(work) {
    this.events.subscribe('open-work', (data) => {
      this.events.unsubscribe('open-work');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(WorkPage, {'_id': work._id});
    this.navCtrl.navigateForward(['/work', {'_id': work.id}]);
  }

  // createWork(){
  //   this.events.subscribe('create-work', (data) => {
  //     if (this.select){
  //       // this.navCtrl.navigateBack().then(() => {
  //         this.modalCtrl.dismiss();
  //         this.events.publish('select-work', data);
  //       // });
  //     }
  //     this.events.unsubscribe('create-work');
  //   })
  //   // let newRootNav = <NavController>this.app.getRootNavById('n4');
  //   // newRootNav.push(WorkPage, {});
  //   this.navCtrl.navigateForward(['/work', {}]);
  // }


    createWork() {
      return new Promise(async resolve => {
        this.events.unsubscribe('select-process');
        this.events.subscribe('select-process', async (data) => {
          // this.setActivity(data);
          console.log("data", data);
          // let startTask = await this.restProvider.getStartTaskRenderedForm(data.id);
          // console.log("startTask", startTask);
          this.navCtrl.navigateForward(['/work', {data: data.id, key: data.key}]);
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: ProcessListPage,
          componentProps: {
            "select": true,
          }
        });
        profileModal.present();
      });
    }

  deleteWork(work){
    let index = this.works.indexOf(work);
    // this.works.splice(index, 1);
    this.worksService.deleteWork(work);
  }
}

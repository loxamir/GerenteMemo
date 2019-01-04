import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, Events } from '@ionic/angular';
import { CheckPage } from '../check/check.page';
import 'rxjs/Rx';
// import { ChecksService } from './checks.service';


@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.page.html',
  styleUrls: ['./check-list.page.scss'],
})
export class CheckListPage implements OnInit {
  checks: any;
  loading: any;
  select;
  searchTerm: string = '';
  // has_search = false;
  page = 0;

  constructor(
    public navCtrl: NavController,
    // public app: App,
    // public checksService: ChecksService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public events: Events,
    // public navParams: NavParams,
  ) {
    //this.loading = //this.loadingCtrl.create();
    // this.select = this.navParams.get('select');
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    //console.log('Begin async operation');
    setTimeout(() => {
      this.getChecks(this.searchTerm, this.page).then((checks: any[]) => {
        checks.forEach(check => {
          this.checks.push(check);
        });
        // this.checks = checks;
        this.page += 1;
      });
      //console.log('Async operation has ended');
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.getChecks(this.searchTerm, 0).then((checks: any[]) => {
        this.checks = checks;
      });
      this.page = 1;
      refresher.target.complete();
    }, 200);
  }

  setFilteredItems() {
    this.getChecks(this.searchTerm, 0).then((checks) => {
      this.checks = checks;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doRefreshList() {
    setTimeout(() => {
      this.getChecks(this.searchTerm, 0).then((checks: any[]) => {
        this.checks = checks;
        this.page = 1;
      });
    }, 200);
  }

  selectCheck(check) {
    //console.log("selectCheck");
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-check', check);
      // });
    } else {
      this.openCheck(check);
    }
  }

  async openCheck(check) {
    this.events.subscribe('open-check', (data) => {
      this.events.unsubscribe('open-check');
      // this.doRefreshList();
    })
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CheckPage,
        componentProps: {
          select: true,
          '_id': check._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/check', {'_id': check._id}]);
    }
  }

  createChesck(){
    this.events.subscribe('create-check', async (data) => {
      if (this.select){

        // this.navCtrl.navigateBack().then(() => {
          // this.events.publish('select-check', data);
        // });
      }
      this.events.unsubscribe('create-check');
      this.doRefreshList();
    })
    // this.navCtrl.navigateForward(['/check', {}]);
  }

  async createCheck(){
    this.events.subscribe('create-check', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-check', data);
          this.modalCtrl.dismiss()
        // });
      }
      this.events.unsubscribe('create-check');
      // this.doRefreshList();
    })
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: CheckPage,
        componentProps: {
          select: true
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/check', {}]);
    }
  }

  getChecks(keyword, page){
    return this.pouchdbService.searchDocTypeData('check', keyword, page);
    // return this.pouchdbService.searchDocTypePage('check');
  }

  deleteCheck(check) {
    return this.pouchdbService.deleteDoc(check);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

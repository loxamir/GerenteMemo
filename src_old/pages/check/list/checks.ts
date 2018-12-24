import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams,  Events } from '@ionic/angular';
import { CheckPage } from '../check';
import 'rxjs/Rx';
//import { ChecksModel } from './checks.model';
import { ChecksService } from './checks.service';

@Component({
  selector: 'checks-page',
  templateUrl: 'checks.html'
})
export class ChecksPage {
  checks: any;
  loading: any;
  select: boolean;
  searchTerm: string = '';
  // has_search = false;
  page = 0;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public checksService: ChecksService,
    public loadingCtrl: LoadingController,
    
    public route: ActivatedRoute,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    //console.log('Begin async operation');
    setTimeout(() => {
      this.checksService.getChecks(this.searchTerm, this.page).then((checks: any[]) => {
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
      this.checksService.getChecks(this.searchTerm, 0).then((checks: any[]) => {
        this.checks = checks;
      });
      this.page = 1;
      refresher.target.complete();
    }, 200);
  }

  setFilteredItems() {
    this.checksService.getChecks(this.searchTerm, 0).then((checks) => {
      this.checks = checks;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doRefreshList() {
    setTimeout(() => {
      this.checksService.getChecks(this.searchTerm, 0).then((checks: any[]) => {
        this.checks = checks;
        this.page = 1;
      });
    }, 200);
  }

  selectCheck(check) {
    //console.log("selectCheck");
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-check', check);
      });
    } else {
      this.openCheck(check);
    }
  }

  openCheck(check) {
    this.events.subscribe('open-check', (data) => {
      this.events.unsubscribe('open-check');
      this.doRefreshList();
    })
    this.navCtrl.navigateForward(CheckPage,{'_id': check._id});
  }

  createCheck(){
    this.events.subscribe('create-check', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-check', data);
        });
      }
      this.events.unsubscribe('create-check');
      this.doRefreshList();
    })
    this.navCtrl.navigateForward(CheckPage, {});
  }

  deleteCheck(check){
    let index = this.checks.indexOf(check);
    this.checks.splice(index, 1);
    this.checksService.deleteCheck(check);
  }

}

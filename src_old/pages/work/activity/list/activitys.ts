import { Component } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
import { ActivityPage } from '../activity';
import 'rxjs/Rx';
import { ActivitysService } from './activitys.service';

@Component({
  selector: 'activitys-page',
  templateUrl: 'activitys.html'
})
export class ActivitysPage {
  activitys: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    public app: App,
    public activitysService: ActivitysService,
    public loadingCtrl: LoadingController,
    
    public modal: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.events.subscribe('changed-activity', (change) => {
      this.activitysService.handleChange(this.activitys, change);
    })
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.activitysService.getActivitysPage(
      this.searchTerm, 0
    ).then((activitys: any[]) => {
      this.activitys = activitys;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.activitysService.getActivitysPage(
        this.searchTerm, this.page
      ).then((activitys: any[]) => {
        // this.activitys = activitys
        activitys.forEach(activity => {
          this.activitys.push(activity);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  searchItems() {
    this.activitysService.searchItems(
      this.searchTerm, 0
    ).then((activitys) => {
      this.activitys = activitys;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.activitysService.getActivitysPage(
        this.searchTerm, 0
      ).then((activitys: any[]) => {
        this.activitys = activitys;
        this.page = 1;
      });
      refresher.target.complete();
    }, 200);
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(ActivitysPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  openActivity(activity) {
    this.events.subscribe('open-activity', (data) => {
      this.events.unsubscribe('open-activity');
    })
    this.navCtrl.navigateForward(ActivityPage, {'_id': activity._id});
  }

  selectActivity(activity) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-activity', activity);
      });
    } else {
      this.openActivity(activity);
    }
  }

  createActivity(){
    this.events.subscribe('create-activity', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-activity', data);
        });
      }
      this.events.unsubscribe('create-activity');
    })
    this.navCtrl.navigateForward(ActivityPage, {});
  }

  deleteActivity(activity){
    let index = this.activitys.indexOf(activity)
    this.activitys.splice(index, 1);
    this.activitysService.deleteActivity(activity);
  }

}

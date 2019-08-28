import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
import { ActivityPage } from '../activity/activity.page';
import 'rxjs/Rx';
import { ActivitysService } from './activitys.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";

@Component({
  selector: 'app-activitys',
  templateUrl: './activitys.page.html',
  styleUrls: ['./activitys.page.scss'],
})
export class ActivitysPage implements OnInit {
  activitys: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    public activitysService: ActivitysService,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    //this.loading = //this.loadingCtrl.create({});
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.events.subscribe('changed-activity', (change) => {
      this.activitysService.handleChange(this.activitys, change);
    })
  }

  async ngOnInit() {
    let language: any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    if (this.filter == 'showLess'){
      this.activitysService.getActivitysPage(
        this.searchTerm, 0, 'show'
      ).then((activitys: any[]) => {
        this.activitys = activitys;
        this.page = 1;
        this.loading.dismiss();
      });
    } else {
      this.activitysService.getActivitysPage(
        this.searchTerm, 0
      ).then((activitys: any[]) => {
        this.activitys = activitys;
        this.page = 1;
        this.loading.dismiss();
      });
    }
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

  async openActivity(activity) {
    this.events.subscribe('open-activity', (data) => {
      this.events.unsubscribe('open-activity');
    })
    // this.navCtrl.navigateForward(ActivityPage, {'_id': activity._id});
    if (this.select) {
      // this.navCtrl.navigateForward(['/product', { '_id': product._id }]);
      let profileModal = await this.modalCtrl.create({
        component: ActivityPage,
        componentProps: {
          "select": true,
          "_id": activity._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/activity', {'_id': activity._id}]);
    }
  }

  selectActivity(activity) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-activity', activity);
      // });
    } else {
      this.openActivity(activity);
    }
  }

  createActivity(){
    this.events.subscribe('create-activity', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.modalCtrl.dismiss();
          this.events.publish('select-activity', data);
        // });
      }
      this.events.unsubscribe('create-activity');
    })
    // this.navCtrl.navigateForward(ActivityPage, {});
    this.navCtrl.navigateForward(['/activity', {}]);
  }

  deleteActivity(activity){
    let index = this.activitys.indexOf(activity)
    this.activitys.splice(index, 1);
    this.activitysService.deleteActivity(activity);
  }

}

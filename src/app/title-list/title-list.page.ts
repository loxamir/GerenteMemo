import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, PopoverController} from '@ionic/angular';
import { TitlePage } from '../title/title.page';
import 'rxjs/Rx';
// import { TitlesService } from './titles.service';
import { TranslateService } from '@ngx-translate/core';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
@Component({
  selector: 'app-title-list',
  templateUrl: './title-list.page.html',
  styleUrls: ['./title-list.page.scss'],
})
export class TitleListPage implements OnInit {
  titles: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  // has_search = false;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    // public app: App,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    // if (this.select){
    //   this.has_search = true;
    // }
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
  }

  ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
    //this.loading.present();
    this.setFilteredItems();
  }
  // setSearch() {
  //   if (this.has_search){
  //     this.searchTerm = "";
  //     this.setFilteredItems();
  //   }
  //   this.has_search = ! this.has_search;
  // }
  // startFilteredItems() {
  //   //console.log("setFilteredItems");
  //   let filter = null;
  //   if (this.filter == "all"){
  //     let filter = null;
  //   } else {
  //     let filter = this.filter;
  //   }
  //   this.getTitlesPage(this.searchTerm, 0, filter).then((titles: any[]) => {
  //     console.log("this.filter", this.filter);
  //     this.titles = titles;
  //
  //     this.page = 1;
  //     //this.loading.dismiss();
  //   });
  // }
  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getTitlesPage(
      this.searchTerm, 0, filter
    ).then((titles: any[]) => {
      this.titles = titles;
      this.page = 1;
    });
  }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getTitlesPage(
        this.searchTerm, this.page
      ).then((titles: any[]) => {
        // this.titles = titles
        titles.forEach(title => {
          this.titles.push(title);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 200);
  }
  doRefresh(refresher) {
    setTimeout(() => {
      this.getTitlesPage(this.searchTerm, 0).then((titles: any[]) => {
        if (this.filter == 'all'){
          this.titles = titles;
        }
        else if (this.filter == 'seller'){
          this.titles = titles.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.titles = titles.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.titles = titles.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.titles = titles.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 500);
  }
  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(TitlesPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  async openTitle(title) {
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: TitlePage,
        componentProps: {
          _id: title._id,
          select: true,
        }
      });
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/title', {'_id': title._id}]);
    }
    this.events.subscribe('open-title', (data) => {
      this.events.unsubscribe('open-title');
    })
  }

  selectTitle(title) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-title', title);
      // });
    } else {
      this.openTitle(title);
    }
  }

  async createTitle(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: TitlePage,
        componentProps: {
          select: true,
        }
      });
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/title', {}]);
    }
    this.events.subscribe('create-title', (data) => {
      if (this.select){
        // this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-title', data);
        // });
      }
      this.events.unsubscribe('create-title');
    })
  }

  getTitlesPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'title', keyword, page, "document", field
      ).then((titles: any[]) => {
        resolve(titles);
      });
    });
  }

  deleteTitle(title) {
    return this.pouchdbService.deleteDoc(title);
  }

}

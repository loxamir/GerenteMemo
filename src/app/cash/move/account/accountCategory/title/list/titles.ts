import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, ModalController, Events, PopoverController} from '@ionic/angular';
import { TitlePage } from '../title';
import 'rxjs/Rx';
import { TitlesService } from './titles.service';
import { TitlesPopover } from './titles.popover';

@Component({
  selector: 'titles-page',
  templateUrl: 'titles.html'
})
export class TitlesPage {
  titles: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  has_search = false;
  filter: string = 'all';

  constructor(
    public navCtrl: NavController,
    public app: App,
    public titlesService: TitlesService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public modal: ModalController,
    public navParams: NavParams,
    public events: Events,
    public popoverCtrl: PopoverController,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
    if (this.select){
      this.has_search = true;
    }
    this.filter = this.navParams.get('filter')||'all';
  }

  ionViewDidLoad() {
    this.loading.present();
    this.startFilteredItems();
  }
  setSearch() {
    if (this.has_search){
      this.searchTerm = "";
      this.setFilteredItems();
    }
    this.has_search = ! this.has_search;
  }
  startFilteredItems() {
    //console.log("setFilteredItems");
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.titlesService.getTitlesPage(this.searchTerm, 0, filter).then((titles: any[]) => {
      console.log("this.filter", this.filter);
      this.titles = titles;

      this.page = 1;
      this.loading.dismiss();
    });
  }
  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.titlesService.getTitlesPage(this.searchTerm, 0, filter).then((titles: any[]) => {
        this.titles = titles;
      // this.titles = titles;
      this.page = 1;
    });
  }
  // setFilteredItems() {
  //   if (this.searchTerm == ""){
  //     this.titlesService.getTitlesPage(this.searchTerm, 0).then((titles) => {
  //       this.titles = titles;
  //     });
  //   } else {
  //     console.log("search", this.searchTerm);
  //     let selector = {
  //       "$and": [
  //         {
  //           "$or": [
  //             {code: { $regex: RegExp(this.searchTerm, "i") }},
  //             {name: { $regex: RegExp(this.searchTerm, "i") }},
  //             {document: { $regex: RegExp(this.searchTerm, "i") }},
  //           ]
  //         },
  //         {docType: 'title'},
  //       ]
  //     }
  //     let sort = [ {'_id' : 'desc'} ];
  //     this.titlesService.searchTitles(selector, sort).then((titles) => {
  //       console.log("titles", titles);
  //       this.titles = titles;
  //     });
  //   }
  // }
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.titlesService.getTitlesPage(this.searchTerm, this.page).then((titles: any[]) => {
        // this.titles = titles
        titles.forEach(title => {
          this.titles.push(title);
        });
        this.page += 1;
      });
      infiniteScroll.complete();
    }, 200);
  }
  doRefresh(refresher) {
    setTimeout(() => {
      this.titlesService.getTitlesPage(this.searchTerm, 0).then((titles: any[]) => {
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
      refresher.complete();
    }, 500);
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(TitlesPopover);
    popover.present({
      ev: myEvent
    });
  }

  openTitle(title) {
    this.events.subscribe('open-title', (data) => {
      this.events.unsubscribe('open-title');
    })
    this.navCtrl.push(TitlePage, {'_id': title._id});
  }

  selectTitle(title) {
    if (this.select){
      this.navCtrl.pop().then(() => {
        this.events.publish('select-title', title);
      });
    } else {
      this.openTitle(title);
    }
  }

  createTitle(){
    this.events.subscribe('create-title', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-title', data);
        });
      }
      this.events.unsubscribe('create-title');
    })
    this.navCtrl.push(TitlePage, {});
  }

  deleteTitle(title){
    let index = this.titles.indexOf(title)
    this.titles.splice(index, 1);
    this.titlesService.deleteTitle(title);
  }

}

import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams,  Events } from '@ionic/angular';
import { CategoryPage } from '../category';
import 'rxjs/Rx';
import { CategoriesService } from './categories.service';

@Component({
  selector: 'categories-page',
  templateUrl: 'categories.html'
})
export class CategoriesPage {
  categories: any;
  loading: any;
  select: boolean;
  searchTerm: string = '';
  page = 0;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public categoriesService: CategoriesService,
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
    setTimeout(() => {
      this.categoriesService.getCategories(
        this.searchTerm, this.page
      ).then((categories: any[]) => {
        categories.forEach(account => {
          this.categories.push(account);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.categoriesService.getCategories(
      this.searchTerm,
      0
    ).then((categories) => {
      this.categories = categories;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  selectCategory(category) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-category', category);
      });
    } else {
      this.gotoCategory(category);
    }
  }

  gotoCategory(category) {
    this.events.subscribe('open-category', (data) => {
      this.events.unsubscribe('open-category');
    })
    this.navCtrl.navigateForward(CategoryPage, {'_id': category._id});
  }

  createCategory(){
    this.events.subscribe('create-category', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-category', data);
        });
      }
      this.events.unsubscribe('create-category');
    })
    this.navCtrl.navigateForward(CategoryPage, {});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  deleteCategory(category){
    let index = this.categories.indexOf(category);
    this.categories.splice(index, 1);
    this.categoriesService.deleteCategory(category);
  }

}

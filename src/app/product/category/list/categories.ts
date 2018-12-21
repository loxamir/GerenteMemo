import { Component } from '@angular/core';
import { NavController, App, LoadingController, NavParams, ViewController, Events } from '@ionic/angular';
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
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public events: Events,
  ) {
    this.loading = this.loadingCtrl.create();
    this.select = this.navParams.get('select');
  }

  ionViewDidLoad() {
    this.loading.present();
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
      infiniteScroll.complete();
    }, 50);
  }

  setFilteredItems() {
    this.categoriesService.getCategories(
      this.searchTerm,
      0
    ).then((categories) => {
      this.categories = categories;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  selectCategory(category) {
    if (this.select){
      this.navCtrl.pop().then(() => {
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
    this.navCtrl.push(CategoryPage, {'_id': category._id});
  }

  createCategory(){
    this.events.subscribe('create-category', (data) => {
      if (this.select){
        this.navCtrl.pop().then(() => {
          this.events.publish('select-category', data);
        });
      }
      this.events.unsubscribe('create-category');
    })
    this.navCtrl.push(CategoryPage, {});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.complete();
    }, 50);
  }

  deleteCategory(category){
    let index = this.categories.indexOf(category);
    this.categories.splice(index, 1);
    this.categoriesService.deleteCategory(category);
  }

}

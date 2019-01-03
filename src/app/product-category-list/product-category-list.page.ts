import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Events, ModalController } from '@ionic/angular';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCategoryPage } from '../product-category/product-category.page';
import 'rxjs/Rx';

@Component({
  selector: 'app-product-category-list',
  templateUrl: './product-category-list.page.html',
  styleUrls: ['./product-category-list.page.scss'],
})
export class ProductCategoryListPage implements OnInit {
  categories: any;
  loading: any;
  select;
  searchTerm: string = '';
  page = 0;

  constructor(
    public navCtrl: NavController,
    // public navPush: IonNavPush,
    public modalController: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public router: Router,
    // public navParams: NavParams,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');

  }

  ngOnInit() {
    this.setFilteredItems();
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getCategories(
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
    this.getCategories(
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
      // this.navCtrl.navigateBack('').then(() => {
        this.events.publish('select-category', category);
      // });
    } else {
      this.gotoCategory(category);
    }
  }

  gotoCategory(category) {
    this.events.subscribe('open-category', (data) => {
      this.events.unsubscribe('open-category');
    })
    // this.navCtrl.push(CategoryPage, {'_id': category._id});
    this.navCtrl.navigateForward(['product-category', {'_id': category._id}]);
  }

  async createCategory(){
    this.events.subscribe('create-category', (data) => {
      if (this.select){
        // this.navCtrl.pop().then(() => {
        // this.navCtrl.navigateBack('').then(() => {
          this.events.publish('select-category', data);
        // });
      }
      this.events.unsubscribe('create-category');
    })
    // this.modalController.dismiss();
    if (this.select){
      let modal = await this.modalController.create({
        component: ProductCategoryPage,
        componentProps: {
          select: true
        }
      })
      modal.present();
    }else {
      // this.router.navigate(['product-category', {}])
          this.navCtrl.navigateForward(['product-category', {}]);
          // .then(() => {
          //   this.events.publish('select-category', data);
          // });
    }
    // this.navCtrl.push(CategoryPage, {});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  // deleteCategory(category){
  //   let index = this.categories.indexOf(category);
  //   this.categories.splice(index, 1);
  //   this.categoriesService.deleteCategory(category);
  // }

  getCategories(keyword, page){
    return this.pouchdbService.searchDocTypeData('category', keyword, page);
  }

  deleteCategory(category) {
    return this.pouchdbService.deleteDoc(category);
  }

}

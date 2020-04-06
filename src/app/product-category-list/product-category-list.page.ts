import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCategoryPage } from '../product-category/product-category.page';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { Events } from '../services/events';

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
    public languageService: LanguageService,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public router: Router,
    public translate: TranslateService,
    public events: Events,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');

  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
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
        this.modalCtrl.dismiss();
        this.events.publish('select-category', category);
      // });
    } else {
      this.openCategory(category);
    }
  }

  async openCategory(category) {
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: ProductCategoryPage,
        componentProps: {
          "select": true,
          _id: category._id,
        }
      });
      await profileModal.present();
    } else {
      this.navCtrl.navigateForward(['product-category', {
        '_id': category._id
      }]);
    }
    this.events.subscribe('open-category', (data) => {
      this.events.unsubscribe('open-category');
    })
    // this.navCtrl.push(CategoryPage, {'_id': category._id});
  }

  async createCategory(){
    this.events.subscribe('create-category', (data) => {
      if (this.select){
        // this.navCtrl.pop().then(() => {
        // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
          this.events.publish('select-category', data);
        // });
      }
      this.events.unsubscribe('create-category');
    })
    // this.modalCtrl.dismiss();
    if (this.select){
      let modal = await this.modalCtrl.create({
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
    return this.pouchdbService.searchDocTypeData(
      'category',
      keyword, page,
      undefined,
      undefined,
      'sequence',
      'increase'
    );
  }

  deleteCategory(category) {
    return this.pouchdbService.deleteDoc(category);
  }

}

import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, Events, ModalController } from '@ionic/angular';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandPage } from '../brand/brand.page';
import 'rxjs/Rx';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.page.html',
  styleUrls: ['./brand-list.page.scss'],
})
export class BrandListPage implements OnInit {
  brands: any;
  loading: any;
  select;
  searchTerm: string = '';
  page = 0;

  constructor(
    public navCtrl: NavController,
    // public navPush: IonNavPush,
    public modalCtrl: ModalController,
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
      this.getBrands(
        this.searchTerm, this.page
      ).then((brands: any[]) => {
        brands.forEach(account => {
          this.brands.push(account);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  setFilteredItems() {
    this.getBrands(
      this.searchTerm,
      0
    ).then((brands) => {
      this.brands = brands;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  selectBrand(brand) {
    if (this.select){
      // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
        this.events.publish('select-brand', brand);
      // });
    } else {
      this.openBrand(brand);
    }
  }

  async openBrand(brand) {
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: BrandPage,
        componentProps: {
          "select": true,
          _id: brand._id,
        }
      });
      await profileModal.present();
    } else {
      this.navCtrl.navigateForward(['brand', {
        '_id': brand._id
      }]);
    }
    this.events.subscribe('open-brand', (data) => {
      this.events.unsubscribe('open-brand');
    })
    // this.navCtrl.push(BrandPage, {'_id': brand._id});
  }

  async createBrand(){
    this.events.subscribe('create-brand', (data) => {
      if (this.select){
        // this.navCtrl.pop().then(() => {
        // this.navCtrl.navigateBack('').then(() => {
        this.modalCtrl.dismiss();
          this.events.publish('select-brand', data);
        // });
      }
      this.events.unsubscribe('create-brand');
    })
    // this.modalCtrl.dismiss();
    if (this.select){
      let modal = await this.modalCtrl.create({
        component: BrandPage,
        componentProps: {
          select: true
        }
      })
      modal.present();
    }else {
      // this.router.navigate(['brand', {}])
          this.navCtrl.navigateForward(['brand', {}]);
          // .then(() => {
          //   this.events.publish('select-brand', data);
          // });
    }
    // this.navCtrl.push(BrandPage, {});
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  // deleteBrand(brand){
  //   let index = this.brands.indexOf(brand);
  //   this.brands.splice(index, 1);
  //   this.brandsService.deleteBrand(brand);
  // }

  getBrands(keyword, page){
    return this.pouchdbService.searchDocTypeData('brand', keyword, page);
  }

  deleteBrand(brand) {
    return this.pouchdbService.deleteDoc(brand);
  }

}

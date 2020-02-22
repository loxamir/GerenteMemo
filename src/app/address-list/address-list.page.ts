import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, ViewChild, OnInit  } from '@angular/core';
import { NavController, LoadingController, ModalController,
  PopoverController, ToastController } from '@ionic/angular';
import { AddressPage } from '../address/address.page';
import 'rxjs/Rx';
import { LanguageService } from "../services/language/language.service";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from "../services/auth.service";
import { Events } from '../services/events';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.page.html',
  styleUrls: ['./address-list.page.scss'],
})
export class AddressListPage implements OnInit {
  addresss: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';
  contact_id;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public events: Events,
    public pouchdbService: PouchdbService,
    public popoverCtrl: PopoverController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public languageService: LanguageService,
    public translate: TranslateService,
    public authService: AuthService,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this.events.subscribe('changed-address', (data:any )=>{
      this.handleChange(this.addresss, data.change);
    })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    await this.setFilteredItems();
    if (this.addresss.length == 0){
      this.createAddress();
    }
    this.authService.loggedIn.subscribe(async status => {
      if (status) {
        let data = await this.authService.getData();
        this.contact_id = "contact."+data.currentUser.email;
      }
    })
  }

  setFilteredItems() {
    return new Promise(async resolve => {
      this.getAddresssPage(
        this.searchTerm, 0
      ).then(async (addresss: any[]) => {
        this.addresss = addresss;
        this.page = 1;
        await this.loading.dismiss();
        resolve(true)
      });
    });
  }

  getAddresssPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'address', keyword, page, "document", field, 'name', 'increase'
      ).then((addresss: any[]) => {
        resolve(addresss);
      });
    });
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'address',
      this.contact_id,
      page,
      "contact_id",
      undefined,
      'name',
      'increase'
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  async deleteAddress(address) {
    await this.pouchdbService.deleteDoc(address);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  searchItems() {
    this.searchItemsS(this.searchTerm, 0).then((sales) => {
      this.addresss = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAddresssPage(this.searchTerm, this.page).then((addresss: any[]) => {
        let list = [];
        list = addresss;
        list.forEach(address => {
          this.addresss.push(address);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  async openAddress(address) {
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AddressPage,
        componentProps: {
          "select": true,
          "_id": address._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/address', {'_id': address._id}]);
    }
  }

  selectAddress(address) {
    if (this.select){
      this.events.publish('select-address', {address: address});
      this.modalCtrl.dismiss();
    } else {
      this.openAddress(address);
    }
  }

  async createAddress(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: AddressPage,
        componentProps: {
          select: true,
        }
      })
      profileModal.present();
    } else {
      this.router.navigate(['address', {}]);
    }
    this.events.subscribe('create-address', (data) => {
      if (this.select){
        this.events.publish('select-address', {"address": data.address});
        this.modalCtrl.dismiss();
      }
      this.events.unsubscribe('create-address');
    })
  }
}

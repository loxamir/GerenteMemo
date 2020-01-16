import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, ViewChild, OnInit  } from '@angular/core';
import { NavController, LoadingController, ModalController, Events,
  PopoverController, ToastController } from '@ionic/angular';
import { AddressPage } from '../address/address.page';
import 'rxjs/Rx';
import { LanguageService } from "../services/language/language.service";
import { AddressListPopover } from './address-list.popover';
import { File } from '@ionic-native/file/ngx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.page.html',
  styleUrls: ['./address-list.page.scss'],
})
export class AddressListPage implements OnInit {
  @ViewChild('searchBar', { static: true }) searchBar;

  addresss: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';
  supplier;
  seller;
  employee;
  customer;
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
    public file: File,
    public loadingCtrl: LoadingController,
    public languageService: LanguageService,
    public translate: TranslateService,
    public authService: AuthService,
  ) {
    // this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.supplier = this.route.snapshot.paramMap.get('supplier') || false;
    this.seller = this.route.snapshot.paramMap.get('seller')|| false;
    this.employee = this.route.snapshot.paramMap.get('employee')|| false;
    this.customer = this.route.snapshot.paramMap.get('customer')|| false;
    this.events.subscribe('changed-address', (change)=>{
      this.handleChange(this.addresss, change);
    })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
    // this.events.subscribe('got-database', ()=>{
    //   this.setFilteredItems();
    // })
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

      console.log("status", status);
      if (status) {
        // this.logged = true;
        let data = await this.authService.getData();
        this.contact_id = "contact."+data.currentUser.email;
      }
    })
    // setTimeout(() => {
    //   if(this.select){
    //     this.searchBar.setFocus();
    //   }
    // }, 200);
  }

  setFilteredItems() {
    return new Promise(async resolve => {
      let filter = null;
      if (this.filter == "all"){
        let filter = null;
      } else {
        let filter = this.filter;
      }
      this.getAddresssPage(
        this.searchTerm, 0, filter
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
    // this.loading = await this.loadingCtrl.create({});
    // await this.loading.present();
    // let viewList: any = await this.pouchdbService.getView('Informes/addressUse', 1,
    // [address._id],
    // [address._id+"z"]);
    // if (viewList.length){
    //   this.loading.dismiss();
    //   let toast = await this.toastCtrl.create({
    //   message: "No se puede borrar, addresso en uso",
    //   duration: 1000
    //   });
    //   toast.present();
    // } else {
      await this.pouchdbService.deleteDoc(address);
    //   this.loading.dismiss();
    // }
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  searchItems() {
    this.searchItemsS(this.searchTerm, 0).then((sales) => {
      // console.log("addresss", sales);
      this.addresss = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getAddresssPage(this.searchTerm, this.page).then((addresss: any[]) => {

        let list = [];
        // if (this.filter == 'all'){
          list = addresss;
        // }
        // else if (this.filter == 'seller'){
        //   list = addresss.filter(word => word.seller == true);
        // }
        // else if (this.filter == 'customer'){
        //   list = addresss.filter(word => word.customer == true);
        // }
        // else if (this.filter == 'supplier'){
        //   list = addresss.filter(word => word.supplier == true);
        // }
        // else if (this.filter == 'employee'){
        //   list = addresss.filter(word => word.employee == true);
        // }


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
      // this.getAddresssPage(this.searchTerm, 0).then((addresss: any[]) => {
      //   if (this.filter == 'all'){
      //     this.addresss = addresss;
      //   }
      //   else if (this.filter == 'seller'){
      //     this.addresss = addresss.filter(word => word.seller == true);
      //   }
      //   else if (this.filter == 'customer'){
      //     this.addresss = addresss.filter(word => word.customer == true);
      //   }
      //   else if (this.filter == 'supplier'){
      //     this.addresss = addresss.filter(word => word.supplier == true);
      //   }
      //   else if (this.filter == 'employee'){
      //     this.addresss = addresss.filter(word => word.employee == true);
      //   }
      //   this.page = 1;
      // });
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(AddresssPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }
  async presentPopover(myEvent) {
    // console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: AddressListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async openAddress(address) {
    this.events.subscribe('open-address', (data) => {
      this.events.unsubscribe('open-address');
    })
    // console.log("address", address);
    // if (this.select){
    //   // this.navCtrl.push(AddressPage, {'_id': address._id});
    //   this.router.navigate(['address', {'_id': address._id}]);
    // } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // newRootNav.push(AddressPage, {'_id': address._id});

      // this.router.navigate(['address', {'_id': address._id}]);
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
    // }
  }

  selectAddress(address) {
    if (this.select){
      // this.navCtrl.pop().then(() => {
        this.events.publish('select-address', address);
        this.modalCtrl.dismiss();
      // });
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
          'supplier': this.supplier,
          'seller': this.seller,
          'employee': this.employee,
          'customer': this.customer,
        }
      })
      profileModal.present();
    } else {
      this.router.navigate(['address', {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      }]);
    }
    this.events.subscribe('create-address', (data) => {
      // console.log("select", data);
      if (this.select){
        this.events.publish('select-address', data);
        // console.log("dismiss");
        this.modalCtrl.dismiss();

        // });
      }
      this.events.unsubscribe('create-address');
    })
  }
}

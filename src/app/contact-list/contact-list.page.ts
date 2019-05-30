import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, ViewChild, OnInit  } from '@angular/core';
import { NavController, LoadingController, ModalController, Events, PopoverController} from '@ionic/angular';
import { ContactPage } from '../contact/contact.page';
import 'rxjs/Rx';
// import { ContactsService } from './contacts.service';
import { ContactListPopover } from './contact-list.popover';
import { File } from '@ionic-native/file/ngx';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';


@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.page.html',
  styleUrls: ['./contact-list.page.scss'],
})
export class ContactListPage implements OnInit {
  @ViewChild('searchBar') searchBar;

  contacts: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';
  supplier;
  seller;
  employee;
  customer;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public events: Events,
    public pouchdbService: PouchdbService,
    public popoverCtrl: PopoverController,
    public file: File,
    public loadingCtrl: LoadingController,
  ) {
    // //this.loading = //this.loadingCtrl.create();
    // this._id = this.route.snapshot.paramMap.get('_id');
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.supplier = this.route.snapshot.paramMap.get('supplier') || false;
    this.seller = this.route.snapshot.paramMap.get('seller')|| false;
    this.employee = this.route.snapshot.paramMap.get('employee')|| false;
    this.customer = this.route.snapshot.paramMap.get('customer')|| false;
    this.events.subscribe('changed-contact', (change)=>{
      this.handleChange(this.contacts, change);
    })
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
    // this.events.subscribe('got-database', ()=>{
    //   this.setFilteredItems();
    // })
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    this.setFilteredItems();
    setTimeout(() => {
      if(this.select){
        this.searchBar.setFocus();
      }
    }, 500);
  }

  setFilteredItems() {
    console.log("tes1");
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getContactsPage(
      this.searchTerm, 0, filter
    ).then((contacts: any[]) => {
      console.log("contacts", contacts);

      // if (this.filter == 'all'){
        this.contacts = contacts;
      // }
      // else if (this.filter == 'seller'){
      //   this.contacts = contacts.filter(word => word.seller == true);
      // }
      // else if (this.filter == 'customer'){
      //   this.contacts = contacts.filter(word => word.customer == true);
      // }
      // else if (this.filter == 'supplier'){
      //   this.contacts = contacts.filter(word => word.supplier == true);
      // }
      // else if (this.filter == 'employee'){
      //   this.contacts = contacts.filter(word => word.employee == true);
      // }
      this.page = 1;

      // this.contacts = contacts;
      // this.page = 1;
      this.loading.dismiss();
    });
  }

  getContactsPage(keyword, page, field=''){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'contact', keyword, page, "document", field, 'name', 'increase'
      ).then((contacts: any[]) => {
        resolve(contacts);
      });
    });
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'contact',
      keyword,
      page,
      "document",
      undefined,
      'name',
      'increase'
    ).then((sales) => {
        resolve(sales);
      })
    })
  }

  deleteContact(contact) {
    return this.pouchdbService.deleteDoc(contact);
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  searchItems() {
    this.searchItemsS(this.searchTerm, 0).then((sales) => {
      console.log("contacts", sales);
      this.contacts = sales;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getContactsPage(this.searchTerm, this.page).then((contacts: any[]) => {

        let list = [];
        // if (this.filter == 'all'){
          list = contacts;
        // }
        // else if (this.filter == 'seller'){
        //   list = contacts.filter(word => word.seller == true);
        // }
        // else if (this.filter == 'customer'){
        //   list = contacts.filter(word => word.customer == true);
        // }
        // else if (this.filter == 'supplier'){
        //   list = contacts.filter(word => word.supplier == true);
        // }
        // else if (this.filter == 'employee'){
        //   list = contacts.filter(word => word.employee == true);
        // }


        list.forEach(contact => {
          this.contacts.push(contact);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      // this.getContactsPage(this.searchTerm, 0).then((contacts: any[]) => {
      //   if (this.filter == 'all'){
      //     this.contacts = contacts;
      //   }
      //   else if (this.filter == 'seller'){
      //     this.contacts = contacts.filter(word => word.seller == true);
      //   }
      //   else if (this.filter == 'customer'){
      //     this.contacts = contacts.filter(word => word.customer == true);
      //   }
      //   else if (this.filter == 'supplier'){
      //     this.contacts = contacts.filter(word => word.supplier == true);
      //   }
      //   else if (this.filter == 'employee'){
      //     this.contacts = contacts.filter(word => word.employee == true);
      //   }
      //   this.page = 1;
      // });
      this.setFilteredItems();
      refresher.target.complete();
    }, 50);
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(ContactsPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }
  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: ContactListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async openContact(contact) {
    this.events.subscribe('open-contact', (data) => {
      this.events.unsubscribe('open-contact');
    })
    console.log("contact", contact);
    // if (this.select){
    //   // this.navCtrl.push(ContactPage, {'_id': contact._id});
    //   this.router.navigate(['contact', {'_id': contact._id}]);
    // } else {
      // let newRootNav = <NavController>this.app.getRootNavById('n4');
      // newRootNav.push(ContactPage, {'_id': contact._id});

      // this.router.navigate(['contact', {'_id': contact._id}]);
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: ContactPage,
        componentProps: {
          "select": true,
          "_id": contact._id,
        }
      })
      profileModal.present();
    } else {
      this.navCtrl.navigateForward(['/contact', {'_id': contact._id}]);
    }
    // }
  }

  selectContact(contact) {
    if (this.select){
      // this.navCtrl.pop().then(() => {
        this.events.publish('select-contact', contact);
        this.modalCtrl.dismiss();
      // });
    } else {
      this.openContact(contact);
    }
  }

  async createContact(){
    if (this.select){
      let profileModal = await this.modalCtrl.create({
        component: ContactPage,
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
      this.router.navigate(['contact', {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      }]);
    }
    this.events.subscribe('create-contact', (data) => {
      console.log("select", data);
      if (this.select){
        this.events.publish('select-contact', data);
        console.log("dismiss");
        this.modalCtrl.dismiss();

        // });
      }
      this.events.unsubscribe('create-contact');
    })
  }

  private discard() {
    if (this.select){
      this.modalCtrl.dismiss();
    } else {
      // this.receiptForm.markAsPristine();
      this.navCtrl.navigateBack('/agro-tabs/area-list');
    }
  }
}

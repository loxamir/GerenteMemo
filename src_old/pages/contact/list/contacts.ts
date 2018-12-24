import { Component, Input, ViewChild  } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
import { ContactPage } from '../contact';
import 'rxjs/Rx';
import { ContactsService } from './contacts.service';
import { ContactsPopover } from './contacts.popover';
import { File } from '@ionic-native/file';

@Component({
  selector: 'contacts-page',
  templateUrl: 'contacts.html'
})
export class ContactsPage {
  @ViewChild('searchBar') myInput;
  contacts: any;
  loading: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  filter: string = 'all';
  supplier: boolean = false;
  seller: boolean = false;
  employee: boolean = false;
  customer: boolean = true;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public contactsService: ContactsService,
    public loadingCtrl: LoadingController,
    
    public modal: ModalController,
    public route: ActivatedRoute,
    public events: Events,
    public popoverCtrl: PopoverController,
    public file: File,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
    this.filter = this.route.snapshot.paramMap.get('filter')||'all';
    this.supplier = this.navParams.data.supplier|| false;
    this.seller = this.navParams.data.seller|| false;
    this.employee = this.navParams.data.employee|| false;
    this.customer = this.navParams.data.customer|| false;
    this.events.subscribe('changed-contact', (change)=>{
      this.contactsService.handleChange(this.contacts, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.contactsService.searchItems(this.searchTerm, 0).then((sales) => {
      console.log("contacts", sales);
      this.contacts = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }


  saveAsCsv() {
    var csv: any = this.convertToCSV(this.contacts)
    var fileName: any = "contacts.csv"
    this.file.writeFile(
      this.file.externalRootDirectory, fileName, csv, {replace:true}
    ).then(_ => {
              alert('Success ;-)')
      }).catch(err => {
              this.file.writeExistingFile(
                this.file.externalRootDirectory, fileName, csv
              ).then(_ => {
        alert('Success ;-)')
          }).catch(err => {
            alert('Failure')
          })
      })

  }

  convertToCSV(contacts) {
    var csv: any = 'Codigo,Nombre,Telefone,RUC,Direccion,Email,Es Cliente,Es Proveedor,Es Empleado,Es Vendedor,Anotación\r\n';

    contacts.forEach(contact => {
      csv += contact.code + "," +
      contact.name + "," +
      contact.phone + "," +
      contact.document + "," +
      contact.address + "," +
      contact.email + "," +
      contact.client + "," +
      contact.supplier + "," +
      contact.employee + "," +
      contact.seller + "," +
      '"' + contact.note + '"' +
      '\r\n';
    });
    return csv
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.contactsService.getContactsPage(this.searchTerm, 0, filter).then((contacts: any[]) => {
      this.contacts = contacts;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.contactsService.getContactsPage(this.searchTerm, this.page).then((contacts: any[]) => {
        contacts.forEach(contact => {
          this.contacts.push(contact);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.contactsService.getContactsPage(this.searchTerm, 0).then((contacts: any[]) => {
        if (this.filter == 'all'){
          this.contacts = contacts;
        }
        else if (this.filter == 'seller'){
          this.contacts = contacts.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.contacts = contacts.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.contacts = contacts.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.contacts = contacts.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(ContactsPopover);
    popover.present({
      ev: myEvent
    });
  }

  openContact(contact) {
    this.events.subscribe('open-contact', (data) => {
      this.events.unsubscribe('open-contact');
    })
    if (this.select){
      this.navCtrl.navigateForward(ContactPage, {'_id': contact._id});
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(ContactPage, {'_id': contact._id});
    }
  }

  selectContact(contact) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-contact', contact);
      });
    } else {
      this.openContact(contact);
    }
  }

  createContact(){
    this.events.subscribe('create-contact', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-contact', data);
        });
      }
      this.events.unsubscribe('create-contact');
    })
    if (this.select){
      this.navCtrl.navigateForward(ContactPage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(ContactPage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    }
  }

  deleteContact(contact){
    let index = this.contacts.indexOf(contact)
    this.contacts.splice(index, 1);
    this.contactsService.deleteContact(contact);
  }

}

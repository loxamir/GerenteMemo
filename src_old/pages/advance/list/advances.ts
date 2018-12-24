import { Component, Input, ViewChild  } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
import { AdvancePage } from '../advance';
import 'rxjs/Rx';
import { AdvancesService } from './advances.service';
import { AdvancesPopover } from './advances.popover';
import { File } from '@ionic-native/file';

@Component({
  selector: 'advances-page',
  templateUrl: 'advances.html'
})
export class AdvancesPage {
  @ViewChild('searchBar') myInput;
  advances: any;
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
    public advancesService: AdvancesService,
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
    this.events.subscribe('changed-advance', (change)=>{
      this.advancesService.handleChange(this.advances, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.advancesService.searchItems(this.searchTerm, 0).then((sales) => {
      console.log("advances", sales);
      this.advances = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }


  saveAsCsv() {
    var csv: any = this.convertToCSV(this.advances)
    var fileName: any = "advances.csv"
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

  convertToCSV(advances) {
    var csv: any = 'Codigo,Nombre,Telefone,RUC,Direccion,Email,Es Cliente,Es Proveedor,Es Empleado,Es Vendedor,Anotación\r\n';

    advances.forEach(advance => {
      csv += advance.code + "," +
      advance.name + "," +
      advance.phone + "," +
      advance.document + "," +
      advance.address + "," +
      advance.email + "," +
      advance.client + "," +
      advance.supplier + "," +
      advance.employee + "," +
      advance.seller + "," +
      '"' + advance.note + '"' +
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
    this.advancesService.getAdvancesPage(this.searchTerm, 0, filter).then((advances: any[]) => {
      this.advances = advances;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.advancesService.getAdvancesPage(this.searchTerm, this.page).then((advances: any[]) => {
        advances.forEach(advance => {
          this.advances.push(advance);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.advancesService.getAdvancesPage(this.searchTerm, 0).then((advances: any[]) => {
        if (this.filter == 'all'){
          this.advances = advances;
        }
        else if (this.filter == 'seller'){
          this.advances = advances.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.advances = advances.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.advances = advances.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.advances = advances.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(AdvancesPopover);
    popover.present({
      ev: myEvent
    });
  }

  openAdvance(advance) {
    this.events.subscribe('open-advance', (data) => {
      this.events.unsubscribe('open-advance');
    })
    if (this.select){
      this.navCtrl.navigateForward(AdvancePage, {'_id': advance._id});
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(AdvancePage, {'_id': advance._id});
    }
  }

  selectAdvance(advance) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-advance', advance);
      });
    } else {
      this.openAdvance(advance);
    }
  }

  createAdvance(){
    this.events.subscribe('create-advance', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-advance', data);
        });
      }
      this.events.unsubscribe('create-advance');
    })
    if (this.select){
      this.navCtrl.navigateForward(AdvancePage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(AdvancePage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    }
  }

  deleteAdvance(advance){
    let index = this.advances.indexOf(advance)
    this.advances.splice(index, 1);
    this.advancesService.deleteAdvance(advance);
  }

}

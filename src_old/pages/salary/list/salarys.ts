import { Component, Input, ViewChild  } from '@angular/core';
import { NavController, App, LoadingController,   ModalController, Events, PopoverController} from '@ionic/angular';
import { SalaryPage } from '../salary';
import 'rxjs/Rx';
import { SalarysService } from './salarys.service';
import { SalarysPopover } from './salarys.popover';
import { File } from '@ionic-native/file';

@Component({
  selector: 'salarys-page',
  templateUrl: 'salarys.html'
})
export class SalarysPage {
  @ViewChild('searchBar') myInput;
  salarys: any;
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
    public salarysService: SalarysService,
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
    this.events.subscribe('changed-salary', (change)=>{
      this.salarysService.handleChange(this.salarys, change);
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  searchItems() {
    this.salarysService.searchItems(this.searchTerm, 0).then((sales) => {
      console.log("salarys", sales);
      this.salarys = sales;
      this.page = 1;
      //this.loading.dismiss();
    });
  }


  saveAsCsv() {
    var csv: any = this.convertToCSV(this.salarys)
    var fileName: any = "salarys.csv"
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

  convertToCSV(salarys) {
    var csv: any = 'Codigo,Nombre,Telefone,RUC,Direccion,Email,Es Cliente,Es Proveedor,Es Empleado,Es Vendedor,Anotación\r\n';

    salarys.forEach(salary => {
      csv += salary.code + "," +
      salary.name + "," +
      salary.phone + "," +
      salary.document + "," +
      salary.address + "," +
      salary.email + "," +
      salary.client + "," +
      salary.supplier + "," +
      salary.employee + "," +
      salary.seller + "," +
      '"' + salary.note + '"' +
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
    this.salarysService.getSalarysPage(this.searchTerm, 0, filter).then((salarys: any[]) => {
      this.salarys = salarys;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.salarysService.getSalarysPage(this.searchTerm, this.page).then((salarys: any[]) => {
        salarys.forEach(salary => {
          this.salarys.push(salary);
        });
        this.page += 1;
      });
      infiniteScroll.target.complete();
    }, 50);
  }

  doRefresh(refresher) {
    setTimeout(() => {
      this.salarysService.getSalarysPage(this.searchTerm, 0).then((salarys: any[]) => {
        if (this.filter == 'all'){
          this.salarys = salarys;
        }
        else if (this.filter == 'seller'){
          this.salarys = salarys.filter(word => word.seller == true);
        }
        else if (this.filter == 'customer'){
          this.salarys = salarys.filter(word => word.customer == true);
        }
        else if (this.filter == 'supplier'){
          this.salarys = salarys.filter(word => word.supplier == true);
        }
        else if (this.filter == 'employee'){
          this.salarys = salarys.filter(word => word.employee == true);
        }
        this.page = 1;
      });
      refresher.target.complete();
    }, 50);
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(SalarysPopover);
    popover.present({
      ev: myEvent
    });
  }

  openSalary(salary) {
    this.events.subscribe('open-salary', (data) => {
      this.events.unsubscribe('open-salary');
    })
    if (this.select){
      this.navCtrl.navigateForward(SalaryPage, {'_id': salary._id});
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(SalaryPage, {'_id': salary._id});
    }
  }

  selectSalary(salary) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-salary', salary);
      });
    } else {
      this.openSalary(salary);
    }
  }

  createSalary(){
    this.events.subscribe('create-salary', (data) => {
      if (this.select){
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('select-salary', data);
        });
      }
      this.events.unsubscribe('create-salary');
    })
    if (this.select){
      this.navCtrl.navigateForward(SalaryPage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    } else {
      let newRootNav = <NavController>this.app.getRootNavById('n4');
      newRootNav.push(SalaryPage, {
        'supplier': this.supplier,
        'seller': this.seller,
        'employee': this.employee,
        'customer': this.customer,
      });
    }
  }

  deleteSalary(salary){
    let index = this.salarys.indexOf(salary)
    this.salarys.splice(index, 1);
    this.salarysService.deleteSalary(salary);
  }

}

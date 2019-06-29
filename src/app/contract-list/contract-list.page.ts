import { Component, OnInit } from '@angular/core';
import {
  NavController, LoadingController, PopoverController, Events,
  NavParams
} from '@ionic/angular';
import 'rxjs/Rx';
// import { File } from '@ionic-native/file';
import { ContractPage } from '../contract/contract.page';
// import { ContractsService } from './contracts.service';
import { ContractsPopover } from './contract-list.popover';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.page.html',
  styleUrls: ['./contract-list.page.scss'],
})
export class ContractListPage implements OnInit {
  contracts: any = [];
  loading: any;
  searchTerm: string = '';
  page = 0;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    // public contractsService: ContractsService,
    public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    public events:Events,
    public route: ActivatedRoute,
    // public file: File,
    public pouchdbService: PouchdbService,
    public languageService: LanguageService,
    public translate: TranslateService,
  ) {
    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.events.subscribe('changed-contract', (change)=>{
      this.handleChange(this.contracts, change);
    })
    this.events.subscribe('got-database', (change)=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getContractsPage(
        this.searchTerm,
        this.page
      ).then((contracts: any[]) => {
        contracts.forEach(contract => {
          this.contracts.push(contract);
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
    }, 200);
  }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: ContractsPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  async ngOnInit() {
    //this.loading.present();
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.setFilteredItems();
  }

  setFilteredItems() {
    this.getContractsPage(
      this.searchTerm, 0
    ).then((contracts) => {
      this.contracts = contracts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  searchItems() {
    this.searchItemsS(
      this.searchTerm, 0
    ).then((contracts) => {
      this.contracts = contracts;
      this.page = 1;
      this.loading.dismiss();
    });
  }

  openContract(contract) {
    this.events.subscribe('open-contract', (data) => {
      this.events.unsubscribe('open-contract');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ContractPage, {'_id': contract._id});
    this.navCtrl.navigateForward(['/contract', {'_id': contract._id}]);
  }

  createContract(){
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(ContractPage, {});
    this.navCtrl.navigateForward(['/contract', {}]);
  }

  // saveAsCsv() {
  //   console.log("Save CSV");
  //   var csv: any = this.convertToCSV(this.contracts)
  //   console.log("Save CSV2", csv);
  //   var fileName: any = "contracts.csv"
  //   this.file.writeFile(this.file.externalRootDirectory, fileName, csv, {replace:true})
  //     .then(
  //     _ => {
  //       alert('Success ;-)')
  //     }
  //     )
  //     .catch(
  //     err => {
  //
  //          this.file.writeExistingFile(this.file.externalRootDirectory, fileName, csv)
  //         .then(
  //         _ => {
  //       alert('Success ;-)')
  //         }
  //         )
  //         .catch(
  //         err => {
  //           alert('Failure')
  //         }
  //         )
  //     }
  //     )
  //
  // }

  convertToCSV(contracts) {
    var csv: any = 'Codigo,Cliente,Condicion de Pago,Fecha\r\n';

    contracts.forEach((contract, index) => {
      // if (contract.code){
      console.log("contract", contract);
        csv += contract.code + "," +
        (contract.contact && contract.contact.name|| contract.contact_name) + "," +
        contract.payment_name + "," +
        contract.date + "," +
        '\r\n';
        // console.log("sss", contract.code+"," + contract.name+"," + contract.price+"," + contract.cost+"," + contract.stock+"," + contract.tax+"," + contract.category_id+","+ contract.stock_min + "," + contract.type+",");
      // }
    });
    return csv
  }

  saveLinesAsCsv() {
    var csv: any = this.convertLinesToCSV(this.contracts)
    var fileName: any = "contracts.csv"
  }

  convertLinesToCSV(contracts) {
    var csv: any = 'Contrato,Producto,Precio,Cantidad\r\n';
    contracts.forEach((contract, index) => {
      contract.items.forEach(line => {
          csv += contract.code + "," +
          line.product.name + "," +
          line.price + "," +
          line.quantity + "," +
          '\r\n';
      });
    });
    return csv
  }

  getContractsPage(keyword, page){
    return new Promise(resolve => {
      this.pouchdbService.searchDocTypeData(
        'contract',
        keyword,
        page,
        "contact_name"
      ).then((contracts: any[]) => {
        resolve(contracts);
      });
    });
  }

  deleteContract(slidingItem, contract){
    slidingItem.close();
    return this.pouchdbService.deleteDoc(contract);
  }

  searchItemsS(keyword, page) {
    return new Promise(resolve => {
    this.pouchdbService.searchDocs(
      'contract',
      keyword,
      page,
      "contact_name"
    ).then((contracts) => {
        resolve(contracts);
      })
    })
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

}

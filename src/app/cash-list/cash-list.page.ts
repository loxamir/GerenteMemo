import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController,  Events, PopoverController, AlertController } from '@ionic/angular';
import { CashPage } from '../cash/cash.page';

import 'rxjs/Rx';
// import { CashListService } from './cash-list.service';
import { CashListPopover } from './cash-list.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CashService } from '../cash/cash.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-cash-list',
  templateUrl: './cash-list.page.html',
  styleUrls: ['./cash-list.page.scss'],
})
export class CashListPage implements OnInit {
  cashList: any;
  loading: any;
  searchTerm: string = '';
  select;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public pouchdbService: PouchdbService,
    public cashService: CashService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public cashMoveService: CashMoveService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ngOnInit() {
    //this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-cash-move', (change)=>{
      this.handleViewChange(this.cashList, change);
    })
    this.events.subscribe('changed-account', (change)=>{
      // this.cashListService.handleChange(this.cashList, change);
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', ()=>{
      this.setFilteredItems();
    })
  }

  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.getCashList(
        this.searchTerm, this.page
      ).then((cashList: any[]) => {
        cashList.forEach(cash => {
          this.cashList.push(cash);
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

  setFilteredItems() {
    this.getCashList(
      this.searchTerm, 0
    ).then((cashList) => {
      this.cashList = cashList;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  // presentPopover(myEvent) {
  //   let popover = this.popoverCtrl.create(CashListPopover);
  //   popover.present({
  //     ev: myEvent
  //   });
  // }

  async presentPopover(myEvent) {
    console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: CashListPopover,
      event: myEvent,
      componentProps: {popoverController: this.popoverCtrl}
    });
    popover.present();
  }

  openCash(cash) {
    this.events.subscribe('open-cash', (data) => {
      this.events.unsubscribe('open-cash');
    })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CashPage, {'_id': cash._id});
    this.navCtrl.navigateForward(['/cash', {'_id': cash._id}]);
  }

  selectCash(cash) {
    if (this.select){
      // this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-cash', cash);
      // });
    } else {
      this.openCash(cash);
    }
  }

  async createCash() {
    // this.events.subscribe('create-cash', (data) => {
    //   if (this.select){
    //     this.navCtrl.navigateBack().then(() => {
    //       this.events.publish('select-cash', data);
    //     });
    //   }
    //   this.events.unsubscribe('create-cash');
    // })
    // let newRootNav = <NavController>this.app.getRootNavById('n4');
    // newRootNav.push(CashPage, {});

    let prompt = await this.alertCtrl.create({
      header: 'Crear Caja',
      message: 'Nombre del Caja?',
      inputs: [
        {
          type: 'text',
          name: 'name',
          value: "Caja Nuevo"
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Confirmar',
          handler: async data => {
            let prompt = await this.alertCtrl.create({
              header: 'Tipo de Caja',
              message: 'Tipo del Caja?',
              inputs:  [
                {
                    type:'radio',
                    label:'Caixa',
                    value:'cash'
                },
                {
                    type:'radio',
                    label:'Banco',
                    value:'bank'
                },
                {
                    type:'radio',
                    label:'Cheque',
                    value:'check'
                }
              ],
              buttons: [
                {
                  text: 'Cancelar',
                },
                {
                  text: 'Confirmar',
                  handler: type => {
                    this.cashService.createCash({
                      'name': data.name,
                      'type': type,
                      'category_id': 'accountCategory.cash',
                      'transfer': true,
                      'payable': false,
                      'receivable': false,
                    }).then((res:any)=>{
                      this.setInitialBalance(res.cash);
                    })
                  }
                }
              ]
            });
            prompt.present();


            //
            // this.cashService.createCash({
            //   'name': data.name,
            //   'type': 'liquidity',
            //   'category_id': 'accountCategory.cash',
            //   'transfer': true,
            //   'payable': false,
            //   'receivable': false,
            // }).then((res:any)=>{
            //   this.setInitialBalance(res.cash);
            // })
          }
        }
      ]
    });
    prompt.present();
  }

  async setInitialBalance(cash){
    let self = this;
    let prompt = await this.alertCtrl.create({
      header: 'Balance del Caja',
      message: 'Cuanto dinero tenes en la Caja '+cash.name+'?',
      inputs: [
        {
          type: 'number',
          name: 'balance',
          value: "0"
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Confirmar',
          handler: data => {
            self.cashMoveService.createCashMove({
              "amount": data.balance,
              "name": "Saldo Inicial",
              "date": new Date().toJSON(),
              "accountFrom_id": "account.other.open",
              "contact_id": 'contact.myCompany',
              "accountTo_id": cash._id,
              'signal': '+',
              "origin_id": cash._id
            });
          }
        }
      ],
    });
    prompt.present();
  }

  deleteCash(cash){
    let index = this.cashList.indexOf(cash);
    if (cash.balance == 0){
      this.cashList.splice(index, 1);
      this.deleteCash2(cash);
    }
  }

  getCashList(keyword, page){
    return new Promise((resolve, reject)=>{
      let payableList = [];
      this.pouchdbService.getView(
        'stock/Caixas', 1,
        ['0'],
        ['z']
      ).then((planneds: any[]) => {
        let cashiers = [];
        this.pouchdbService.searchDocTypeData(
          'account', keyword
        ).then((cashList: any[]) => {
          cashList.forEach(cashier=>{
            cashier.balance = 0;
            if (cashier._id.split('.')[1] == 'cash' || cashier._id.split('.')[1] == 'check' || cashier._id.split('.')[1] == 'bank'){
              let cashReport = planneds.filter(x => x.key[0]==cashier._id)[0]
              cashier.balance = cashReport && cashReport.value || 0;
              cashiers.push(cashier);
            }
          })
          resolve(cashiers);
        });
      });
    });
  }

  handleChange(list, change){
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change){
    this.pouchdbService.getView(
      'stock/Caixas', 1,
      ['0'],
      ['z']
    ).then((cashiers: any[]) => {
      let cashierDict = {}
      cashiers.forEach(item=>{
        cashierDict[item.key[0]] = item.value;
      })
      list.forEach((cashier, index)=>{
        if (
          change.doc.accountFrom_id == cashier._id
          || change.doc.accountTo_id == cashier._id
        ){
          cashier.balance = cashierDict[cashier._id] || 0;
        }
      })
    });
  }

  deleteCash2(cash) {
    return this.pouchdbService.deleteDoc(cash);
  }

}
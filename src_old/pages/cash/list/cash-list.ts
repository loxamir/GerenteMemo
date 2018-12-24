import { Component } from '@angular/core';
import { NavController, App, NavParams, LoadingController,  Events, PopoverController, AlertController } from '@ionic/angular';
import { CashPage } from '../cash';

import 'rxjs/Rx';
import { CashListService } from './cash-list.service';
import { CashListPopover } from './cash-list.popover';
// import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { CashService } from '../cash.service';
import { CashMoveService } from '../move/cash-move.service';

@Component({
  selector: 'cash-list-page',
  templateUrl: 'cash-list.html',
  providers: [CashListService]
})
export class CashListPage {
  cashList: any;
  loading: any;
  searchTerm: string = '';
  select: boolean;
  page = 0;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public cashListService: CashListService,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    
    public events: Events,
    public popoverCtrl: PopoverController,
    public cashMoveService: CashMoveService,
    public cashService: CashService,
    public alertCtrl: AlertController,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.select = this.route.snapshot.paramMap.get('select');
  }

  ionViewDidLoad() {
    //this.loading.present();
    this.setFilteredItems();
    this.events.subscribe('changed-cash-move', (change)=>{
      this.cashListService.handleViewChange(this.cashList, change);
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
      this.cashListService.getCashList(
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
    this.cashListService.getCashList(
      this.searchTerm, 0
    ).then((cashList) => {
      this.cashList = cashList;
      this.page = 1;
      //this.loading.dismiss();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(CashListPopover);
    popover.present({
      ev: myEvent
    });
  }

  openCash(cash) {
    this.events.subscribe('open-cash', (data) => {
      this.events.unsubscribe('open-cash');
    })
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(CashPage, {'_id': cash._id});
  }

  selectCash(cash) {
    if (this.select){
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('select-cash', cash);
      });
    } else {
      this.openCash(cash);
    }
  }

  createCash() {
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

    let prompt = this.alertCtrl.create({
      title: 'Crear Caja',
      message: 'Nombre del Caja?',
      inputs: [
        {
          type: 'string',
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
          handler: data => {
            let prompt = this.alertCtrl.create({
              title: 'Tipo de Caja',
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

  setInitialBalance(cash){
    let self = this;
    let prompt = self.alertCtrl.create({
      title: 'Balance del Caja',
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
      this.cashListService.deleteCash(cash);
    }
  }

}

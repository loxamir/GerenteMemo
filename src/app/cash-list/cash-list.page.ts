import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, Events, PopoverController, AlertController } from '@ionic/angular';
import { CashPage } from '../cash/cash.page';

import 'rxjs/Rx';
import { CashListPopover } from './cash-list.popover';
import { FormatService } from '../services/format.service';
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
  currency_precision = 2;
  user: any = {};
  company_currency_id = 'currency.PYG';
  currencies = {};
  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public route: ActivatedRoute,
    public pouchdbService: PouchdbService,
    public formatService: FormatService,
    public cashService: CashService,
    public events: Events,
    public popoverCtrl: PopoverController,
    public cashMoveService: CashMoveService,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    var foo = { foo: true };
    history.pushState(foo, "Anything", " ");
  }

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
    let config: any = (await this.pouchdbService.getDoc('config.profile'));
    this.currency_precision = config.currency_precision;

    this.company_currency_id = config.currency_id;
    let pyg = await this.pouchdbService.getDoc('currency.PYG')
    let usd = await this.pouchdbService.getDoc('currency.USD')
    this.currencies = {
      "currency.PYG": pyg,
      "currency.USD": usd,
    }

    this.user = (await this.pouchdbService.getUser());
    this.setFilteredItems();
    this.events.subscribe('changed-cash-move', (change) => {
      this.handleViewChange(this.cashList, change);
    })
    this.events.subscribe('refresh-cash-list', (change) => {
      this.handleViewChange(this.cashList, change);
    })
    this.events.subscribe('changed-account', (change) => {
      this.setFilteredItems();
    })
    this.events.subscribe('got-database', () => {
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
      this.loading.dismiss();
    });
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: CashListPopover,
      event: myEvent,
      componentProps: { popoverController: this.popoverCtrl }
    });
    popover.present();
  }

  openCash(cash) {
    this.events.subscribe('open-cash', (data) => {
      this.events.unsubscribe('open-cash');
    })
    this.navCtrl.navigateForward(['/cash', { '_id': cash._id }]);
  }

  selectCash(cash) {
    if (this.select) {
      this.events.publish('select-cash', cash);
      this.modalCtrl.dismiss();
    } else {
      this.openCash(cash);
    }
  }

  async createCash() {
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
              inputs: [
                {
                  type: 'radio',
                  label: 'Caixa',
                  value: 'cash'
                },
                {
                  type: 'radio',
                  label: 'Banco',
                  value: 'bank'
                },
                {
                  type: 'radio',
                  label: 'Cheque',
                  value: 'check'
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
                    }).then((res: any) => {
                      this.setInitialBalance(res.cash);
                    })
                  }
                }
              ]
            });
            prompt.present();
          }
        }
      ]
    });
    prompt.present();
  }

  async setInitialBalance(cash) {
    let self = this;
    let prompt = await this.alertCtrl.create({
      header: 'Balance del Caja',
      message: 'Cuanto dinero tenes en la Caja ' + cash.name + '?',
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

  deleteCash(cash) {
    let index = this.cashList.indexOf(cash);
    if (cash.balance == 0) {
      this.cashList.splice(index, 1);
      this.deleteCash2(cash);
    }
  }

  getCashList(keyword, page) {
    return new Promise(async (resolve, reject) => {
      let cashiers = [];
      let cashList: any = await this.pouchdbService.searchDocTypeData(
        'account', keyword
      );
      await this.formatService.asyncForEach(cashList, async (cashier: any) => {
        if (this.user['admin']) {
          if (cashier._id.split('.')[1] == 'cash'
            || cashier._id.split('.')[1] == 'check'
            || cashier._id.split('.')[1] == 'bank') {
            if (cashier.currency_id) {
              let currency_balance = await this.pouchdbService.getView(
                'stock/CaixasForeing', 1, [cashier._id, null], [cashier._id, "z"]);
              cashier.currency_balance = currency_balance[0] && currency_balance[0].value || 0;
            }
            let balance = await this.pouchdbService.getView(
              'stock/Caixas', 1, [cashier._id, null], [cashier._id, "z"]);
            cashier.balance = balance[0] && balance[0].value || 0;
            cashiers.push(cashier);
          }
        } else {
          if (cashier.users && cashier.users.indexOf(this.user['username']) >= 0) {
            cashier.balance = 0;
            if (cashier._id.split('.')[1] == 'cash'
              || cashier._id.split('.')[1] == 'check'
              || cashier._id.split('.')[1] == 'bank') {
              if (cashier.currency_id) {
                let currency_balance = await this.pouchdbService.getView(
                  'stock/CaixasForeing', 1, [cashier._id, null], [cashier._id, "z"]);
                cashier.currency_balance = currency_balance[0] && currency_balance[0].value || 0;
              }
              let balance = await this.pouchdbService.getView(
                'stock/Caixas', 1, [cashier._id, null], [cashier._id, "z"]);
              cashier.balance = balance[0] && balance[0].value || 0;
              cashiers.push(cashier);
            }
          }
        }
      })
      resolve(cashiers);
    });
  }

  handleChange(list, change) {
    this.pouchdbService.localHandleChangeData(list, change)
  }

  handleViewChange(list, change) {
    if (change.doc.currency_id) {
      this.pouchdbService.getView(
        'stock/CaixasForeing', 1,
        ['0'],
        ['z']
      ).then((cashiers: any[]) => {
        let cashierDict = {}
        cashiers.forEach(item => {
          cashierDict[item.key[0]] = item.value;
        })
        list.forEach((cashier, index) => {
          if (
            change.doc.accountFrom_id == cashier._id
            || change.doc.accountTo_id == cashier._id
          ) {
            cashier.balance = cashierDict[cashier._id] || 0;
          }
        })
      });
    } else {
      this.pouchdbService.getView(
        'stock/Caixas', 1,
        ['0'],
        ['z']
      ).then((cashiers: any[]) => {
        let cashierDict = {}
        cashiers.forEach(item => {
          cashierDict[item.key[0]] = item.value;
        })
        list.forEach((cashier, index) => {
          if (
            change.doc.accountFrom_id == cashier._id
            || change.doc.accountTo_id == cashier._id
          ) {
            cashier.balance = cashierDict[cashier._id] || 0;
          }
        })
      });
    }
  }

  deleteCash2(cash) {
    return this.pouchdbService.deleteDoc(cash);
  }

}

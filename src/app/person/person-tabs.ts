import { Component } from '@angular/core';

import { SalesPage } from '../sale/list/sales';
import { ServicesPage } from '../service/list/services';
import { PurchasesPage } from '../purchase/list/purchases';
// import { ReportsPage } from '../report/list/reports';
// import { AccountsPage } from '../cash/move/account/list/accounts';
import { WorksPage } from '../work/list/works';
// import { StockMoveListPage } from '../stock/list/stock-move-list';
// import { CashMoveListPage } from '../cash/move/list/cash-move-list';
// import { TabsPage } from '../stock/tabs/tabs';
// import { FinancePage } from '../finance/finance';
// import { WarehousesPage } from '../stock/warehouse/list/warehouses';
// import { SaleTabsPage } from '../sale/tabs/tabs';
// import { PurchaseTabsPage } from '../purchase/tabs/tabs';
// import { ViewPage } from '../report/view/view';
import { CashListPage } from '../cash/list/cash-list';
import { ProductsPage } from '../product/list/products';
import { AreasPage } from '../area/list/areas';
import { CropsPage } from '../crop/list/crops';
import { MachinesPage } from '../machine/list/machines';
import { ContactsPage } from '../contact/list/contacts';

@Component({
  selector: 'person-tabs',
  templateUrl: 'person-tabs.html'
})
export class PersonTabsPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;
  tab4Root: any;
  tab5Root: any;

  constructor() {
    this.tab1Root = ContactsPage;
    this.tab2Root = ContactsPage;
    this.tab3Root = ContactsPage;
    this.tab4Root = ContactsPage;
    this.tab5Root = ContactsPage;
  }
}

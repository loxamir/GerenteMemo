import { Component } from '@angular/core';

import { SalesPage } from '../sale/list/sales';
import { ServicesPage } from '../service/list/services';
import { PurchasesPage } from '../purchase/list/purchases';
// import { ReportsPage } from '../report/list/reports';
// import { AccountsPage } from '../cash/move/account/list/accounts';
// import { WorksPage } from '../work/list/works';
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

@Component({
  selector: 'tabs-navigation',
  templateUrl: 'tabs-navigation.html'
})
export class TabsNavigationPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;
  tab4Root: any;
  tab5Root: any;

  constructor() {
    this.tab1Root = SalesPage;
    this.tab2Root = PurchasesPage;
    this.tab3Root = CashListPage;
    this.tab4Root = ProductsPage;
    this.tab5Root = ServicesPage;
  }
}

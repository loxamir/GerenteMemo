import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'service', pathMatch: 'full' },
  // { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'contact', loadChildren: './contact/contact.module#ContactPageModule' },
  { path: 'contact-list', loadChildren: './contact-list/contact-list.module#ContactListPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  // { path: 'menu', loadChildren: './menu/menu.module#MenuPageModule' },
  // { path: '', loadChildren: './menu/menu.module#MenuPageModule' },
  { path: 'product', loadChildren: './product/product.module#ProductPageModule' },
  { path: 'product-category', loadChildren: './product-category/product-category.module#ProductCategoryPageModule' },
  { path: 'product-category-list', loadChildren: './product-category-list/product-category-list.module#ProductCategoryListPageModule' },
  { path: 'product-list', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'stock-move', loadChildren: './stock-move/stock-move.module#StockMovePageModule' },
  { path: 'stock-move-list', loadChildren: './stock-move-list/stock-move-list.module#StockMoveListPageModule' },
  { path: 'warehouse', loadChildren: './warehouse/warehouse.module#WarehousePageModule' },
  { path: 'warehouse-list', loadChildren: './warehouse-list/warehouse-list.module#WarehouseListPageModule' },
  { path: 'cash-move', loadChildren: './cash-move/cash-move.module#CashMovePageModule' },
  { path: 'account', loadChildren: './account/account.module#AccountPageModule' },
  { path: 'account-list', loadChildren: './account-list/account-list.module#AccountListPageModule' },
  { path: 'account-category', loadChildren: './account-category/account-category.module#AccountCategoryPageModule' },
  { path: 'account-category-list', loadChildren: './account-category-list/account-category-list.module#AccountCategoryListPageModule' },
  { path: 'title', loadChildren: './title/title.module#TitlePageModule' },
  { path: 'title-list', loadChildren: './title-list/title-list.module#TitleListPageModule' },
  { path: 'cash-move-list', loadChildren: './cash-move-list/cash-move-list.module#CashMoveListPageModule' },
  { path: 'currency', loadChildren: './currency/currency.module#CurrencyPageModule' },
  { path: 'currency-list', loadChildren: './currency-list/currency-list.module#CurrencyListPageModule' },
  { path: 'check', loadChildren: './check/check.module#CheckPageModule' },
  { path: 'check-list', loadChildren: './check-list/check-list.module#CheckListPageModule' },
  { path: 'receipt', loadChildren: './receipt/receipt.module#ReceiptPageModule' },
  { path: 'receipt-list', loadChildren: './receipt-list/receipt-list.module#ReceiptListPageModule' },
  { path: 'cash', loadChildren: './cash/cash.module#CashPageModule' },
  { path: 'cash-list', loadChildren: './cash-list/cash-list.module#CashListPageModule' },
  { path: 'invoice', loadChildren: './invoice/invoice.module#InvoicePageModule' },
  { path: 'invoice-list', loadChildren: './invoice-list/invoice-list.module#InvoiceListPageModule' },
  { path: 'sale', loadChildren: './sale/sale.module#SalePageModule' },
  { path: 'sale-list', loadChildren: './sale-list/sale-list.module#SaleListPageModule' },
  { path: 'payment-condition', loadChildren: './payment-condition/payment-condition.module#PaymentConditionPageModule' },
  { path: 'payment-condition-list', loadChildren: './payment-condition-list/payment-condition-list.module#PaymentConditionListPageModule' },
  { path: 'advance', loadChildren: './advance/advance.module#AdvancePageModule' },
  { path: 'config', loadChildren: './config/config.module#ConfigPageModule' },
  { path: 'invoice-config', loadChildren: './invoice-config/invoice-config.module#InvoiceConfigPageModule' },
  { path: 'user', loadChildren: './user/user.module#UserPageModule' },
  { path: 'help', loadChildren: './help/help.module#HelpPageModule' },
  { path: 'help-list', loadChildren: './help-list/help-list.module#HelpListPageModule' },
  // // { path: 'importer', loadChildren: './importer/importer.module#ImporterPageModule' },
  { path: 'planned-list', loadChildren: './planned-list/planned-list.module#PlannedListPageModule' },
  { path: 'purchase', loadChildren: './purchase/purchase.module#PurchasePageModule' },
  { path: 'salary', loadChildren: './salary/salary.module#SalaryPageModule' },
  { path: 'service', loadChildren: './service/service.module#ServicePageModule' },
  { path: 'purchase-list', loadChildren: './purchase-list/purchase-list.module#PurchaseListPageModule' },
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'service-list', loadChildren: './service-list/service-list.module#ServiceListPageModule' },
  { path: 'service/input', loadChildren: './service/input/input.module#ServiceInputPageModule' },
  { path: 'service/travel', loadChildren: './service/travel/travel.module#ServiceTravelPageModule' },
  { path: 'service/work', loadChildren: './service/work/work.module#ServiceWorkPageModule' },
  { path: 'report-list', loadChildren: './report-list/report-list.module#ReportListPageModule' },
  { path: 'report', loadChildren: './report/report.module#ReportPageModule' },
  { path: 'accounts-report', loadChildren: './accounts-report/accounts-report.module#AccountsReportPageModule' },
  { path: 'balance-report', loadChildren: './balance-report/balance-report.module#BalanceReportPageModule' },
  { path: 'cash-flow', loadChildren: './cash-flow/cash-flow.module#CashFlowPageModule' },
  { path: 'purchase-report', loadChildren: './purchase-report/purchase-report.module#PurchaseReportPageModule' },
  { path: 'result-report', loadChildren: './result-report/result-report.module#ResultReportPageModule' },
  { path: 'sale-report', loadChildren: './sale-report/sale-report.module#SaleReportPageModule' },
  { path: 'view-report', loadChildren: './view-report/view-report.module#ViewReportPageModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardPageModule' },
  { path: 'dashboard-list', loadChildren: './dashboard-list/dashboard-list.module#DashboardListPageModule' },
  { path: 'dashboard-filter', loadChildren: './dashboard-filter/dashboard-filter.module#DashboardFilterPageModule' },
  { path: 'person-tabs', loadChildren: './person-tabs/person-tabs.module#PersonTabsPageModule' },
  { path: 'report-tabs', loadChildren: './report-tabs/report-tabs.module#ReportTabsPageModule' },
  { path: 'importer', loadChildren: './importer/importer.module#ImporterPageModule' },
  { path: 'close', loadChildren: './cash/close/close.module#ClosePageModule' },
  { path: 'receivable-report', loadChildren: './receivable-report/receivable-report.module#ReceivableReportPageModule' },
  { path: 'payable-report', loadChildren: './payable-report/payable-report.module#PayableReportPageModule' },
  { path: 'production', loadChildren: './production/production.module#ProductionPageModule' },
  { path: 'production-list', loadChildren: './production-list/production-list.module#ProductionListPageModule' },
  { path: 'production-report', loadChildren: './production-report/production-report.module#ProductionReportPageModule' },
  { path: 'service-report', loadChildren: './service-report/service-report.module#ServiceReportPageModule' },
  { path: 'brand-list', loadChildren: './brand-list/brand-list.module#BrandListPageModule' },
  { path: 'brand', loadChildren: './brand/brand.module#BrandPageModule' },
  // { path: 'tabs/contact-list', loadChildren: './contact-list/contact-list.module#ContactListPageModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

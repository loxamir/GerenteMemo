import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'contact', loadChildren: './contact/contact.module#ContactPageModule' },
  { path: 'contact-list', loadChildren: './contact-list/contact-list.module#ContactListPageModule' },
  // { path: 'contacts', loadChildren: './contacts/contacts.module#ContactsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'menu', loadChildren: './menu/menu.module#MenuPageModule' },
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

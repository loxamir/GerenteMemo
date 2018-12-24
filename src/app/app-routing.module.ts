import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'contact', loadChildren: './contact/contact.module#ContactPageModule' },
  { path: 'contacts', loadChildren: './contacts/contacts.module#ContactsPageModule' },
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

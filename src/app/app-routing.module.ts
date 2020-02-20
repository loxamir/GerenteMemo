import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'product-list', pathMatch: 'full' },
  { path: 'contact', loadChildren: './contact/contact.module#ContactPageModule' },
  { path: 'address', loadChildren: './address/address.module#AddressPageModule' },
  { path: 'address-list', loadChildren: './address-list/address-list.module#AddressListPageModule' },
  { path: 'product', loadChildren: './product/product.module#ProductPageModule' },
  { path: 'product-list', loadChildren: './product-list/product-list.module#ProductListPageModule' },
  { path: 'sale', loadChildren: './sale/sale.module#SalePageModule' },
  { path: 'sale-list', loadChildren: './sale-list/sale-list.module#SaleListPageModule' },
  { path: 'payment-condition-list', loadChildren: './payment-condition-list/payment-condition-list.module#PaymentConditionListPageModule' },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

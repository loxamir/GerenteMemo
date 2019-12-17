import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'product-list',
        children: [
          {
            path: '',
            loadChildren: '../product-list/product-list.module#ProductListPageModule'
          }
        ]
      },
      {
        path: 'sale-list',
        children: [
          {
            path: '',
            loadChildren: '../sale-list/sale-list.module#SaleListPageModule'
          }
        ]
      },
      {
        path: 'purchase-list',
        children: [
          {
            path: '',
            loadChildren: '../purchase-list/purchase-list.module#PurchaseListPageModule'
          }
        ]
      },
      {
        path: 'cash-list',
        children: [
          {
            path: '',
            loadChildren: '../cash-list/cash-list.module#CashListPageModule'
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: '../contact/contact.module#ContactPageModule'
          }
        ]
      },
      {
        path: 'service-list',
        children: [
          {
            path: '',
            loadChildren: '../service-list/service-list.module#ServiceListPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/product-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/product-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}

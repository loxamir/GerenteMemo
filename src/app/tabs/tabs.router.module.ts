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
        path: 'config',
        children: [
          {
            path: '',
            loadChildren: '../config/config.module#ConfigPageModule'
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

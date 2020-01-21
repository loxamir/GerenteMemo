import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgroTabsPage } from './agro-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AgroTabsPage,
    children: [
      {
        path: 'person-list',
        children: [
          {
            path: '',
            loadChildren: '../persons/persons.module#PersonsPageModule'
          }
        ]
      },
      {
        path: 'area-list',
        children: [
          {
            path: '',
            loadChildren: '../areas/areas.module#AreasPageModule'
          }
        ]
      },
      {
        path: 'machine-list',
        children: [
          {
            path: '',
            loadChildren: '../machines/machines.module#MachinesPageModule'
          }
        ]
      },
      {
        path: 'input-list',
        children: [
          {
            path: '',
            loadChildren: '../product-list/product-list.module#ProductListPageModule'
          }
        ]
      },
      {
        path: 'activity-list',
        children: [
          {
            path: '',
            loadChildren: '../works/works.module#WorksPageModule'
          }
        ]
      },
      {
        path: 'report-list',
        children: [
          {
            path: '',
            loadChildren: '../activity-report/activity-report.module#ActivityReportPageModule'
          }
        ]
      },
      {
        path: 'warehouse-list',
        children: [
          {
            path: '',
            loadChildren: '../warehouse-list/warehouse-list.module#WarehouseListPageModule'
          }
        ]
      },
      {
        path: 'future-contract-list',
        children: [
          {
            path: '',
            loadChildren: '../future-contract-list/future-contract-list.module#FutureContractListPageModule'
          }
        ]
      },
      {
        path: 'work-list',
        children: [
          {
            path: '',
            loadChildren: '../works/works.module#WorksPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/agro-tabs/activity-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/agro-tabs/activity-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgroTabsPageRoutingModule {}

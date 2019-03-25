import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgroTabsPage } from './agro-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AgroTabsPage,
    children: [
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
            loadChildren: '../inputs/inputs.module#InputsPageModule'
          }
        ]
      },
      {
        path: 'crop-list',
        children: [
          {
            path: '',
            loadChildren: '../crops/crops.module#CropsPageModule'
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
      // {
      //   path: '',
      //   redirectTo: '/agro-tabs/work-list',
      //   pathMatch: 'full'
      // }
    ]
  },
  {
    path: '',
    redirectTo: '/agro-tabs/work-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgroTabsPageRoutingModule {}

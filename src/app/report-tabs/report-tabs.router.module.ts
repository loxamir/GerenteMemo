import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportTabsPage } from './report-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: ReportTabsPage,
    children: [
      {
        path: 'short-report',
        children: [
          {
            path: '',
            loadChildren: '../report-list/report-list.module#ReportListPageModule'
          }
        ]
      },
      {
        path: 'long-report',
        children: [
          {
            path: '',
            loadChildren: '../dashboard-list/dashboard-list.module#DashboardListPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/report-tabs/short-report',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/report-tabs/short-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportTabsPageRoutingModule {}

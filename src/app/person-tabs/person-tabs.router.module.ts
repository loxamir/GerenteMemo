import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PersonTabsPage } from './person-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: PersonTabsPage,
    children: [
      {
        path: 'contact-list',
        children: [
          {
            path: '',
            loadChildren: '../contact-list/contact-list.module#ContactListPageModule'
          }
        ]
      },
      {
        path: 'client-list',
        children: [
          {
            path: '',
            loadChildren: '../contact-list/contact-list.module#ContactListPageModule'
          }
        ]
      },
      {
        path: 'supplier-list',
        children: [
          {
            path: '',
            loadChildren: '../contact-list/contact-list.module#ContactListPageModule'
          }
        ]
      },
      {
        path: 'seller-list',
        children: [
          {
            path: '',
            loadChildren: '../contact-list/contact-list.module#ContactListPageModule'
          }
        ]
      },
      {
        path: 'employee-list',
        children: [
          {
            path: '',
            loadChildren: '../contact-list/contact-list.module#ContactListPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/person-tabs/contact-list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/person-tabs/contact-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonTabsPageRoutingModule {}

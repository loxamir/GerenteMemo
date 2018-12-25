import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { MenuPage } from './menu.page';
import { Routes, RouterModule } from '@angular/router';

import { ContactListPage } from '../contact-list/contact-list.page';
import { ContactPage } from '../contact/contact.page';

const routes: Routes = [{
  path: 'menu',
  component: MenuPage,
  children: [
    {
      path: 'contacts',
      outlet: 'menucontent',
      component: ContactListPage
    },
    {
      path: 'contact',
      outlet: 'menucontent',
      component: ContactPage
    }
  ]
 },
 {
   path: '',
   redirectTo: '/menu/(menucontent:contacts)'
 }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class MenuRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MenuRoutingModule } from './menu-routing.module';
import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';
import { ContactListPageModule } from '../contact-list/contact-list.module';
import { ContactPageModule } from '../contact/contact.module';
// const routes: Routes = [
//   {
//     path: '',
//     component: MenuPage
//   }
// ];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // RouterModule.forChild(routes)
    MenuRoutingModule,
    ContactListPageModule,
    ContactPageModule,
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AgroTabsPage } from './agro-tabs.page';
import { AgroTabsPageRoutingModule } from './agro-tabs.router.module';

const routes: Routes = [
  {
    path: '',
    component: AgroTabsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgroTabsPageRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AgroTabsPage]
})
export class AgroTabsPageModule {}

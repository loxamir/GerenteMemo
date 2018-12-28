import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportTabsPageRoutingModule } from './report-tabs.router.module';

import { ReportTabsPage } from './report-tabs.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReportTabsPageRoutingModule
  ],
  declarations: [ReportTabsPage]
})
export class ReportTabsPageModule {}

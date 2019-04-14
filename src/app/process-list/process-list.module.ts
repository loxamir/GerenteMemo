import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProcessListPage } from './process-list.page';
import { ProcessListService } from './process-list.service';


const routes: Routes = [
  {
    path: '',
    component: ProcessListPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProcessListPage],
  providers: [ProcessListService]
})
export class ProcessListPageModule {}

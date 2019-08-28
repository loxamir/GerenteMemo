import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
// import { ProductPage } from '../product/product.page';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

import { IonicModule } from '@ionic/angular';

import { FutureContractListPage } from './future-contract-list.page';
import { FutureContractsPopover } from './future-contract-list.popover';

const routes: Routes = [
  {
    path: '',
    component: FutureContractListPage
  }
];

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FutureContractListPage, FutureContractsPopover],
  entryComponents: [FutureContractsPopover]
})
export class FutureContractListPageModule {}

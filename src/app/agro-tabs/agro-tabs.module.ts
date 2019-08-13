import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AgroTabsPage } from './agro-tabs.page';
import { AgroTabsPageRoutingModule } from './agro-tabs.router.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}


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
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AgroTabsPageRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AgroTabsPage]
})
export class AgroTabsPageModule {}

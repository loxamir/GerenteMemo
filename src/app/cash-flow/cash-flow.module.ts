import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CashFlowPage } from './cash-flow.page';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
const routes: Routes = [
  {
    path: '',
    component: CashFlowPage
  }
];

@NgModule({
  imports: [
    ReactiveFormsModule,
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
  declarations: [CashFlowPage],
  providers: [SocialSharing]
})
export class CashFlowPageModule {}

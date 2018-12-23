import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
// import { TranslateService, TranslateStore, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { ContactPage } from './contact.page';

const routes: Routes = [
  {
    path: '',
    component: ContactPage
  }
];

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule,
    TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    RouterModule.forChild(routes)
  ],
  // providers: [
  //   TranslateService,
  // ],
  declarations: [ContactPage]
})
export class ContactPageModule {}

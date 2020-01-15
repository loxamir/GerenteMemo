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
import { AddressListPopover} from './address-list.popover';
import { IonicModule } from '@ionic/angular';

import { AddressListPage } from './address-list.page';

const routes: Routes = [
  {
    path: '',
    component: AddressListPage
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
  declarations: [AddressListPage, AddressListPopover],
  entryComponents: [AddressListPopover]
})
export class AddressListPageModule {}

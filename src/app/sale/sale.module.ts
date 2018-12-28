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
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Printer } from '@ionic-native/printer';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { IonicModule } from '@ionic/angular';

import { SalePage } from './sale.page';

const routes: Routes = [
  {
    path: '',
    component: SalePage
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
  declarations: [SalePage],
  entryComponents: [],
  providers: [
    BluetoothSerial,
    Printer,
    SocialSharing,
  ]
})
export class SalePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';

import { ReceiptPage } from '../receipt/receipt.page';
import { InvoicePage } from '../invoice/invoice.page';

import { IonicModule } from '@ionic/angular';

import { PurchasePage } from './purchase.page';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Printer } from '@ionic-native/printer';

const routes: Routes = [
  {
    path: '',
    component: PurchasePage
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
  // declarations: [PurchasePage]
  declarations: [PurchasePage, PaymentConditionListPage, ProductListPage, ContactListPage, CurrencyListPage, ReceiptPage, InvoicePage],
  entryComponents: [PaymentConditionListPage, ProductListPage, ContactListPage, CurrencyListPage, ReceiptPage, InvoicePage],
  providers: [
    BluetoothSerial,
    Printer,
  ]
})
export class PurchasePageModule {}

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
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { IonicModule } from '@ionic/angular';

import { ReceiptPage } from './receipt.page';
import { ReceiptService } from './receipt.service';
import { ReceiptPopover } from './receipt.popover';

const routes: Routes = [
  {
    path: '',
    component: ReceiptPage
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
  declarations: [ReceiptPage, ReceiptPopover],
  entryComponents: [ReceiptPopover],
  providers: [
    BluetoothSerial,
    Printer,
    ReceiptService,
  ]
})
export class ReceiptPageModule {}

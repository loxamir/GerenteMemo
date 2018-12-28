import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { IonicStorageModule } from '@ionic/storage';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
// Custom Imports
import { ProductListPage } from './product-list/product-list.page';
import { PaymentConditionListPage } from './payment-condition-list/payment-condition-list.page';
import { ContactListPage } from './contact-list/contact-list.page';
import { CurrencyListPage } from './currency-list/currency-list.page';
import { ReceiptPage } from './receipt/receipt.page';
import { InvoicePage } from './invoice/invoice.page';

@NgModule({
  declarations: [
    AppComponent,
    ContactListPage,
    CurrencyListPage,
    PaymentConditionListPage,
    ProductListPage,
    ReceiptPage,
    InvoicePage,
  ],
  entryComponents: [
    ContactListPage,
    CurrencyListPage,
    PaymentConditionListPage,
    ProductListPage,
    ReceiptPage,
    InvoicePage,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(),
    AppRoutingModule],
  providers: [
    NativeStorage,
    File,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

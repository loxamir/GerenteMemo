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
import { WarehouseListPage } from './warehouse-list/warehouse-list.page';
import { AccountListPage } from './account-list/account-list.page';
import { CashListPage } from './cash-list/cash-list.page';


import { ProductCategoryListPageModule } from './product-category-list/product-category-list.module';
import { ProductListPageModule } from './product-list/product-list.module';
import { PaymentConditionListPageModule } from './payment-condition-list/payment-condition-list.module';
import { ContactListPageModule } from './contact-list/contact-list.module';
import { CurrencyListPageModule } from './currency-list/currency-list.module';
import { ReceiptPageModule } from './receipt/receipt.module';
import { InvoicePageModule } from './invoice/invoice.module';
import { WarehouseListPageModule } from './warehouse-list/warehouse-list.module';
import { AccountListPageModule } from './account-list/account-list.module';
import { CashListPageModule } from './cash-list/cash-list.module';
import { CashMovePageModule } from './cash-move/cash-move.module';
import { LoginPageModule } from './login/login.module';

import { ProductCategoryPageModule } from './product-category/product-category.module';
import { ContactPageModule } from './contact/contact.module';

import { CheckListPageModule } from './check-list/check-list.module';
import { CheckPageModule } from './check/check.module';

import { UserPageModule } from './user/user.module';
import { InvoiceConfigPageModule } from './invoice-config/invoice-config.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    // CurrencyListPage,
    // PaymentConditionListPage,
    // ProductListPage,
    // ReceiptPage,
    // InvoicePage,
    // WarehouseListPage,
    // AccountListPage,
    // CashListPage,
  ],
  entryComponents: [
    ContactListPage,
    CurrencyListPage,
    PaymentConditionListPage,
    ProductListPage,
    ReceiptPage,
    InvoicePage,
    WarehouseListPage,
    AccountListPage,
    CashListPage,
  ],
  imports: [
    LoginPageModule,
    ContactPageModule,
    CashMovePageModule,
    ProductCategoryListPageModule,
    ProductListPageModule,
    PaymentConditionListPageModule,
    CurrencyListPageModule,
    ReceiptPageModule,
    InvoicePageModule,
    WarehouseListPageModule,
    AccountListPageModule,
    CashListPageModule,
    UserPageModule,
    CheckPageModule,
    InvoiceConfigPageModule,
    BrowserModule,
    FormsModule,
    ContactListPageModule,
    ReactiveFormsModule,
    ProductCategoryPageModule,
    CheckListPageModule,
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
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
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

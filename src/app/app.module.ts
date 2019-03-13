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
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(es);
// Custom Imports
import { ProductListPage } from './product-list/product-list.page';
import { PaymentConditionListPage } from './payment-condition-list/payment-condition-list.page';
import { ContactListPage } from './contact-list/contact-list.page';
import { CurrencyListPage } from './currency-list/currency-list.page';
import { ReceiptPage } from './receipt/receipt.page';
import { InvoicePage } from './invoice/invoice.page';
import { WarehouseListPage } from './warehouse-list/warehouse-list.page';
import { AccountListPage } from './account-list/account-list.page';

import { ClosePageModule } from './cash/close/close.module';

import { TitlePageModule } from './title/title.module';
import { TitleListPageModule } from './title-list/title-list.module';
import { AccountPageModule } from './account/account.module';
import { AccountCategoryPageModule } from './account-category/account-category.module';
import { AccountCategoryListPageModule } from './account-category-list/account-category-list.module';
import { CashListPage } from './cash-list/cash-list.page';


import { ProductCategoryListPageModule } from './product-category-list/product-category-list.module';
import { BrandListPageModule } from './brand-list/brand-list.module';
import { ProductListPageModule } from './product-list/product-list.module';
import { PaymentConditionListPageModule } from './payment-condition-list/payment-condition-list.module';
import { ContactListPageModule } from './contact-list/contact-list.module';
import { CurrencyListPageModule } from './currency-list/currency-list.module';
import { CurrencyPageModule } from './currency/currency.module';
import { ReceiptPageModule } from './receipt/receipt.module';
import { InvoicePageModule } from './invoice/invoice.module';
import { WarehouseListPageModule } from './warehouse-list/warehouse-list.module';
import { AccountListPageModule } from './account-list/account-list.module';
import { CashListPageModule } from './cash-list/cash-list.module';
import { CashMovePageModule } from './cash-move/cash-move.module';
import { LoginPageModule } from './login/login.module';

import { ProductCategoryPageModule } from './product-category/product-category.module';
import { BrandPageModule } from './brand/brand.module';
import { ContactPageModule } from './contact/contact.module';
import { ProductPageModule } from './product/product.module';

import { CheckListPageModule } from './check-list/check-list.module';
import { CheckPageModule } from './check/check.module';
import { PaymentConditionPageModule } from './payment-condition/payment-condition.module';
import { ServiceWorkPageModule } from './service/work/work.module';
import { ProductionWorkPageModule } from './production/work/work.module';
import { ServiceTravelPageModule } from './service/travel/travel.module';
import { WorkPageModule } from './work/work.module';
import { WorksPageModule } from './works/works.module';
import { UserPageModule } from './user/user.module';
import { InvoiceConfigPageModule } from './invoice-config/invoice-config.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ActivitysPageModule } from './activitys/activitys.module';
import { ActivityPageModule } from './activity/activity.module';
import { FieldPageModule } from './field/field.module';

import { AnimalPageModule } from './animal/animal.module';
import { AreaPageModule } from './area/area.module';
import { MachinePageModule } from './machine/machine.module';
import { CropPageModule } from './crop/crop.module';
import { AnimalsPageModule } from './animals/animals.module';
import { AreasPageModule } from './areas/areas.module';
import { MachinesPageModule } from './machines/machines.module';
import { CropsPageModule } from './crops/crops.module';

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
    BrandListPageModule,
    ProductCategoryListPageModule,
    AccountCategoryListPageModule,
    AnimalPageModule,
    AreaPageModule,
    MachinePageModule,
    CropPageModule,
    AnimalsPageModule,
    AreasPageModule,
    MachinesPageModule,
    CropsPageModule,
    ProductListPageModule,
    PaymentConditionListPageModule,
    CurrencyListPageModule,
    TitleListPageModule,
    ClosePageModule,
    ReceiptPageModule,
    TitlePageModule,
    AccountPageModule,
    AccountCategoryPageModule,
    InvoicePageModule,
    WarehouseListPageModule,
    AccountListPageModule,
    ActivitysPageModule,
    ActivityPageModule,
    CurrencyPageModule,
    CashListPageModule,
    WorkPageModule,
    WorksPageModule,
    UserPageModule,
    CheckPageModule,
    InvoiceConfigPageModule,
    BrowserModule,
    FormsModule,
    ContactListPageModule,
    ReactiveFormsModule,
    ProductPageModule,
    FieldPageModule,
    ProductCategoryPageModule,
    BrandPageModule,
    PaymentConditionPageModule,
    CheckListPageModule,
    ServiceWorkPageModule,
    ProductionWorkPageModule,
    ServiceTravelPageModule,
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
        { provide: LOCALE_ID, useValue: 'es-PY' },
    NativeStorage,
    File,
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

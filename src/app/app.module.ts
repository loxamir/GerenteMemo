import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { File } from '@ionic-native/file/ngx';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';
// import { IonicStorageModule } from '@ionic/storage';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(es);
// Custom Imports
import { Facebook } from "@ionic-native/facebook/ngx";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ProductListPage } from './product-list/product-list.page';
import { SalePageModule } from './sale/sale.module';
import { ProductListPageModule } from './product-list/product-list.module';
import { PaymentConditionListPageModule } from './payment-condition-list/payment-condition-list.module';
import { AddressListPageModule } from './address-list/address-list.module';
import { ContactPageModule } from './contact/contact.module';
import { AddressPageModule } from './address/address.module';
import { ProductPageModule } from './product/product.module';
import { LoginPageModule } from './login/login.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SaleListPageModule } from './sale-list/sale-list.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
    ProductListPage,
  ],
  imports: [
    ProductListPageModule,
    SalePageModule,
    ContactPageModule,
    LoginPageModule,
    SaleListPageModule,
    AddressPageModule,
    PaymentConditionListPageModule,
    BrowserModule,
    FormsModule,
    AddressListPageModule,
    ReactiveFormsModule,
    ProductPageModule,
    HttpClientModule,
    // IonicStorageModule.forRoot(),
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
    // NativeStorage,
    // File,
    StatusBar,
    // SplashScreen,
    Facebook,
    Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

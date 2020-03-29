import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ImageModalPageModule } from './image-modal/image-modal.module';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { File } from '@ionic-native/file/ngx';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IonicStorageModule } from '@ionic/storage';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
import { LOCALE_ID } from '@angular/core';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
registerLocaleData(es);
// Custom Imports
// import { Facebook } from "@ionic-native/facebook/ngx";
// import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ProductListPage } from './product-list/product-list.page';
import { ProductCategoryListPageModule } from './product-category-list/product-category-list.module';
import { ProductListPageModule } from './product-list/product-list.module';
import { LoginPageModule } from './login/login.module';
import { ProductCategoryPageModule } from './product-category/product-category.module';
import { ProductPageModule } from './product/product.module';
import { TabsPageModule } from './tabs/tabs.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
    ProductListPage,
  ],
  imports: [
    LoginPageModule,
    TabsPageModule,
    ProductListPageModule,
    ImageModalPageModule,
    ProductCategoryListPageModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ProductPageModule,
    ProductCategoryPageModule,
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
    // StatusBar,
    // SplashScreen,
    // Facebook,
    // Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

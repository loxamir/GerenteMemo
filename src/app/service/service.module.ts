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
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Printer } from '@ionic-native/printer';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { PaymentConditionListPage } from '../payment-condition-list/payment-condition-list.page';
import { ProductListPage } from '../product-list/product-list.page';
import { ContactListPage } from '../contact-list/contact-list.page';
import { CurrencyListPage } from '../currency-list/currency-list.page';
import { ServiceWorkPage, } from './work/work.page';
import { ServiceInputPage, } from './input/input.page';
import { ServiceTravelPage, } from './travel/travel.page';
import { ServicePopover, } from './service.popover';
import { IonicModule } from '@ionic/angular';

import { ServicePage } from './service.page';

const routes: Routes = [
  {
    path: '',
    component: ServicePage
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
  declarations: [ServicePage,
  ServiceWorkPage,
  ServiceInputPage,
  ServiceTravelPage,
  ServicePopover,
],
  entryComponents: [
    ServiceWorkPage,
    ServiceInputPage,
    ServiceTravelPage,
    ServicePopover,
  ],
  providers: [
    BluetoothSerial,
    Printer,
    SocialSharing,
    TextToSpeech,
    SpeechRecognition,
  ]
})
export class ServicePageModule {}

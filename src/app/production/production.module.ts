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
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ProductionPopover, } from './production.popover';
import { IonicModule } from '@ionic/angular';

import { ProductionPage } from './production.page';

const routes: Routes = [
  {
    path: '',
    component: ProductionPage
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
    RouterModule.forChild(routes),
  ],
  declarations: [ProductionPage,
  ProductionPopover,
],
  entryComponents: [
    ProductionPopover,
  ],
  providers: [
    BluetoothSerial,
    Printer,
    SocialSharing,
    TextToSpeech,
    SpeechRecognition,
  ]
})
export class ProductionPageModule {}

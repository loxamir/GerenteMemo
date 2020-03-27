import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}
import { IonicModule } from '@ionic/angular';
import { ImageModalPage } from './image-modal.page';
import { ImageModalPopover } from './image-modal.popover';

const routes: Routes = [
  {
    path: '',
    component: ImageModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ImageModalPage, ImageModalPopover],
  entryComponents: [ImageModalPopover]
})
export class ImageModalPageModule {}

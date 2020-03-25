import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavParams, ModalController, PopoverController } from '@ionic/angular';
import { ImageModalPopover } from './image-modal.popover';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { PouchdbService } from "../services/pouchdb/pouchdb-service";

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {
  @ViewChild('slider', { read: ElementRef, static: true })slider: ElementRef;
  img: any;
  // note: any;
  // date: any;
  // name: any;
  // doc: any;

  sliderOpts = {
    zoom: {
      maxRatio: 5
    }
  };
  time = new Date();

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    public popoverCtrl: PopoverController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public pouchdbService: PouchdbService,
  ) {
  }

  async ngOnInit() {
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.img = this.navParams.get('img');
    // this.note = this.navParams.get('note');
    // this.date = this.navParams.get('date');
    // this.name = this.navParams.get('name');
    // this.doc = this.navParams.get('doc');
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: ImageModalPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
  }

  zoom(zoomIn: boolean) {
    let zoom = this.slider.nativeElement.swiper.zoom;
    if (zoomIn) {
      zoom.in();
    } else {
      zoom.out();
    }
  }


  close() {
    this.modalController.dismiss();
  }

  // async updatePictureDate(){
  //   this.doc.date = this.date;
  //   await this.pouchdbService.updateDoc(this.doc);
  // }

}

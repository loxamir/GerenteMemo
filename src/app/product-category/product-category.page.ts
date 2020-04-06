import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ActivatedRoute } from '@angular/router';
import { ProductCategoryService } from './product-category.service';
import { Events } from '../services/events';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.page.html',
  styleUrls: ['./product-category.page.scss'],
})
export class ProductCategoryPage implements OnInit {
  @ViewChild('pwaphoto', { static: false }) pwaphoto: ElementRef;
  @ViewChild('pwacamera', { static: false }) pwacamera: ElementRef;
  @ViewChild('pwagalery', { static: false }) pwagalery: ElementRef;

  categoryForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;
  _id: string;
  select;
  avatar = undefined;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public formBuilder: FormBuilder,
    public events: Events,
    public pouchdbService: PouchdbService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public productCategoryService: ProductCategoryService,
  ) {
    this.select = this.route.snapshot.paramMap.get('select');
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  async ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      // dre:  new FormControl('sale'),
      image: new FormControl(''),
      note: new FormControl(''),
      _id: new FormControl(''),
      _attachments: new FormControl({}),
      create_user: new FormControl(''),
      create_time: new FormControl(''),
      write_user: new FormControl(''),
      sequence: new FormControl('9999'),
      write_time: new FormControl(''),
    });
    let language:any = await this.languageService.getDefaultLanguage();
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    if (this._id){
      this.productCategoryService.getCategory(this._id).then((data) => {
        //let currentLang = this.translate.currentLang;
        this.categoryForm.patchValue(data);
        this.categoryForm.markAsPristine();
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  // ionViewDidLoad() {
  //   //this.loading.present();
  //   console.log("testess");
  //   if (this._id){
  //     this.getCategory(this._id).then((data) => {
  //       //let currentLang = this.translate.currentLang;
  //       this.categoryForm.patchValue(data);
  //       //this.loading.dismiss();
  //     });
  //   } else {
  //     //this.loading.dismiss();
  //   }
  // }

  buttonSave() {
    if (this._id){
      this.productCategoryService.updateCategory(this.categoryForm.value, this.avatar);
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/product-category-list');
        // .then(() => {
          this.events.publish('open-category', this.categoryForm.value);
        // });
      }
    } else {
      this.productCategoryService.createCategory(this.categoryForm.value, this.avatar);
      if (this.select){
        this.modalCtrl.dismiss();
        this.events.publish('create-category', this.categoryForm.value);
      } else {
        this.navCtrl.navigateBack('/product-category-list');
        // .then(() => {
          this.events.publish('create-category', this.categoryForm.value);
        // });
      }
    }
  }

  discard(){
    this.canDeactivate();
  }

  async canDeactivate() {
      if(this.categoryForm.dirty) {
          let alertPopup = await this.alertCtrl.create({
              header: this.translate.instant('DISCARD'),
              message: this.translate.instant('SURE_DONT_SAVE'),
              buttons: [{
                      text: this.translate.instant('YES'),
                      handler: () => {
                          // alertPopup.dismiss().then(() => {
                              this.exitPage();
                          // });
                      }
                  },
                  {
                      text: this.translate.instant('NO'),
                      handler: () => {
                          // need to do something if the user stays?
                      }
                  }]
          });

          // Show the alert
          alertPopup.present();

          // Return false to avoid the page to be popped up
          return false;
      } else {
        this.exitPage();
      }
  }

  private exitPage() {
    // console.log("exitPage", this.select);
      this.categoryForm.markAsPristine();
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.navCtrl.navigateBack('/product-category-list');
      }
  }

  setLanguage(lang: LanguageModel){
    let language_to_set = this.translate.getDefaultLang();
    if(lang){
      language_to_set = lang.code;
    }
    this.translate.setDefaultLang(language_to_set);
    this.translate.use(language_to_set);
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ]
  };

  onSubmit(values){
    //console.log(values);
  }

  openPWAPhotoPicker() {
    if (this.pwaphoto == null) {
      return;
    }

    this.pwaphoto.nativeElement.click();
  }

  openPWACamera() {
    if (this.pwacamera == null) {
      return;
    }

    this.pwacamera.nativeElement.click();
  }

  openPWAGalery() {
    if (this.pwagalery == null) {
      return;
    }

    this.pwagalery.nativeElement.click();
  }

  previewFile() {
    let self = this;
    var preview: any = document.querySelector('#imageSrc');
    var file = this.pwaphoto.nativeElement.files[0];
    var reader = new FileReader();
    reader.onload = (event: Event) => {
      let myData = reader.result.split('base64,')[1];
      // preview.src = reader.result;
      this.categoryForm.patchValue({
        _attachments: {
          'avatar.png': {
            type: 'image/jpeg',
            data: myData,
          }
        }
      })
      this.categoryForm.markAsDirty();
      preview.onload = function() {

        var percentage = 1;
        let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)
        if (image_diameter > max_diameter) {
          percentage = max_diameter / image_diameter
        }

        var canvas: any = window.document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        canvas.height = canvas.width * (preview.height / preview.width);
        var oc = window.document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = preview.width * percentage;
        oc.height = preview.height * percentage;
        canvas.width = oc.width;
        canvas.height = oc.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        octx.drawImage(preview, 0, 0, oc.width, oc.height);
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);

        let jpg = ctx.canvas.toDataURL("image/jpeg");
        fetch(jpg)
          .then(res => res.blob())
          .then(blob => self.avatar = blob)
      }
    }

    if (file) {
      reader.readAsDataURL(file);
    }
  }

}

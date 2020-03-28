import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from './product.service';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ImageModalPage } from '../image-modal/image-modal.page';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, CanDeactivate<boolean> {
    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    select;
    currency_precision = 0;
    product;
    whatsapp;
    product_images = [];
    sliderOpts = {
      zoom:false,
      slidesPerView: 1.5,
      centeredSlides: true,
      autoplay: true,
      speed: 1000,
      spaceBetween: 20
    }

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      public platform: Platform,
      public productService: ProductService,
      public route: ActivatedRoute,
      public modalCtrl: ModalController,
      public formBuilder: FormBuilder,
      public pouchdbService: PouchdbService,
    ) {
      this._id = this.route.snapshot.paramMap.get('_id');
      this.whatsapp = this.route.snapshot.paramMap.get('whatsapp');
      this.product = JSON.parse(this.route.snapshot.paramMap.get('product'));
      this.select = this.route.snapshot.paramMap.get('select');
    }

    async ngOnInit() {
      setTimeout(() => {
        this.productForm.markAsPristine();
      }, 400);
      this.productForm = this.formBuilder.group({
        name: new FormControl(null, Validators.required),
        image: new FormControl(''),
        price: new FormControl(null, Validators.required),
        category: new FormControl({}),
        brand: new FormControl({}),
        code: new FormControl(''),
        barcode: new FormControl(''),
        note: new FormControl(''),
        date: new FormControl(new Date().toJSON()),
        fixed: new FormControl(false),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
        quantity: new FormControl(1),
        products: new FormControl([]),
        sizes: new FormControl([]),
        size: new FormControl(),
        description: new FormControl(''),
        _attachments: new FormControl(),
      });
      let language:any = await this.languageService.getDefaultLanguage();
      this.translate.setDefaultLang(language);
      this.translate.use(language);
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      if (this.product){

        this.productForm.patchValue(this.product);
        Object.keys(this.product._attachments).forEach(file=>{
          this.product_images.push('https://database.sistemamemo.com/catalogo/'+this.product._id+'/'+file);
        })
        this.productForm.markAsPristine();
        this.loading.dismiss();
      }
      else if (this._id){
        this.productService.getProduct(this._id).then((data) => {
          setTimeout(() => {
            if (data.sizes && data.sizes[0]){
              data.size = data.sizes[0].name;
              this.productForm.patchValue({
                size: data.sizes[0].name
              });
            }
          }, 400);
          Object.keys(data._attachments).forEach(file=>{
            this.product_images.push('https://database.sistemamemo.com/catalogo/'+data._id+'/'+file);
          })
          this.productForm.patchValue(data);
          this.productForm.markAsPristine();
          this.loading.dismiss();
        });
      } else {
        this.loading.dismiss();
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

    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
      if(this.productForm.dirty) {
        let alertPopup = await this.alertCtrl.create({
          header: this.translate.instant('DISCARD'),
          message: this.translate.instant('SURE_DONT_SAVE'),
          buttons: [{
              text: this.translate.instant('YES'),
              handler: () => {
                this.exitPage();
              }
            },
            {
              text: this.translate.instant('NO'),
              handler: () => {}
            }]
        });
        alertPopup.present();
        return false;
      } else {
        this.exitPage();
      }
    }

    exitPage() {
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.productForm.markAsPristine();
        this.navCtrl.navigateBack('/product-list');
      }
    }

  selectSize(item){
    this.productForm.patchValue({
      size: item.name,
      price: item.price
    })
  }

  async openProduct(product){
    let profileModal = await this.modalCtrl.create({
      component: ProductPage,
      componentProps: {
        "select": true,
        "_id": product._id,
      }
    });
    await profileModal.present();
    await this.loading.dismiss();
    await profileModal.onDidDismiss();
  }

  openPreview(img) {
    this.modalCtrl.create({
      component: ImageModalPage,
      componentProps: {
        img: img
      }
    }).then(modal => {
      modal.present();
    });
  }

  askQuote(){
    console.log("send quote by whatsapp");
  }

}

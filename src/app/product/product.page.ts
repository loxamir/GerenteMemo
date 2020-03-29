import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProductService } from './product.service';
import { ProductCategoryListPage } from '../product-category-list/product-category-list.page';
import { ConfigService } from '../config/config.service';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { ProductListPage } from '../product-list/product-list.page';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { Events } from '../services/events';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit, CanDeactivate<boolean> {
  @ViewChild('pwaphoto', { static: false }) pwaphoto: ElementRef;
  @ViewChild('pwacamera', { static: false }) pwacamera: ElementRef;
  @ViewChild('pwagalery', { static: false }) pwagalery: ElementRef;

  @ViewChild('name', { static: true }) name;
  @ViewChild('price', { static: true }) price;
  // @ViewChild('barcode') barcodeField;

  @ViewChild('category', { static: true }) category;
    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    opened: boolean = false;
    select;
    currency_precision = 0;
    product_images = [];
    changed_images = [];
    database = '';
    moreFields = false;

    constructor(
      public navCtrl: NavController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      public platform: Platform,
      public productService: ProductService,
      public configService: ConfigService,
      public route: ActivatedRoute,
      public modalCtrl: ModalController,
      public formBuilder: FormBuilder,
      public events:Events,
      public pouchdbService: PouchdbService,
    ) {
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
    }

    async ngOnInit() {
      this.productForm = this.formBuilder.group({
        name: new FormControl(null, Validators.required),
        price: new FormControl(null, Validators.required),
        category: new FormControl({}),
        brand: new FormControl({}),
        cost: new FormControl(0),
        code: new FormControl(''),
        sequence: new FormControl('9999'),
        barcode: new FormControl(),
        tax: new FormControl(),
        type: new FormControl(),
        stock: new FormControl(null),
        stock_min: new FormControl(this.route.snapshot.paramMap.get('stock_min')),
        note: new FormControl(''),
        date: new FormControl(new Date().toJSON()),
        unity: new FormControl(this.route.snapshot.paramMap.get('unity')||'un'),
        fixed: new FormControl(false),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
        publish: new FormControl(true),
        quantity: new FormControl(1),
        products: new FormControl([]),
        images: new FormControl([]),
        sizes: new FormControl([]),
        size: new FormControl(),
        _attachments: new FormControl({}),
        description: new FormControl(''),
      });
      this.database = this.pouchdbService.getDatabaseName();
      let language:any = await this.languageService.getDefaultLanguage();
      this.translate.setDefaultLang(language);
      this.translate.use(language);
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      if (this._id){
        this.productService.getProduct(this._id).then((data) => {
          setTimeout(() => {
            if (data.sizes && data.sizes[0]){
              data.size = data.sizes[0].name;
              this.productForm.patchValue({
                size: data.sizes[0].name
              });
            }
          }, 400);
          if (data._attachments){
            Object.keys(data._attachments).forEach(file_name=>{
              this.product_images.push('https://database.sistemamemo.com/'+this.database+'/'+data._id+'/'+file_name);
            })
          }
          this.productForm.patchValue(data);
          this.loading.dismiss();
        });
      } else {
        this.getDefaultCategory();
        this.loading.dismiss();
      }
    }

    getBase64Image(imgUrl, callback) {
      var img = new Image();
      // onload fires when the image is fully loadded, and has width and height
      img.onload = function(){
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png"),
            dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        callback(dataURL); // the base64 string
      };
      // set attributes and src
      img.setAttribute('crossOrigin', 'anonymous'); //
      img.src = imgUrl;
    }

    getDefaultCategory(){
      if (this._id){
        //TODO: find a way to avoid the loading time
      } else {
        this.pouchdbService.getDoc('category.'+this.productForm.value.type).then((category)=>{
          this.productForm.patchValue({
            category: category
          })
        })
      }
    }

    buttonSave() {
      this.productForm.patchValue({
          stock: parseFloat(this.productForm.value.stock) || 0,
          cost: parseFloat(this.productForm.value.cost) || 0,
          price: parseFloat(this.productForm.value.price) || 0,
          stock_min: parseFloat(this.productForm.value.stock_min) || 0,
      })

      let product = Object.assign({}, this.productForm.value);
      if (this._id){
        this.productService.updateProduct(product, this.changed_images);
        if (this.select){
          this.modalCtrl.dismiss();
          this.events.publish('open-product', this.productForm.value);
        } else {
          this.navCtrl.navigateBack('/tabs/product-list');
          this.events.publish('open-product', this.productForm.value);
        }
      } else {
        this.productService.createProduct(product, this.changed_images).then(async (doc: any) => {
          let produ:any = await this.pouchdbService.getDoc(doc['id'])
          this.productForm.patchValue({
            _id: doc['id'],
            code: produ.code
          });
          this._id = doc['id'];
          if (this.select){
            this.modalCtrl.dismiss();
            this.events.publish('create-product', this.productForm.value);
          } else {
            this.navCtrl.navigateBack('/tabs/product-list');
            this.events.publish('create-product', this.productForm.value);
          }
        });
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
      ],
      'price': [
        { type: 'required', message: 'Price is required.' }
      ],
      'cost': [
        { type: 'required', message: 'Cost is required.' }
      ],
      'stock': [
        { type: 'required', message: 'Stock is required.' }
      ]
    };

    selectCategory() {
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        let profileModal = await this.modalCtrl.create({
          component: ProductCategoryListPage,
          componentProps: {
            "select": true,
          }
        });
        await profileModal.present();
        this.events.unsubscribe('select-category');
        this.events.subscribe('select-category', (data) => {
          this.productForm.patchValue({
            category: data,
            category_name: data.name,
          });
          this.productForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-category');
          profileModal.dismiss();
          // resolve(true);
        })
      });
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
      if (this.select){
        this.modalCtrl.dismiss();
      } else {
        this.productForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/product-list');
      }
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
        preview.src = reader.result;
        this.product_images.push(reader.result);
        let image_name = "image-"+this.pouchdbService.getUUID();
        this.changed_images.push({
          name: image_name,
          action: "ADD",
          image: reader.result,
        })
        this.productForm.value.images.push(image_name);
        this.productForm.markAsDirty();
        // preview.onload = function() {
        //
        //   var percentage = 1;
        //   let max_diameter = (800 ** 2 + 600 ** 2) ** (1 / 2);
        //   var image_diameter = (preview.height ** 2 + preview.width ** 2) ** (1 / 2)
        //   if (image_diameter > max_diameter) {
        //     percentage = max_diameter / image_diameter
        //   }
        //
        //   var canvas: any = window.document.getElementById("canvas");
        //   var ctx = canvas.getContext("2d");
        //   canvas.height = canvas.width * (preview.height / preview.width);
        //   var oc = window.document.createElement('canvas');
        //   var octx = oc.getContext('2d');
        //   oc.width = preview.width * percentage;
        //   oc.height = preview.height * percentage;
        //   canvas.width = oc.width;
        //   canvas.height = oc.height;
        //   octx.drawImage(preview, 0, 0, oc.width, oc.height);
        //   octx.drawImage(oc, 0, 0, oc.width, oc.height);
        //   ctx.drawImage(oc, 0, 0, oc.width, oc.height, 0, 0, canvas.width, canvas.height);
        //
        //   let jpg = ctx.canvas.toDataURL("image/jpeg");
        //   fetch(jpg)
        //     .then(res => res.blob())
        //     .then(blob => self.avatar = blob)
        // }
      }

      if (file) {
        reader.readAsDataURL(file);
      }
    }

    async addProduct(){
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', async (product) => {
        this.productForm.value.products.unshift(product)
        this.productForm.markAsDirty();
        this.events.unsubscribe('select-product');
        profileModal.dismiss();
      })
      let profileModal = await this.modalCtrl.create({
        component: ProductListPage,
        componentProps: {
          "select": true
        }
      });
      await profileModal.present();
      await this.loading.dismiss();
      await profileModal.onDidDismiss();
    }

    async addSize(){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('PRODUCT_SIZE'),
        message: this.translate.instant('WHAT_PRODUCT_SIZE'),
        inputs: [
          {
            placeholder: "Nombre",
            type: 'text',
            name: 'name'
        },
        {
          placeholder: "Precio",
          type: 'number',
          name: 'price',
        },
        ],
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
          },
          {
            text: this.translate.instant('CONFIRM'),
            handler: data => {
              this.productForm.value.sizes.push({
                name: data.name,
                price: data.price
              })
              this.productForm.markAsDirty();
            }
          }
        ]
      });

      prompt.present();
    }

    async editSize(item){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('PRODUCT_SIZE'),
        message: this.translate.instant('WHAT_PRODUCT_SIZE'),
        inputs: [
          {
            placeholder: "Nombre",
            type: 'text',
            name: 'name',
            value: item.name
        },
        {
          placeholder: "Precio",
          type: 'number',
          name: 'price',
          value: item.price
        }
        ],
        buttons: [
          {
            text: this.translate.instant('CANCEL'),
          },
          {
            text: this.translate.instant('CONFIRM'),
            handler: data => {
              item.name = data.name;
              item.price = data.price;
              this.productForm.markAsDirty();
            }
          }
        ]
      });

      prompt.present();
    }

    async selectProduct(product){
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

    deleteProduct(item, slidingItem){
      slidingItem.close();
      let index = this.productForm.value.products.indexOf(item);
      this.productForm.value.products.splice(index, 1);
    }

    deleteSize(item, slidingItem){
      slidingItem.close();
      let index = this.productForm.value.sizes.indexOf(item);
      this.productForm.value.sizes.splice(index, 1);
    }

  selectSize(item){
    this.productForm.patchValue({
      size: item.name,
      price: item.price
    })
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

  deleteImage(img){
    let index = this.product_images.indexOf(img);
    if (index!=-1){
      this.product_images.splice(index, 1)
    }
    let src = img.split('/');
    let file_name = src[src.length - 1];
    if (img[0] == 'h'){
      this.changed_images.push({
        name: file_name,
        action: "DEL",
        image: img,
      });
    } else {
      let index3=  this.changed_images.find(image=>image.name==file_name);
      if (index3!=-1){
        this.changed_images.splice(index3, 1)
      }
    }
    let index2 = this.productForm.value.images.indexOf(file_name);
    if (index2!=-1){
      this.productForm.value.images.splice(index2, 1)
    }
  }

  showFields(){
    this.moreFields = true;
  }
  hideFields(){
    this.moreFields = false;
  }
}

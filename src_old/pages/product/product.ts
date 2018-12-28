import { Component, ViewChild } from '@angular/core';
import { NavController,  ModalController, LoadingController, Platform,  Select, TextInput, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ProductService } from './product.service';
import { Base64 } from '@ionic-native/base64';
import { CategoriesPage } from './category/list/categories';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { StockMoveService } from '../stock/stock-move.service';
import { CashMoveService } from '../cash/move/cash-move.service';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'product-page',
  templateUrl: 'product.html'
})
export class ProductPage {
@ViewChild('name') name: TextInput;
@ViewChild('price') price: TextInput;
@ViewChild('cost') cost: TextInput;
@ViewChild('type') type: Select;
@ViewChild('stock') stock: TextInput;

  productForm: FormGroup;
  loading: any;
  _id: string;
  languages: Array<LanguageModel>;
  theoreticalStock: number = 0;
  opened: boolean = false;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    public platform: Platform,
    public productService: ProductService,
    public configService: ConfigService,
    public route: ActivatedRoute,
    
    public formBuilder: FormBuilder,
    public base64: Base64,
    public events:Events,
    // public camera: Camera,
    public stockMoveService: StockMoveService,
    public cashMoveService: CashMoveService,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get(_id);
    if (this.navParams.data._id){
      this.opened = true;
    }
    if (this.navParams.data.cost == undefined){
      this.navParams.data.cost = '';
    }
    if (this.navParams.data.code == undefined){
      this.navParams.data.code = '';
    }
    if (this.navParams.data.barcode == undefined){
      this.navParams.data.barcode = '';
    }
    if (this.navParams.data.tax == undefined){
      this.navParams.data.tax = '';
    }
    if (this.navParams.data.type == undefined){
      this.navParams.data.type = '';
    }
    if (this.navParams.data.stock == undefined){
      this.navParams.data.stock = '';
    }
    if (this.navParams.data.stock_min == undefined){
      this.navParams.data.stock_min = 0;
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.name.setFocus();
    }, 200);
  }

  ionViewWillLoad() {
    this.productForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      image: new FormControl(''),
      price: new FormControl('', Validators.required),
      category: new FormControl({}),
      cost: new FormControl(this.navParams.data.cost),
      code: new FormControl(''),
      barcode: new FormControl(this.navParams.data.barcode),
      tax: new FormControl(this.navParams.data.iva||'iva10'),
      type: new FormControl(this.navParams.data.type),
      stock: new FormControl(this.navParams.data.stock),
      stock_min: new FormControl(this.navParams.data.stock_min),
      note: new FormControl(''),
      date: new FormControl(new Date().toJSON()),
      unity: new FormControl(this.navParams.data.unity||'un'),
      _id: new FormControl(''),
    });
  }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.productService.getProduct(this._id).then((data) => {
        this.productForm.patchValue(data);
        this.theoreticalStock = data.stock;
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  goNextStep() {
    // if (this.productForm.value.state == 'DRAFT'){
      if (!this.productForm.value.name){
        this.name.setFocus();
        // return;
      }
      else if (this.productForm.value.price==''){
        this.price.setFocus();
        // return;
      }
      else if (this.productForm.value.cost==''){
        this.cost.setFocus();
        // return;
      }
      else if (!this.productForm.value.type){
        this.type.open();
        // return;
      }
      else if (Object.keys(this.productForm.value.category).length === 0){
        // this.category.setFocus();
        this.selectCategory();

      }
      else if (this.productForm.value.stock.toString()==''){
        // console.l
        this.stock.setFocus();
        // return;
      }
      else if (this.productForm.dirty) {
        this.justSave();
      } else {
        if (this.opened){
          this.navCtrl.navigateBack().then(() => {
            this.events.publish('open-product', this.productForm.value);
          });
        } else {
          this.navCtrl.navigateBack().then(() => {
            this.events.publish('create-product', this.productForm.value);
          });
        }
      }

      // else if (Object.keys(this.productForm.value.accountFrom).length === 0){
      //   this.selectAccountFrom();
      //   return;
      // }
      // else if (Object.keys(this.productForm.value.accountTo).length === 0){
      //   this.selectAccountTo();
      //   return;
      // }
      // else if (!this.transfer && Object.keys(this.productForm.value.contact).length === 0){
      //   this.selectContact();
      //   return;
      // }
      // else {
      //   let prompt = this.alertCtrl.create({
      //     title: 'Confirmar',
      //     message: 'Estas seguro que deseas confirmar el movimiento?',
      //     buttons: [
      //       {
      //         text: 'No',
      //         handler: data => {
      //         }
      //       },
      //       {
      //         text: 'Si',
      //         handler: data => {
      //           // this.addTravel();
      //           this.confirmCashMove();
      //         }
      //       }
      //     ]
      //   });
      //   prompt.present();
      // }
    // }
    // else {
    //   this.navCtrl.navigateBack();
    // }
  }

  justSave() {
    let product = Object.assign({}, this.productForm.value);
    // if(this.productForm.value.stock != this.theoreticalStock){
      product.stock = this.theoreticalStock;
    // }
    if (this._id){
      this.productService.updateProduct(product).then(doc=>{
        this.createInventoryAdjustment();
        this.productForm.markAsPristine();
      })
    } else {
      this.productService.createProduct(product).then(doc => {
        //console.log("docss", doc);
        this.productForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.createInventoryAdjustment();
        this.productForm.markAsPristine();
      });
    }
  }

  buttonSave() {
    let product = Object.assign({}, this.productForm.value);
    // if(this.productForm.value.stock != this.theoreticalStock){
      product.stock = this.theoreticalStock;
    // }
    if (this._id){
      this.productService.updateProduct(product).then(doc=>{
        this.createInventoryAdjustment();
      })
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-product', this.productForm.value);
      });
    } else {
      this.productService.createProduct(product).then(doc => {
        //console.log("docss", doc);
        this.productForm.patchValue({
          _id: doc['id'],
        });
        this._id = doc['id'];
        this.createInventoryAdjustment();
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-product', this.productForm.value);
        });
      });
    }
  }

  createInventoryAdjustment(){
    if(this.productForm.value.stock != this.theoreticalStock){
      this.configService.getConfigDoc().then((config: any)=>{
        let difference = (this.productForm.value.stock - this.theoreticalStock);
        let warehouseFrom_id = 'warehouse.inventoryAdjust';
        let warehouseTo_id  = config.warehouse_id;
        let accountFrom_id = 'account.other.inventoryAdjust';
        let accountTo_id  = 'account.other.stock';
        if (difference < 0) {
          warehouseFrom_id  = config.warehouse_id;
          warehouseTo_id = 'warehouse.inventoryAdjust';
          accountFrom_id = 'account.other.stock';
          accountTo_id  = 'account.other.inventoryAdjust';
        }
        this.stockMoveService.createStockMove({
          'name': "Ajuste "+this.productForm.value.code,
          'quantity': Math.abs(difference),
          'origin_id': this.productForm.value._id,
          'contact_id': "contact.myCompany",
          'product_id': this.productForm.value._id,
          'date': new Date(),
          'cost': this.productForm.value.cost*Math.abs(difference),
          'warehouseFrom_id': warehouseFrom_id,
          'warehouseTo_id': warehouseTo_id,
        }).then(res => {
          console.log("res", res);
        });

        this.cashMoveService.createCashMove({
          'name': "Ajuste "+this.productForm.value.code,
          'contact_id': "contact.myCompany",
          'amount': this.productForm.value.cost*Math.abs(difference),
          'origin_id': this.productForm.value._id,
          // "project_id": this.productForm.value.project_id,
          'date': new Date(),
          'accountFrom_id': accountFrom_id,
          'accountTo_id': accountTo_id,
        }).then((plan: any) => {
          //console.log("Plan", plan);
          // data['_id'] = plan.id;
          // this.saleForm.value.planned.push(data);
        })
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

  onSubmit(values){
    //console.log(values);
  }

  selectCategory() {
      this.events.subscribe('select-category', (data) => {
        this.productForm.patchValue({
          category: data,
        });
        this.productForm.markAsDirty();
        this.events.unsubscribe('select-category');
      })
      this.navCtrl.navigateForward(CategoriesPage, {"select": true});
  }

  // getAvatar(){
  //   this.productService.getAvatar(this.productForm.value).then((image_url) =>{
  //     this.productForm.patchValue({
  //       image: image_url
  //     });
  //   })
  // }

  // openImagePicker(){
  //   //console.log("openImagePicker");
  //   const options: CameraOptions = {
  //     quality: 100,
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     allowEdit: true
  //   }
  //   this.camera.getPicture(options).then((base64File: string) => {
  //     //console.log("results image");
  //     this.productService.sendImage(this.productForm.value, base64File).then((res) =>{
  //       //console.log("RES", res);
  //       this.getAvatar();
  //     });
  //    }, (err) => console.log(err)
  //  );
  // }

  // openImagePicker(){
  //  this.imagePicker.hasReadPermission().then(
  //    (result) => {
  //      //console.log("result", result);
  //      if(result == false){
  //        // no callbacks required as this opens a popup which returns async
  //        this.imagePicker.requestReadPermission();
  //      }
  //      else if(result == true){
  //        this.imagePicker.getPictures({ maximumImagesCount: 1 }).then(
  //          (results) => {
  //            for (var i = 0; i < results.length; i++) {
  //              this.cropService.crop(results[i], {quality: 75}).then(
  //                newImage => {
  //                  let image = newImage;
  //                  if (this.platform.is('ios')) {
  //                     image = image.replace(/^file:\/\//, '');
  //                  }
  //                  let filePath: string = image;
  //                   this.base64.encodeFile(filePath).then((base64File: string) => {
  //                     //console.log("base64File");
  //                     let base64_list = base64File.split("data:image/*;charset=utf-8;base64,")[1].split("\n");
  //                     let base64_content = "";
  //                     base64_list.forEach((item) => {
  //                       base64_content = base64_content + item;
  //                     })
  //                     this.productService.sendImage(this.productForm.value, base64_content).then((res) =>{
  //
  //                       //console.log("RES", res);
  //                       this.getAvatar();
  //                     })
  //                   }, (err) => {
  //                     console.log(err);
  //                   });
  //                  //console.log("image", image);
  //                  // this.productForm.patchValue({
  //                  //   'image': image,
  //                  // })
  //
  //                },
  //                error => console.error("Error cropping image", error)
  //              );
  //            }
  //          }, (err) => console.log(err)
  //        );
  //      }
  //    }, (err) => {
  //      console.log(err);
  //    });
  // }

}

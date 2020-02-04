import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController, Platform, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { ProductService } from './product.service';
// import { Base64 } from '@ionic-native/base64';
import { ProductCategoryListPage } from '../product-category-list/product-category-list.page';
import { BrandListPage } from '../brand-list/brand-list.page';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { StockMoveService } from '../stock-move/stock-move.service';
import { CashMoveService } from '../cash-move/cash-move.service';
import { ConfigService } from '../config/config.service';
import { ActivatedRoute, CanDeactivate } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { AuthService } from "../services/auth.service";
import { ProductListPage } from '../product-list/product-list.page';

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
  @ViewChild('cost', { static: true }) cost;
  @ViewChild('type', { static: true }) type;
  @ViewChild('stock', { static: false }) stock;
  // @ViewChild('barcode') barcodeField;

  @ViewChild('category', { static: true }) category;
  @ViewChild('brand', { static: true }) brand;
  @ViewChild('tax', { static: false })tax;
    productForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    theoreticalStock: number = 0;
    opened: boolean = false;
    select;
    barcode = '';
    editMode = false;
    avatar = undefined;
    logged: boolean = false;
    asking: boolean = false;
    currency_precision = 0;

    constructor(
      public navCtrl: NavController,
      // public modal: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      public platform: Platform,
      public productService: ProductService,
      public configService: ConfigService,
      public route: ActivatedRoute,
      public modalCtrl: ModalController,
      public formBuilder: FormBuilder,
      // public base64: Base64,
      public events:Events,
      // public camera: Camera,
      public pouchdbService: PouchdbService,
      public stockMoveService: StockMoveService,
      public cashMoveService: CashMoveService,
      public authService: AuthService,
    ) {



      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
      if (this.route.snapshot.paramMap.get('_id')){
        this.opened = true;
      }
      this.barcode = this.route.snapshot.paramMap.get('barcode');
      this.cost = this.route.snapshot.paramMap.get('cost');
      this.stock = this.route.snapshot.paramMap.get('stock');
      // if (this.route.snapshot.paramMap.get('cost') == undefined){
      //   this.route.snapshot.paramMap.get('cost') = '';
      // }
      // if (this.route.snapshot.paramMap.get('code') == undefined){
      //   this.route.snapshot.paramMap.get('code') = '';
      // }
      // if (this.route.snapshot.paramMap.get('barcode') == undefined){
      //   this.route.snapshot.paramMap.get('barcode') = '';
      // }
      // if (this.route.snapshot.paramMap.get('tax') == undefined){
      //   this.route.snapshot.paramMap.get('tax') = '';
      // }
      // if (this.route.snapshot.paramMap.get('type') == undefined){
      //   this.route.snapshot.paramMap.get('type') = '';
      // }
      // if (this.route.snapshot.paramMap.get('stock') == undefined){
      //   this.route.snapshot.paramMap.get('stock') = '';
      // }
      // if (this.route.snapshot.paramMap.get('stock_min') == undefined){
      //   this.route.snapshot.paramMap.get('stock_min') = 0;
      // }
    }

    enableEditMode(){
      this.editMode = !this.editMode;
    }

    async ngOnInit() {
      setTimeout(() => {
        // this.name.setFocus();
        this.productForm.markAsPristine();
      }, 400);
      this.productForm = this.formBuilder.group({
        name: new FormControl(null, Validators.required),
        image: new FormControl(''),
        price: new FormControl(null, Validators.required),
        category: new FormControl({}),
        brand: new FormControl({}),
        cost: new FormControl(this.cost||null),
        code: new FormControl(''),
        barcode: new FormControl(this.barcode),
        tax: new FormControl(this.route.snapshot.paramMap.get('iva')||'iva10'),
        type: new FormControl(this.route.snapshot.paramMap.get('type')||'product'),
        stock: new FormControl(this.stock||null),
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
        quantity: new FormControl(1),
        products: new FormControl([]),
        sizes: new FormControl([]),
        size: new FormControl(),
        description: new FormControl(''),
      });

      this.authService.loggedIn.subscribe(async status => {
        // this.loading.dismiss();
        console.log("estado", status);
        if (status) {
          //check if contact_id exists
          let data = await this.authService.getData();
          let contact = await this.pouchdbService.getDoc("contact."+data.currentUser.email);
          if (JSON.stringify(contact) == "{}"){
            this.pouchdbService.createDoc({
              "_id": "contact."+data.currentUser.email,
              "name": data.currentUser.displayName,
              "name_legal": null,
              "address": "",
              "phone": "",
              "document": "",
              "code": "#3",
              "section": "salary",
              "email": data.currentUser.email,
              "note": "",
              "customer": true,
              "supplier": true,
              "seller": false,
              "employee": false,
              "user": false,
              "user_details": {},
              "salary": null,
              "currency": {},
              "hire_date": null,
              "salaries": [],
              "advances": [],
              "fixed": true,
              "create_user": "",
              "create_time": "",
              "write_user": "larica",
              "write_time": "2020-01-14T20:48:52.405Z",
              "docType": "contact"
            })
          }

          this.logged = true;
          if(this.asking){
            this.events.publish('add-product', this.productForm.value);
            this.exitPage();
          }
        } else {
          this.logged = false;
        }
        this.asking = false;
      });
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
          this.productForm.patchValue(data);
          this.theoreticalStock = data.stock;
          this.productForm.markAsPristine();
          this.loading.dismiss();
        });
      } else {
        this.editMode = true;
        this.getDefaultCategory();
        this.loading.dismiss();
      }
    }

    async askProduct(){
      let orders:any = await this.pouchdbService.searchDocTypeData(
        'sale', "CONFIRMED", 0, "state");
      if (orders[0]){
        let alertPopup = await this.alertCtrl.create({
            header: this.translate.instant('Pedido Pendiente'),
            message: this.translate.instant('No puedes hacer un nuevo pedido mientras hay otro pendiente'),
            buttons: [{
                    text: this.translate.instant('OK'),
                    handler: () => {
                    }
                }]
        });
        alertPopup.present();
      } else {
        if (this.logged){
          this.events.publish('add-product', this.productForm.value);
          this.exitPage();
        } else {
          this.asking = true;
          this.authLogin();
        }
      }
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

    async authLogin() {
      this.authService.login();
    }

    goNextStep() {
        if (this.productForm.value.name==null){
          this.name.setFocus();
        }
        else if (this.productForm.value.price==null){
          this.price.setFocus();
        }
        else if (this.productForm.value.cost==null){
          this.cost.setFocus();
        }
        else if (this.productForm.value.stock==null){
          this.stock.setFocus();
          return;
        }
        else if (this.productForm.dirty) {
          this.buttonSave();
        } else {
          if (this.opened){
            this.navCtrl.navigateBack('/product-list');
            // .then(() => {
              this.events.publish('open-product', this.productForm.value);
            // });
          } else {
            this.navCtrl.navigateBack('/product-list');
            // .then(() => {
              this.events.publish('create-product', this.productForm.value);
            // });
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
        //         text: this.translate.instant('NO'),
        //         handler: data => {
        //         }
        //       },
        //       {
        //         text: this.translate.instant('YES'),
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
      this.productForm.patchValue({
          stock: parseFloat(this.productForm.value.stock) || 0,
          cost: parseFloat(this.productForm.value.cost) || 0,
          price: parseFloat(this.productForm.value.price) || 0,
          stock_min: parseFloat(this.productForm.value.stock_min) || 0,
      })

      let product = Object.assign({}, this.productForm.value);
      // console.log("product", product);
      // if(this.productForm.value.stock != this.theoreticalStock){
        product.stock = this.theoreticalStock;
      // }
      if (this._id){
        this.productService.updateProduct(product, this.avatar).then(doc=>{
          this.createInventoryAdjustment();
        })
        if (this.select){
          this.modalCtrl.dismiss();
          this.events.publish('open-product', this.productForm.value);
        } else {
          this.navCtrl.navigateBack('/product-list');
          // .then(() => {
            this.events.publish('open-product', this.productForm.value);
          // });
        }
      } else {
          //console.log("docss", doc);
        this.productService.createProduct(product, this.avatar).then(async (doc: any) => {
          let produ:any = await this.pouchdbService.getDoc(doc['id'])
          this.productForm.patchValue({
            _id: doc['id'],
            code: produ.code
          });
          this._id = doc['id'];
          this.createInventoryAdjustment();
          if (this.select){
            this.modalCtrl.dismiss();
            this.events.publish('create-product', this.productForm.value);
          } else {
            this.navCtrl.navigateBack('/product-list');
            // .then(() => {
              this.events.publish('create-product', this.productForm.value);
            // });
          }
        });
      }
    }

    createInventoryAdjustment(){
      if(this.productForm.value.stock != this.theoreticalStock){
        this.configService.getConfigDoc().then(async (config: any)=>{
          let difference = (this.productForm.value.stock - this.theoreticalStock);
          let warehouseFrom_id = 'warehouse.inventoryAdjust';
          let warehouseTo_id  = config.warehouse_id;
          let accountFrom_id = 'account.income.positiveInventory';
          let accountTo_id  = 'account.other.stock';
          if (difference < 0) {
            warehouseFrom_id  = config.warehouse_id;
            warehouseTo_id = 'warehouse.inventoryAdjust';
            accountFrom_id = 'account.other.stock';
            accountTo_id  = 'account.expense.negativeInventory';
          }
          let docs: any = await this.pouchdbService.getList([
            warehouseFrom_id,
            warehouseTo_id,
            accountFrom_id,
            accountTo_id,
          ]);
          var doc_dict = {};
          docs.forEach(row=>{
            doc_dict[row.id] = row.doc.name;
          })
          this.stockMoveService.createStockMove({
            'name': "Ajuste "+this.productForm.value.code,
            'quantity': Math.abs(difference),
            'origin_id': this.productForm.value._id,
            'contact_id': "contact.myCompany",
            'contact_name': config.name,
            'product_id': this.productForm.value._id,
            'date': new Date(),
            'cost': (parseFloat(this.productForm.value.cost)||0)*Math.abs(difference),
            'warehouseFrom_id': warehouseFrom_id,
            'warehouseFrom_name': doc_dict[warehouseFrom_id],
            'warehouseTo_id': warehouseTo_id,
            'warehouseTo_name': doc_dict[warehouseTo_id],
          }).then(res => {
            // console.log("res", res);
          });

          this.cashMoveService.createCashMove({
            'name': "Ajuste "+this.productForm.value.code,
            'contact_id': "contact.myCompany",
            'contact_name': config.name,
            'amount': (parseFloat(this.productForm.value.cost)||0)*Math.abs(difference),
            'origin_id': this.productForm.value._id,
            // "project_id": this.productForm.value.project_id,
            'date': new Date(),
            'accountFrom_id': accountFrom_id,
            'accountFrom_name': doc_dict[accountFrom_id],
            'accountTo_id': accountTo_id,
            'accountTo_name': doc_dict[accountTo_id],
          }).then((plan: any) => {
            //console.log("Plan", plan);
            // data['_id'] = plan.id;
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

    // selectCategory() {
    //     this.events.subscribe('select-category', (data) => {
    //       this.productForm.patchValue({
    //         category: data,
    //       });
    //       this.productForm.markAsDirty();
    //       this.events.unsubscribe('select-category');
    //     })
    //     this.navCtrl.navigateForward(['product-category-list', {
    //       "select": true
    //     }]);
    // }

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

    selectBrand() {
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        let profileModal = await this.modalCtrl.create({
          component: BrandListPage,
          componentProps: {
            "select": true,
          }
        });
        await profileModal.present();
        this.events.unsubscribe('select-brand');
        this.events.subscribe('select-brand', (data) => {
          this.productForm.patchValue({
            brand: data,
            brand_name: data.name,
          });
          this.productForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-brand');
          profileModal.dismiss();
          // resolve(true);
        })
      });
    }

    showNextButton(){
      // console.log("stock",this.productForm.value.stock);
      if (this.productForm.value.name==null){
        return true;
      }
      else if (this.productForm.value.price==null){
        return true;
      }
      else if (this.productForm.value.cost==null){
        return true;
      }
      else if (this.productForm.value.type=='product'&&this.productForm.value.stock==null){
        return true;
      }
      else {
        return false;
      }
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

    sumItem() {
      let quantity = this.productForm.value.quantity;
      quantity += 1;
      this.productForm.patchValue({
        quantity: quantity
      })
        // this.recomputeValues();
    }

    remItem() {
      let quantity = this.productForm.value.quantity;
      if (quantity>1){
        quantity -= 1;
        this.productForm.patchValue({
          quantity: quantity
        })
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
        this.productForm.patchValue({
          image: reader.result,
        })
        this.productForm.markAsDirty();
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

    async addOption(){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('PRODUCT_PRICE'),
        message: this.translate.instant('WHAT_PRODUCT_PRICE'),
        inputs: [
          {
            type: 'text',
            name: 'name'
        },
        {
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

    async editOption(item){
      let prompt = await this.alertCtrl.create({
        header: this.translate.instant('PRODUCT_PRICE'),
        message: this.translate.instant('WHAT_PRODUCT_PRICE'),
        inputs: [
          {
            type: 'text',
            name: 'name',
            value: item.name
        },
        {
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

    changeOption(){
      let opt = this.productForm.value.sizes.filter(option=>option.name == this.productForm.value.size);
      console.log("this.productForm.value.size", this.productForm.value.size);
      console.log("opt", opt);
      if (opt[0]){
        this.productForm.patchValue({
          price: opt[0].price
        })
      }
    }

}

import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController,  Events } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
import { ProductService } from '../../product/product.service';
import { ProductListPage } from '../../product-list/product-list.page';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-input',
  templateUrl: './input.page.html',
  styleUrls: ['./input.page.scss'],
})
export class ServiceInputPage implements OnInit {
  inputForm: FormGroup;
  loading: any;
  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public route: ActivatedRoute,

    public formBuilder: FormBuilder,
    public productService: ProductService,
    public events: Events,
    public speechRecognition: SpeechRecognition,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
  }

  ngOnInit() {
    this.inputForm = this.formBuilder.group({
      product: new FormControl({}),
      description: new FormControl(this.route.snapshot.paramMap.get('description')||''),
      quantity: new FormControl(this.route.snapshot.paramMap.get('quantity')||0),
      price: new FormControl(this.route.snapshot.paramMap.get('price')||0),
      note: new FormControl(this.route.snapshot.paramMap.get('note')||''),
    });
    //console.log("Params", this.navParams.data);
    this.productService.getProduct(this.route.snapshot.paramMap.get('product._id')).then(product => {
      this.inputForm.patchValue({
        product: product,
      });
    })
  }

  async openItem() {
      this.events.unsubscribe('select-product');
      this.events.subscribe('select-product', (data) => {
        //console.log(data);
        this.inputForm.patchValue({
          product: data,
          description: data.name,
          price: data.price,
        });
        this.inputForm.markAsDirty();
        this.events.unsubscribe('select-product');
      })
      let profileModal = await this.modal.create({
        component: ProductListPage,
        componentProps: {"select": true, "type": "product"}
      });
      profileModal.present();
  }

  listenDescription() {
    //console.log("teste");
    let options = {
      language: 'pt-BR'
    }
    this.speechRecognition.hasPermission()
    .then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission();
      } else {
        this.speechRecognition.startListening(options).subscribe(matches => {
          this.inputForm.patchValue({
            note: matches[0],
          });
        });
      }
    });
  }

  buttonSave(){
    // this.viewCtrl.dismiss(this.inputForm.value);
  }

}

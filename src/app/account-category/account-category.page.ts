import { ActivatedRoute, Router } from '@angular/router';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { Component, OnInit } from '@angular/core';
import { NavController,  ModalController, LoadingController, AlertController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { AccountCategoryService } from './accountCategory.service';
import { TitleListPage } from '../title-list/title-list.page';

@Component({
  selector: 'app-account-category',
  templateUrl: './account-category.page.html',
  styleUrls: ['./account-category.page.scss'],
})
export class AccountCategoryPage implements OnInit {
    accountCategoryForm: FormGroup;
    loading: any;
    languages: Array<LanguageModel>;
    _id: string;
    select;
    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public alertCtrl: AlertController,
      // public imagePicker: ImagePicker,
      // public cropService: Crop,
      // public platform: Platform,
      // public accountCategoryService: AccountCategoryService,
      public pouchdbService: PouchdbService,
      public route: ActivatedRoute,

      public formBuilder: FormBuilder,
      public events: Events,
    ) {
      this.languages = this.languageService.getLanguages();
      this.translate.setDefaultLang('es');
      this.translate.use('es');
      this._id = this.route.snapshot.paramMap.get('_id');
      this.select = this.route.snapshot.paramMap.get('select');
    }

    ngOnInit() {
      this.accountCategoryForm = this.formBuilder.group({
        name: new FormControl('', Validators.required),
        type: new FormControl('receivable'),
        note: new FormControl(''),
        code: new FormControl(''),
        title: new FormControl({}),
        title_id: new FormControl(""),
        cash_out: new FormControl(false),
        cash_in: new FormControl(false),
        transfer: new FormControl(false),
        payable: new FormControl(false),
        receivable: new FormControl(false),
        _id: new FormControl(''),
        create_user: new FormControl(''),
        create_time: new FormControl(''),
        write_user: new FormControl(''),
        write_time: new FormControl(''),
      });
      //this.loading.present();
      if (this._id){
        this.getAccountCategory(this._id).then((data) => {
          this.accountCategoryForm.patchValue(data);
          //this.loading.dismiss();
        });
      } else {
        //this.loading.dismiss();
      }
    }

    buttonSave() {
      if (this._id){
        this.updateAccountCategory(this.accountCategoryForm.value);
        this.events.publish('open-accountCategory', this.accountCategoryForm.value);
      } else {
        this.createAccountCategory(this.accountCategoryForm.value).then((doc: any) => {
          this.accountCategoryForm.patchValue({
            _id: doc.id,
          });
          this._id = doc.id;
          this.events.publish('create-accountCategory', this.accountCategoryForm.value);
        });
      }
      if (this.select){
        this.modalCtrl.dismiss();
      }
      else {
        this.navCtrl.navigateBack('/account-category-list');
      }
    }

    selectTitle() {
      // console.log("selectTitle");
      return new Promise(async resolve => {
        // this.avoidAlertMessage = true;
        this.events.unsubscribe('select-title');
        this.events.subscribe('select-title', (data) => {
          this.accountCategoryForm.patchValue({
            title: data,
            // type: data.type,
          });
          this.accountCategoryForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-title');
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: TitleListPage,
          componentProps: {
            "select": true
          }
        });
        profileModal.present();
      });
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
      //console.log("teste", values);
    }

    getAccountCategory(doc_id): Promise<any> {
      // return this.pouchdbService.getDoc(doc_id);
      return new Promise((resolve, reject)=>{
        this.pouchdbService.getDoc(doc_id).then((category: any)=>{
          if (category.title_id){
            this.pouchdbService.getDoc(category.title_id).then(title=>{
              category.title = title || {};
              resolve(category);
            });
          } else {
            category.title = {};
            resolve(category);
          }
        });
      });
    }

    createAccountCategory(accountCategory){
      accountCategory.docType = 'accountCategory';
      accountCategory.title_id = accountCategory.title._id;
      delete accountCategory.title;
      return this.pouchdbService.createDoc(accountCategory);
    }

    updateAccountCategory(accountCategory){
      accountCategory.docType = 'accountCategory';
      accountCategory.title_id = accountCategory.title._id;
      delete accountCategory.title;
      return this.pouchdbService.updateDoc(accountCategory);
    }

    deleteAccountCategory(accountCategory){
      return this.pouchdbService.deleteDoc(accountCategory);
    }

    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.accountCategoryForm.dirty) {
            let alertPopup = await this.alertCtrl.create({
                header: 'Descartar',
                message: '¿Deseas salir sin guardar?',
                buttons: [{
                        text: 'Si',
                        handler: () => {
                            // alertPopup.dismiss().then(() => {
                                this.exitPage();
                            // });
                        }
                    },
                    {
                        text: 'No',
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
        this.accountCategoryForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/sale-list');
      }
    }
}

import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavController, ModalController, LoadingController,  Events, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../../services/language/language.service";
import { LanguageModel } from "../../services/language/language.model";
// import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { ContactListPage } from '../../contact-list/contact-list.page';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-work',
  templateUrl: './work.page.html',
  styleUrls: ['./work.page.scss'],
})
export class ProductionWorkPage implements OnInit {
  @ViewChild('description', { static: true }) descriptionField;
  @ViewChild('time', { static: true }) timeField;
    workForm: FormGroup;
    loading: any;
    _id: string;
    languages: Array<LanguageModel>;
    select = true;
    @Input() description;
    @Input() date;
    @Input() time;
    @Input() responsible;

    constructor(
      public navCtrl: NavController,
      public modalCtrl: ModalController,
      public loadingCtrl: LoadingController,
      public translate: TranslateService,
      public languageService: LanguageService,
      public route: ActivatedRoute,
      // public navParams: NavParams,
      public alertCtrl: AlertController,
      public formBuilder: FormBuilder,
      // public speechRecognition: SpeechRecognition,
      public events: Events,
    ) {
      
      
      
      var foo = { foo: true };
      history.pushState(foo, "Anything", " ");
      // this._id = this.route.snapshot.paramMap.get(_id);
    }

    ngOnInit() {
  let language = navigator.language.split('-')[0];
  this.translate.setDefaultLang(language);
  this.translate.use(language);
      this.workForm = this.formBuilder.group({
        description: new FormControl(this.description||null),
        date: new FormControl(this.date||new Date().toISOString()),
        time: new FormControl(this.time||null),
        // note: new FormControl(this.navParams.datanote||''),
        responsible: new FormControl(this.route.snapshot.paramMap.get('responsible')||''),
      });
    // }
    //
    // ionViewDidLoad(){
      setTimeout(() => {
        this.timeField.setFocus();
      }, 200);
    }

    buttonSave(){
      this.modalCtrl.dismiss(this.workForm.value);
    }

    selectResponsible() {
      return new Promise( async resolve => {
        // this.avoidAlertMessage = true;
        this.events.unsubscribe('select-contact');
        this.events.subscribe('select-contact', (data) => {
          this.workForm.patchValue({
            responsible: data,
          });
          this.workForm.markAsDirty();
          // this.avoidAlertMessage = false;
          this.events.unsubscribe('select-contact');
          resolve(true);
        })
        let profileModal = await this.modalCtrl.create({
          component: ContactListPage,
          componentProps: {"select": true, "filter": "employee"}
        });
        profileModal.present();
      });
    }

    // listenDescription() {
    //   let options = {
    //     language: 'pt-BR'
    //   }
    //   this.speechRecognition.hasPermission()
    //   .then((hasPermission: boolean) => {
    //     if (!hasPermission) {
    //       this.speechRecognition.requestPermission();
    //     } else {
    //       this.speechRecognition.startListening(options).subscribe(matches => {
    //         this.workForm.patchValue({
    //           description: matches[0],
    //         });
    //         this.workForm.markAsDirty();
    //       });
    //     }
    //   });
    // }


    async goNextStep() {
      // if (this.workForm.value.state == 'QUOTATION'){
      //   console.log("set Focus");
      //   if (this.workForm.value.client_request == ''){
      //     this.clientRequest.setFocus();
      //   }
      if (this.workForm.value.time==null){
        this.timeField.setFocus();
        return;
      }
    }


    showNextButton(){
      // console.log("stock",this.workForm.value.stock);
      if (this.workForm.value.time==null){
        return true;
      }
      // else if (this.workForm.value.cost==null){
      //   return true;
      // }
      // else if (this.workForm.value.type=='product'&&this.workForm.value.stock==null){
      //   return true;
      // }
      else {
        return false;
      }
    }
    discard(){
      this.canDeactivate();
    }
    async canDeactivate() {
        if(this.workForm.dirty) {
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
        this.workForm.markAsPristine();
        this.navCtrl.navigateBack('/tabs/sale-list');
      }
    }


}

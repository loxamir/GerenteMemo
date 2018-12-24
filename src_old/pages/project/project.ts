import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Events } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { ProjectService } from './project.service';

@Component({
  selector: 'project-page',
  templateUrl: 'project.html'
})
export class ProjectPage {

  projectForm: FormGroup;
  loading: any;
  _id: string;

  languages: Array<LanguageModel>;

  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public projectService: ProjectService,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public events: Events,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this._id = this.route.snapshot.paramMap.get('_id');
  }

  ionViewWillLoad() {
    this.projectForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      type: new FormControl('VEHICLE'),
      // project: new FormControl(this.navParams.data.project||{}),
      // project_name: new FormControl(this.navParams.data.project_name||''),
      value: new FormControl(),
      attributes: new FormControl([]),
      expenses: new FormControl([]),
      category: new FormControl({}),
      note: new FormControl(''),
      code: new FormControl(''),
      meter: new FormControl(''),
      image: new FormControl(''),
      _id: new FormControl(''),
    });
  }

  // selectProject() {
  //   console.log("selectProject");
  //   // if (this.projectForm.value.state=='QUOTATION'){
  //     return new Promise(resolve => {
  //       this.events.unsubscribe('select-project');
  //       this.events.subscribe('select-project', (data) => {
  //         this.projectForm.patchValue({
  //           project: data,
  //           project_name: data.name,
  //         });
  //         this.projectForm.markAsDirty();
  //         // this.avoidAlertMessage = false;
  //         this.events.unsubscribe('select-project');
  //         resolve(true);
  //       })
  //       let profileModal = this.modal.create(ProjectsPage, {"select": true});
  //       profileModal.present();
  //     });
  //   // }
  // }

  ionViewDidLoad() {
    //this.loading.present();
    if (this._id){
      this.projectService.getProject(this._id).then((data) => {
        this.projectForm.patchValue(data);
        //this.loading.dismiss();
      });
    } else {
      //this.loading.dismiss();
    }
  }

  // buttonSave() {
  //   if (this._id){
  //     this.projectService.updateProject(this.projectForm.value);
  //   } else {
  //     this.projectService.createProject(this.projectForm.value);
  //   }
  // }
  buttonSave() {
    if (this._id){
      this.projectService.updateProject(this.projectForm.value);
      this.navCtrl.navigateBack().then(() => {
        this.events.publish('open-project', this.projectForm.value);
      });
    } else {
      this.projectService.createProject(this.projectForm.value).then((doc: any) => {
        //console.log("docss", doc);
        this.projectForm.patchValue({
          _id: doc.id,
        });
        this._id = doc.id;
        this.navCtrl.navigateBack().then(() => {
          this.events.publish('create-project', this.projectForm.value);
        });
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
    ]
  };

  onSubmit(values){
    //console.log(values);
  }
}

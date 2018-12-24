import { Component } from '@angular/core';
import { NavController,  ModalController, LoadingController, App, Events, ToastController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
// import { ImagePicker } from '@ionic-native/image-picker';
// import { Crop } from '@ionic-native/crop';
import { Storage } from '@ionic/storage';
import { LoginService } from './login.service';
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { AppConfig } from '../../app/app.config';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from '../services/rest/rest';

@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {

  loginForm: FormGroup;
  loading: any;
  context: any;
  languages: Array<LanguageModel>;
  // phone: any;
  show_create: boolean = false;
  selected_user: boolean = false;
  databaseList: any[];
  constructor(
    public navCtrl: NavController,
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    // public imagePicker: ImagePicker,
    // public cropService: Crop,
    // public platform: Platform,
    public route: ActivatedRoute,
    public formBuilder: FormBuilder,
    public storage: Storage,
    public app: App,
    public loginService: LoginService,
    public events: Events,
    public appConfig: AppConfig,
    public pouchdbService: PouchdbService,
    public toastCtrl: ToastController,
    public restProvider: RestProvider,
  ) {
    //this.loading = //this.loadingCtrl.create();
    this.languages = this.languageService.getLanguages();
    this.context = this.route.snapshot.paramMap.get('context');
    //console.log("Test", this.context);

    this.storage.get("username").then((username)=>{
      if (username){
        this.showDatabaseList();
        this.selected_user = true;
      }
    })
    this.loginForm = new FormGroup({
      name: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.compose([
        Validators.minLength(10),
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ])),
      user: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+$')
      ])),
      password: new FormControl('', Validators.required),
    });
  }

  validation_messages = {
    'password': [
      { type: 'required', message: 'La Contraseña es necesaria.' }
    ],
    'user': [
      { type: 'minlength', message: 'El Usuario debe tener al menos 5 digitos.' },
      { type: 'required', message: 'El Usuario es Necesario.' },
      { type: 'pattern', message: 'Use solo letras, numeros, "." y "_" por ejemplo: mi_nombre.123' },
    ],
    'name': [
      { type: 'required', message: 'El Nombre es Necesario.' }
    ],
    'mobile': [
      { type: 'minlength', message: 'El Celular debe tener al menos 10 digitos.' },
      { type: 'required', message: 'El Celular es Necesario.' },
      { type: 'pattern', message: 'Use solo numeros sin espacios por ejemplo: 0984123456' },
    ],
  };

  showDemo (){
    this.loginForm.patchValue({
      "user": "base_memo_demo",
    })
    this.login();
  }

  showCreate(){
    this.show_create = true;
  }

  showLogin(){
    this.show_create = false;
  }

  login (){
    this.loginService.checkLogin(this.loginForm.value.user.toLowerCase(), this.loginForm.value.password).then((loginData: any)=>{
      console.log("LOGIN DATA", loginData);
      if (loginData.ok){
        this.doLogin();
      } else {
        let toast = this.toastCtrl.create({
          message: "Usuario o Contraseña Equivocados",
          duration: 3000
        });
        toast.present();
      }
    })
  }

  register (){
    console.log("values", this.loginForm.value);
    this.restProvider.checkDbExist(this.loginForm.value.user.toLowerCase()).then((dbexists: any)=>{
      console.log("dbexists", dbexists);
      if (dbexists.status=="404"){
        //this.loading.present();
        this.loginService.createLogin(this.loginForm.value).then(login => {
          setTimeout(() => {
            this.doLogin();
          }, 5000);
        })
      } else {
        let toast = this.toastCtrl.create({
          message: "Base Existente",
          duration: 3000
        });
        toast.present();
      }
    })
  }

  changePassword (){
    this.loginService.checkLogin(
      this.loginForm.value.user.toLowerCase(),
      this.loginForm.value.password
    ).then((loginData: any)=>{
      console.log("LOGIN DATA", loginData);
      if (loginData.ok){
        this.restProvider.changePassword(
          this.loginForm.value.user.toLowerCase(),
          this.loginForm.value.password,
          this.loginForm.value.new_password,
        ).then(updatePassword=>{
          console.log("updatePassword", updatePassword);
        })
      }
      else {
        let toast = this.toastCtrl.create({
          message: "Usuario o Contraseña Equivocados",
          duration: 3000
        });
        toast.present();
      }
    })
  }

  async doLogin(){
    await this.storage.set('username', this.loginForm.value.user.toLowerCase());
    this.storage.set("password", this.loginForm.value.password.toLowerCase());
    this.events.publish('get-user', {"user": this.loginForm.value.user.toLowerCase()});
    this.selected_user = true;
    this.showDatabaseList();
  }

  showDatabaseList(){
    this.databaseList = ['moga', 'demo'];
  }

  async selectDatabase(database){
    //this.loading.present();
    if (this.navParams.data.current_db){
      this.pouchdbService.getDisConnect();
    }
    await this.storage.set('database', database.toLowerCase());
    this.appConfig.setDatabase(database.toLowerCase());
    this.pouchdbService.getConnect();
    if (this.navParams.data.current_db){
      this.navCtrl.navigateBack()
    }

    // this.events.subscribe('end-sync', () => {
    //   let isFirst = false;
    //   if(isFirst){
    //     this.initiateViews();
    //   } else {
    //     // window.location.reload();
    //   }
    //   //this.loading.dismiss();
    // })
  }

  async initiateViews(){
    let toast2 = this.toastCtrl.create({
      message: "2/8 - Sincronizando Balancete",
    });
    toast2.present();
    await this.pouchdbService.getView('stock/Contas');
    toast2.dismiss();
    let toast3 = this.toastCtrl.create({
    message: "3/8 - Sincronizando Cuentas a Cobrar",
    });
    toast3.present();
    await this.pouchdbService.getView('stock/A Cobrar');
    toast3.dismiss();
    let toast4 = this.toastCtrl.create({
    message: "4/8 - Sincronizando Cuentas a Pagar",
    });
    toast4.present();
    await this.pouchdbService.getView('stock/A Pagar');
    toast4.dismiss();
    let toast5 = this.toastCtrl.create({
    message: "5/8 - Sincronizando Stock",
    });
    toast5.present();
    await this.pouchdbService.getView('stock/Depositos');
    toast5.dismiss();
    let toast6 = this.toastCtrl.create({
    message: "6/8 - Sincronizando Cajas",
    });
    toast6.present();
    await this.pouchdbService.getView('stock/Caixas');
    toast6.dismiss();
    let toast7 = this.toastCtrl.create({
    message: "7/8 - Sincronizando Balance y Resultados",
    });
    toast7.present();
    await this.pouchdbService.getView('stock/ResultadoDiario');
    toast7.dismiss();
    let toast8 = this.toastCtrl.create({
    message: "8/8 - Sincronizando Flujo de Caja",
    });
    toast8.present();
    await this.pouchdbService.getView('stock/Fluxo');
    toast8.dismiss();
    this.events.publish('get-database', {});
    //this.loading.dismiss();
    this.navCtrl.setRoot(TabsNavigationPage);
    console.log("dismissed");
  }

  logout(){
    this.storage.set('username', false).then(()=>{
      this.storage.set('password', false).then(()=>{
        this.storage.set('database', false).then(()=>{
          window.location.reload();
        });
      });
    });
  }
}

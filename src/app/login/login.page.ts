import { Component, OnInit } from '@angular/core';
import { LoadingController, Events, ToastController, MenuController,
  PopoverController, AlertController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { Storage } from '@ionic/storage';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from '../services/rest/rest';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginPopover } from './login.popover';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  loading: any;
  context: any;
  languages: Array<LanguageModel>;
  show_create: boolean = false;
  selected_user: boolean = false;
  databaseList: [];
  username = 'larica';
  today = new Date().toISOString();
  language;
  demo;

  constructor(
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public formBuilder: FormBuilder,
    public storage: Storage,
    public events: Events,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public pouchdbService: PouchdbService,
    public toastCtrl: ToastController,
    public restProvider: RestProvider,
    public route: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
  ) {
    this.demo = this.route.snapshot.paramMap.get('demo');
    if (this.demo){
      this.show_create = true;
    }
    let username = "larica";
    let password = "123";
    // this.username = "larica";
    // this.selectDatabase("larica");
    // this.storage.get("username").then((username)=>{
    //   if (username){
    //     this.storage.get("password").then((password)=>{
          // this.showDatabaseList(username, password);
          // this.selected_user = true;
      //   })
      // }
    // })
  }

  async ngOnInit() {
    // await this.showLoading();
    // this.authService.loggedIn.subscribe(status => {
      // this.loading.dismiss();
      // console.log("status", status);
      // if (status) {
      //   // this.navCtrl.navigateForward("/home");
      //   this.router.navigate(['/tabs/product-list']);
      // }
    // });
    this.loginForm = new FormGroup({
      name: new FormControl('', Validators.required),
      mobile: new FormControl('', Validators.compose([
        Validators.minLength(10),
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ])),
      user: new FormControl('larica', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+$')
      ])),
      password: new FormControl('123', Validators.required),
      address: new FormControl('', Validators.required),
    });
    this.loading = await this.loadingCtrl.create({});
    this.language = await this.storage.get("language");
    if (!this.language){
      this.language = navigator.language.split('-')[0];
    }
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    // this.username = 'larica';
    this.doLogin();
    setTimeout(() => {
      this.menuCtrl.enable(false);
    }, 500);
  }

  payDatabase(database){
    window.open("https://www.pagopar.com/pagos/"+database.paylink);
  }

  async authLogin() {
    await this.showLoading();
    this.authService.login();
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: "Authenticating..."
    });

    this.loading.present();
  }

  async presentPopover(myEvent) {
    let popover = await this.popoverCtrl.create({
      component: LoginPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    await popover.present();
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

  showCreate(){
    this.show_create = true;
    this.loginForm.patchValue({
      "user": "memo",
      "password": "123",
    })
  }

  showLogin(){
    this.loginForm.patchValue({
      "user": "",
      "password": "",
    })
    this.show_create = false;
  }

  seeDemo(){
    this.login();
    this.registerLead()
  }

  registerLead(){
    let leadData = {
      "name": this.loginForm.value.name,
      "address": this.loginForm.value.address,
      "phone": this.loginForm.value.mobile,
      "date": this.today,
    }
    this.restProvider.sendLead(leadData);
  }

  login (){
    this.authService.login();
    this.checkLogin(
      this.loginForm.value.user.toLowerCase(),
      this.loginForm.value.password
    ).then(async (loginData: any)=>{
      if (loginData.ok){
        this.doLogin();
      } else {
        let toast = await this.toastCtrl.create({
          message: "Usuario o Contraseña Equivocados",
          duration: 3000
        });
        await toast.present();
      }
    })
  }

  register (){
    this.restProvider.checkDbExist(this.loginForm.value.user.toLowerCase()).then(async (dbexists: any)=>{
      if (dbexists.status=="404"){
        let toast = await this.toastCtrl.create({
          message: "Creando base",
          duration: 3000
        });
        toast.present();
        await this.loading.present();
        this.createLogin(this.loginForm.value).then(login => {
          setTimeout(() => {
            this.doLogin();
          }, 5000);
        })
      } else {
        let toast = await this.toastCtrl.create({
          message: "Base Existente",
          duration: 3000
        });
        await toast.present();
      }
    })
  }

  changePassword (){
    this.checkLogin(
      this.loginForm.value.user.toLowerCase(),
      this.loginForm.value.password
    ).then(async (loginData: any)=>{
      if (loginData.ok){
        this.restProvider.changePassword(
          this.loginForm.value.user.toLowerCase(),
          this.loginForm.value.password,
          this.loginForm.value.new_password,
        ).then(updatePassword=>{
          // console.log("updatePassword", updatePassword);
        })
      }
      else {
        let toast = await this.toastCtrl.create({
          message: "Usuario o Contraseña Equivocados",
          duration: 3000
        });
        await toast.present();
      }
    })
  }

  async doLogin(){
    await this.storage.set('username', this.loginForm.value.user.toLowerCase());
    this.storage.set("password", this.loginForm.value.password);
    this.events.publish('get-user', {"user": this.loginForm.value.user.toLowerCase()});
    this.selected_user = true;
    let userData:any = await this.showDatabaseList(this.loginForm.value.user, this.loginForm.value.password);
    let dbList = userData.db_list;
    this.storage.set("language", userData.language);
    this.language = userData.language;
    if (!this.language){
      this.language = navigator.language.split('-')[0];
    }
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    this.username = this.loginForm.value.user.toLowerCase();
    if (dbList.length == 1){
      this.selectDatabase(dbList[0]);
    }
    this.menuCtrl.enable(false);
    this.loading.dismiss();
  }

  async changeLanguage() {
    const alert = await this.alertCtrl.create({
      header: 'CHOOSE_LANGUAGE',
      inputs: [
        {
          name: 'english',
          type: 'radio',
          label: 'English',
          value: 'en',
          checked: this.language == 'en'
        },
        {
          name: 'spanish',
          type: 'radio',
          label: 'Español',
          value: 'es',
          checked: this.language == 'es'
        },
        {
          name: 'portuguese',
          type: 'radio',
          label: 'Português',
          value: 'pt',
          checked: this.language == 'pt'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Ok',
          handler: async (language) => {
            this.language = language;
            this.storage.set("language", language);
            this.translate.setDefaultLang(this.language);
            this.translate.use(this.language);
            let password = await this.storage.get("password");
            if (this.username!='memo'){
              this.restProvider.setUserLanguage(this.username, password, this.language);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async showDatabaseList(username, password){
    return new Promise(async (resolve, reject)=>{
      let list: any = await this.storage.get("dbList") || [];
      this.databaseList = list;
      let listOnline: any = await this.restProvider.getUserDbList(
        username, password);
      if (listOnline.ok != false){
        this.storage.set("dbList", listOnline.db_list);
        this.databaseList = listOnline.db_list;
        this.storage.set("language", listOnline.userData.language);

        this.language = listOnline.userData.language;

        if (!this.language){
          this.language = navigator.language.split('-')[0];
        }
        this.translate.setDefaultLang(this.language);
        this.translate.use(this.language);

        resolve({db_list:this.databaseList, language:listOnline.userData.language})
      } else {
        let language: any = await this.storage.get("language");
        resolve({db_list:this.databaseList, language})
      }
    })
  }

  async selectDatabase(database){
    if (
      !database.date_due
      || (
        database.date_due.split('T')[0] > this.today.split('T')[0]
        || this.today.split('-')[1] == database.date_due.split('-')[1]
      )
    ){
      this.loading = await this.loadingCtrl.create({});
      await this.loading.present();
      await this.storage.set('database', database.database);
      let toast = await this.toastCtrl.create({
        message: "Cargando el Cardapio...",
      });
      await toast.present();
      this.pouchdbService.getConnect();
      this.events.subscribe('end-sync', async () => {
        this.events.unsubscribe('end-sync');
        await this.router.navigate(['/tabs/product-list']);
        // this.menuCtrl.enable(true);
        await toast.dismiss();
        await this.loading.dismiss();
      })
    }
  }

  async logout(){
    await this.storage.set('username', false);
    await this.storage.set('password', false);
    await this.storage.set('database', false);
    await this.storage.set('language', false);
    window.location.reload();
  }

  createLogin(datas){
    return new Promise(async (resolve, reject)=>{
      let body = {variables:{
        "name": {"value":datas.name, "type": "String"},
        "mobile": {"value":datas.mobile, "type": "String"},
        "email": {"value":datas.email, "type": "String"},
        "user": {"value":datas.user.toLowerCase(), "type": "String"},
        "password": {"value":datas.password, "type": "String"},
      }};
      this.restProvider.startProcess("Process_1", body).then((data:any)=>{
        resolve(data);
      })
    });
  }

  checkLogin(username, password){
    return new Promise((resolve, reject)=>{
      this.restProvider.checkLogin(username.toLowerCase(), password).then((data:any)=>{
        resolve(data);
      })
    });
  }

}

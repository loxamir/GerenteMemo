import { Component, OnInit, Inject } from '@angular/core';
import { LoadingController, Events, ToastController, MenuController, PopoverController } from '@ionic/angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/Rx';

import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from "../services/language/language.service";
import { LanguageModel } from "../services/language/language.model";
import { Storage } from '@ionic/storage';
import { PouchdbService } from '../services/pouchdb/pouchdb-service';
import { RestProvider } from '../services/rest/rest';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import * as jsPDF from 'jspdf';
import * as html2canvas from 'html2canvas';
import { LoginPopover } from './login.popover';

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
  username: '';


  helps: any;
  select:any;
  searchTerm: string = '';
  page = 0;
  has_search = false;
  filter: string = 'all';

  constructor(
    // public modal: ModalController,
    // @Inject('Window') private window: Window,
    public loadingCtrl: LoadingController,
    public translate: TranslateService,
    public languageService: LanguageService,
    public formBuilder: FormBuilder,
    public storage: Storage,
    public events: Events,
    public popoverCtrl: PopoverController,
    // public appConfig: AppConfig,
    public menuCtrl: MenuController,
    public pouchdbService: PouchdbService,
    public toastCtrl: ToastController,
    public restProvider: RestProvider,
    public route: ActivatedRoute,
    public router: Router,
  ) {

    this.languages = this.languageService.getLanguages();
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.storage.get("username").then((username)=>{
      this.username = username;
      if (username){
        this.storage.get("password").then((password)=>{
          this.showDatabaseList(username, password);
          // this.selectDatabase(username);
          this.selected_user = true;
        })
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

  async ngOnInit() {
    this.loading = await this.loadingCtrl.create();
    // this.router.events.subscribe((event: RouterEvent) => {
      // if (event instanceof NavigationEnd && event.url === '/login') {
      let username = await this.storage.get('username');
      // if (!username){
        this.menuCtrl.enable(false);
      // }
      console.log("usernames", username);
      // }
    // });
    this.setFilteredItems();
  }

  setFilteredItems() {
    let filter = null;
    if (this.filter == "all"){
      let filter = null;
    } else {
      let filter = this.filter;
    }
    this.getHelpsPage(this.searchTerm, 0, filter).then((helps: any[]) => {
        console.log("helps", helps);
        this.helps = helps;
      // this.helps = helps;
      this.page = 1;
    });
  }

  // doInfinite(infiniteScroll) {
  //   setTimeout(() => {
  //     this.getHelpsPage(this.searchTerm, this.page).then((helps: any[]) => {
  //       // this.helps = helps
  //       helps.forEach(help => {
  //         this.helps.push(help);
  //       });
  //       this.page += 1;
  //     });
  //     infiniteScroll.target.complete();
  //   }, 200);
  // }
  // doRefresh(refresher) {
  //   setTimeout(() => {
  //     this.getHelpsPage(this.searchTerm, 0).then((helps: any[]) => {
  //       if (this.filter == 'all'){
  //         this.helps = helps;
  //       }
  //       else if (this.filter == 'seller'){
  //         this.helps = helps.filter(word => word.seller == true);
  //       }
  //       else if (this.filter == 'customer'){
  //         this.helps = helps.filter(word => word.customer == true);
  //       }
  //       else if (this.filter == 'supplier'){
  //         this.helps = helps.filter(word => word.supplier == true);
  //       }
  //       else if (this.filter == 'employee'){
  //         this.helps = helps.filter(word => word.employee == true);
  //       }
  //       this.page = 1;
  //     });
  //     refresher.target.complete();
  //   }, 500);
  // }
  //
  getHelpsPage(keyword, page, field=''){
    console.log("getHelpsPage(",keyword, page, field);
    return new Promise(resolve => {
      this.restProvider.getDatabaseDoc('helps', '_design/Vistas/_view/videos?include_docs=true').then((helps: any[]) => {
        console.log("helps", helps['rows']);
        resolve(helps['rows']);
      });
    //   let list = [
    //     {
    //       "name": "Como Crear Nuevo Contacto",
    //       youtubeCode: "cMMWurKDecg",
    //     },
    //     {
    //       "name": "Como Crear un Registro de Caja",
    //       youtubeCode: "xX3tyZYzqi4",
    //     },
    //     {
    //       name: "Como Crear Nuevo Producto",
    //       youtubeCode: "nG02vx4sQos",
    //     },
    //     {
    //       name: "Como Crear una Compra al Contado",
    //       youtubeCode: "Ot13AxANq2s",
    //     },
    //     {
    //       name: "Como Crear una Compra a Credito",
    //       youtubeCode: "24_dpHb9xHI",
    //     },
    //     {
    //       name: "Como Crear una Venta al Contado",
    //       youtubeCode: "c41qtU8Pl7k",
    //     },
    //
    //   ];
    // // let otro = list.filter(help => help['name'].toString().search(new RegExp(keyword, "i")) != -1);
    // let otro = helps.list.filter(word=>word.name.toString().search(new RegExp(keyword, "i")) != -1)
    // // console.log("list", list);
    // // console.log("otro", otro);
    // // console.log("keyword", keyword);
    // // console.log("this.searchTerm", this.searchTerm);
    // resolve(otro);
  });
  }

  async presentPopover(myEvent) {
    // console.log("teste my event");
    let popover = await this.popoverCtrl.create({
      component: LoginPopover,
      event: myEvent,
      componentProps: {
        popoverController: this.popoverCtrl,
        doc: this
      }
    });
    popover.present();
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

  // showDemo (){
  //   // this.navCtrl.push(TabsNavigationPage);
  //   this.loginForm.patchValue({
  //     "user": "base_memo_demo",
  //   })
  //   // this.appConfig.setDatabase("base");
  //   // this.events.publish('get-user', {"user": "base"});
  //   // this.events.publish('get-database', {});
  //   // this.navCtrl.setRoot(TabsNavigationPage)
  //   this.login();
  // }

  showCreate(){
    this.show_create = true;
  }

  showLogin(){
    this.show_create = false;
  }

  login (){
    this.checkLogin(
      this.loginForm.value.user.toLowerCase(),
      this.loginForm.value.password
    ).then(async (loginData: any)=>{
      // console.log("LOGIN DATA", loginData);
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
    console.log("values", this.loginForm.value);
    this.restProvider.checkDbExist(this.loginForm.value.user.toLowerCase()).then(async (dbexists: any)=>{
      console.log("dbexists", dbexists);
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
      // console.log("LOGIN DATA", loginData);
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
    this.showDatabaseList(this.loginForm.value.user, this.loginForm.value.password);
    // this.selectDatabase();
    this.username = this.loginForm.value.user.toLowerCase();
    this.menuCtrl.enable(false);
    this.loading.dismiss();

  }

  async showDatabaseList(username, password){
    let list: any = await this.storage.get("dbList") || [];
    this.databaseList = list;
    let listOnline: any = await this.restProvider.getUserDbList(
      username, password);
    console.log("listOnline", listOnline);
    if (listOnline.ok != false){
      console.log("yes list");
      this.storage.set("dbList", listOnline);
      this.databaseList = listOnline;
    }
  }

  async selectDatabase(database){
    // let username = await this.storage.get("username");
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
      // if (this.navParams.data.current_db){
      // await this.pouchdbService.getDisConnect();
      // }
      await this.storage.set('database', database);
      // this.appConfig.setDatabase(database.toLowerCase());
      // let toast = this.toastCtrl.create({
      //   message: "1/8 - Sincronizando Datos",
      // });
      // toast.present();
      this.pouchdbService.getConnect();
      // if (this.navParams.data.current_db){
      //   this.navCtrl.pop()
      // }

      this.events.subscribe('end-sync', async () => {
        this.events.unsubscribe('end-sync');
        // toast.dismiss();
        let viewExist = await this.storage.get('optimize-'+database);
        if(viewExist){
          this.loading.dismiss();
        } else {
          this.initiateViews();
          this.storage.set('optimize-'+database, true);
        }
        // this.navCtrl.setRoot(TabsNavigationPage);
        // this.loading.dismiss();
      })
      this.menuCtrl.enable(true);
      this.router.navigate(['/agro-tabs/work-list']);
    // }
  }

  // gotoHelp(){
  //   this.router.navigate(['/help-list']);
  // }

  async initiateViews(){
    let toast2 = await this.toastCtrl.create({
      message: "2/8 - Sincronizando Balancete",
    });
    await toast2.present();
    await this.pouchdbService.getView('stock/Contas');
    toast2.dismiss();
    let toast3 = await this.toastCtrl.create({
    message: "3/8 - Sincronizando Cuentas a Cobrar",
    });
    await toast3.present();
    await this.pouchdbService.getView('stock/A Cobrar');
    toast3.dismiss();
    let toast4 = await this.toastCtrl.create({
    message: "4/8 - Sincronizando Cuentas a Pagar",
    });
    await toast4.present();
    await this.pouchdbService.getView('stock/A Pagar');
    toast4.dismiss();
    let toast5 = await this.toastCtrl.create({
    message: "5/8 - Sincronizando Stock",
    });
    await toast5.present();
    await this.pouchdbService.getView('stock/Depositos');
    toast5.dismiss();
    let toast6 = await this.toastCtrl.create({
    message: "6/8 - Sincronizando Cajas",
    });
    await toast6.present();
    await this.pouchdbService.getView('stock/Caixas');
    toast6.dismiss();
    let toast7 = await this.toastCtrl.create({
    message: "7/8 - Sincronizando Balance y Resultados",
    });
    await toast7.present();
    await this.pouchdbService.getView('stock/ResultadoDiario');
    toast7.dismiss();
    let toast8 = await this.toastCtrl.create({
    message: "8/8 - Sincronizando Flujo de Caja",
    });
    await toast8.present();
    await this.pouchdbService.getView('stock/Fluxo');
    toast8.dismiss();
    this.events.publish('get-database', {});
    this.loading.dismiss();
    // this.navCtrl.setRoot(TabsNavigationPage);
    // this.router.navigate(['/tabs/sale-list']);
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

  createLogin(datas){
    return new Promise((resolve, reject)=>{
      // console.log("datas", datas);
      let body = {variables:{
        "name": {"value":datas.name, "type": "String"},
        "mobile": {"value":datas.mobile, "type": "String"},
        "email": {"value":datas.email, "type": "String"},
        "user": {"value":datas.user.toLowerCase(), "type": "String"},
        "password": {"value":datas.password, "type": "String"},
      }};
      // console.log("variables", variables);
      this.restProvider.startProcess("Process_1", body).then((data:any)=>{
        // console.log("DATA startProcess", data);
        resolve(data);
      })
    });
  }

  checkLogin(username, password){
    return new Promise((resolve, reject)=>{
      // console.log("variables", variables);
      this.restProvider.checkLogin(username.toLowerCase(), password).then((data:any)=>{
        // console.log("DATA startProcess", data);
        resolve(data);
      })
    });
  }

}

import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, MenuController, Nav, App, ToastController, AlertController, Events, IonicApp } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Observable } from 'rxjs';

import { TabsNavigationPage } from '../pages/tabs-navigation/tabs-navigation';
// import { ProductsPage } from '../pages/product/list/products';
import { ContactsPage } from '../pages/contact/list/contacts';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ConfigPage } from '../pages/config/config';
import { ConfigService } from '../pages/config/config.service';
import { LoginPage } from '../pages/login/login';
import { Storage } from '@ionic/storage';
import { ProjectsPage } from '../pages/project/list/projects';
import { HomePage } from '../pages/home/home';
import { HelpsPage } from '../pages/help/list/helps';
import { ReportsPage } from '../pages/report/list/reports';
import { DashboardsPage } from '../pages/dashboard/list/dashboards';
import { ContactPage } from '../pages/contact/contact';
import { AgroTabsPage } from '../pages/agro-tabs/agro-tabs';
import { PersonTabsPage } from '../pages/person/person-tabs';

// import { AgriculturePage } from '../pages/agriculture/agriculture';
import { StockMoveListPage } from '../pages/stock/list/stock-move-list';

// import { TabsPage } from '../pages/stock/tabs/tabs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any = LoginPage;
  //rootPage: any = WalkthroughPage
  textDir: string = "ltr";

  pages: Array<{title: any, icon: string, component: any}>;
  pushPages: Array<{title: any, icon: string, component: any}>;
  name: any;
  image: any;
  showedAlert: boolean;
  confirmAlert: any;
  database: any = "";


  constructor(
    public platform: Platform,
    public menu: MenuController,
    public app: App,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public translate: TranslateService,
    public configService: ConfigService,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public storage: Storage,
    private ionicApp: IonicApp,
    public events: Events,
  ) {
    translate.setDefaultLang('es');
    translate.use('es');
    platform.ready().then(() => {
      console.log("Ready");
      this.splashScreen.hide();
      this.image = "./assets/images/profile/memorizador.jpeg";
      this.storage.get('database').then(() => {
          this.events.subscribe('got-database', () => {
          this.rootPage = ReportsPage;
            this.configService.getMyContact().then((data) => {
              this.name = data.name;
            });
            // Confirm exit
            this.showedAlert = false;
            this.platform.registerBackButtonAction(() => {
              let activeModal=this.ionicApp._modalPortal.getActive();
              if(activeModal){
                activeModal.dismiss();
                return;
              } else {
                if (this.nav.length() == 1) {
                  if (!this.showedAlert) {
                    this.confirmExitApp();
                  } else {
                    this.showedAlert = false;
                    this.confirmAlert.dismiss();
                  }
                }
                else if (this.nav.length() > 1){
                  this.nav.pop();
                }
              }
            });
          })
      });
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) =>
      {
        if(event.lang == 'ar'){
          platform.setDir('rtl', true);
        }
        else {
          platform.setDir('ltr', true);
        }
        Observable.forkJoin(
          this.translate.get('HOME'),
          this.translate.get('REPORTS'),
          this.translate.get('HELP'),
          this.translate.get('CONTACTS'),
          this.translate.get('ASSETS'),
          this.translate.get('SETTINGS'),
          this.translate.get('AGRICULTURE'),

        ).subscribe(data => {
          this.pushPages = [
            { title: data[6], icon: 'leaf', component: AgroTabsPage },
            { title: data[0], icon: 'home', component: TabsNavigationPage },
            { title: data[1], icon: 'stats', component: DashboardsPage },
            { title: data[2], icon: 'help-circle', component: ReportsPage },
            { title: data[3], icon: 'contacts', component: PersonTabsPage },
            // { title: data[4], icon: 'car', component: ProjectsPage },
            { title: data[5], icon: 'settings', component: ConfigPage },
          ];
          this.pages = [];
        });
      });

  }

  logout() {
    this.menu.close();
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(LoginPage, {'current_db': true});
  }

  openPage(page) {
    this.menu.close();
    this.nav.setRoot(page.component);
  }

  pushSettings() {
    this.menu.close();
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ConfigPage, {});
  }

  editProfile() {
    this.menu.close();
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(ContactPage, {'_id': 'contact.myCompany'});
  }

  pushPage(page) {
    this.menu.close();
    let newRootNav = <NavController>this.app.getRootNavById('n4');
    newRootNav.push(page.component);
  }

  confirmExitApp() {
    this.showedAlert = true;
    this.confirmAlert = this.alertCtrl.create({
        title: "Salir",
        message: "¿ Esta seguro que desea salir de la aplicación ?",
        buttons: [
            {
                text: 'Cancelar',
                handler: () => {
                    this.showedAlert = false;
                    return;
                }
            },
            {
                text: 'Aceptar',
                handler: () => {
                    this.platform.exitApp();
                }
            }
        ]
    });
    this.confirmAlert.present();
  }
}

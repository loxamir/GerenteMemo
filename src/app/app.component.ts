import { Component, OnInit } from '@angular/core';

import { Platform, MenuController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { PouchdbService } from './services/pouchdb/pouchdb-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  user = {};
  public appPages = [
    {
      title: 'Operativo',
      url: '/tabs',
      icon: 'infinite'
    },
    {
      title: 'Informes',
      url: '/report-list',
      icon: 'stats',
      restrict: true
    },
    {
      title: 'Productos',
      url: '/product-list',
      icon: 'cube'
    },
    {
      title: 'Personas',
      url: '/contact-list',
      icon: 'contacts'
    },
    {
      title: 'Ajustes',
      url: '/config',
      icon: 'settings',
      restrict: true
    },
    {
      title: 'Dudas',
      url: '/help-list',
      icon: 'help-circle'
    },
    {
      title: 'Salir',
      url: '/login',
      icon: 'exit'
    },
];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    public translate: TranslateService,
    private statusBar: StatusBar,
    public router: Router,
    public menuCtrl: MenuController,
    public modalCtrl: ModalController,
    public pouchdbService: PouchdbService,
  ) {
    this.initializeApp();
    this.backButtonListener();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.translate.setDefaultLang('es');
      // this.translate.use('es');
      // this.statusBar.styleDefault();
      this.statusBar.show()
      // this.statusBar.overlaysWebView(true);
      this.statusBar.styleLightContent()
      this.statusBar.backgroundColorByHexString('#1652a0');
      this.splashScreen.hide();
    });
  }

  backButtonListener(): void {
    window.onpopstate = async (evt) => {
      // Close any active modals or overlays
      console.log("close modal");
          console.log("teste back");
          const modal = await this.modalCtrl.getTop();
          if (modal) {
              modal.dismiss();
          }
    }
  }

 async ngOnInit(){
    this.user = (await this.pouchdbService.getUser());
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        // if (event.url === '/login') {
        //   this.menuCtrl.enable(false);
        // }
        this.appPages.map( p => {
          return p['active'] = (event.url === p.url);
        });
      }
    })
  }
}

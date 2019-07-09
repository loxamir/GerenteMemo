import { Component, OnInit } from '@angular/core';

import { Platform, MenuController, ModalController, LoadingController } from '@ionic/angular';
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
  user: any = {};
  loading: any;
  public appPages = [
    {
      title: 'Agricultura',
      url: '/agro-tabs',
      icon: 'ios-leaf'
    },
    {
      title: 'Administración',
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
      title: 'Ajuda',
      url: '/help-list',
      icon: 'help-circle-outline'
    },
    {
      title: 'Ajustes',
      url: '/config',
      icon: 'settings',
      restrict: true
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
    public loadingCtrl: LoadingController,
    public pouchdbService: PouchdbService,
  ) {
    this.initializeApp();
    this.backButtonListener();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('cordova')){
        // this.translate.setDefaultLang('es');
        // this.translate.use('es');
        // this.statusBar.styleDefault();
        this.statusBar.show()
        // this.statusBar.overlaysWebView(true);
        this.statusBar.styleLightContent()
        this.statusBar.backgroundColorByHexString('#1652a0');
        this.splashScreen.hide();
      }
    });
  }

  backButtonListener(): void {
    window.onpopstate = async (evt) => {
      // Close any active modals or overlays
      const modal = await this.modalCtrl.getTop();
      if (modal) {
        await modal.dismiss();
      }
    }
  }

  async ngOnInit(){
    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    this.user = (await this.pouchdbService.getUser());
    if (this.user && !this.user['admin']){
      this.appPages = [
        {
          title: 'Operativo',
          url: '/tabs',
          icon: 'infinite'
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
          title: 'Salir',
          url: '/login',
          icon: 'exit'
        },
    ];
    }
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
    this.loading.dismiss();
  }
}

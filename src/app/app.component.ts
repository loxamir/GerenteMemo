import { Component, OnInit } from '@angular/core';

import { Platform, MenuController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
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
      icon: 'stats'
    },
    {
      title: 'Deposito',
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
      icon: 'help'
    },
    {
      title: 'Ajustes',
      url: '/config',
      icon: 'settings'
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

  ngOnInit(){
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

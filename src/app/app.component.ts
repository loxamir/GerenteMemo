import { Component, OnInit } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd, } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: 'Inicio',
      url: '/login',
      icon: 'home'
    },
    {
      title: 'Operativo',
      url: '/tabs',
      icon: 'infinite'
    },
    {
      title: 'Informes',
      url: '/report-tabs',
      icon: 'stats'
    },
    // {
    //   title: 'Ayuda',
    //   url: '/help-list',
    //   icon: 'help-circle'
    // },
    {
      title: 'Personas',
      url: '/contact-list',
      icon: 'contacts'
    },
    {
      title: 'Ajustes',
      url: '/config',
      icon: 'settings'
    },
];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    public translate: TranslateService,
    private statusBar: StatusBar,
    public router: Router,
    public menuCtrl: MenuController,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.translate.setDefaultLang('es');
      // this.translate.use('es');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
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

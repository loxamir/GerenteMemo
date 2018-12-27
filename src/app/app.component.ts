import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Inicio',
      url: '/tabs',
      icon: 'home'
    },
    {
      title: 'Informes',
      url: '/help-list',
      icon: 'stats'
    },
    {
      title: 'Ayuda',
      url: '/help-list',
      icon: 'help-circle'
    },
    {
      title: 'Contactos',
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
    private statusBar: StatusBar
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
}
